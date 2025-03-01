package handler

import (
	"backend/helper"
	"backend/prisma/db"
	"backend/service"
	"encoding/json"
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

	if currentTime.Format("2006-01-02") != scheduleDate.Format("2006-01-02") {
		w.WriteHeader(http.StatusBadRequest)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "attendance code can only be generated on the same date as the practicum"})
		return
	}

	// **PERBAIKAN: Cek apakah masih ada kode aktif di database**
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

	// **Generate kode baru**
	code := helper.GenerateRandomCode()
	expired := time.Now().Add(30 * time.Minute)

	// **Simpan kode baru ke database**
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

	// **Simpan ke Redis**
	if err := h.cacheService.SetAttendanceCode(req.ScheduleID, code, 30*time.Minute); err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "failed to store attendance code in cache"})
		return
	}

	// **Buat default attendance untuk setiap anggota kelompok**
	for _, member := range schedule.Group().Members() {
		_, err = h.client.Attendance.CreateOne(
			db.Attendance.Code.Link(db.AttendanceCode.ID.Equals(attendanceCode.ID)),
			db.Attendance.User.Link(db.User.ID.Equals(member.ID)),
			db.Attendance.Status.Set("TIDAK_HADIR"),
		).Exec(r.Context())
		if err != nil {
			log.Printf("Failed to create default attendance for user %s: %v\n", member.ID, err)
		}
	}

	// **Kirim respons sukses**
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
		db.AttendanceCode.ScheduleID.Equals(scheduleID), // Pastikan field ini di-fetch
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

	// Cek apakah user sudah pernah submit attendance untuk schedule ini
	existingAttendance, err := h.client.Attendance.FindFirst(
		db.Attendance.UserID.Equals(userID),
	).Exec(r.Context())

	if err == nil && existingAttendance != nil {
		w.WriteHeader(http.StatusBadRequest)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "Anda sudah melakukan presensi untuk jadwal ini"})
		return
	}

	// Buat attendance record baru
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

	// Cari semua AttendanceCode untuk schedule ini
	attendanceCodes, err := h.client.AttendanceCode.FindMany(
		db.AttendanceCode.ScheduleID.Equals(req.ScheduleID),
	).Exec(r.Context())

	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "failed to fetch attendance codes"})
		return
	}

	if len(attendanceCodes) == 0 {
		w.WriteHeader(http.StatusInternalServerError)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "attendance code not found"})
		return
	}

	// Cari Attendance yang sudah ada untuk scheduleId dan userId ini
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

	// Jika record sudah ada, update statusnya
	if existingAttendance != nil {
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
		// Jika record belum ada, buat record baru menggunakan AttendanceCode pertama
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

	// Kirim response
	w.WriteHeader(http.StatusOK)
	_ = json.NewEncoder(w).Encode(map[string]interface{}{
		"message": "attendance updated",
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
