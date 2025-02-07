package handler

import (
	"backend/prisma/db"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
)

type AssistantHandler struct {
	client *db.PrismaClient
}

func NewAssistantHandler(client *db.PrismaClient) *AssistantHandler {
	return &AssistantHandler{client: client}
}

func (h *AssistantHandler) SetAssistant(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	ctx := r.Context()

	userRole := ctx.Value("role").(string)
	if userRole != "SUPER_ADMIN" && userRole != "ADMIN" {
		w.WriteHeader(http.StatusForbidden)
		json.NewEncoder(w).Encode(map[string]string{"error": "only SUPER_ADMIN and ADMIN can assign assistants"})
		return
	}

	var req struct {
		PracticumID int    `json:"practicumId"`
		GroupID     string `json:"groupId"`
		AssistantID string `json:"assistantId"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "invalid request format"})
		return
	}

	// Validasi asisten
	assistant, err := h.client.User.FindUnique(
		db.User.ID.Equals(req.AssistantID),
	).Exec(ctx)

	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "assistant not found"})
		return
	}

	if assistant.Role != "ASISTEN" {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "user is not an assistant"})
		return
	}

	// Cek apakah asisten sudah mengampu praktikum lain
	existingAssistantSchedule, err := h.client.Schedule.FindFirst(
		db.Schedule.AssistantID.Equals(req.AssistantID),
		db.Schedule.PracticumID.Not(req.PracticumID),
	).Exec(ctx)

	if err != nil && !errors.Is(err, db.ErrNotFound) {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": "failed to check assistant's schedule"})
		return
	}

	if existingAssistantSchedule != nil {
		// Ambil detail praktikum yang sedang diampu
		currentPracticum, err := h.client.Practicum.FindUnique(
			db.Practicum.ID.Equals(existingAssistantSchedule.PracticumID),
		).Exec(ctx)

		if err == nil {
			w.WriteHeader(http.StatusConflict)
			json.NewEncoder(w).Encode(map[string]string{
				"error": fmt.Sprintf("assistant is already assigned to practicum: %s", currentPracticum.Title),
			})
			return
		} else {
			w.WriteHeader(http.StatusConflict)
			json.NewEncoder(w).Encode(map[string]string{
				"error": "assistant is already assigned to another practicum",
			})
			return
		}
	}

	// Validasi praktikum
	_, err = h.client.Practicum.FindUnique(
		db.Practicum.ID.Equals(req.PracticumID),
	).Exec(ctx)

	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "practicum not found"})
		return
	}

	// Validasi group
	_, err = h.client.Group.FindUnique(
		db.Group.ID.Equals(req.GroupID),
	).Exec(ctx)

	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "group not found"})
		return
	}

	// Cek apakah sudah ada jadwal untuk kombinasi praktikum dan group ini
	existingSchedule, err := h.client.Schedule.FindFirst(
		db.Schedule.PracticumID.Equals(req.PracticumID),
		db.Schedule.GroupID.Equals(req.GroupID),
	).Exec(ctx)

	if err != nil && !errors.Is(err, db.ErrNotFound) {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": "failed to check existing schedule"})
		return
	}

	var schedule *db.ScheduleModel
	if existingSchedule != nil {
		// Update asisten jika jadwal sudah ada
		schedule, err = h.client.Schedule.FindUnique(
			db.Schedule.ID.Equals(existingSchedule.ID),
		).Update(
			db.Schedule.AssistantID.Set(req.AssistantID),
			db.Schedule.Status.Set(db.StatusUnscheduled),
		).Exec(ctx)
	} else {
		// Buat jadwal baru jika belum ada
		schedule, err = h.client.Schedule.CreateOne(
			db.Schedule.PracticumID.Set(req.PracticumID),
			db.Schedule.GroupID.Set(req.GroupID),
			db.Schedule.AssistantID.Set(req.AssistantID),
			db.Schedule.Status.Set(db.StatusUnscheduled),
		).Exec(ctx)
	}

	if err != nil {
		fmt.Printf("Error managing schedule: %v\n", err)
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": "failed to assign assistant"})
		return
	}

	dateStr := ""
	timeStr := ""
	if date, ok := schedule.Date(); ok {
		dateStr = date.Format("2006-01-02")
	}
	if startTime, ok := schedule.StartTime(); ok {
		timeStr = startTime.Format("15:04")
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

	if existingSchedule != nil {
		w.WriteHeader(http.StatusOK)
	} else {
		w.WriteHeader(http.StatusCreated)
	}
	json.NewEncoder(w).Encode(response)
}

func (h *AssistantHandler) GetAssistants(w http.ResponseWriter, r *http.Request) {
	userRole := r.Context().Value("role").(string)
	if userRole != "SUPER_ADMIN" && userRole != "ADMIN" {
		w.WriteHeader(http.StatusForbidden)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "only SUPER_ADMIN and ADMIN can view assistant assignments"})
		return
	}

	// Ambil semua jadwal dengan detil asisten dan praktikum
	schedules, err := h.client.Schedule.FindMany().With(
		db.Schedule.Assistant.Fetch(),
		db.Schedule.Practicum.Fetch(),
	).Exec(r.Context())

	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "failed to fetch assistant assignments"})
		return
	}

	var response []map[string]interface{}
	for _, schedule := range schedules {
		assistant := schedule.Assistant()
		practicum := schedule.Practicum()

		response = append(response, map[string]interface{}{
			"id":    assistant.ID,
			"name":  assistant.Name,
			"nrp":   assistant.Nrp,
			"judul": practicum.Title,
		})
	}

	w.WriteHeader(http.StatusOK)
	_ = json.NewEncoder(w).Encode(response)
}

//func (h *AssistantHandler) UpdateAssistant(w http.ResponseWriter, r *http.Request) {
//	userRole := r.Context().Value("role").(string)
//	if userRole != "SUPER_ADMIN" && userRole != "ADMIN" {
//		w.WriteHeader(http.StatusForbidden)
//		return
//	}
//
//	var req struct {
//		ScheduleID  int    `json:"scheduleId"`
//		AssistantID string `json:"assistantId"`
//	}
//
//	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
//		w.WriteHeader(http.StatusBadRequest)
//		json.NewEncoder(w).Encode(map[string]string{"error": "invalid request"})
//		return
//	}
//
//	// Validasi asisten baru
//	assistant, err := h.client.User.FindUnique(
//		db.User.ID.Equals(req.AssistantID),
//	).Exec(r.Context())
//
//	if err != nil || assistant.Role != "ASISTEN" {
//		w.WriteHeader(http.StatusBadRequest)
//		json.NewEncoder(w).Encode(map[string]string{"error": "invalid assistant"})
//		return
//	}
//
//	// Update penugasan asisten
//	schedule, err := h.client.Schedule.FindUnique(
//		db.Schedule.ID.Equals(req.ScheduleID),
//	).Update(
//		db.Schedule.AssistantID.Set(req.AssistantID),
//		db.Schedule.Status.Set("UNSCHEDULED"),
//	).Exec(r.Context())
//
//	if err != nil {
//		w.WriteHeader(http.StatusInternalServerError)
//		json.NewEncoder(w).Encode(map[string]string{"error": "failed to update assistant"})
//		return
//	}
//
//	w.WriteHeader(http.StatusOK)
//	json.NewEncoder(w).Encode(schedule)
//}
