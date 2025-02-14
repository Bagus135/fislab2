package handler

import (
	"backend/prisma/db"
	"encoding/json"
	"fmt"
	"github.com/gorilla/mux"
	"math/rand"
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

func generateRandomCode() string {
	// Generate angular random antara 100000-999999
	m := 100000
	i := 999999

	// Gunakan math/rand dengan source baru
	source := rand.NewSource(time.Now().UnixNano())
	r := rand.New(source)

	// Generate angka random
	code := r.Intn(i-m+1) + m

	// Format menjadi 6 digit dengan leading zeros
	return fmt.Sprintf("%06d", code)
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
	code := generateRandomCode()
	expired := time.Now().Add(30 * time.Minute)

	attendanceCode, err := h.client.AttendanceCode.CreateOne(
		db.AttendanceCode.Schedule.Link(db.Schedule.ID.Equals(req.ScheduleID)),
		db.AttendanceCode.Code.Set(code),
		db.AttendanceCode.ExpiredAt.Set(expired),
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

	attendance, err := h.client.Attendance.UpsertOne(
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
		"id":     attendance.ID,
		"status": attendance.Status,
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
	attendance, err := h.client.Attendance.FindUnique(
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
	_ = json.NewEncoder(w).Encode(map[string]interface{}{
		"id":         attendance.ID,
		"name":       attendance.User().Name,
		"nrp":        attendance.User().Nrp,
		"scheduleId": req.ScheduleID,
		"userId":     req.UserID,
		"status":     attendance.Status,
	})
}

func (h *AttendanceHandler) GetAttendanceStatus(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	userRole := r.Context().Value("role").(string)
	assistantID := r.Context().Value("userID").(string)

	if userRole != "ASISTEN" {
		w.WriteHeader(http.StatusForbidden)
		return
	}

	vars := mux.Vars(r)
	scheduleID, err := strconv.Atoi(vars["id"])
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "invalid scheduleId"})
		return
	}

	schedule, err := h.client.Schedule.FindUnique(
		db.Schedule.ID.Equals(scheduleID),
	).With(
		db.Schedule.Assistant.Fetch(),
		db.Schedule.AttendanceCodes.Fetch(),
	).Exec(r.Context())

	if err != nil || schedule.Assistant().ID != assistantID {
		w.WriteHeader(http.StatusForbidden)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "you are not the assistant for this schedule"})
		return
	}

	attendances, err := h.client.Attendance.FindMany(
		db.Attendance.CodeID.Equals(schedule.AttendanceCodes()[0].ID),
	).With(
		db.Attendance.User.Fetch(),
	).Exec(r.Context())
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "failed to fetch attendance"})
		return
	}

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
