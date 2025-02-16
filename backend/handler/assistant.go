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

	userRole := r.Context().Value("role").(string)
	if userRole != "SUPER_ADMIN" && userRole != "ADMIN" {
		w.WriteHeader(http.StatusForbidden)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "only SUPER_ADMIN and ADMIN can assign assistants"})
		return
	}

	var req struct {
		PracticumID int    `json:"practicumId"`
		GroupID     string `json:"groupId"`
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
		w.WriteHeader(http.StatusBadRequest)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "assistant not found"})
		return
	}

	if assistant.Role != "ASISTEN" {
		w.WriteHeader(http.StatusBadRequest)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "user is not an assistant"})
		return
	}

	// Cek apakah asisten sudah mengampu praktikum
	existingAssistantPracticum, err := h.client.Schedule.FindFirst(
		db.Schedule.AssistantID.Equals(req.AssistantID),
	).Exec(r.Context())

	if err == nil && existingAssistantPracticum.PracticumID != req.PracticumID {
		// Jika asisten sudah mengampu praktikum lain, tolak permintaan
		w.WriteHeader(http.StatusConflict)
		_ = json.NewEncoder(w).Encode(map[string]string{
			"error": "assistant is already assigned to another practicum",
		})
		return
	}

	// Validasi praktikum
	_, err = h.client.Practicum.FindUnique(
		db.Practicum.ID.Equals(req.PracticumID),
	).Exec(r.Context())

	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "practicum not found"})
		return
	}

	// Validasi group
	_, err = h.client.Group.FindUnique(
		db.Group.ID.Equals(req.GroupID),
	).Exec(r.Context())

	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "group not found"})
		return
	}

	// Cek apakah sudah ada jadwal untuk kombinasi praktikum, asisten, dan kelompok
	existingSchedule, err := h.client.Schedule.FindFirst(
		db.Schedule.PracticumID.Equals(req.PracticumID),
		db.Schedule.AssistantID.Equals(req.AssistantID),
		db.Schedule.GroupID.Equals(req.GroupID),
	).Exec(r.Context())

	if err != nil && !errors.Is(err, db.ErrNotFound) {
		w.WriteHeader(http.StatusInternalServerError)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "failed to check existing schedule"})
		return
	}

	var schedule *db.ScheduleModel

	if existingSchedule != nil {
		// Jika jadwal sudah ada, update statusnya
		schedule, err = h.client.Schedule.FindUnique(
			db.Schedule.ID.Equals(existingSchedule.ID),
		).Update(
			db.Schedule.Status.Set(db.StatusUnscheduled),
		).Exec(r.Context())
	} else {
		// Jika jadwal belum ada, buat baru
		schedule, err = h.client.Schedule.CreateOne(
			db.Schedule.PracticumID.Set(req.PracticumID),
			db.Schedule.GroupID.Set(req.GroupID),
			db.Schedule.AssistantID.Set(req.AssistantID),
			db.Schedule.Status.Set(db.StatusUnscheduled),
		).Exec(r.Context())
	}

	if err != nil {
		fmt.Printf("Error managing schedule: %v\n", err)
		w.WriteHeader(http.StatusInternalServerError)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "failed to assign assistant"})
		return
	}

	response := map[string]interface{}{
		"id":          schedule.ID,
		"practicumId": schedule.PracticumID,
		"groupId":     schedule.GroupID,
		"assistantId": schedule.AssistantID,
		"status":      schedule.Status,
	}

	w.WriteHeader(http.StatusOK)
	_ = json.NewEncoder(w).Encode(response)
}

func (h *AssistantHandler) GetAssistants(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

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

	// Gunakan map untuk menyimpan asisten unik berdasarkan ID
	assistantMap := make(map[string]map[string]interface{})

	for _, schedule := range schedules {
		assistant := schedule.Assistant()
		practicum := schedule.Practicum()

		// Jika asisten belum ada di map, tambahkan
		if _, exists := assistantMap[assistant.ID]; !exists {
			assistantMap[assistant.ID] = map[string]interface{}{
				"id":    assistant.ID,
				"name":  assistant.Name,
				"nrp":   assistant.Nrp,
				"judul": practicum.Title, // Hanya ambil judul pertama karena semua harus sama
			}
		}
	}

	// Konversi map ke slice
	var response []map[string]interface{}
	for _, data := range assistantMap {
		response = append(response, data)
	}

	w.WriteHeader(http.StatusOK)
	_ = json.NewEncoder(w).Encode(response)
}

func (h *AssistantHandler) GetAssistantStatus(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	// Ambil role dari context
	userRole, ok := r.Context().Value("role").(string)
	if !ok || userRole != "ADMIN" && userRole != "SUPER_ADMIN" {
		w.WriteHeader(http.StatusForbidden)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "only ADMIN can view assistant status"})
		return
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
		assistantData := map[string]interface{}{
			"id":   assistant.ID,
			"name": assistant.Name,
			"nrp":  assistant.Nrp,
		}

		var practicumStatus []map[string]interface{}
		for _, schedule := range assistant.AssistantSchedules() {
			practicum := schedule.Practicum()
			group := schedule.Group()

			// Hitung jumlah praktikan yang sudah dinilai
			gradedCount := len(schedule.Grades())

			// Tentukan status praktikum
			var status string
			switch schedule.Status {
			case db.StatusCompleted:
				status = "Sudah dinilai"
			case db.StatusFinished:
				if gradedCount < len(group.Members()) {
					status = "Sudah dilaksanakan, belum dinilai"
				} else {
					status = "Sudah dilaksanakan, sudah dinilai semua"
				}
			case db.StatusScheduled:
				status = "Belum dilaksanakan"
			case db.StatusUnscheduled:
				status = "Belum dijadwalkan"
			default:
				status = "Status tidak diketahui"
			}

			practicumStatus = append(practicumStatus, map[string]interface{}{
				"practicumId":   practicum.ID,
				"practicumName": practicum.Title,
				"groupId":       group.ID,
				"groupName":     fmt.Sprintf("Kelompok %d", group.Name),
				"status":        status,
			})
		}

		assistantData["practicumStatus"] = practicumStatus
		response = append(response, assistantData)
	}

	// Kirim response
	w.WriteHeader(http.StatusOK)
	_ = json.NewEncoder(w).Encode(response)
}
