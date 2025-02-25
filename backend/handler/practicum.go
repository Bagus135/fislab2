package handler

import (
	"backend/prisma/db"
	"encoding/json"
	"fmt"
	"net/http"
)

type PracticumHandler struct {
	client *db.PrismaClient
}

func NewPracticumHandler(client *db.PrismaClient) *PracticumHandler {
	return &PracticumHandler{client: client}
}

func (h *PracticumHandler) CreatePracticum(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json; charset=UTF-8")

	userRole, ok := r.Context().Value("role").(string)
	if !ok {
		w.WriteHeader(http.StatusUnauthorized)
		return
	}
	if userRole != "SUPER_ADMIN" && userRole != "ADMIN" {
		w.WriteHeader(http.StatusForbidden)
		return
	}

	var req struct {
		Code        string `json:"code"`
		Title       string `json:"title"`
		Description string `json:"description"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		w.WriteHeader(http.StatusBadRequest)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "invalid request"})
		return
	}

	_, err := h.client.Practicum.CreateOne(
		db.Practicum.ID.Set(req.Code),
		db.Practicum.Title.Set(req.Title),
		db.Practicum.Description.Set(req.Description),
	).Exec(r.Context())
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		fmt.Printf(err.Error())
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "failed to create practicum"})
		return
	}

	w.WriteHeader(http.StatusOK)
	_ = json.NewEncoder(w).Encode(map[string]string{"message": "module created"})
}

func (h *PracticumHandler) GetPracticum(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json; charset=UTF-8")

	// Ambil data practicum dari database
	practicums, err := h.client.Practicum.FindMany().Exec(r.Context())
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "failed to find practicum"})
		return
	}

	// Buat slice untuk menyimpan data practicum yang sudah dimodifikasi
	var response []map[string]interface{}

	desc, _ := practicums[0].Description()
	// Loop melalui setiap practicum dan modifikasi strukturnya
	for _, practicum := range practicums {
		response = append(response, map[string]interface{}{
			"code":        practicum.ID,
			"title":       practicum.Title,
			"description": desc,
			"createdAt":   practicum.CreatedAt,
			"updatedAt":   practicum.UpdatedAt,
		})
	}

	// Kirim response JSON
	w.WriteHeader(http.StatusOK)
	_ = json.NewEncoder(w).Encode(response)
}

func (h *PracticumHandler) UpdatePracticum(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json; charset=UTF-8")
	userRole, ok := r.Context().Value("role").(string)
	if !ok {
		w.WriteHeader(http.StatusUnauthorized)
		return
	}
	if userRole != "SUPER_ADMIN" && userRole != "ADMIN" {
		w.WriteHeader(http.StatusForbidden)
		return
	}

	var req struct {
		Code        string `json:"code"`
		Title       string `json:"title"`
		Description string `json:"description"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		w.WriteHeader(http.StatusBadRequest)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "invalid request"})
		return
	}

	_, err := h.client.Practicum.FindUnique(
		db.Practicum.ID.Equals(req.Code),
	).Update(
		db.Practicum.Title.Set(req.Title),
		db.Practicum.Description.Set(req.Description),
	).Exec(r.Context())
	if err != nil {
		fmt.Printf("Error updating practicum: %v\n", err)
		w.WriteHeader(http.StatusInternalServerError)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "failed to update practicum"})
		return
	}
	w.WriteHeader(http.StatusOK)
	_ = json.NewEncoder(w).Encode(map[string]string{"message": "module updated"})
}

func (h *PracticumHandler) DeletePracticum(w http.ResponseWriter, r *http.Request) {
	userRole, ok := r.Context().Value("role").(string)
	if !ok {
		w.WriteHeader(http.StatusUnauthorized)
		return
	}
	if userRole != "SUPER_ADMIN" && userRole != "ADMIN" {
		w.WriteHeader(http.StatusForbidden)
		return
	}
	var req struct {
		Code string `json:"code"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		w.WriteHeader(http.StatusBadRequest)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "invalid request"})
		return
	}
	_, err := h.client.Practicum.FindUnique(
		db.Practicum.ID.Equals(req.Code),
	).Delete().Exec(r.Context())

	if err != nil {
		fmt.Printf("Error deleting practicum: %v\n", err)
		w.WriteHeader(http.StatusInternalServerError)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "failed to delete practicum"})
		return
	}
	w.WriteHeader(http.StatusOK)
	_ = json.NewEncoder(w).Encode(map[string]string{"message": "practicum deleted successfully"})
}
