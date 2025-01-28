package handler

import (
	"backend/prisma/db"
	"backend/types"
	"backend/utils"
	"encoding/json"
	"net/http"
)

// AuthHandler adalah struct untuk menangani autentikasi
type AuthHandler struct {
	client *db.PrismaClient
}

// NewAuthHandler membuat instance baru dari AuthHandler
func NewAuthHandler(client *db.PrismaClient) *AuthHandler {
	return &AuthHandler{
		client: client,
	}
}

// Login menangani permintaan login
func (h *AuthHandler) Login(w http.ResponseWriter, r *http.Request) {
	var req types.LoginRequest

	// Decode request body
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusBadRequest)
		_ = json.NewEncoder(w).Encode(types.ErrorAuth(http.StatusBadRequest, "Invalid request"))
		return
	}

	ctx := r.Context()

	// Cari user berdasarkan NRP
	user, err := h.client.User.FindUnique(
		db.User.Nrp.Equals(req.NRP),
	).Exec(ctx)
	if err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusUnauthorized)
		_ = json.NewEncoder(w).Encode(types.ErrorAuth(http.StatusUnauthorized, "Invalid credentials"))
		return
	}

	// Verifikasi password
	if !utils.CheckPasswordHash(req.Password, user.Password) {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusUnauthorized)
		_ = json.NewEncoder(w).Encode(types.ErrorAuth(http.StatusUnauthorized, "Invalid credentials"))
		return
	}

	// Generate token JWT
	token, err := utils.GenerateTokens(user.ID, user.Nrp, string(user.Role), "your-secret-key")
	if err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusInternalServerError)
		_ = json.NewEncoder(w).Encode(types.ErrorAuth(http.StatusInternalServerError, "Failed to generate token"))
		return
	}

	// Kirim response sukses
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	_ = json.NewEncoder(w).Encode(types.SuccessLogin(token, types.UserDetail{
		ID:   user.ID,
		NRP:  user.Nrp,
		Name: user.Name,
		Role: string(user.Role),
	}))
}
