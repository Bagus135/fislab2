package handler

import (
	"backend/prisma/db"
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"net/http"
	"strconv"
	"strings"
)

type AssistantHandler struct {
	client *db.PrismaClient
}

func NewAssistantHandler(client *db.PrismaClient) *AssistantHandler {
	return &AssistantHandler{client: client}
}

// SetAssistantToPracticum - Menetapkan asisten ke judul praktikum

func (h *AssistantHandler) SetAssistantToPracticum(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	userRole := r.Context().Value("role").(string)
	if userRole != "SUPER_ADMIN" && userRole != "ADMIN" {
		w.WriteHeader(http.StatusForbidden)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "only SUPER_ADMIN and ADMIN can assign assistants"})
		return
	}

	var req struct {
		PracticumID string `json:"practicumCode"` // Format: MP1, W2, E3
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

	if assistant.Role != db.RoleAsisten {
		w.WriteHeader(http.StatusBadRequest)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "user is not an assistant"})
		return
	}

	// Validasi praktikum
	practicum, err := h.client.Practicum.FindUnique(
		db.Practicum.ID.Equals(req.PracticumID),
	).Exec(r.Context())

	if err != nil {
		w.WriteHeader(http.StatusNotFound)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "practicum not found"})
		return
	}

	// Cek apakah asisten sudah mengampu praktikum lain
	existingSchedules, err := h.client.Schedule.FindMany(
		db.Schedule.AssistantID.Equals(req.AssistantID),
	).Exec(r.Context())

	if err != nil && !errors.Is(err, db.ErrNotFound) {
		w.WriteHeader(http.StatusInternalServerError)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "failed to check existing assignments"})
		return
	}

	// Validasi: Jika asisten sudah mengampu praktikum (apapun), beri pesan error
	if len(existingSchedules) > 0 {
		// Cek apakah asisten sudah mengampu praktikum yang diminta
		alreadyAssigned := false
		var otherPracticumID string

		for _, schedule := range existingSchedules {
			if schedule.PracticumID == req.PracticumID {
				alreadyAssigned = true
				break
			} else {
				otherPracticumID = schedule.PracticumID
			}
		}

		if alreadyAssigned {
			// Jika sudah mengampu praktikum yang diminta, berikan respons sukses
			w.WriteHeader(http.StatusOK)
			_ = json.NewEncoder(w).Encode(map[string]interface{}{
				"message": "assistant already assigned to this practicum",
				"assistant": map[string]interface{}{
					"id":   assistant.ID,
					"name": assistant.Name,
					"nrp":  assistant.Nrp,
				},
				"practicum": map[string]interface{}{
					"id":    practicum.ID,
					"title": practicum.Title,
				},
			})
			return
		} else {
			// Jika mengampu praktikum lain, berikan pesan error yang jelas
			otherPracticum, err := h.client.Practicum.FindUnique(
				db.Practicum.ID.Equals(otherPracticumID),
			).Exec(r.Context())

			if err == nil && otherPracticum != nil {
				w.WriteHeader(http.StatusConflict)
				_ = json.NewEncoder(w).Encode(map[string]interface{}{
					"error":   "assistant is already assigned to another practicum",
					"message": "assistant cannot be assigned to multiple practicums.",
					"currentAssignment": map[string]interface{}{
						"practicumId":    otherPracticum.ID,
						"practicumTitle": otherPracticum.Title,
					},
				})
				return
			} else {
				w.WriteHeader(http.StatusConflict)
				_ = json.NewEncoder(w).Encode(map[string]interface{}{
					"error":   "assistant is already assigned to another practicum",
					"message": "assistant cannot be assigned to multiple practicums.",
				})
				return
			}
		}
	}

	// Cek apakah asisten sudah ditugaskan ke praktikum ini
	existingAssignment, err := h.client.Schedule.FindFirst(
		db.Schedule.PracticumID.Equals(req.PracticumID),
		db.Schedule.AssistantID.Equals(req.AssistantID),
	).Exec(r.Context())

	// Jika asisten sudah ditugaskan ke praktikum ini, berikan respon sukses
	if err == nil && existingAssignment != nil {
		w.WriteHeader(http.StatusOK)
		_ = json.NewEncoder(w).Encode(map[string]interface{}{
			"message": "assistant already assigned to this practicum",
			"assistant": map[string]interface{}{
				"id":   assistant.ID,
				"name": assistant.Name,
				"nrp":  assistant.Nrp,
			},
			"practicum": map[string]interface{}{
				"id":    practicum.ID,
				"title": practicum.Title,
			},
		})
		return
	}

	// Dapatkan grup pertama untuk membuat jadwal placeholder
	groups, err := h.client.Group.FindMany().Take(1).Exec(r.Context())
	if err != nil || len(groups) == 0 {
		w.WriteHeader(http.StatusInternalServerError)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "no groups available for assignment"})
		return
	}
	placeholderGroup := groups[0]

	// Buat jadwal placeholder untuk relasi asisten-praktikum
	newSchedule, err := h.client.Schedule.CreateOne(
		db.Schedule.PracticumID.Set(req.PracticumID),
		db.Schedule.AssistantID.Set(req.AssistantID),
		db.Schedule.GroupID.Set(placeholderGroup.ID),
		db.Schedule.Status.Set(db.StatusUnscheduled),
	).Exec(r.Context())

	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		_ = json.NewEncoder(w).Encode(map[string]string{
			"error": "failed to assign assistant to practicum: " + err.Error(),
		})
		return
	}

	w.WriteHeader(http.StatusCreated)
	_ = json.NewEncoder(w).Encode(map[string]interface{}{
		"message": "assistant assigned to practicum successfully",
		"assistant": map[string]interface{}{
			"id":   assistant.ID,
			"name": assistant.Name,
			"nrp":  assistant.Nrp,
		},
		"practicum": map[string]interface{}{
			"code":  practicum.ID,
			"title": practicum.Title,
		},
		"assignment": map[string]interface{}{
			"id":     newSchedule.ID,
			"status": newSchedule.Status,
		},
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
		PracticumID    string `json:"practicumCode"`
		OldAssistantID string `json:"oldAssistantId"`
		NewAssistantID string `json:"newAssistantId"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		w.WriteHeader(http.StatusBadRequest)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "invalid request format"})
		return
	}

	// Validasi apakah praktikum ada
	practicum, err := h.client.Practicum.FindUnique(
		db.Practicum.ID.Equals(req.PracticumID),
	).Exec(r.Context())

	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "practicum not found"})
		return
	}

	// Validasi apakah asisten lama ada
	oldAssistant, err := h.client.User.FindUnique(
		db.User.ID.Equals(req.OldAssistantID),
	).Exec(r.Context())

	if err != nil || oldAssistant.Role != db.RoleAsisten {
		w.WriteHeader(http.StatusBadRequest)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "old assistant not found or not an assistant"})
		return
	}

	// Validasi apakah asisten baru ada
	newAssistant, err := h.client.User.FindUnique(
		db.User.ID.Equals(req.NewAssistantID),
	).Exec(r.Context())

	if err != nil || newAssistant.Role != db.RoleAsisten {
		w.WriteHeader(http.StatusBadRequest)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "new assistant not found or not an assistant"})
		return
	}

	// Cari jadwal yang ditugaskan ke asisten lama
	existingSchedule, err := h.client.Schedule.FindFirst(
		db.Schedule.PracticumID.Equals(req.PracticumID),
		db.Schedule.AssistantID.Equals(req.OldAssistantID),
	).Exec(r.Context())

	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "old assistant is not assigned to this practicum"})
		return
	}

	// Update jadwal dengan asisten baru
	_, err = h.client.Schedule.FindUnique(
		db.Schedule.ID.Equals(existingSchedule.ID),
	).Update(
		db.Schedule.AssistantID.Set(req.NewAssistantID),
	).Exec(r.Context())

	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		fmt.Printf(err.Error())
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "failed to update assistant assignment"})
		return
	}

	w.WriteHeader(http.StatusOK)
	_ = json.NewEncoder(w).Encode(map[string]interface{}{
		"message": "assistant assignment updated successfully",
		"newAssistant": map[string]interface{}{
			"id":   newAssistant.ID,
			"name": newAssistant.Name,
			"nrp":  newAssistant.Nrp,
		},
		"practicum": map[string]interface{}{
			"id":    practicum.ID,
			"title": practicum.Title,
		},
	})
}

// RemoveAssistantsFromPracticum - Menghapus semua asisten dari praktikum tertentu
func (h *AssistantHandler) RemoveAssistantsFromPracticum(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	userRole := r.Context().Value("role").(string)
	if userRole != "SUPER_ADMIN" && userRole != "ADMIN" {
		w.WriteHeader(http.StatusForbidden)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "you are not allowed to remove assistants from practicum"})
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

	// Validasi praktikum
	practicum, err := h.client.Practicum.FindUnique(
		db.Practicum.ID.Equals(req.PracticumID),
	).Exec(r.Context())

	if err != nil {
		w.WriteHeader(http.StatusNotFound)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "practicum not found"})
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

	// Cek apakah asisten benar-benar mengampu praktikum ini
	existingSchedules, err := h.client.Schedule.FindMany(
		db.Schedule.PracticumID.Equals(req.PracticumID),
		db.Schedule.AssistantID.Equals(req.AssistantID),
	).Exec(r.Context())

	if err != nil && !errors.Is(err, db.ErrNotFound) {
		w.WriteHeader(http.StatusInternalServerError)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "failed to check assistant assignment"})
		return
	}

	// Jika tidak ada jadwal yang ditemukan, berarti asisten tidak mengampu praktikum ini
	if len(existingSchedules) == 0 {
		w.WriteHeader(http.StatusNotFound)
		_ = json.NewEncoder(w).Encode(map[string]string{
			"error": fmt.Sprintf("assistant %s is not assigned to practicum %s", assistant.Name, practicum.Title),
		})
		return
	}

	// Hapus jadwal untuk asisten dalam praktikum ini
	_, err = h.client.Schedule.FindMany(
		db.Schedule.PracticumID.Equals(req.PracticumID),
		db.Schedule.AssistantID.Equals(req.AssistantID),
	).Delete().Exec(r.Context())

	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "failed to delete assistant assignment: " + err.Error()})
		return
	}

	w.WriteHeader(http.StatusOK)
	_ = json.NewEncoder(w).Encode(map[string]interface{}{
		"message":     fmt.Sprintf("assistant %s removed from practicum %s successfully", assistant.Name, practicum.Title),
		"countBefore": len(existingSchedules), // Berapa banyak jadwal sebelum penghapusan
	})
}

// SetAssistantToGroup - Menetapkan asisten ke kelompok dalam praktikum
func (h *AssistantHandler) SetAssistantToGroup(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	userRole := r.Context().Value("role").(string)
	if userRole != "SUPER_ADMIN" && userRole != "ADMIN" {
		w.WriteHeader(http.StatusForbidden)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "you are not allowed to assign assistant"})
		return
	}

	var req struct {
		PracticumID string `json:"practicumCode"` // Format: MP1, W2, E3
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
	practicum, err := h.client.Practicum.FindUnique(
		db.Practicum.ID.Equals(req.PracticumID),
	).Exec(r.Context())

	if err != nil {
		w.WriteHeader(http.StatusNotFound)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "practicum not found"})
		return
	}

	// Validasi group
	group, err := h.client.Group.FindUnique(
		db.Group.ID.Equals(req.GroupID),
	).Exec(r.Context())

	if err != nil {
		w.WriteHeader(http.StatusNotFound)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "group not found"})
		return
	}

	// Cek apakah asisten sudah ditugaskan ke praktikum lain (yang berbeda)
	existingSchedules, err := h.client.Schedule.FindMany(
		db.Schedule.AssistantID.Equals(req.AssistantID),
	).Exec(r.Context())

	if err != nil && !errors.Is(err, db.ErrNotFound) {
		w.WriteHeader(http.StatusInternalServerError)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "failed to check existing assignments"})
		return
	}

	// Jika asisten sudah ditugaskan ke praktikum lain, tolak
	for _, schedule := range existingSchedules {
		if schedule.PracticumID != req.PracticumID {
			w.WriteHeader(http.StatusConflict)
			_ = json.NewEncoder(w).Encode(map[string]string{
				"error": "assistant is already assigned to another practicum",
			})
			return
		}
	}

	// Cek apakah asisten sudah memiliki jadwal pada minggu yang sama dengan grup lain
	// VALIDASI BARU: Asisten hanya bisa mengampu 1x per week
	assistantWeekSchedules, err := h.client.Schedule.FindMany(
		db.Schedule.AssistantID.Equals(req.AssistantID),
		db.Schedule.Week.Equals(req.Week),
		db.Schedule.GroupID.Not(req.GroupID), // Jangan cek grup yang sama
	).Exec(r.Context())

	if err == nil && len(assistantWeekSchedules) > 0 {
		// Asisten sudah mengampu grup lain pada minggu yang sama
		conflictGroup, err := h.client.Group.FindUnique(
			db.Group.ID.Equals(assistantWeekSchedules[0].GroupID),
		).Exec(r.Context())

		if err == nil && conflictGroup != nil {
			w.WriteHeader(http.StatusConflict)
			_ = json.NewEncoder(w).Encode(map[string]string{
				"error": fmt.Sprintf("assistant is already assigned to group %d at week %d", conflictGroup.Name, req.Week),
			})
			return
		} else {
			w.WriteHeader(http.StatusConflict)
			_ = json.NewEncoder(w).Encode(map[string]string{
				"error": fmt.Sprintf("assistant is already assigned to another group at week %d", req.Week),
			})
			return
		}
	}

	// Cek apakah kelompok sudah ditugaskan ke asisten lain pada minggu yang sama
	conflictSchedule, err := h.client.Schedule.FindFirst(
		db.Schedule.PracticumID.Equals(req.PracticumID),
		db.Schedule.GroupID.Equals(req.GroupID),
		db.Schedule.Week.Equals(req.Week),
		db.Schedule.AssistantID.Not(req.AssistantID), // Jangan cek asisten yang sama
	).Exec(r.Context())

	if err == nil && conflictSchedule != nil {
		// Jika ada konflik, beritahu admin
		conflictAssistant, _ := h.client.User.FindUnique(
			db.User.ID.Equals(conflictSchedule.AssistantID),
		).Exec(r.Context())

		conflictName := "Unknown"
		if conflictAssistant != nil {
			conflictName = conflictAssistant.Name
		}

		w.WriteHeader(http.StatusConflict)
		_ = json.NewEncoder(w).Encode(map[string]string{
			"error": fmt.Sprintf("this group is already assigned to %s at week %d", conflictName, req.Week),
		})
		return
	}

	// Cek apakah sudah ada jadwal untuk asisten dan grup ini
	existingAssignment, err := h.client.Schedule.FindFirst(
		db.Schedule.AssistantID.Equals(req.AssistantID),
		db.Schedule.GroupID.Equals(req.GroupID),
	).Exec(r.Context())

	// Jika sudah ada jadwal untuk asisten dan grup ini (pada minggu berapapun)
	if err == nil && existingAssignment != nil {
		// Mendapatkan nilai week dari existingAssignment
		existingWeekVal, ok := existingAssignment.Week()

		// Jika week sudah diatur sebelumnya, jangan izinkan perubahan
		if ok && existingWeekVal > 0 {
			w.WriteHeader(http.StatusBadRequest)
			_ = json.NewEncoder(w).Encode(map[string]string{
				"error": fmt.Sprintf("assignment for this assistant and group already exists with week %d.", existingWeekVal),
			})
			return
		}

		// Jika week belum diatur (null atau 0), izinkan untuk mengatur week
		schedule, err := h.client.Schedule.FindUnique(
			db.Schedule.ID.Equals(existingAssignment.ID),
		).Update(
			db.Schedule.Week.Set(req.Week),
			db.Schedule.Status.Set(db.StatusUnscheduled),
		).Exec(r.Context())

		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			_ = json.NewEncoder(w).Encode(map[string]string{"error": "failed to update schedule week"})
			return
		}

		// Mendapatkan nilai week dari schedule yang sudah diupdate
		var updatedWeek int
		updatedWeekVal, ok := schedule.Week()
		if ok {
			updatedWeek = updatedWeekVal
		} else {
			updatedWeek = req.Week // Fallback ke request value
		}

		// Kirim response berhasil update
		w.WriteHeader(http.StatusOK)
		_ = json.NewEncoder(w).Encode(map[string]interface{}{
			"id":             schedule.ID,
			"practicumCode":  schedule.PracticumID,
			"practicumTitle": practicum.Title,
			"groupId":        schedule.GroupID,
			"group":          group.Name,
			"assistantId":    schedule.AssistantID,
			"assistantName":  assistant.Name,
			"week":           updatedWeek,
			"status":         schedule.Status,
			"message":        "week has been set successfully",
		})
		return
	}

	// Jika jadwal belum ada, buat baru
	newSchedule, err := h.client.Schedule.CreateOne(
		db.Schedule.PracticumID.Set(req.PracticumID),
		db.Schedule.GroupID.Set(req.GroupID),
		db.Schedule.AssistantID.Set(req.AssistantID),
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

	// Mendapatkan nilai week dari newSchedule
	var newWeek int
	newWeekVal, ok := newSchedule.Week()
	if ok {
		newWeek = newWeekVal
	} else {
		newWeek = req.Week // Fallback ke request value
	}

	// Kirim response sukses
	w.WriteHeader(http.StatusCreated)
	_ = json.NewEncoder(w).Encode(map[string]interface{}{
		"id":             newSchedule.ID,
		"practicumCode":  newSchedule.PracticumID,
		"practicumTitle": practicum.Title,
		"groupId":        newSchedule.GroupID,
		"group":          group.Name,
		"assistantId":    newSchedule.AssistantID,
		"assistantName":  assistant.Name,
		"week":           newWeek,
		"status":         newSchedule.Status,
		"message":        "assistant assigned to group successfully",
	})
}

// UpdateAssistantGroupAssignment - Mengubah penugasan asisten ke kelompok
func (h *AssistantHandler) UpdateAssistantGroupAssignment(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	userRole := r.Context().Value("role").(string)
	if userRole != "SUPER_ADMIN" && userRole != "ADMIN" {
		w.WriteHeader(http.StatusForbidden)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "only SUPER_ADMIN and ADMIN can update assistant assignments"})
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

	// Ambil data praktikum dan group
	practicum, err := h.client.Practicum.FindUnique(
		db.Practicum.ID.Equals(existingSchedule.PracticumID),
	).Exec(r.Context())

	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "failed to fetch practicum"})
		return
	}

	group, err := h.client.Group.FindUnique(
		db.Group.ID.Equals(existingSchedule.GroupID),
	).Exec(r.Context())

	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "failed to fetch group"})
		return
	}

	// Jika week yang diminta berbeda dari week saat ini
	// Ambil current week menggunakan accessor function (jika ada)
	var currentWeek int
	if weekVal, ok := existingSchedule.Week(); ok {
		currentWeek = weekVal
	} else {
		currentWeek = 1 // Default jika tidak bisa diambil
	}

	if req.Week > 0 && req.Week != currentWeek {
		// Cek apakah ada jadwal lain dengan kombinasi yang sama
		conflictSchedule, err := h.client.Schedule.FindFirst(
			db.Schedule.PracticumID.Equals(existingSchedule.PracticumID),
			db.Schedule.GroupID.Equals(existingSchedule.GroupID),
			db.Schedule.Week.Equals(req.Week),
			db.Schedule.ID.Not(req.ScheduleID), // Exclude current schedule
		).Exec(r.Context())

		if err == nil && conflictSchedule != nil {
			w.WriteHeader(http.StatusConflict)
			_ = json.NewEncoder(w).Encode(map[string]string{
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
		fmt.Printf("Error updating schedule: %v\n", err)
		w.WriteHeader(http.StatusInternalServerError)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "failed to update assistant assignment"})
		return
	}

	// Ambil week dari updated schedule
	var updatedWeek int
	if weekVal, ok := updatedSchedule.Week(); ok {
		updatedWeek = weekVal
	} else {
		updatedWeek = req.Week // Gunakan input jika gagal diambil
	}

	// Buat response
	response := map[string]interface{}{
		"id":             updatedSchedule.ID,
		"practicumId":    updatedSchedule.PracticumID,
		"practicumTitle": practicum.Title,
		"groupId":        updatedSchedule.GroupID,
		"group":          group.Name,
		"assistantId":    updatedSchedule.AssistantID,
		"assistantName":  assistant.Name,
		"week":           updatedWeek,
		"status":         updatedSchedule.Status,
		"message":        "assistant assignment updated successfully",
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

	// Ambil semua user dengan role ASISTEN
	assistants, err := h.client.User.FindMany(
		db.User.Role.Equals(db.RoleAsisten),
	).Exec(r.Context())

	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "failed to fetch assistants"})
		return
	}

	// Ambil semua jadwal beserta praktikum & kelompok yang diampu
	schedules, err := h.client.Schedule.FindMany().With(
		db.Schedule.Assistant.Fetch(),
		db.Schedule.Practicum.Fetch(),
		db.Schedule.Group.Fetch(),
	).Exec(r.Context())

	if err != nil {
		log.Printf("Error fetching schedules: %v\n", err)
		w.WriteHeader(http.StatusInternalServerError)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "failed to fetch schedules"})
		return
	}

	// Map untuk menyimpan data praktikum berdasarkan ID asisten
	// Gunakan map dengan key asisten ID dan value slice dari jadwal
	scheduleMap := make(map[string][]struct {
		Code  string
		Title string
		Group string
	})

	for _, schedule := range schedules {
		assistant := schedule.Assistant()
		practicum := schedule.Practicum()
		group := schedule.Group()

		// Jika asisten belum ada di map, inisialisasi slice kosong
		if _, exists := scheduleMap[assistant.ID]; !exists {
			scheduleMap[assistant.ID] = []struct {
				Code  string
				Title string
				Group string
			}{}
		}

		// Tambahkan data praktikum ke slice untuk asisten ini
		scheduleMap[assistant.ID] = append(scheduleMap[assistant.ID], struct {
			Code  string
			Title string
			Group string
		}{
			Code:  practicum.ID,
			Title: practicum.Title,
			Group: strconv.Itoa(group.Name),
		})
	}

	// Buat response JSON
	var response []map[string]interface{}
	for _, assistant := range assistants {
		// Cek apakah asisten punya jadwal
		practicumData, hasSchedule := scheduleMap[assistant.ID]

		assistantData := map[string]interface{}{
			"id":    assistant.ID,
			"name":  assistant.Name,
			"nrp":   assistant.Nrp,
			"code":  nil,
			"judul": nil,
			"group": nil,
		}

		if hasSchedule && len(practicumData) > 0 {
			// Ambil data praktikum pertama untuk judul yang diampu
			firstPracticum := practicumData[0]
			assistantData["code"] = firstPracticum.Code
			assistantData["judul"] = firstPracticum.Title

			// Untuk group, kita bisa menampilkan semua grup yang diampu
			var groups []string
			// Tambahkan semua grup dari data jadwal
			for _, scheduleData := range practicumData {
				groups = append(groups, scheduleData.Group)
			}

			// Jika ingin menampilkan semua group
			assistantData["group"] = strings.Join(groups, ", ")
		}

		response = append(response, assistantData)
	}

	w.WriteHeader(http.StatusOK)
	_ = json.NewEncoder(w).Encode(response)
}

func (h *AssistantHandler) GetAssistantStatus(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	// Ambil role dari context
	userRole, ok := r.Context().Value("role").(string)
	if !ok || (userRole != "ADMIN" && userRole != "SUPER_ADMIN") {
		w.WriteHeader(http.StatusForbidden)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "only ADMIN can view assistant status"})
		return
	}

	// Ambil semua jadwal untuk mendapatkan jumlah grup per praktikum
	allSchedules, err := h.client.Schedule.FindMany().With(
		db.Schedule.Practicum.Fetch(),
		db.Schedule.Group.Fetch(),
	).Exec(r.Context())

	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "failed to fetch schedules"})
		return
	}

	// Hitung jumlah grup unik untuk setiap praktikum
	practicumGroupCounts := make(map[string]int)
	practicumGroupMap := make(map[string]map[string]bool)

	for _, schedule := range allSchedules {
		practicumID := schedule.PracticumID
		groupID := schedule.GroupID

		// Inisialisasi map untuk praktikum jika belum ada
		if _, exists := practicumGroupMap[practicumID]; !exists {
			practicumGroupMap[practicumID] = make(map[string]bool)
		}

		// Tandai grup ini sudah ditugaskan ke praktikum
		practicumGroupMap[practicumID][groupID] = true
	}

	// Hitung jumlah grup untuk masing-masing praktikum
	for practicumID, groups := range practicumGroupMap {
		practicumGroupCounts[practicumID] = len(groups)
	}

	// Ambil semua asisten
	assistants, err := h.client.User.FindMany(
		db.User.Role.Equals(db.RoleAsisten),
	).With(
		db.User.AssistantSchedules.Fetch().With(
			db.Schedule.Practicum.Fetch(),
			db.Schedule.Group.Fetch(),
			db.Schedule.Grades.Fetch(),
		),
	).Exec(r.Context())

	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "failed to fetch assistants"})
		return
	}

	// Buat response
	var response []map[string]interface{}

	for _, assistant := range assistants {
		// Proses jadwal asisten
		schedules := assistant.AssistantSchedules()

		// Jika asisten tidak memiliki jadwal, lewati
		if len(schedules) == 0 {
			continue
		}

		// Dapatkan praktikum yang diampu asisten (seharusnya hanya satu judul)
		var practicumID string
		var practicumTitle string

		// Variabel untuk menghitung jumlah grup yang telah selesai
		completedGroups := 0

		// Set untuk melacak grup yang telah diperiksa
		checkedGroups := make(map[string]bool)

		for _, schedule := range schedules {
			// Ambil ID praktikum dari jadwal pertama
			if practicumID == "" {
				practicumID = schedule.PracticumID
				practicumTitle = schedule.Practicum().Title
			}

			// Hanya proses jadwal untuk praktikum yang sama (untuk jaga-jaga)
			if schedule.PracticumID != practicumID {
				continue
			}

			// Hindari menghitung grup yang sama lebih dari sekali
			groupID := schedule.GroupID
			if checkedGroups[groupID] {
				continue
			}
			checkedGroups[groupID] = true

			// Periksa apakah grup ini telah selesai
			if schedule.Status == db.StatusCompleted {
				// Periksa apakah semua anggota grup telah dinilai
				groupMembers := schedule.Group().Members()
				grades := schedule.Grades()

				// Jika jumlah nilai sama dengan atau lebih dari jumlah anggota grup, anggap selesai
				if len(grades) >= len(groupMembers) && len(groupMembers) > 0 {
					completedGroups++
				}
			}
		}

		// Dapatkan total grup untuk praktikum ini
		totalGroups := practicumGroupCounts[practicumID]
		if totalGroups <= 0 {
			totalGroups = 1
		}

		// Tambahkan data ke respons
		response = append(response, map[string]interface{}{
			"code":     practicumID,
			"name":     assistant.Name,
			"progress": fmt.Sprintf("%d/%d", completedGroups, totalGroups),
			"title":    practicumTitle,
		})
	}

	// Kirim response
	w.WriteHeader(http.StatusOK)
	_ = json.NewEncoder(w).Encode(response)
}
