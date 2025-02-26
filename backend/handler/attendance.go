package handler

import (
	"backend/helper"
	"backend/prisma/db"
	"encoding/json"
	"fmt"
	"github.com/gorilla/mux"
	"net/http"
	"strconv"
	"time"
)

type AttendanceHandler struct {
	client *db.PrismaClient
}

func NewAttendanceHandler(client *db.PrismaClient) *AttendanceHandler {
	return &AttendanceHandler{client: client}
}

func (h *AttendanceHandler) GenerateCode(w http.ResponseWriter, r *http.Request) {
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
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "invalid request format"})
		return
	}

	schedule, err := h.client.Schedule.FindUnique(
		db.Schedule.ID.Equals(req.ScheduleID),
	).With(
		db.Schedule.Group.Fetch().With(
			db.Group.Members.Fetch(),
		),
	).Exec(r.Context())

	if err != nil {
		w.WriteHeader(http.StatusNotFound)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "schedule not found"})
		return
	}

	if schedule.AssistantID != assistantID {
		w.WriteHeader(http.StatusForbidden)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "you are not the assistant for this schedule"})
		return
	}

	if schedule.Status != db.StatusScheduled {
		w.WriteHeader(http.StatusBadRequest)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "attendance can only be generated for scheduled practicum"})
		return
	}

	// Validasi bahwa waktu saat ini sudah melewati waktu mulai praktikum
	currentTime := time.Now()
	startTime, hasStartTime := schedule.StartTime()
	if hasStartTime {
		// Jika waktu saat ini masih sebelum waktu mulai praktikum
		if currentTime.Before(startTime) {
			w.WriteHeader(http.StatusBadRequest)
			_ = json.NewEncoder(w).Encode(map[string]string{"error": "attendance code can only be generated after the practicum start time"})
			return
		}
	} else {
		// Jika tidak ada waktu mulai, kembalikan error
		w.WriteHeader(http.StatusBadRequest)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "schedule start time is not set"})
		return
	}

	code := helper.GenerateRandomCode()
	expired := time.Now().Add(30 * time.Minute)

	attendanceCode, err := h.client.AttendanceCode.CreateOne(
		db.AttendanceCode.Code.Set(code),
		db.AttendanceCode.ExpiredAt.Set(expired),
		db.AttendanceCode.Schedule.Link(db.Schedule.ID.Equals(req.ScheduleID)),
	).Exec(r.Context())

	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "failed to generate code"})
		return
	}

	for _, member := range schedule.Group().Members() {
		_, err = h.client.Attendance.CreateOne(
			db.Attendance.Code.Link(db.AttendanceCode.ID.Equals(attendanceCode.ID)),
			db.Attendance.User.Link(db.User.ID.Equals(member.ID)),
			db.Attendance.Status.Set("TIDAK_HADIR"),
		).Exec(r.Context())

		if err != nil {
			fmt.Printf("Failed to create default attendance for user %s: %v\n", member.ID, err)
		}
	}

	w.WriteHeader(http.StatusCreated)
	_ = json.NewEncoder(w).Encode(map[string]interface{}{
		"code":         code,
		"expired":      expired.Format("15:04:05"),
		"message":      "Code will expire in 30 minutes",
		"totalMembers": len(schedule.Group().Members()),
	})
}

func (h *AttendanceHandler) SubmitAttendance(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	userRole := r.Context().Value("role").(string)
	userID := r.Context().Value("userID").(string)

	if userRole != "PRAKTIKAN" {
		w.WriteHeader(http.StatusForbidden)
		return
	}

	var req struct {
		Code string `json:"code"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	if req.Code == "" {
		w.WriteHeader(http.StatusBadRequest)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "code is required"})
		return
	}

	attendanceCode, err := h.client.AttendanceCode.FindUnique(
		db.AttendanceCode.Code.Equals(req.Code)).Exec(r.Context())

	if err != nil {
		w.WriteHeader(http.StatusNotFound)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "invalid code"})
		return
	}

	if time.Now().After(attendanceCode.ExpiredAt) {
		w.WriteHeader(http.StatusBadRequest)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "code has expired"})
		return
	}

	_, err = h.client.Attendance.UpsertOne(
		db.Attendance.CodeIDUserID(
			db.Attendance.CodeID.Equals(attendanceCode.ID),
			db.Attendance.UserID.Equals(userID),
		),
	).Create(
		db.Attendance.Code.Link(db.AttendanceCode.ID.Equals(attendanceCode.ID)),
		db.Attendance.User.Link(db.User.ID.Equals(userID)),
		db.Attendance.Status.Set(db.AttendanceStatusHadir),
	).Update(
		db.Attendance.Status.Set(db.AttendanceStatusHadir),
	).Exec(r.Context())

	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "failed to submit attendance"})
		return
	}

	w.WriteHeader(http.StatusOK)
	_ = json.NewEncoder(w).Encode(map[string]interface{}{
		"message": "attendance success",
	})
}

func (h *AttendanceHandler) UpdateAttendance(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	userRole := r.Context().Value("role").(string)
	assistantID := r.Context().Value("userID").(string)

	if userRole != "ASISTEN" {
		w.WriteHeader(http.StatusForbidden)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "forbidden"})
		return
	}

	var req struct {
		ScheduleID int                 `json:"scheduleId"`
		UserID     string              `json:"userId"`
		Status     db.AttendanceStatus `json:"status"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		w.WriteHeader(http.StatusBadRequest)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "invalid request body"})
		return
	}

	// Validasi input
	if req.ScheduleID == 0 || req.UserID == "" || req.Status == "" {
		w.WriteHeader(http.StatusBadRequest)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "scheduleId, userId, and status are required"})
		return
	}

	// Validasi status absensi
	validStatus := map[db.AttendanceStatus]bool{
		db.AttendanceStatusHadir:      true,
		db.AttendanceStatusIzin:       true,
		db.AttendanceStatusSakit:      true,
		db.AttendanceStatusTidakHadir: true,
	}
	if !validStatus[req.Status] {
		w.WriteHeader(http.StatusBadRequest)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "invalid status"})
		return
	}

	// Cek apakah jadwal terkait dengan asisten ini
	schedule, err := h.client.Schedule.FindUnique(
		db.Schedule.ID.Equals(req.ScheduleID),
	).With(
		db.Schedule.Assistant.Fetch(),
		db.Schedule.AttendanceCodes.Fetch(),
	).Exec(r.Context())

	if err != nil || schedule.Assistant().ID != assistantID {
		w.WriteHeader(http.StatusForbidden)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "you are not the assistant for this schedule"})
		return
	}

	// Cek apakah praktikan adalah anggota kelompok yang terkait dengan jadwal ini
	group, err := h.client.Group.FindUnique(
		db.Group.ID.Equals(schedule.GroupID),
	).With(
		db.Group.Members.Fetch(),
	).Exec(r.Context())

	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "failed to fetch group"})
		return
	}

	// Cek apakah praktikan adalah anggota kelompok
	isMember := false
	for _, member := range group.Members() {
		if member.ID == req.UserID {
			isMember = true
			break
		}
	}

	if !isMember {
		w.WriteHeader(http.StatusBadRequest)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "user is not a member of this group"})
		return
	}

	// Ambil kode absensi pertama
	if len(schedule.AttendanceCodes()) == 0 {
		w.WriteHeader(http.StatusInternalServerError)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "attendance code not found"})
		return
	}
	attendanceCodeID := schedule.AttendanceCodes()[0].ID

	// Lakukan Upsert tanpa With() karena tidak didukung
	_, err = h.client.Attendance.UpsertOne(
		db.Attendance.CodeIDUserID(
			db.Attendance.CodeID.Equals(attendanceCodeID),
			db.Attendance.UserID.Equals(req.UserID),
		),
	).Create(
		db.Attendance.Code.Link(db.AttendanceCode.ID.Equals(attendanceCodeID)),
		db.Attendance.User.Link(db.User.ID.Equals(req.UserID)),
		db.Attendance.Status.Set(req.Status),
	).Update(
		db.Attendance.Status.Set(req.Status),
	).Exec(r.Context())

	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "failed to update attendance"})
		return
	}

	// Query ulang untuk mendapatkan data lengkap dengan User
	_, err = h.client.Attendance.FindUnique(
		db.Attendance.CodeIDUserID(
			db.Attendance.CodeID.Equals(attendanceCodeID),
			db.Attendance.UserID.Equals(req.UserID),
		),
	).With(
		db.Attendance.User.Fetch(),
	).Exec(r.Context())

	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "failed to fetch updated attendance"})
		return
	}

	// Kirim response
	w.WriteHeader(http.StatusOK)
	_ = json.NewEncoder(w).Encode(map[string]string{"message": "atendance updated"})
}

func (h *AttendanceHandler) GetAttendanceStatus(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	userRole := r.Context().Value("role").(string)
	assistantID := r.Context().Value("userID").(string)

	if userRole != "ASISTEN" {
		w.WriteHeader(http.StatusForbidden)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "only assistants can access this resource"})
		return
	}

	vars := mux.Vars(r)
	scheduleID, err := strconv.Atoi(vars["id"])
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "invalid scheduleId"})
		return
	}

	// Ambil schedule beserta assistant dan attendance codes
	schedule, err := h.client.Schedule.FindUnique(
		db.Schedule.ID.Equals(scheduleID),
	).With(
		db.Schedule.Assistant.Fetch(),
		db.Schedule.AttendanceCodes.Fetch(),
	).Exec(r.Context())

	if err != nil {
		w.WriteHeader(http.StatusNotFound)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "schedule not found"})
		return
	}

	// Pastikan asisten yang mengakses adalah asisten yang bertanggung jawab
	if schedule.Assistant().ID != assistantID {
		w.WriteHeader(http.StatusForbidden)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "you are not the assistant for this schedule"})
		return
	}

	// Cek apakah ada attendance codes
	attendanceCodes := schedule.AttendanceCodes()
	if len(attendanceCodes) == 0 {
		w.WriteHeader(http.StatusNotFound)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "attendance code not generated yet"})
		return
	}

	// Ambil attendance berdasarkan attendance code pertama
	attendances, err := h.client.Attendance.FindMany(
		db.Attendance.CodeID.Equals(attendanceCodes[0].ID),
	).With(
		db.Attendance.User.Fetch(),
	).Exec(r.Context())

	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "failed to fetch attendance"})
		return
	}

	// Format response
	var response []map[string]interface{}
	for _, attendance := range attendances {
		response = append(response, map[string]interface{}{
			"id":         attendance.ID,
			"scheduleId": scheduleID,
			"userId":     attendance.User().ID,
			"name":       attendance.User().Name,
			"nrp":        attendance.User().Nrp,
			"status":     attendance.Status,
		})
	}

	w.WriteHeader(http.StatusOK)
	_ = json.NewEncoder(w).Encode(response)
}
