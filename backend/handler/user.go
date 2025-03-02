package handler

import (
	"backend/helper"
	"backend/prisma/db"
	"backend/types"
	"encoding/json"
	"fmt"
	"github.com/gorilla/mux"
	"io"
	"log"
	"mime/multipart"
	"net/http"
	"os"
	"path/filepath"
	"strings"
)

type UserHandler struct {
	client    *db.PrismaClient
	uploadDir string
	maxSize   int64
}

func NewUserHandler(client *db.PrismaClient) *UserHandler {
	uploadDir := "./data/profiles"
	if err := os.MkdirAll(uploadDir, 0755); err != nil {
		fmt.Printf("Error creating upload directory: %v\n", err)
	}
	return &UserHandler{
		client:    client,
		uploadDir: uploadDir,
		maxSize:   512 * 1024,
	}
}

// GetMyProfile - Ambil profile sendiri
func (h *UserHandler) GetMyProfile(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Cache-Control", "public, max-age=3600") // Cache 1 jam

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

	// Menggunakan metode accessor untuk field nullable
	email, _ := user.Email()
	about, _ := user.About()
	phone, _ := user.Phone()
	profilePict, _ := user.ProfilePict()

	// Buat URL untuk foto profil jika ada
	var profilePictureUrl string
	if profilePict != "" {
		profilePictureUrl = fmt.Sprintf("/api/profile/picture/%s", userID)
	}

	response := map[string]interface{}{
		"id":              user.ID,
		"nrp":             user.Nrp,
		"name":            user.Name,
		"phone":           phone,
		"about":           about,
		"email":           email,
		"email_verified":  user.EmailVerified,
		"role":            string(user.Role),
		"profile_picture": profilePictureUrl,
	}

	w.WriteHeader(http.StatusOK)
	err = json.NewEncoder(w).Encode(response)
	if err != nil {
		fmt.Printf("Error encoding response: %v\n", err)
	}
}

func (h *UserHandler) GetUserProfile(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Cache-Control", "public, max-age=3600")

	vars := mux.Vars(r)
	requestedUserID := vars["id"]

	if requestedUserID == "" {
		userID, ok := r.Context().Value("userID").(string)
		if !ok {
			w.WriteHeader(http.StatusUnauthorized)
			_ = json.NewEncoder(w).Encode(map[string]string{"error": "unauthorized"})
			return
		}
		requestedUserID = userID
	}

	user, err := h.client.User.FindUnique(
		db.User.ID.Equals(requestedUserID),
	).Exec(r.Context())
	if err != nil {
		w.WriteHeader(http.StatusNotFound)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "user not found"})
		return
	}

	email, _ := user.Email()
	phone, _ := user.Phone()
	about, _ := user.About()
	profilePict, _ := user.ProfilePict()

	// Buat URL untuk foto profil jika ada
	var profilePictureUrl string
	if profilePict != "" {
		profilePictureUrl = fmt.Sprintf("/api/profile/picture/%s", requestedUserID)
	}

	response := map[string]interface{}{
		"id":              user.ID,
		"nrp":             user.Nrp,
		"name":            user.Name,
		"phone":           phone,
		"about":           about,
		"email":           email,
		"role":            string(user.Role),
		"profile_picture": profilePictureUrl,
	}

	w.WriteHeader(http.StatusOK)
	err = json.NewEncoder(w).Encode(response)
	if err != nil {
		fmt.Printf("Error encoding response: %v\n", err)
	}
}

func (h *UserHandler) UpdateMyProfile(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

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

	// Sanitasi input SETELAH decode
	req.Name = helper.SanitizeString(req.Name)
	req.Email = helper.SanitizeString(req.Email)
	req.Phone = helper.SanitizeString(req.Phone)
	req.About = helper.SanitizeString(req.About)

	// Log untuk debug
	log.Printf("After sanitization: Name=%s, Email=%s, Phone=%s", req.Name, req.Email, req.Phone)

	// Validasi anti-SQLi menggunakan helper
	if !helper.ValidateInputAgainstSQLi(req.Name) ||
		!helper.ValidateInputAgainstSQLi(req.Email) ||
		!helper.ValidateInputAgainstSQLi(req.Phone) ||
		!helper.ValidateInputAgainstSQLi(req.About) {
		w.WriteHeader(http.StatusBadRequest)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "invalid input detected"})
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
	_, err := h.client.User.FindUnique(
		db.User.ID.Equals(userID),
	).Update(
		db.User.Name.Set(req.Name),
		db.User.Email.Set(req.Email),
		db.User.Phone.Set(req.Phone),
		db.User.About.Set(req.About),
	).Exec(r.Context())
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "failed to update profile"})
		return
	}

	// Kirim response sukses
	w.WriteHeader(http.StatusOK)
	_ = json.NewEncoder(w).Encode(map[string]string{"message": "profile updated"})
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

func (h *UserHandler) DeleteUser(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	// Validasi role super admin dari context
	userRole := r.Context().Value("role").(string)
	if userRole != "SUPER_ADMIN" {
		w.WriteHeader(http.StatusForbidden)
		_ = json.NewEncoder(w).Encode(types.ErrorResponse("only super admin can delete users"))
		return
	}

	// Parse request body
	var req struct {
		ID string `json:"id"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		w.WriteHeader(http.StatusBadRequest)
		_ = json.NewEncoder(w).Encode(types.ErrorResponse("invalid request"))
		return
	}

	// Validasi ID tidak kosong
	if req.ID == "" {
		w.WriteHeader(http.StatusBadRequest)
		_ = json.NewEncoder(w).Encode(types.ErrorResponse("user id is required"))
		return
	}

	// Cek apakah user yang akan dihapus ada
	user, err := h.client.User.FindUnique(
		db.User.ID.Equals(req.ID),
	).Exec(r.Context())
	if err != nil {
		w.WriteHeader(http.StatusNotFound)
		_ = json.NewEncoder(w).Encode(types.ErrorResponse("user not found"))
		return
	}

	// Cek apakah user yang akan dihapus bukan super admin
	if user.Role == db.RoleSuperAdmin {
		w.WriteHeader(http.StatusForbidden)
		_ = json.NewEncoder(w).Encode(types.ErrorResponse("cannot delete super admin user"))
		return
	}

	// Hapus user
	_, err = h.client.User.FindUnique(
		db.User.ID.Equals(req.ID),
	).Delete().Exec(r.Context())
	if err != nil {
		fmt.Printf("Error deleting user: %v\n", err)
		w.WriteHeader(http.StatusInternalServerError)
		_ = json.NewEncoder(w).Encode(types.ErrorResponse("failed to delete user"))
		return
	}

	w.WriteHeader(http.StatusOK)
	_ = json.NewEncoder(w).Encode(types.SuccessResponse("user deleted"))
}

func (h *UserHandler) UploadProfilePicture(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	userID, ok := r.Context().Value("userID").(string)
	if !ok {
		w.WriteHeader(http.StatusUnauthorized)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "unauthorized"})
		return
	}

	var fileBytes []byte
	var filename string
	var fileSize int64
	var contentType string
	var err error

	contentType = r.Header.Get("Content-Type")

	// Periksa apakah request adalah image/* langsung atau multipart/form-data
	if strings.HasPrefix(contentType, "image/") {
		// Kasus 1: File langsung dalam body
		fileBytes, err = io.ReadAll(r.Body)
		if err != nil {
			w.WriteHeader(http.StatusBadRequest)
			_ = json.NewEncoder(w).Encode(map[string]string{"error": "failed to read file"})
			return
		}

		fileSize = int64(len(fileBytes))

		// Buat nama file dari Content-Type
		ext := ".jpg" // Default
		if contentType == "image/png" {
			ext = ".png"
		} else if contentType == "image/jpeg" || contentType == "image/jpg" {
			ext = ".jpg"
		}

		filename = "direct_upload" + ext

	} else {
		// Kasus 2: File dalam multipart/form-data
		err = r.ParseMultipartForm(h.maxSize)
		if err != nil {
			w.WriteHeader(http.StatusBadRequest)
			_ = json.NewEncoder(w).Encode(map[string]string{"error": "failed to parse form: " + err.Error()})
			return
		}

		file, handler, err := r.FormFile("profilePicture")
		if err != nil {
			w.WriteHeader(http.StatusBadRequest)
			_ = json.NewEncoder(w).Encode(map[string]string{"error": "failed to get file: " + err.Error()})
			return
		}
		defer func(file multipart.File) {
			err := file.Close()
			if err != nil {
				log.Printf("Error closing file: %v", err)
			}
		}(file)

		fileBytes, err = io.ReadAll(file)
		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			_ = json.NewEncoder(w).Encode(map[string]string{"error": "failed to read file: " + err.Error()})
			return
		}

		filename = handler.Filename
		fileSize = handler.Size
		contentType = handler.Header.Get("Content-Type")
	}

	// Validasi ukuran file
	if fileSize > h.maxSize {
		w.WriteHeader(http.StatusBadRequest)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "file too large, maximum size is 500 KB"})
		return
	}

	// Validasi file gambar dengan helper
	if err := helper.IsSecureImageFile(fileBytes, fileSize, filename); err != nil {
		w.WriteHeader(http.StatusBadRequest)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": err.Error()})
		return
	}

	// Hapus file profil lama jika ada
	oldUser, err := h.client.User.FindUnique(
		db.User.ID.Equals(userID),
	).Exec(r.Context())

	if err == nil {
		// Cek apakah ada foto profil sebelumnya
		if oldProfilePict, ok := oldUser.ProfilePict(); ok && oldProfilePict != "" {
			oldFilePath := filepath.Join(h.uploadDir, filepath.Base(oldProfilePict))
			oldFilePath = helper.SanitizePath(oldFilePath)

			// Periksa apakah file ada
			if _, err := os.Stat(oldFilePath); err == nil {
				// Hapus file
				if removeErr := os.Remove(oldFilePath); removeErr != nil {
					log.Printf("Failed to remove old profile picture: %v", removeErr)
					w.WriteHeader(http.StatusInternalServerError)
					_ = json.NewEncoder(w).Encode(map[string]string{"error": "failed to remove old profile picture"})
					return
				}
			}
		}
	}

	// Generate nama file aman dengan helper
	ext := filepath.Ext(filename)
	if ext == "" {
		// Jika tidak ada ekstensi, gunakan berdasarkan content type
		if strings.HasPrefix(contentType, "image/png") {
			ext = ".png"
		} else {
			ext = ".jpg"
		}
	}

	safeFilename := helper.GenerateSecureFilename(fileBytes, ext)

	// Tulis file dengan path yang aman
	fullPath := helper.SanitizePath(filepath.Join(h.uploadDir, safeFilename))
	err = os.WriteFile(fullPath, fileBytes, 0644)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "failed to save file"})
		return
	}

	// Update database
	_, err = h.client.User.FindUnique(
		db.User.ID.Equals(userID),
	).Update(
		db.User.ProfilePict.Set(safeFilename),
	).Exec(r.Context())

	if err != nil {
		// Hapus file jika gagal update database
		if removeErr := os.Remove(fullPath); removeErr != nil {
			log.Printf("Error removing file after failed DB update: %v", removeErr)
		}
		w.WriteHeader(http.StatusInternalServerError)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "failed to update profile"})
		return
	}

	w.WriteHeader(http.StatusOK)
	_ = json.NewEncoder(w).Encode(map[string]interface{}{
		"message":  "profile picture updated successfully",
		"filename": safeFilename,
	})
}

func (h *UserHandler) GetProfilePicture(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	userID := vars["id"]

	if userID == "" {
		w.WriteHeader(http.StatusBadRequest)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "user ID is required"})
		return
	}

	// Ambil nama file gambar profil dari database
	user, err := h.client.User.FindUnique(
		db.User.ID.Equals(userID),
	).Exec(r.Context())
	if err != nil {
		w.WriteHeader(http.StatusNotFound)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "user not found"})
		return
	}

	profilePict, _ := user.ProfilePict()
	if profilePict == "" {
		w.WriteHeader(http.StatusNotFound)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "profile picture not found"})
		return
	}

	// Baca file gambar dari direktori upload
	filePath := filepath.Join(h.uploadDir, profilePict)
	fileBytes, err := os.ReadFile(filePath)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "failed to read profile picture"})
		return
	}

	// Tentukan Content-Type berdasarkan ekstensi file
	ext := filepath.Ext(profilePict)
	contentType := "image/jpeg" // Default
	switch ext {
	case ".png":
		contentType = "image/png"
	case ".jpg", ".jpeg":
		contentType = "image/jpeg"
	}

	// Set header dan kirim file
	w.Header().Set("Content-Type", contentType)
	w.Header().Set("Cache-Control", "public, max-age=3600") // Cache 1 jam
	w.WriteHeader(http.StatusOK)
	_, _ = w.Write(fileBytes)
}

// DeleteProfilePicture - Handler untuk menghapus foto profil
func (h *UserHandler) DeleteProfilePicture(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	// Autentikasi pengguna
	userID, ok := r.Context().Value("userID").(string)
	if !ok {
		w.WriteHeader(http.StatusUnauthorized)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "unauthorized"})
		return
	}

	// Ambil data user
	user, err := h.client.User.FindUnique(
		db.User.ID.Equals(userID),
	).Exec(r.Context())

	if err != nil {
		w.WriteHeader(http.StatusNotFound)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "user not found"})
		return
	}

	// Cek apakah ada foto profil
	profileID, ok := user.ProfilePict()
	if ok && profileID != "" {
		// Cari dan hapus file
		matches, err := filepath.Glob(filepath.Join(h.uploadDir, profileID+".*"))
		if err == nil && len(matches) > 0 {
			for _, match := range matches {
				err := os.Remove(match)
				if err != nil {
					return
				}
			}
		}
	}

	// Update database dengan profilePict kosong/null
	_, err = h.client.User.FindUnique(
		db.User.ID.Equals(userID),
	).Update(
		db.User.ProfilePict.Set(""),
	).Exec(r.Context())

	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "failed to update profile"})
		return
	}

	w.WriteHeader(http.StatusOK)
	_ = json.NewEncoder(w).Encode(map[string]string{"message": "profile picture removed"})
}
