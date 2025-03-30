package handler

import (
	"backend/helper"
	"backend/prisma/db"
	"backend/service"
	"encoding/json"
	"errors"
	"log"
	"net/http"
	"strconv"
	"time"

	"github.com/gorilla/mux"
)

type AttendanceHandler struct {
	client       *db.PrismaClient
	cacheService *service.CacheService
}

func NewAttendanceHandler(client *db.PrismaClient, cacheService *service.CacheService) *AttendanceHandler {
	return &AttendanceHandler{
		client:       client,
		cacheService: cacheService,
	}
}

func (h *AttendanceHandler) GenerateCode(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	userRole := r.Context().Value("role").(string)
	assistantID := r.Context().Value("userID").(string)

	if userRole != "ASISTEN" {
		w.WriteHeader(http.StatusForbidden)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "only assistants can generate attendance codes"})
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

	currentTime := time.Now()
	scheduleDate, hasScheduleDate := schedule.Date()
	if !hasScheduleDate {
		w.WriteHeader(http.StatusBadRequest)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "schedule date is not set"})
		return
	}

	// Modified time check to allow code generation from the scheduled date onwards
	currentDate := currentTime.Format("2006-01-02")
	scheduleDateStr := scheduleDate.Format("2006-01-02")

	if currentDate < scheduleDateStr {
		w.WriteHeader(http.StatusBadRequest)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "attendance code can only be generated on or after the schedule date"})
		return
	}

	// Cek apakah masih ada kode aktif di database
	existingCode, err := h.client.AttendanceCode.FindFirst(
		db.AttendanceCode.ScheduleID.Equals(req.ScheduleID),
		db.AttendanceCode.ExpiredAt.Gt(currentTime),
	).Exec(r.Context())

	if err == nil {
		// Jika ada kode aktif, kembalikan kode yang sudah ada
		w.WriteHeader(http.StatusOK)
		_ = json.NewEncoder(w).Encode(map[string]interface{}{
			"code":         existingCode.Code,
			"expired":      existingCode.ExpiredAt.Format("15:04:05"),
			"message":      "Existing attendance code is still active",
			"totalMembers": len(schedule.Group().Members()),
		})
		return
	}

	// Generate kode baru
	code := helper.GenerateRandomCode()
	expired := time.Now().Add(30 * time.Minute)

	// Get all existing attendance codes for this schedule
	attendanceCodes, err := h.client.AttendanceCode.FindMany(
		db.AttendanceCode.ScheduleID.Equals(req.ScheduleID),
	).Exec(r.Context())
	if err != nil && !errors.Is(err, db.ErrNotFound) {
		w.WriteHeader(http.StatusInternalServerError)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "failed to check existing attendance codes"})
		return
	}

	// Get all existing attendance statuses for this schedule
	existingAttendances := make(map[string]string) // map[userID]status
	for _, existingAttCode := range attendanceCodes {
		attendances, err := h.client.Attendance.FindMany(
			db.Attendance.CodeID.Equals(existingAttCode.ID),
		).Exec(r.Context())
		if err == nil {
			for _, att := range attendances {
				// If a user has multiple attendance records, use the latest status
				// We're assuming the last attendance record in the loop is the latest one
				existingAttendances[att.UserID] = string(att.Status)
			}
		}
	}

	// Simpan kode baru ke database
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

	// Simpan ke Redis (opsional, tergantung kebutuhan)
	if err := h.cacheService.SetAttendanceCode(req.ScheduleID, code, 30*time.Minute); err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "failed to store attendance code in cache"})
		return
	}

	// Buat default attendance untuk setiap anggota kelompok
	for _, member := range schedule.Group().Members() {
		// Use existing status if available, otherwise default to "TIDAK_HADIR"
		status := db.AttendanceStatusTidakHadir
		if existingStatus, ok := existingAttendances[member.ID]; ok {
			status = db.AttendanceStatus(existingStatus)
		}

		_, err = h.client.Attendance.CreateOne(
			db.Attendance.Code.Link(db.AttendanceCode.ID.Equals(attendanceCode.ID)),
			db.Attendance.User.Link(db.User.ID.Equals(member.ID)),
			db.Attendance.Status.Set(status),
		).Exec(r.Context())
		if err != nil {
			log.Printf("Failed to create default attendance for user %s: %v\n", member.ID, err)
		}
	}

	// Kirim respons sukses
	w.WriteHeader(http.StatusCreated)
	_ = json.NewEncoder(w).Encode(map[string]interface{}{
		"code":         code,
		"expired":      expired.Format("15:04:05"),
		"message":      "New code generated, will expire in 30 minutes",
		"totalMembers": len(schedule.Group().Members()),
	})
}

func (h *AttendanceHandler) SubmitAttendance(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	// Validasi role praktikan
	userRole, ok := r.Context().Value("role").(string)
	if !ok || userRole != "PRAKTIKAN" {
		w.WriteHeader(http.StatusForbidden)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "akses ditolak"})
		return
	}

	// Ambil userID dari context
	userID, ok := r.Context().Value("userID").(string)
	if !ok {
		w.WriteHeader(http.StatusUnauthorized)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "tidak terautentikasi"})
		return
	}

	// Ambil schedule_id dari URL path parameter
	vars := mux.Vars(r)
	scheduleIDStr, exists := vars["id"]
	if !exists {
		w.WriteHeader(http.StatusBadRequest)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "schedule_id wajib diisi"})
		return
	}

	// Konversi ke integer
	scheduleID, err := strconv.Atoi(scheduleIDStr)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "format schedule_id tidak valid"})
		return
	}

	// Ambil kode dari request body
	var req struct {
		Code string `json:"code"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		w.WriteHeader(http.StatusBadRequest)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "format request tidak valid"})
		return
	}

	// Validasi kode tidak kosong
	if req.Code == "" {
		w.WriteHeader(http.StatusBadRequest)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "kode wajib diisi"})
		return
	}

	// Cari kode presensi berdasarkan code DAN schedule_id
	attendanceCode, err := h.client.AttendanceCode.FindFirst(
		db.AttendanceCode.Code.Equals(req.Code),
		db.AttendanceCode.ScheduleID.Equals(scheduleID),
	).Exec(r.Context())

	if err != nil {
		w.WriteHeader(http.StatusNotFound)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "kode tidak valid atau tidak sesuai jadwal"})
		return
	}

	// Cek expired
	if time.Now().After(attendanceCode.ExpiredAt) {
		w.WriteHeader(http.StatusBadRequest)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "kode sudah kedaluwarsa"})
		return
	}

	// Cek apakah user sudah pernah submit attendance untuk kode ini
	existingAttendance, err := h.client.Attendance.FindFirst(
		db.Attendance.UserID.Equals(userID),
		db.Attendance.CodeID.Equals(attendanceCode.ID),
	).Exec(r.Context())

	if err == nil && existingAttendance != nil {
		// Jika sudah ada, perbarui statusnya
		_, err = h.client.Attendance.FindUnique(
			db.Attendance.ID.Equals(existingAttendance.ID),
		).Update(
			db.Attendance.Status.Set(db.AttendanceStatusHadir),
		).Exec(r.Context())

		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			_ = json.NewEncoder(w).Encode(map[string]string{"error": "gagal memperbarui presensi"})
			return
		}

		w.WriteHeader(http.StatusOK)
		_ = json.NewEncoder(w).Encode(map[string]interface{}{
			"message": "presensi berhasil diperbarui",
		})
		return
	} else if err != nil && !errors.Is(err, db.ErrNotFound) {
		w.WriteHeader(http.StatusInternalServerError)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "gagal memeriksa presensi"})
		return
	}

	// Jika belum ada, buat record baru
	_, err = h.client.Attendance.CreateOne(
		db.Attendance.Code.Link(db.AttendanceCode.ID.Equals(attendanceCode.ID)),
		db.Attendance.User.Link(db.User.ID.Equals(userID)),
		db.Attendance.Status.Set(db.AttendanceStatusHadir),
	).Exec(r.Context())

	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "gagal menyimpan presensi"})
		return
	}

	w.WriteHeader(http.StatusOK)
	_ = json.NewEncoder(w).Encode(map[string]interface{}{
		"message": "presensi berhasil dicatat",
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

	// Validate input
	if req.ScheduleID == 0 || req.UserID == "" || req.Status == "" {
		w.WriteHeader(http.StatusBadRequest)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "scheduleId, userId, and status are required"})
		return
	}

	// Validate attendance status
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

	// Check if schedule belongs to this assistant
	schedule, err := h.client.Schedule.FindUnique(
		db.Schedule.ID.Equals(req.ScheduleID),
	).With(
		db.Schedule.Assistant.Fetch(),
		db.Schedule.Group.Fetch().With(
			db.Group.Members.Fetch(),
		),
	).Exec(r.Context())

	if err != nil || schedule.Assistant().ID != assistantID {
		w.WriteHeader(http.StatusForbidden)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "you are not the assistant for this schedule"})
		return
	}

	// Validate date - allow manual attendance on or after schedule date
	currentTime := time.Now()
	scheduleDate, hasScheduleDate := schedule.Date()
	if !hasScheduleDate {
		w.WriteHeader(http.StatusBadRequest)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "schedule date is not set"})
		return
	}

	currentDate := currentTime.Format("2006-01-02")
	scheduleDateStr := scheduleDate.Format("2006-01-02")

	if currentDate < scheduleDateStr {
		w.WriteHeader(http.StatusBadRequest)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "attendance can only be updated on or after the schedule date"})
		return
	}

	// Check if user is a member of the group
	isMember := false
	for _, member := range schedule.Group().Members() {
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

	// Find all attendance codes for this schedule
	attendanceCodes, err := h.client.AttendanceCode.FindMany(
		db.AttendanceCode.ScheduleID.Equals(req.ScheduleID),
	).Exec(r.Context())

	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "failed to fetch attendance codes"})
		return
	}

	// If no attendance code exists, create one automatically for manual attendance
	if len(attendanceCodes) == 0 {
		// Create a manual attendance code
		attendanceCode, err := h.client.AttendanceCode.CreateOne(
			db.AttendanceCode.Code.Set("MANUAL-"+helper.GenerateRandomCode()),
			db.AttendanceCode.ExpiredAt.Set(time.Now().Add(24*time.Hour)), // Expires in 24 hours
			db.AttendanceCode.Schedule.Link(db.Schedule.ID.Equals(req.ScheduleID)),
		).Exec(r.Context())

		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			_ = json.NewEncoder(w).Encode(map[string]string{"error": "failed to create manual attendance code"})
			return
		}

		attendanceCodes = []db.AttendanceCodeModel{*attendanceCode}
	}

	// Find existing attendance record for this user and schedule
	var existingAttendance *db.AttendanceModel
	for _, code := range attendanceCodes {
		attendance, err := h.client.Attendance.FindFirst(
			db.Attendance.CodeID.Equals(code.ID),
			db.Attendance.UserID.Equals(req.UserID),
		).Exec(r.Context())

		if err == nil {
			existingAttendance = attendance
			break
		}
	}

	// Update or create attendance record
	if existingAttendance != nil {
		// Update existing record
		_, err = h.client.Attendance.FindUnique(
			db.Attendance.ID.Equals(existingAttendance.ID),
		).Update(
			db.Attendance.Status.Set(req.Status),
		).Exec(r.Context())

		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			_ = json.NewEncoder(w).Encode(map[string]string{"error": "failed to update attendance"})
			return
		}
	} else {
		// Create new record using the first attendance code
		_, err = h.client.Attendance.CreateOne(
			db.Attendance.Code.Link(db.AttendanceCode.ID.Equals(attendanceCodes[0].ID)),
			db.Attendance.User.Link(db.User.ID.Equals(req.UserID)),
			db.Attendance.Status.Set(req.Status),
		).Exec(r.Context())

		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			_ = json.NewEncoder(w).Encode(map[string]string{"error": "failed to create attendance"})
			return
		}
	}

	// Send success response
	w.WriteHeader(http.StatusOK)
	_ = json.NewEncoder(w).Encode(map[string]interface{}{
		"message":   "attendance updated successfully",
		"updatedAt": time.Now().Format(time.RFC3339),
	})
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

func (h *AttendanceHandler) GetAttendanceSummary(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	// Ambil userID dari context (asumsi sudah di-set oleh middleware auth)
	userID := r.Context().Value("userID").(string)

	// Ambil semua attendance untuk user tersebut
	attendances, err := h.client.Attendance.FindMany(
		db.Attendance.UserID.Equals(userID),
	).With(
		db.Attendance.Code.Fetch().With(
			db.AttendanceCode.Schedule.Fetch().With(
				db.Schedule.Practicum.Fetch(),
			),
		),
	).Exec(r.Context())
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "failed to fetch attendance records"})
		return
	}

	// Hitung total kehadiran berdasarkan status
	summary := map[string]int{
		"HADIR":       0,
		"SAKIT":       0,
		"IZIN":        0,
		"TIDAK_HADIR": 0,
	}

	// Map untuk menyimpan status kehadiran per praktikum (menghindari duplikasi)
	attendanceMap := make(map[int]map[string]interface{})

	for _, attendance := range attendances {
		// Update total kehadiran berdasarkan status
		summary[string(attendance.Status)]++

		// Ambil data schedule dari attendance
		schedule := attendance.Code().Schedule()

		// Tangani nilai tanggal schedule
		scheduleDate, hasScheduleDate := schedule.Date()
		if !hasScheduleDate {
			// Jika tanggal tidak diatur, gunakan nilai default atau lewati
			scheduleDate = time.Time{} // Atau tangani sesuai kebutuhan
		}

		// Gunakan scheduleID sebagai kunci untuk menghindari duplikasi
		if _, exists := attendanceMap[schedule.ID]; !exists {
			attendanceMap[schedule.ID] = map[string]interface{}{
				"scheduleId": schedule.ID,
				"title":      schedule.Practicum().Title,
				"date":       scheduleDate.Format("2006-01-02"), // Format tanggal
				"status":     string(attendance.Status),
			}
		}
	}

	// Konversi map ke slice untuk respons
	var attendanceDetails []map[string]interface{}
	for _, detail := range attendanceMap {
		attendanceDetails = append(attendanceDetails, detail)
	}

	// Kirim respons
	w.WriteHeader(http.StatusOK)
	_ = json.NewEncoder(w).Encode(map[string]interface{}{
		"summary":           summary,
		"attendanceDetails": attendanceDetails,
	})
}
