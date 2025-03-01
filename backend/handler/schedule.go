package handler

import (
	"backend/prisma/db"
	"backend/types"
	"encoding/json"
	"errors"
	"fmt"
	"log"
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
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "only assistant can set schedule"})
		return
	}

	assistantId := r.Context().Value("userID").(string)

	var req types.SetScheduleRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		w.WriteHeader(http.StatusBadRequest)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "invalid request format"})
		return
	}

	// Cari grup berdasarkan name
	group, err := h.client.Group.FindFirst(
		db.Group.Name.Equals(req.Group),
	).Exec(r.Context())
	if err != nil {
		w.WriteHeader(http.StatusNotFound)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "group not found"})
		return
	}

	// Validasi format tanggal
	date, err := time.Parse("2006-01-02", req.Date)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "invalid date format. Use YYYY-MM-DD"})
		return
	}

	// Validasi format waktu
	timeArr := strings.Split(req.StartTime, ":")
	if len(timeArr) != 2 {
		w.WriteHeader(http.StatusBadRequest)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "invalid time format. Use HH:mm"})
		return
	}

	hour, err := strconv.Atoi(timeArr[0])
	if err != nil || hour < 0 || hour > 23 {
		w.WriteHeader(http.StatusBadRequest)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "invalid hour. Must be between 0-23"})
		return
	}

	minute, err := strconv.Atoi(timeArr[1])
	if err != nil || minute < 0 || minute > 59 {
		w.WriteHeader(http.StatusBadRequest)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "invalid minute. Must be between 0-59"})
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

	// Cek keberadaan jadwal menggunakan group.ID
	existingSchedule, err := h.client.Schedule.FindFirst(
		db.Schedule.PracticumID.Equals(req.PracticumCode),
		db.Schedule.GroupID.Equals(group.ID),
		db.Schedule.AssistantID.Equals(assistantId),
	).With(
		db.Schedule.Practicum.Fetch(),
		db.Schedule.Group.Fetch(),
	).Exec(r.Context())

	if err != nil {
		if errors.Is(err, db.ErrNotFound) {
			w.WriteHeader(http.StatusNotFound)
			_ = json.NewEncoder(w).Encode(map[string]string{
				"error": "no assignment found for this combination of practicum, group, and assistant",
			})
			return
		}
		w.WriteHeader(http.StatusInternalServerError)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "failed to check existing schedule"})
		return
	}

	// Hapus semua record AttendanceCode dan Attendance yang terkait dengan jadwal lama
	attendanceCodes, err := h.client.AttendanceCode.FindMany(
		db.AttendanceCode.ScheduleID.Equals(existingSchedule.ID),
	).Exec(r.Context())
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "failed to fetch attendance codes"})
		return
	}

	for _, code := range attendanceCodes {
		// Hapus semua Attendance yang terkait dengan AttendanceCode ini
		_, err := h.client.Attendance.FindMany(db.Attendance.CodeID.Equals(code.ID)).Delete().Exec(r.Context())
		if err != nil {
			log.Printf("Failed to delete attendance records for code %d: %v\n", code.ID, err)
		}

		// Hapus AttendanceCode
		_, err = h.client.AttendanceCode.FindUnique(
			db.AttendanceCode.ID.Equals(code.ID),
		).Delete().Exec(r.Context())
		if err != nil {
			log.Printf("Failed to delete attendance code %d: %v\n", code.ID, err)
		}
	}

	// Cek jadwal bentrok untuk group
	conflictGroupSchedule, err := h.client.Schedule.FindFirst(
		db.Schedule.GroupID.Equals(group.ID),
		db.Schedule.StartTime.Equals(scheduleTime),
		db.Schedule.ID.Not(existingSchedule.ID),
		db.Schedule.Status.Equals(db.StatusScheduled),
	).With(
		db.Schedule.Practicum.Fetch(),
	).Exec(r.Context())

	if err != nil && !errors.Is(err, db.ErrNotFound) {
		w.WriteHeader(http.StatusInternalServerError)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "failed to check schedule conflicts"})
		return
	}

	if conflictGroupSchedule != nil {
		w.WriteHeader(http.StatusConflict)
		_ = json.NewEncoder(w).Encode(map[string]interface{}{
			"error": "group already has a schedule at this time",
			"conflict": map[string]interface{}{
				"practicum": conflictGroupSchedule.Practicum().Title,
				"time":      scheduleTime.Format("2006-01-02 15:04"),
			},
		})
		return
	}

	// Cek jadwal bentrok untuk asisten
	conflictAssistantSchedule, err := h.client.Schedule.FindFirst(
		db.Schedule.AssistantID.Equals(assistantId),
		db.Schedule.StartTime.Equals(scheduleTime),
		db.Schedule.ID.Not(existingSchedule.ID),
		db.Schedule.Status.Equals(db.StatusScheduled),
	).With(
		db.Schedule.Practicum.Fetch(),
		db.Schedule.Group.Fetch(),
	).Exec(r.Context())

	if err != nil && !errors.Is(err, db.ErrNotFound) {
		w.WriteHeader(http.StatusInternalServerError)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "failed to check schedule conflicts"})
		return
	}

	if conflictAssistantSchedule != nil {
		w.WriteHeader(http.StatusConflict)
		_ = json.NewEncoder(w).Encode(map[string]interface{}{
			"error": "you already have a schedule at this time",
			"conflict": map[string]interface{}{
				"practicum": conflictAssistantSchedule.Practicum().Title,
				"group":     conflictAssistantSchedule.Group().Name,
				"time":      scheduleTime.Format("2006-01-02 15:04"),
			},
		})
		return
	}

	// Update jadwal
	_, err = h.client.Schedule.FindUnique(
		db.Schedule.ID.Equals(existingSchedule.ID),
	).Update(
		db.Schedule.Date.Set(date),
		db.Schedule.StartTime.Set(scheduleTime),
		db.Schedule.Status.Set(db.StatusScheduled),
		db.Schedule.Week.Set(req.Week),
	).Exec(r.Context())

	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "failed to update schedule"})
		return
	}

	// Kirim response sukses
	w.WriteHeader(http.StatusOK)
	_ = json.NewEncoder(w).Encode(map[string]string{
		"message": "schedule changed",
	})
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
		week, _ := schedule.Week()
		data := map[string]interface{}{
			"id": schedule.ID,
			"practicum": map[string]interface{}{
				"code":  schedule.Practicum().ID,
				"title": schedule.Practicum().Title,
			},
			"schedule": map[string]interface{}{
				"date":   dateStr,
				"time":   timeStr,
				"week":   week,
				"status": schedule.Status,
			},
		}

		if userRole == "ASISTEN" {
			data["groupId"] = schedule.GroupID
			data["group"] = schedule.Group().Name
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

	// Ubah status praktikum menjadi COMPLETED
	_, err = h.client.Schedule.FindUnique(
		db.Schedule.ID.Equals(req.ScheduleID),
	).Update(
		db.Schedule.Status.Set("FINISHED"),
	).Exec(r.Context())

	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "failed to update status"})
		return
	}

	w.WriteHeader(http.StatusOK)
	_ = json.NewEncoder(w).Encode(map[string]string{"message": "schedule finished"})
}

func (h *ScheduleHandler) GetAllSchedulesForAdmin(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	userRole := r.Context().Value("role").(string)

	if userRole != "SUPER_ADMIN" && userRole != "ADMIN" {
		w.WriteHeader(http.StatusForbidden)
		return
	}

	// Ambil semua jadwal tanpa memfilter berdasarkan status
	schedules, err := h.client.Schedule.FindMany().With(
		db.Schedule.Assistant.Fetch(),
		db.Schedule.Practicum.Fetch(),
		db.Schedule.Group.Fetch(),
	).Exec(r.Context())

	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "failed to fetch schedules"})
		return
	}

	// Jika tidak ada jadwal yang ditemukan, kembalikan array kosong
	if len(schedules) == 0 {
		w.WriteHeader(http.StatusOK)
		_ = json.NewEncoder(w).Encode([]map[string]interface{}{})
		return
	}

	// Format data jadwal untuk response
	var response []map[string]interface{}
	for _, schedule := range schedules {
		assistant := schedule.Assistant()
		practicum := schedule.Practicum()
		group := schedule.Group()
		week, _ := schedule.Week()

		// Get schedule date and start time using accessor functions
		var scheduleDate string
		var startTime string

		if date, ok := schedule.Date(); ok {
			scheduleDate = date.Format("2006-01-02") // Format: YYYY-MM-DD
		}

		if dateTime, ok := schedule.StartTime(); ok {
			startTime = dateTime.Format("15:04") // Format: HH:MM (24-hour)
		}

		scheduleData := map[string]interface{}{
			"assistant": map[string]interface{}{
				"id":   assistant.ID,
				"name": assistant.Name,
				"nrp":  assistant.Nrp,
			},
			"practicum": map[string]interface{}{
				"code":  practicum.ID,
				"title": practicum.Title,
			},
			"group": map[string]interface{}{
				"id":    group.ID,
				"group": group.Name,
				"week":  week,
			},
			"schedule": map[string]interface{}{
				"id":        schedule.ID,
				"date":      scheduleDate,
				"startTime": startTime,
				"status":    schedule.Status,
			},
		}
		response = append(response, scheduleData)
	}

	// Kirim response JSON
	w.WriteHeader(http.StatusOK)
	_ = json.NewEncoder(w).Encode(response)
}

func (h *ScheduleHandler) GetAllSchedules(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	// Ambil semua jadwal dengan status SCHEDULED
	schedules, err := h.client.Schedule.FindMany(
		db.Schedule.Status.Equals(db.StatusScheduled), // Hanya ambil yang sudah terjadwal
	).With(
		db.Schedule.Assistant.Fetch(),
		db.Schedule.Practicum.Fetch(),
		db.Schedule.Group.Fetch(),
	).OrderBy(
		db.Schedule.StartTime.Order(db.SortOrderAsc), // Urutkan berdasarkan waktu
	).Exec(r.Context())

	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "failed to fetch schedules"})
		return
	}

	// Jika tidak ada jadwal yang ditemukan, kembalikan array kosong
	if len(schedules) == 0 {
		w.WriteHeader(http.StatusOK)
		_ = json.NewEncoder(w).Encode([]map[string]interface{}{})
		return
	}

	var response []map[string]interface{}
	for _, schedule := range schedules {
		var dateStr, timeStr string

		if date, ok := schedule.Date(); ok {
			dateStr = date.Format("2006-01-02")
		}
		if startTime, ok := schedule.StartTime(); ok {
			timeStr = startTime.Format("15:04")
		}

		scheduleData := map[string]interface{}{
			"assistantName": schedule.Assistant().Name,
			"group":         schedule.Group().Name,
			"date":          dateStr,
			"time":          timeStr,
			"code":          schedule.PracticumID,
			"practicum":     schedule.Practicum().Title,
		}
		response = append(response, scheduleData)
	}

	w.WriteHeader(http.StatusOK)
	_ = json.NewEncoder(w).Encode(response)
}

func (h *ScheduleHandler) GetNearestSchedules(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	// Ambil userID dan role dari context (asumsi sudah diset di middleware)
	userID := r.Context().Value("userID").(string)
	userRole := r.Context().Value("role").(string)

	// Cari jadwal terdekat berdasarkan role
	var schedule *db.ScheduleModel
	var err error

	if userRole == "PRAKTIKAN" {
		// Jika pengguna adalah praktikan, cari jadwal untuk kelompoknya
		user, err := h.client.User.FindUnique(
			db.User.ID.Equals(userID),
		).With(
			db.User.MemberGroups.Fetch(),
		).Exec(r.Context())

		if err != nil {
			if errors.Is(err, db.ErrNotFound) {
				w.WriteHeader(http.StatusNotFound)
				_ = json.NewEncoder(w).Encode(map[string]string{"error": "user not found"})
				return
			}

			w.WriteHeader(http.StatusInternalServerError)
			_ = json.NewEncoder(w).Encode(map[string]string{"error": "failed to fetch user data"})
			return
		}

		// Ambil groupId dari kelompok user
		if len(user.MemberGroups()) == 0 {
			w.WriteHeader(http.StatusOK)
			_ = json.NewEncoder(w).Encode(nil) // User tidak memiliki kelompok
			return
		}
		groupID := user.MemberGroups()[0].ID // Ambil kelompok pertama (asumsi 1 user hanya punya 1 kelompok)

		// Cari jadwal terdekat untuk kelompok user
		schedule, err = h.client.Schedule.FindFirst(
			db.Schedule.Status.Equals(db.StatusScheduled), // Hanya ambil yang sudah terjadwal
			db.Schedule.GroupID.Equals(groupID),           // Filter berdasarkan groupId
		).With(
			db.Schedule.Assistant.Fetch(),
			db.Schedule.Practicum.Fetch(),
			db.Schedule.Group.Fetch(),
		).OrderBy(
			db.Schedule.StartTime.Order(db.SortOrderAsc), // Urutkan berdasarkan waktu terdekat
		).Exec(r.Context())
	} else if userRole == "ASISTEN" {
		// Jika pengguna adalah asisten, cari jadwal yang terkait dengan asisten tersebut
		schedule, err = h.client.Schedule.FindFirst(
			db.Schedule.Status.Equals(db.StatusScheduled), // Hanya ambil yang sudah terjadwal
			db.Schedule.AssistantID.Equals(userID),        // Filter berdasarkan assistantID
		).With(
			db.Schedule.Assistant.Fetch(),
			db.Schedule.Practicum.Fetch(),
			db.Schedule.Group.Fetch(),
		).OrderBy(
			db.Schedule.StartTime.Order(db.SortOrderAsc), // Urutkan berdasarkan waktu terdekat
		).Exec(r.Context())
	} else {
		// Jika role tidak valid
		w.WriteHeader(http.StatusForbidden)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "akses ditolak"})
		return
	}

	if err != nil {
		// Jika tidak ada jadwal yang ditemukan, kembalikan null
		if errors.Is(err, db.ErrNotFound) {
			w.WriteHeader(http.StatusOK)
			_ = json.NewEncoder(w).Encode(nil)
			return
		}

		// Jika terjadi error lain, kembalikan error
		w.WriteHeader(http.StatusInternalServerError)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "failed to fetch schedules"})
		return
	}

	// Format data jadwal
	var dateStr, timeStr string

	if date, ok := schedule.Date(); ok {
		dateStr = date.Format("2006-01-02")
	}
	if startTime, ok := schedule.StartTime(); ok {
		timeStr = startTime.Format("15:04")
	}

	scheduleData := map[string]interface{}{
		"assistantName": schedule.Assistant().Name,
		"group":         schedule.Group().Name,
		"date":          dateStr,
		"time":          timeStr,
		"code":          schedule.PracticumID,
		"practicum":     schedule.Practicum().Title,
	}

	// Kirim response
	w.WriteHeader(http.StatusOK)
	_ = json.NewEncoder(w).Encode(scheduleData)
}
