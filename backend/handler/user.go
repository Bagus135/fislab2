package handler

import (
	"backend/prisma/db"
	"encoding/json"
	"fmt"
	"github.com/gorilla/mux"
	"net/http"
	"strings"
)

type UserHandler struct {
	client *db.PrismaClient
}

func NewUserHandler(client *db.PrismaClient) *UserHandler {
	return &UserHandler{client}
}

// GetMyProfile - Ambil profile sendiri
func (h *UserHandler) GetMyProfile(w http.ResponseWriter, r *http.Request) {
	userID, ok := r.Context().Value("userID").(string)
	if !ok {
		w.WriteHeader(http.StatusUnauthorized)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "unauthorized"})
		return
	}

	user, err := h.client.User.FindUnique(
		db.User.ID.Equals(userID),
	).Exec(r.Context())
	if err != nil {
		fmt.Printf("Error finding user: %v\n", err)
		w.WriteHeader(http.StatusNotFound)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "user not found"})
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
	_ = json.NewEncoder(w).Encode(response)
}

func (h *UserHandler) GetUserProfile(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	requestedUserID := vars["id"]

	// Debugging
	fmt.Println("Requested User ID:", requestedUserID)

	if requestedUserID == "" {
		userID, ok := r.Context().Value("userID").(string)
		if !ok {
			w.WriteHeader(http.StatusUnauthorized)
			_ = json.NewEncoder(w).Encode(map[string]string{"error": "unauthorized"})
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
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "user not found"})
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
	_ = json.NewEncoder(w).Encode(response)
}

func (h *UserHandler) UpdateMyProfile(w http.ResponseWriter, r *http.Request) {
	userID, ok := r.Context().Value("userID").(string)
	if !ok {
		w.WriteHeader(http.StatusUnauthorized)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "userID not found in context"})
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
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "invalid request"})
		return
	}

	// Validasi email
	if req.Email != "" && !strings.Contains(req.Email, "@") {
		w.WriteHeader(http.StatusBadRequest)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "email must contain @"})
		return
	}

	// Validasi phone
	if req.Phone != "" && !strings.HasPrefix(req.Phone, "+62") {
		w.WriteHeader(http.StatusBadRequest)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "phone must start with +62"})
		return
	}

	// Validasi about
	if len(req.About) > 500 {
		w.WriteHeader(http.StatusBadRequest)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "about must be less than 500 characters"})
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
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "failed to update profile"})
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
	_ = json.NewEncoder(w).Encode(response)
}

func (h *UserHandler) GetAllUsers(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	// Validasi role
	userRole := r.Context().Value("role").(string)
	if userRole != "SUPER_ADMIN" && userRole != "ADMIN" {
		w.WriteHeader(http.StatusForbidden)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "only admin can view all users"})
		return
	}

	// Ambil semua user
	users, err := h.client.User.FindMany().OrderBy(
		db.User.Role.Order(db.SortOrderAsc),
		db.User.Name.Order(db.SortOrderAsc),
	).Exec(r.Context())

	if err != nil {
		fmt.Printf("Error fetching users: %v\n", err)
		w.WriteHeader(http.StatusInternalServerError)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "failed to fetch users"})
		return
	}

	// Format response
	var response []map[string]interface{}
	for _, user := range users {
		userData := map[string]interface{}{
			"id":   user.ID,
			"name": user.Name,
			"nrp":  user.Nrp,
			"role": user.Role,
		}
		response = append(response, userData)
	}

	w.WriteHeader(http.StatusOK)
	_ = json.NewEncoder(w).Encode(map[string]interface{}{
		"total": len(users),
		"users": response,
	})
}

func (h *UserHandler) GetUsersByRole(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	// Validasi role admin
	userRole := r.Context().Value("role").(string)
	if userRole != "SUPER_ADMIN" && userRole != "ADMIN" {
		w.WriteHeader(http.StatusForbidden)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "only admin can view users"})
		return
	}

	// Ambil role dari URL path parameter dan konversi ke uppercase
	vars := mux.Vars(r)
	requestedRole := strings.ToUpper(vars["role"])

	// Validasi role yang diminta
	validRoles := map[string]bool{
		"SUPER_ADMIN": true,
		"ADMIN":       true,
		"ASISTEN":     true,
		"PRAKTIKAN":   true,
	}

	roleMapping := map[string]string{
		"super_admin": "SUPER_ADMIN",
		"admin":       "ADMIN",
		"asisten":     "ASISTEN",
		"praktikan":   "PRAKTIKAN",
	}

	// Konversi role dari lowercase ke UPPERCASE yang valid
	if mappedRole, exists := roleMapping[strings.ToLower(vars["role"])]; exists {
		requestedRole = mappedRole
	}

	if !validRoles[requestedRole] {
		w.WriteHeader(http.StatusBadRequest)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "invalid role"})
		return
	}

	// Ambil user berdasarkan role
	users, err := h.client.User.FindMany(
		db.User.Role.Equals(db.Role(requestedRole)),
	).OrderBy(
		db.User.Name.Order(db.SortOrderAsc),
	).Exec(r.Context())

	if err != nil {
		fmt.Printf("Error fetching users: %v\n", err)
		w.WriteHeader(http.StatusInternalServerError)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "failed to fetch users"})
		return
	}

	// Format response
	var response []map[string]interface{}
	for _, user := range users {
		userData := map[string]interface{}{
			"id":   user.ID,
			"name": user.Name,
			"nrp":  user.Nrp,
		}
		response = append(response, userData)
	}

	w.WriteHeader(http.StatusOK)
	_ = json.NewEncoder(w).Encode(map[string]interface{}{
		"role":  strings.ToLower(requestedRole), // konversi role ke lowercase di response
		"total": len(users),
		"users": response,
	})
}
