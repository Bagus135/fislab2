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
		Title       string `json:"title"`
		Description string `json:"description"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "invalid request"})
		return
	}

	practicum, err := h.client.Practicum.CreateOne(
		db.Practicum.Title.Set(req.Title),
		db.Practicum.Description.Set(req.Description),
	).Exec(r.Context())
	if err != nil {
		fmt.Printf("Error creating practicum: %v\n", err)
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": "failed to create practicum"})
		return
	}
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(practicum)

}

func (h *PracticumHandler) GetPracticum(w http.ResponseWriter, r *http.Request) {
	practicums, err := h.client.Practicum.FindMany().Exec(r.Context())

	if err != nil {
		fmt.Printf("Error getting practicums: %v\n", err)
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": "failed to find practicum"})
		return
	}

	// Langsung encode hasil practicums
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(practicums)
}

func (h *PracticumHandler) UpdatePracticum(w http.ResponseWriter, r *http.Request) {
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
		ID          int    `json:"id"`
		Title       string `json:"title"`
		Description string `json:"description"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "invalid request"})
		return
	}

	practicum, err := h.client.Practicum.FindUnique(
		db.Practicum.ID.Equals(req.ID),
	).Update(
		db.Practicum.Title.Set(req.Title),
		db.Practicum.Description.Set(req.Description),
	).Exec(r.Context())
	if err != nil {
		fmt.Printf("Error updating practicum: %v\n", err)
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": "failed to update practicum"})
		return
	}
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(practicum)
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
		ID int `json:"id"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "invalid request"})
		return
	}
	_, err := h.client.Practicum.FindUnique(
		db.Practicum.ID.Equals(req.ID),
	).Delete().Exec(r.Context())

	if err != nil {
		fmt.Printf("Error deleting practicum: %v\n", err)
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": "failed to delete practicum"})
		return
	}
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"message": "practicum deleted successfully"})
}
