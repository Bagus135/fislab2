package handler

import (
	"backend/prisma/db"
	"encoding/json"
	"fmt"
	"github.com/gorilla/mux"
	"net/http"
	"strings"
)

type UserProfile struct {
	client *db.PrismaClient
}

func NewUserProfile(client *db.PrismaClient) *UserProfile {
	return &UserProfile{client}
}

// GetMyProfile - Ambil profile sendiri
func (h *UserProfile) GetMyProfile(w http.ResponseWriter, r *http.Request) {
	userID, ok := r.Context().Value("userID").(string)
	if !ok {
		w.WriteHeader(http.StatusUnauthorized)
		json.NewEncoder(w).Encode(map[string]string{"error": "unauthorized"})
		return
	}

	user, err := h.client.User.FindUnique(
		db.User.ID.Equals(userID),
	).Exec(r.Context())
	if err != nil {
		fmt.Printf("Error finding user: %v\n", err)
		w.WriteHeader(http.StatusNotFound)
		json.NewEncoder(w).Encode(map[string]string{"error": "user not found"})
		return
	}

	response := map[string]interface{}{
		"id":    user.ID,
		"nrp":   user.Nrp,
		"name":  user.Name,
		"email": user.Email,
		"phone": user.Phone,
		"about": user.About,
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(response)
}

func (h *UserProfile) GetUserProfile(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	requestedUserID := vars["id"]

	// Debugging
	fmt.Println("Requested User ID:", requestedUserID)

	if requestedUserID == "" {
		userID, ok := r.Context().Value("userID").(string)
		if !ok {
			w.WriteHeader(http.StatusUnauthorized)
			json.NewEncoder(w).Encode(map[string]string{"error": "unauthorized"})
			return
		}
		requestedUserID = userID
		fmt.Println("Using Own Profile:", requestedUserID)
	}

	user, err := h.client.User.FindUnique(
		db.User.ID.Equals(requestedUserID),
	).Exec(r.Context())

	if err != nil {
		fmt.Printf("Error finding user: %v\n", err)
		w.WriteHeader(http.StatusNotFound)
		json.NewEncoder(w).Encode(map[string]string{"error": "user not found"})
		return
	}

	response := map[string]interface{}{
		"nrp":   user.Nrp,
		"name":  user.Name,
		"email": user.Email,
		"phone": user.Phone,
		"about": user.About,
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(response)
}

func (h *UserProfile) UpdateMyProfile(w http.ResponseWriter, r *http.Request) {
	userID, ok := r.Context().Value("userID").(string)
	if !ok {
		w.WriteHeader(http.StatusUnauthorized)
		json.NewEncoder(w).Encode(map[string]string{"error": "userID not found in context"})
		return
	}

	// Decode request body
	var req struct {
		Name  string `json:"name"`
		Email string `json:"email"`
		Phone string `json:"phone"`
		About string `json:"about"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "invalid request"})
		return
	}

	// Validasi email
	if req.Email != "" && !strings.Contains(req.Email, "@") {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "email must contain @"})
		return
	}

	// Validasi phone
	if req.Phone != "" && !strings.HasPrefix(req.Phone, "+62") {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "phone must start with +62"})
		return
	}

	// Validasi about
	if len(req.About) > 500 {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "about must be less than 500 characters"})
		return
	}

	// Update profile
	updatedUser, err := h.client.User.FindUnique(
		db.User.ID.Equals(userID),
	).Update(
		db.User.Name.Set(req.Name),
		db.User.Email.Set(req.Email),
		db.User.Phone.Set(req.Phone),
		db.User.About.Set(req.About),
	).Exec(r.Context())
	if err != nil {
		fmt.Printf("Error updating profile: %v\n", err)
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": "failed to update profile"})
		return
	}

	// Buat response
	response := map[string]interface{}{
		"nrp":   updatedUser.Nrp,
		"name":  updatedUser.Name,
		"email": updatedUser.Email,
		"phone": updatedUser.Phone,
		"about": updatedUser.About,
	}

	// Kirim response sukses
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(response)
}
