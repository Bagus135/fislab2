package handler

import (
	"backend/prisma/db"
	"backend/types"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"strconv"
	"strings"
	"time"
)

type ScheduleHandler struct {
	client *db.PrismaClient
}

func NewScheduleHandler(client *db.PrismaClient) *ScheduleHandler {
	return &ScheduleHandler{client: client}
}

func (h *ScheduleHandler) SetSchedule(w http.ResponseWriter, r *http.Request) {
	userRole := r.Context().Value("role").(string)

	if userRole != "ASISTEN" {
		w.WriteHeader(http.StatusForbidden)
		return
	}
	assistantId := r.Context().Value("userID").(string)

	var req types.SetScheduleRequest

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		w.WriteHeader(http.StatusBadRequest)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "invalid request"})
		return
	}

	date, err := time.Parse("2006-01-02", req.Date)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "invalid date format. Use YYYY-MM-DD"})
		return
	}

	timeArr := strings.Split(req.StartTime, ":")
	if len(timeArr) != 2 {
		w.WriteHeader(http.StatusBadRequest)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "invalid time format. Use HH:mm"})
		return
	}

	hour, err := strconv.Atoi(timeArr[0])
	if err != nil || hour < 0 || hour > 23 {
		w.WriteHeader(http.StatusBadRequest)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "invalid hour"})
	}

	minute, err := strconv.Atoi(timeArr[1])
	if err != nil || minute < 0 || minute > 59 {
		w.WriteHeader(http.StatusBadRequest)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "invalid minute"})
		return
	}

	scheduleTime := time.Date(
		date.Year(),
		date.Month(),
		date.Day(),
		hour,
		minute,
		0,
		0,
		time.UTC,
	)

	now := time.Now().UTC()
	if scheduleTime.Before(now) {
		w.WriteHeader(http.StatusBadRequest)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "cannot schedule for past time"})
		return
	}

	existingSchedule, err := h.client.Schedule.FindFirst(
		db.Schedule.PracticumID.Equals(req.PracticumID),
		db.Schedule.GroupID.Equals(req.GroupID),
		db.Schedule.AssistantID.Equals(assistantId),
		db.Schedule.Status.Equals(db.StatusUnscheduled),
	).Exec(r.Context())

	if err != nil {
		if errors.Is(err, db.ErrNotFound) {

			w.WriteHeader(http.StatusNotFound)
			_ = json.NewEncoder(w).Encode(map[string]string{"error": "no unscheduled practicum found for this group"})
			return
		}
		w.WriteHeader(http.StatusInternalServerError)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "failed to check existing schedule"})
		return
	}

	// Cek jadwal bentrok untuk group
	conflictGroupSchedule, err := h.client.Schedule.FindFirst(
		db.Schedule.GroupID.Equals(req.GroupID),
		db.Schedule.StartTime.Equals(scheduleTime),
		db.Schedule.ID.Not(existingSchedule.ID),
		db.Schedule.Status.Equals(db.StatusScheduled),
	).Exec(r.Context())

	if err != nil && !errors.Is(err, db.ErrNotFound) {
		w.WriteHeader(http.StatusInternalServerError)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "failed to check schedule conflicts"})
		return
	}

	if conflictGroupSchedule != nil {
		w.WriteHeader(http.StatusConflict)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "group already has a schedule at this time"})
		return
	}

	// Cek jadwal bentrok untuk asisten
	conflictAssistantSchedule, err := h.client.Schedule.FindFirst(
		db.Schedule.AssistantID.Equals(assistantId),
		db.Schedule.StartTime.Equals(scheduleTime),
		db.Schedule.ID.Not(existingSchedule.ID),
		db.Schedule.Status.Equals(db.StatusScheduled),
	).Exec(r.Context())

	if err != nil && !errors.Is(err, db.ErrNotFound) {
		w.WriteHeader(http.StatusInternalServerError)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "failed to check schedule conflicts"})
		return
	}

	if conflictAssistantSchedule != nil {
		w.WriteHeader(http.StatusConflict)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "you already have a schedule at this time"})
		return
	}

	// Update jadwal
	schedule, err := h.client.Schedule.FindUnique(
		db.Schedule.ID.Equals(existingSchedule.ID),
	).Update(
		db.Schedule.Date.Set(date),
		db.Schedule.StartTime.Set(scheduleTime),
		db.Schedule.Status.Set(db.StatusScheduled),
	).Exec(r.Context())

	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "failed to update schedule"})
		return
	}

	dateStr := ""
	timeStr := ""
	if scheduleDate, ok := schedule.Date(); ok {
		dateStr = scheduleDate.Format("2006-01-02")
	}
	if scheduleStartTime, ok := schedule.StartTime(); ok {
		timeStr = scheduleStartTime.Format("15:04")
	}

	response := map[string]interface{}{
		"id":          schedule.ID,
		"practicumId": schedule.PracticumID,
		"groupId":     schedule.GroupID,
		"assistantId": schedule.AssistantID,
		"date":        dateStr,
		"startTime":   timeStr,
		"status":      schedule.Status,
	}

	w.WriteHeader(http.StatusOK)
	_ = json.NewEncoder(w).Encode(response)
}

func (h *ScheduleHandler) GetSchedules(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	userRole, ok := r.Context().Value("role").(string)
	if !ok {
		http.Error(w, `{"error": "role not found in context"}`, http.StatusUnauthorized)
		return
	}

	userID, ok := r.Context().Value("userID").(string)
	if !ok {
		http.Error(w, `{"error": "user not found in context"}`, http.StatusUnauthorized)
		return
	}

	var schedules []db.ScheduleModel
	var err error

	switch userRole {
	case "ASISTEN":
		schedules, err = h.client.Schedule.FindMany(
			db.Schedule.AssistantID.Equals(userID),
		).With(
			db.Schedule.Practicum.Fetch(),
			db.Schedule.Group.Fetch(),
		).OrderBy(
			db.Schedule.Date.Order(db.SortOrderAsc),
			db.Schedule.StartTime.Order(db.SortOrderAsc),
		).Exec(r.Context())

	case "PRAKTIKAN":
		schedules, err = h.client.Schedule.FindMany(
			db.Schedule.Group.Where(
				db.Group.Members.Some(
					db.User.ID.Equals(userID),
				),
			),
		).With(
			db.Schedule.Practicum.Fetch(),
			db.Schedule.Group.Fetch(),
			db.Schedule.Assistant.Fetch(),
		).OrderBy(
			db.Schedule.Date.Order(db.SortOrderAsc),
			db.Schedule.StartTime.Order(db.SortOrderAsc),
		).Exec(r.Context())

	default:
		http.Error(w, `{"error": "only ASISTEN and PRAKTIKAN can view schedules"}`, http.StatusForbidden)
		return
	}

	if err != nil {
		http.Error(w, `{"error": "failed to fetch schedules"}`, http.StatusInternalServerError)
		return
	}

	var response []map[string]interface{}
	for _, schedule := range schedules {
		date, _ := schedule.Date()
		timeValue, _ := schedule.StartTime()
		dateStr := fmt.Sprintf("%d-%02d-%02d", date.Year(), date.Month(), date.Day())
		timeStr := fmt.Sprintf("%02d:%02d", timeValue.Hour(), timeValue.Minute())

		data := map[string]interface{}{
			"id": schedule.ID,
			"practicum": map[string]interface{}{
				"id":    schedule.Practicum().ID,
				"title": schedule.Practicum().Title,
			},
			"date":   dateStr,
			"time":   timeStr,
			"status": schedule.Status,
		}

		if userRole == "ASISTEN" {
			data["groupId"] = schedule.GroupID
			data["kelompok"] = schedule.Group().Name
		} else {
			data["group"] = map[string]interface{}{
				"id":   schedule.Group().ID,
				"name": schedule.Group().Name,
			}
			data["assistant"] = map[string]interface{}{
				"id":   schedule.Assistant().ID,
				"name": schedule.Assistant().Name,
				"nrp":  schedule.Assistant().Nrp,
			}
		}

		response = append(response, data)
	}

	w.WriteHeader(http.StatusOK)
	_ = json.NewEncoder(w).Encode(response)
}

func (h *ScheduleHandler) SetFinished(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	userRole := r.Context().Value("role").(string)
	assistantID := r.Context().Value("userID").(string)

	if userRole != "ASISTEN" {
		w.WriteHeader(http.StatusForbidden)
		return
	}

	var req struct {
		ScheduleID int `json:"scheduleId"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		w.WriteHeader(http.StatusBadRequest)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "invalid request"})
		return
	}

	// Validasi input
	if req.ScheduleID == 0 {
		w.WriteHeader(http.StatusBadRequest)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "scheduleId is required"})
		return
	}

	schedule, err := h.client.Schedule.FindUnique(
		db.Schedule.ID.Equals(req.ScheduleID),
	).With(
		db.Schedule.Assistant.Fetch(),
		db.Schedule.Practicum.Fetch(),
		db.Schedule.Group.Fetch(),
	).Exec(r.Context())

	if err != nil {
		w.WriteHeader(http.StatusNotFound)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "schedule not found"})
		return
	}

	if schedule.Assistant().ID != assistantID {
		w.WriteHeader(http.StatusForbidden)
		return
	}

	// Validasi bahwa waktu jadwal sudah dilewati
	startTime, hasStartTime := schedule.StartTime()
	if !hasStartTime {
		w.WriteHeader(http.StatusBadRequest)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "schedule time not set"})
		return
	}

	if time.Now().Before(startTime) {
		w.WriteHeader(http.StatusBadRequest)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "schedule has not yet passed"})
		return
	}

	// Ubah status praktikum menjadi COMPLETED (sesuai enum di schema)
	updatedSchedule, err := h.client.Schedule.FindUnique(
		db.Schedule.ID.Equals(req.ScheduleID),
	).Update(
		db.Schedule.Status.Set("COMPLETED"),
	).Exec(r.Context())

	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "failed to update status"})
		return
	}

	w.WriteHeader(http.StatusOK)
	_ = json.NewEncoder(w).Encode(map[string]interface{}{
		"id":          updatedSchedule.ID,
		"practicumId": updatedSchedule.PracticumID,
		"groupId":     updatedSchedule.GroupID,
		"status":      updatedSchedule.Status,
	})
}
