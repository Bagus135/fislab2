package handler

import (
	"backend/prisma/db"
	"backend/types"
	"backend/utils"
	"encoding/json"
	"fmt"
	"net/http"
	"os"
)

type AuthHandler struct {
	client *db.PrismaClient
}

func NewAuthHandler(client *db.PrismaClient) *AuthHandler {
	return &AuthHandler{
		client: client,
	}
}

func (h *AuthHandler) Login(w http.ResponseWriter, r *http.Request) {
	var req struct {
		NRP      string `json:"nrp"`
		Password string `json:"password"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		fmt.Printf("Error decoding request: %v\n", err)
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(types.ErrorResponse("invalid request"))
		return
	}

	fmt.Printf("Login attempt - NRP: %s\n", req.NRP)

	// Cari user berdasarkan NRP
	user, err := h.client.User.FindFirst(
		db.User.Nrp.Equals(req.NRP),
	).Exec(r.Context())
	if err != nil {
		fmt.Printf("Error finding user: %v\n", err)
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusUnauthorized)
		json.NewEncoder(w).Encode(types.ErrorResponse("invalid credentials"))
		return
	}

	fmt.Printf("Found user: %+v\n", user)
	fmt.Printf("Input password: %s\n", req.Password)
	fmt.Printf("Stored hash: %s\n", user.Password)

	// Verifikasi password
	if !utils.CheckPasswordHash(req.Password, user.Password) {
		fmt.Printf("Password mismatch\n")
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusUnauthorized)
		json.NewEncoder(w).Encode(types.ErrorResponse("invalid credentials"))
		return
	}

	// Jika berhasil, kirim token
	secretKey := os.Getenv("JWT_SECRET")
	if secretKey == "" {
		fmt.Printf("Error getting JWT_SECRET environment variable\n")
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(types.ErrorResponse("server error"))
		return
	}

	token, err := utils.GenerateTokens(user.ID, user.Nrp, string(user.Role), secretKey)
	if err != nil {
		fmt.Printf("Error generating JWT: %v\n", err)
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(types.ErrorResponse("could not generating token"))
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"token": token})
}

func (h *AuthHandler) Register(w http.ResponseWriter, r *http.Request) {
	var req types.RegisterRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(types.ErrorResponse("invalid request"))
		return
	}

	// Cek apakah NRP sudah ada
	existingUser, _ := h.client.User.FindUnique(
		db.User.Nrp.Equals(req.Nrp),
	).Exec(r.Context())

	if existingUser != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusConflict)
		json.NewEncoder(w).Encode(types.ErrorResponse("nrp already exists"))
		return
	}

	// Hash password
	hashedPassword, err := utils.HashPassword(req.Password)
	if err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(types.ErrorResponse("failed to process request"))
		return
	}

	role := db.Role(req.Role)

	// Create user
	_, err = h.client.User.CreateOne(
		db.User.Nrp.Set(req.Nrp),
		db.User.Name.Set(req.Name),
		db.User.Password.Set(hashedPassword),
		db.User.Role.Set(role),
	).Exec(r.Context())

	if err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(types.ErrorResponse("failed to create user"))
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(types.SuccessResponse("user created"))
}
