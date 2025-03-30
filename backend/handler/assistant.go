package handler

import (
	"backend/prisma/db"
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"sort"
	"strconv"
	"strings"
	"sync"
	"time"
)

type AssistantHandler struct {
	client *db.PrismaClient
}

func NewAssistantHandler(client *db.PrismaClient) *AssistantHandler {
	return &AssistantHandler{client: client}
}

// SetAssistantToPracticum - Menugaskan asisten ke praktikum menggunakan AssistantPracticum
func (h *AssistantHandler) SetAssistantToPracticum(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	// Validasi role admin atau super admin
	userRole := r.Context().Value("role").(string)
	if userRole != "SUPER_ADMIN" && userRole != "ADMIN" {
		w.WriteHeader(http.StatusForbidden)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "you cannot assign assistants"})
		return
	}

	// Parse request body
	var req struct {
		PracticumID string `json:"practicumCode"`
		AssistantID string `json:"assistantId"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		w.WriteHeader(http.StatusBadRequest)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "invalid request format"})
		return
	}

	// Validasi apakah asisten ada
	assistant, err := h.client.User.FindUnique(
		db.User.ID.Equals(req.AssistantID),
	).Exec(r.Context())
	if err != nil {
		w.WriteHeader(http.StatusNotFound)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "assistant not found"})
		return
	}

	// Cek role asisten
	if assistant.Role != db.RoleAsisten {
		w.WriteHeader(http.StatusBadRequest)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "user is not an assistant"})
		return
	}

	// Validasi praktikum
	_, err = h.client.Practicum.FindUnique(
		db.Practicum.ID.Equals(req.PracticumID),
	).Exec(r.Context())
	if err != nil {
		w.WriteHeader(http.StatusNotFound)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "practicum not found"})
		return
	}

	// Cek apakah asisten sudah ditugaskan ke praktikum ini
	existingAssignment, err := h.client.AssistantPracticum.FindFirst(
		db.AssistantPracticum.AssistantID.Equals(req.AssistantID),
		db.AssistantPracticum.PracticumID.Equals(req.PracticumID),
	).Exec(r.Context())

	if err == nil && existingAssignment != nil {
		w.WriteHeader(http.StatusOK)
		_ = json.NewEncoder(w).Encode(map[string]interface{}{
			"message": "assistant already assigned to this practicum",
		})
		return
	}

	// Cek apakah asisten sudah mengampu praktikum lain
	otherAssignment, err := h.client.AssistantPracticum.FindFirst(
		db.AssistantPracticum.AssistantID.Equals(req.AssistantID),
	).With(
		db.AssistantPracticum.Practicum.Fetch(),
	).Exec(r.Context())

	if err == nil && otherAssignment != nil {
		w.WriteHeader(http.StatusConflict)
		_ = json.NewEncoder(w).Encode(map[string]interface{}{
			"error": "assistant is already assigned to another practicum",
		})
		return
	}

	_, err = h.client.AssistantPracticum.CreateOne(
		db.AssistantPracticum.Assistant.Link(db.User.ID.Equals(req.AssistantID)),
		db.AssistantPracticum.Practicum.Link(db.Practicum.ID.Equals(req.PracticumID)),
	).Exec(r.Context())

	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "failed to assign assistant to practicum"})
		return
	}

	// Kirim response sukses
	w.WriteHeader(http.StatusCreated)
	_ = json.NewEncoder(w).Encode(map[string]interface{}{
		"message": "assistant successfully assigned to practicum",
	})
}

func (h *AssistantHandler) UpdateAssistantPracticum(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	userRole := r.Context().Value("role").(string)
	if userRole != "SUPER_ADMIN" && userRole != "ADMIN" {
		w.WriteHeader(http.StatusForbidden)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "only SUPER_ADMIN and ADMIN can edit assistant assignments"})
		return
	}

	var req struct {
		OldPracticumID string `json:"oldPracticumCode"`
		NewPracticumID string `json:"newPracticumCode"`
		AssistantID    string `json:"assistantId"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		w.WriteHeader(http.StatusBadRequest)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "invalid request format"})
		return
	}

	// Validasi asisten
	assistant, err := h.client.User.FindUnique(
		db.User.ID.Equals(req.AssistantID),
	).Exec(r.Context())

	if err != nil || assistant.Role != db.RoleAsisten {
		w.WriteHeader(http.StatusBadRequest)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "assistant not found or not an assistant"})
		return
	}

	// Validasi praktikum lama
	_, err = h.client.Practicum.FindUnique(
		db.Practicum.ID.Equals(req.OldPracticumID),
	).Exec(r.Context())

	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "old practicum not found"})
		return
	}

	// Validasi praktikum baru
	_, err = h.client.Practicum.FindUnique(
		db.Practicum.ID.Equals(req.NewPracticumID),
	).Exec(r.Context())

	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "new practicum not found"})
		return
	}

	// Validasi asisten mengampu praktikum lama
	_, err = h.client.AssistantPracticum.FindFirst(
		db.AssistantPracticum.AssistantID.Equals(req.AssistantID),
		db.AssistantPracticum.PracticumID.Equals(req.OldPracticumID),
	).Exec(r.Context())

	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "assistant is not assigned to the old practicum"})
		return
	}

	// Cek apakah asisten masih punya jadwal dengan grup
	existingSchedules, err := h.client.Schedule.FindMany(
		db.Schedule.AssistantID.Equals(req.AssistantID),
		db.Schedule.PracticumID.Equals(req.OldPracticumID),
	).With(
		db.Schedule.Group.Fetch(),
	).Exec(r.Context())

	if err == nil && len(existingSchedules) > 0 {
		// Buat daftar grup yang masih diampu
		var groups []string
		for _, schedule := range existingSchedules {
			groups = append(groups, fmt.Sprintf("Group %d", schedule.Group().Name))
		}

		w.WriteHeader(http.StatusConflict)
		_ = json.NewEncoder(w).Encode(map[string]interface{}{
			"error": "cannot change practicum while assistant still has group assignments. Please remove all group assignments first",
		})
		return
	}

	// Hapus penugasan lama
	_, err = h.client.AssistantPracticum.FindMany(
		db.AssistantPracticum.AssistantID.Equals(req.AssistantID),
		db.AssistantPracticum.PracticumID.Equals(req.OldPracticumID),
	).Delete().Exec(r.Context())

	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "failed to remove old assignment"})
		return
	}

	// Buat penugasan baru
	_, err = h.client.AssistantPracticum.CreateOne(
		db.AssistantPracticum.Assistant.Link(db.User.ID.Equals(req.AssistantID)),
		db.AssistantPracticum.Practicum.Link(db.Practicum.ID.Equals(req.NewPracticumID)),
	).Exec(r.Context())

	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "failed to create new assignment"})
		return
	}

	// Response sukses
	w.WriteHeader(http.StatusOK)
	_ = json.NewEncoder(w).Encode(map[string]interface{}{
		"message": "assistant practicum updated successfully",
	})
}

func (h *AssistantHandler) RemoveAssistantsFromPracticum(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	userRole := r.Context().Value("role").(string)
	if userRole != "SUPER_ADMIN" && userRole != "ADMIN" {
		w.WriteHeader(http.StatusForbidden)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "you are not allowed to remove assistants"})
		return
	}

	var req struct {
		PracticumID string `json:"practicumCode"`
		AssistantID string `json:"assistantId"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		w.WriteHeader(http.StatusBadRequest)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "invalid request format"})
		return
	}

	// Verifikasi bahwa penugasan ada sebelum menghapus
	existingAssignment, err := h.client.AssistantPracticum.FindFirst(
		db.AssistantPracticum.AssistantID.Equals(req.AssistantID),
		db.AssistantPracticum.PracticumID.Equals(req.PracticumID),
	).Exec(r.Context())

	if err != nil || existingAssignment == nil {
		w.WriteHeader(http.StatusNotFound)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "assignment not found"})
		return
	}

	// Hapus penugasan dari AssistantPracticum
	_, err = h.client.AssistantPracticum.FindMany(
		db.AssistantPracticum.AssistantID.Equals(req.AssistantID),
		db.AssistantPracticum.PracticumID.Equals(req.PracticumID),
	).Delete().Exec(r.Context())

	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "failed to remove assignment"})
		return
	}

	// Hapus juga semua jadwal terkait
	_, err = h.client.Schedule.FindMany(
		db.Schedule.AssistantID.Equals(req.AssistantID),
		db.Schedule.PracticumID.Equals(req.PracticumID),
	).Delete().Exec(r.Context())

	if err != nil {
		log.Printf("Warning: Failed to delete related schedules: %v", err)
	}

	w.WriteHeader(http.StatusOK)
	_ = json.NewEncoder(w).Encode(map[string]string{
		"message": "assistant removed from practicum successfully",
	})
}

func (h *AssistantHandler) SetAssistantToGroup(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	userRole := r.Context().Value("role").(string)
	if userRole != "SUPER_ADMIN" && userRole != "ADMIN" {
		w.WriteHeader(http.StatusForbidden)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "you are not allowed to assign assistant"})
		return
	}

	var req struct {
		PracticumID string `json:"practicumCode"`
		GroupID     string `json:"groupId"`
		AssistantID string `json:"assistantId"`
		Week        int    `json:"week"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		w.WriteHeader(http.StatusBadRequest)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "invalid request format"})
		return
	}

	// Validasi week
	if req.Week <= 0 {
		w.WriteHeader(http.StatusBadRequest)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "week must be a positive number"})
		return
	}

	// Validasi asisten
	assistant, err := h.client.User.FindUnique(
		db.User.ID.Equals(req.AssistantID),
	).Exec(r.Context())
	if err != nil {
		w.WriteHeader(http.StatusNotFound)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "assistant not found"})
		return
	}

	// Validasi role asisten
	if assistant.Role != db.RoleAsisten {
		w.WriteHeader(http.StatusBadRequest)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "user is not an assistant"})
		return
	}

	// Validasi praktikum
	_, err = h.client.Practicum.FindUnique(
		db.Practicum.ID.Equals(req.PracticumID),
	).Exec(r.Context())
	if err != nil {
		w.WriteHeader(http.StatusNotFound)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "practicum not found"})
		return
	}

	// Validasi group
	_, err = h.client.Group.FindUnique(
		db.Group.ID.Equals(req.GroupID),
	).Exec(r.Context())
	if err != nil {
		w.WriteHeader(http.StatusNotFound)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "group not found"})
		return
	}

	// Validasi asisten sudah ditugaskan ke praktikum di AssistantPracticum
	assignmentExists, err := h.client.AssistantPracticum.FindFirst(
		db.AssistantPracticum.AssistantID.Equals(req.AssistantID),
		db.AssistantPracticum.PracticumID.Equals(req.PracticumID),
	).Exec(r.Context())
	if err != nil || assignmentExists == nil {
		w.WriteHeader(http.StatusBadRequest)
		_ = json.NewEncoder(w).Encode(map[string]string{
			"error": "assistant must be assigned to practicum first before being assigned to a group",
		})
		return
	}

	existingAssignment, err := h.client.Schedule.FindFirst(
		db.Schedule.AssistantID.Equals(req.AssistantID),
		db.Schedule.GroupID.Equals(req.GroupID),
		db.Schedule.PracticumID.Equals(req.PracticumID),
	).With(
		db.Schedule.Group.Fetch(),
	).Exec(r.Context())

	if err == nil && existingAssignment != nil {
		weekVal, _ := existingAssignment.Week()
		w.WriteHeader(http.StatusConflict)
		_ = json.NewEncoder(w).Encode(map[string]interface{}{
			"error": fmt.Sprintf("This assistant is already assigned to group %d at week %d",
				existingAssignment.Group().Name,
				weekVal,
			),
		})
		return
	}

	existingWeekSchedule, err := h.client.Schedule.FindFirst(
		db.Schedule.AssistantID.Equals(req.AssistantID),
		db.Schedule.Week.Equals(req.Week),
	).With(
		db.Schedule.Group.Fetch(),
		db.Schedule.Practicum.Fetch(),
	).Exec(r.Context())

	if err == nil && existingWeekSchedule != nil {
		w.WriteHeader(http.StatusConflict)
		_ = json.NewEncoder(w).Encode(map[string]interface{}{
			"error": fmt.Sprintf("Assistant already has schedule at week %d", req.Week),
		})
		return
	}

	// 3. Cek apakah kelompok sudah ada jadwal di week yang sama
	existingGroupSchedule, err := h.client.Schedule.FindFirst(
		db.Schedule.GroupID.Equals(req.GroupID),
		db.Schedule.Week.Equals(req.Week),
	).With(
		db.Schedule.Assistant.Fetch(),
		db.Schedule.Practicum.Fetch(),
	).Exec(r.Context())

	if err == nil && existingGroupSchedule != nil {
		w.WriteHeader(http.StatusConflict)
		_ = json.NewEncoder(w).Encode(map[string]interface{}{
			"error": fmt.Sprintf("Group already has schedule at week %d", req.Week),
		})
		return
	}

	// Buat jadwal baru
	_, err = h.client.Schedule.CreateOne(
		db.Schedule.Practicum.Link(db.Practicum.ID.Equals(req.PracticumID)),
		db.Schedule.Group.Link(db.Group.ID.Equals(req.GroupID)),
		db.Schedule.Assistant.Link(db.User.ID.Equals(req.AssistantID)),
		db.Schedule.Week.Set(req.Week),
		db.Schedule.Status.Set(db.StatusUnscheduled),
	).Exec(r.Context())

	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		_ = json.NewEncoder(w).Encode(map[string]string{
			"error": "failed to assign assistant to group: " + err.Error(),
		})
		return
	}

	// Response sukses dengan detail lengkap
	w.WriteHeader(http.StatusCreated)
	_ = json.NewEncoder(w).Encode(map[string]interface{}{
		"message": "assistant assigned to group successfully",
	})
}

func (h *AssistantHandler) UpdateAssistantGroupAssignment(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	userRole := r.Context().Value("role").(string)
	if userRole != "SUPER_ADMIN" && userRole != "ADMIN" {
		w.WriteHeader(http.StatusForbidden)
		return
	}

	var req struct {
		ScheduleID  int    `json:"scheduleId"`  // ID jadwal yang akan diubah
		AssistantID string `json:"assistantId"` // Asisten baru
		Week        int    `json:"week"`        // Week baru (opsional)
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		w.WriteHeader(http.StatusBadRequest)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "invalid request format"})
		return
	}

	// Validasi schedule ID
	existingSchedule, err := h.client.Schedule.FindUnique(
		db.Schedule.ID.Equals(req.ScheduleID),
	).Exec(r.Context())

	if err != nil {
		w.WriteHeader(http.StatusNotFound)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "schedule not found"})
		return
	}

	// Validasi asisten baru
	assistant, err := h.client.User.FindUnique(
		db.User.ID.Equals(req.AssistantID),
	).Exec(r.Context())

	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "assistant not found"})
		return
	}

	// Validasi role asisten
	if assistant.Role != db.RoleAsisten {
		w.WriteHeader(http.StatusBadRequest)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "user is not an assistant"})
		return
	}

	// VALIDASI BARU: Cek apakah asisten baru sudah ditugaskan ke praktikum yang sama
	assignmentExists, err := h.client.AssistantPracticum.FindFirst(
		db.AssistantPracticum.AssistantID.Equals(req.AssistantID),
		db.AssistantPracticum.PracticumID.Equals(existingSchedule.PracticumID),
	).With(
		db.AssistantPracticum.Practicum.Fetch(),
	).Exec(r.Context())

	if err != nil || assignmentExists == nil {
		w.WriteHeader(http.StatusBadRequest)
		_ = json.NewEncoder(w).Encode(map[string]interface{}{
			"error": "new assistant must be assigned to the same practicum first",
		})
		return
	}

	// Ambil data praktikum dan group
	_, err = h.client.Practicum.FindUnique(
		db.Practicum.ID.Equals(existingSchedule.PracticumID),
	).Exec(r.Context())

	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "failed to fetch practicum"})
		return
	}

	_, err = h.client.Group.FindUnique(
		db.Group.ID.Equals(existingSchedule.GroupID),
	).Exec(r.Context())

	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "failed to fetch group"})
		return
	}

	// Cek jadwal asisten baru di week yang sama (jika week diubah)
	if req.Week > 0 {
		assistantSchedule, err := h.client.Schedule.FindFirst(
			db.Schedule.AssistantID.Equals(req.AssistantID),
			db.Schedule.Week.Equals(req.Week),
			db.Schedule.ID.Not(req.ScheduleID),
		).With(
			db.Schedule.Group.Fetch(),
		).Exec(r.Context())

		if err == nil && assistantSchedule != nil {
			w.WriteHeader(http.StatusConflict)
			_ = json.NewEncoder(w).Encode(map[string]interface{}{
				"error": fmt.Sprintf("new assistant already has schedule at week %d", req.Week),
			})
			return
		}
	}

	// Jika week yang diminta berbeda dari week saat ini
	var currentWeek int
	if weekVal, ok := existingSchedule.Week(); ok {
		currentWeek = weekVal
	} else {
		currentWeek = 1
	}

	if req.Week > 0 && req.Week != currentWeek {
		// Cek apakah ada jadwal lain dengan kombinasi yang sama
		conflictSchedule, err := h.client.Schedule.FindFirst(
			db.Schedule.PracticumID.Equals(existingSchedule.PracticumID),
			db.Schedule.GroupID.Equals(existingSchedule.GroupID),
			db.Schedule.Week.Equals(req.Week),
			db.Schedule.ID.Not(req.ScheduleID),
		).With(
			db.Schedule.Assistant.Fetch(),
		).Exec(r.Context())

		if err == nil && conflictSchedule != nil {
			w.WriteHeader(http.StatusConflict)
			_ = json.NewEncoder(w).Encode(map[string]interface{}{
				"error": "there is already a schedule for this group at the specified week",
			})
			return
		}
	}

	// Update jadwal
	updatedSchedule, err := h.client.Schedule.FindUnique(
		db.Schedule.ID.Equals(req.ScheduleID),
	).Update(
		db.Schedule.AssistantID.Set(req.AssistantID),
		db.Schedule.Week.Set(req.Week),
	).Exec(r.Context())

	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "failed to update assistant assignment"})
		return
	}

	// Ambil week dari updated schedule
	var _ int
	if weekVal, ok := updatedSchedule.Week(); ok {
		_ = weekVal
	} else {
		_ = req.Week
	}

	// Buat response
	response := map[string]interface{}{
		"message": "assistant assignment updated successfully",
	}

	w.WriteHeader(http.StatusOK)
	_ = json.NewEncoder(w).Encode(response)
}

// RemoveAssistantFromGroup - Menghapus asisten dari kelompok dalam praktikum
func (h *AssistantHandler) RemoveAssistantFromGroup(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	userRole := r.Context().Value("role").(string)
	if userRole != "SUPER_ADMIN" && userRole != "ADMIN" {
		w.WriteHeader(http.StatusForbidden)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "you are not allowed to remove assistant"})
		return
	}

	var req struct {
		GroupID     string `json:"groupId"`
		AssistantID string `json:"assistantId"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		w.WriteHeader(http.StatusBadRequest)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "invalid request format"})
		return
	}

	// Validasi apakah jadwal tersebut ada
	schedule, err := h.client.Schedule.FindFirst(
		db.Schedule.GroupID.Equals(req.GroupID),
		db.Schedule.AssistantID.Equals(req.AssistantID),
	).Exec(r.Context())

	if err != nil {
		w.WriteHeader(http.StatusNotFound)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "assignment not found"})
		return
	}

	// Hapus jadwal asisten dari kelompok
	// Perhatikan bahwa err di sini tidak perlu diberi nilai awal "_"
	_, err = h.client.Schedule.FindUnique(
		db.Schedule.ID.Equals(schedule.ID),
	).Delete().Exec(r.Context())

	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "failed to delete assignment: " + err.Error()})
		return
	}

	w.WriteHeader(http.StatusOK)
	_ = json.NewEncoder(w).Encode(map[string]string{"message": "assistant removed from group successfully"})
}

func (h *AssistantHandler) GetAssistants(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	userRole := r.Context().Value("role").(string)
	if userRole != "SUPER_ADMIN" && userRole != "ADMIN" {
		w.WriteHeader(http.StatusForbidden)
		return
	}

	// Ambil semua asisten dengan relasi ke praktikum dan jadwal
	assistants, err := h.client.User.FindMany(
		db.User.Role.Equals(db.RoleAsisten),
	).With(
		// Ambil praktikum yang diampu
		db.User.Practicums.Fetch().With(
			db.AssistantPracticum.Practicum.Fetch(),
		),
		// Ambil jadwal untuk mendapatkan grup
		db.User.AssistantSchedules.Fetch().With(
			db.Schedule.Group.Fetch(),
			db.Schedule.Practicum.Fetch(),
		),
	).Exec(r.Context())

	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "failed to fetch assistants"})
		return
	}

	var response []map[string]interface{}
	for _, assistant := range assistants {
		practicums := assistant.Practicums()
		schedules := assistant.AssistantSchedules()

		assistantData := map[string]interface{}{
			"id":          assistant.ID,
			"name":        assistant.Name,
			"nrp":         assistant.Nrp,
			"code":        nil,
			"judul":       nil,
			"group":       nil,
			"weeks":       nil,
			"scheduleIds": []int{},
		}

		// Jika asisten memiliki praktikum yang diampu
		if len(practicums) > 0 {
			practicum := practicums[0].Practicum()
			assistantData["code"] = practicum.ID
			assistantData["judul"] = practicum.Title

			// Kumpulkan informasi grup, minggu, dan scheduleId
			var groups []string
			var weeks []int
			var scheduleIds []int
			groupMap := make(map[string]bool) // untuk menghindari duplikasi grup

			for _, schedule := range schedules {
				if schedule.PracticumID == practicum.ID {
					group := schedule.Group()
					groupStr := strconv.Itoa(group.Name)

					// Tambahkan grup jika belum ada
					if !groupMap[groupStr] {
						groups = append(groups, groupStr)
						groupMap[groupStr] = true
					}

					// Tambahkan minggu jika ada
					if weekVal, ok := schedule.Week(); ok {
						weeks = append(weeks, weekVal)
					}

					// Tambahkan scheduleId
					scheduleIds = append(scheduleIds, schedule.ID)
				}
			}

			// Sort groups dan weeks untuk konsistensi
			sort.Strings(groups)
			sort.Ints(weeks)

			if len(groups) > 0 {
				assistantData["group"] = strings.Join(groups, ", ")
			}
			if len(weeks) > 0 {
				assistantData["weeks"] = weeks
			}
			if len(scheduleIds) > 0 {
				assistantData["scheduleIds"] = scheduleIds
			}
		}

		response = append(response, assistantData)
	}

	w.WriteHeader(http.StatusOK)
	_ = json.NewEncoder(w).Encode(response)
}

func (h *AssistantHandler) GetAssistantStatus(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	// 1. Context dengan timeout
	ctx, cancel := context.WithTimeout(r.Context(), 10*time.Second)
	defer cancel()

	// 2. Validasi role
	if !isAuthorized(r) {
		respondWithError(w, http.StatusForbidden, "only ADMIN can view assistant status")
		return
	}

	// 3. Gunakan worker pool pattern untuk proses konkuren
	type result struct {
		data map[string]interface{}
		err  error
	}

	// 4. Ambil semua asisten dengan pagination
	assistants, err := h.client.User.FindMany(
		db.User.Role.Equals(db.RoleAsisten),
	).With(
		db.User.AssistantSchedules.Fetch().With(
			db.Schedule.Practicum.Fetch(),
			db.Schedule.Group.Fetch().With(
				db.Group.Members.Fetch(),
			),
			db.Schedule.Grades.Fetch(),
		),
	).Take(500).Exec(ctx)

	if err != nil {
		log.Printf("Failed to fetch assistants: %v", err)
		respondWithError(w, http.StatusInternalServerError, "failed to fetch assistants")
		return
	}

	// 5. Hitung grup per praktikum secara parallel
	practicumGroupCounts := h.countPracticumGroupsConcurrently(ctx)

	// 6. Buat worker pool untuk proses data asisten
	numWorkers := 5 // Sesuaikan dengan CPU cores
	assistantChan := make(chan db.UserModel, len(assistants))
	resultChan := make(chan result, len(assistants))

	// Start workers
	var wg sync.WaitGroup
	for i := 0; i < numWorkers; i++ {
		wg.Add(1)
		go func() {
			defer wg.Done()
			for assistant := range assistantChan {
				res, err := h.processAssistant(assistant, practicumGroupCounts)
				resultChan <- result{data: res, err: err}
			}
		}()
	}

	// Feed data ke channel
	for _, assistant := range assistants {
		assistantChan <- assistant
	}
	close(assistantChan)

	// Tunggu semua worker selesai
	go func() {
		wg.Wait()
		close(resultChan)
	}()

	// 7. Stream hasil ke client
	w.WriteHeader(http.StatusOK)
	encoder := json.NewEncoder(w)
	_, _ = w.Write([]byte("["))

	first := true
	for res := range resultChan {
		if res.err != nil {
			log.Printf("Error processing assistant: %v", res.err)
			continue
		}

		if res.data == nil {
			continue
		}

		if !first {
			_, _ = w.Write([]byte(","))
		}
		first = false

		if err := encoder.Encode(res.data); err != nil {
			log.Printf("Error encoding response: %v", err)
			continue
		}

		// Flush buffer secara periodic
		if flusher, ok := w.(http.Flusher); ok {
			flusher.Flush()
		}
	}

	_, _ = w.Write([]byte("]"))
}

func (h *AssistantHandler) countPracticumGroupsConcurrently(ctx context.Context) map[string]int {
	// Gunakan map sync untuk thread safety
	var mu sync.Mutex
	counts := make(map[string]int)

	// Ambil semua grup dengan schedules
	groups, err := h.client.Group.FindMany().With(
		db.Group.Schedules.Fetch().With(
			db.Schedule.Practicum.Fetch(),
		),
	).Exec(ctx)

	if err != nil {
		log.Printf("Error fetching groups: %v", err)
		return counts
	}

	var wg sync.WaitGroup
	semaphore := make(chan struct{}, 10) // Batasi konkurensi

	for _, group := range groups {
		wg.Add(1)
		go func(g db.GroupModel) {
			defer wg.Done()
			semaphore <- struct{}{}
			defer func() { <-semaphore }()

			for _, schedule := range g.Schedules() {
				mu.Lock()
				counts[schedule.PracticumID]++
				mu.Unlock()
			}
		}(group)
	}

	wg.Wait()
	return counts
}

func (h *AssistantHandler) processAssistant(assistant db.UserModel, practicumGroupCounts map[string]int, ) (map[string]interface{}, error) {
	schedules := assistant.AssistantSchedules()
	if len(schedules) == 0 {
		return nil, nil
	}

	// Gunakan sync.Map untuk thread-safe access jika diperlukan
	var completedGroups int
	checkedGroups := make(map[string]bool)
	var practicumID, practicumTitle string

	for _, schedule := range schedules {
		if practicumID == "" {
			practicumID = schedule.PracticumID
			practicumTitle = schedule.Practicum().Title
		}

		if schedule.PracticumID != practicumID {
			continue
		}

		groupID := schedule.GroupID
		if checkedGroups[groupID] {
			continue
		}
		checkedGroups[groupID] = true

		if schedule.Status == db.StatusCompleted {
			groupMembers := schedule.Group().Members()
			grades := schedule.Grades()
			if len(grades) >= len(groupMembers) && len(groupMembers) > 0 {
				completedGroups++
			}
		}
	}

	totalGroups := practicumGroupCounts[practicumID]
	if totalGroups == 0 {
		totalGroups = 1
	}

	return map[string]interface{}{
		"code":     practicumID,
		"name":     assistant.Name,
		"progress": fmt.Sprintf("%d/%d", completedGroups, totalGroups),
		"title":    practicumTitle,
	}, nil
}

func isAuthorized(r *http.Request) bool {
	userRole, ok := r.Context().Value("role").(string)
	return ok && (userRole == "ADMIN" || userRole == "SUPER_ADMIN")
}

func respondWithError(w http.ResponseWriter, code int, message string) {
	w.WriteHeader(code)
	_ = json.NewEncoder(w).Encode(map[string]string{"error": message})
}
