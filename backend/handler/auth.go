package handler

import (
	"backend/helper"
	"backend/prisma/db"
	"backend/service"
	"backend/types"
	"backend/utils"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"strings"
	"time"

	"golang.org/x/crypto/bcrypt"
)

type AuthHandler struct {
	client       *db.PrismaClient
	emailService *service.EmailService
	cacheService *service.CacheService
}

func NewAuthHandler(
	client *db.PrismaClient,
	emailService *service.EmailService,
	cacheService *service.CacheService) *AuthHandler {

	return &AuthHandler{
		client:       client,
		emailService: emailService,
		cacheService: cacheService,
	}
}

func (h *AuthHandler) Login(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	var req types.LoginRequest

	// Decode JSON request
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		log.Printf("Error decoding request body: %v", err)
		w.WriteHeader(http.StatusBadRequest)
		_ = json.NewEncoder(w).Encode(types.ErrorResponse("invalid request"))
		return
	}

	// Validasi input kosong
	if req.NRP == "" || req.Password == "" {
		w.WriteHeader(http.StatusBadRequest)
		_ = json.NewEncoder(w).Encode(types.ErrorResponse("nrp and password are required"))
		return
	}

	// Cari user berdasarkan NRP
	user, err := h.client.User.FindFirst(
		db.User.Nrp.Equals(req.NRP),
	).Exec(r.Context())
	if err != nil {
		log.Printf("User not found or database error: %v", err)
		w.WriteHeader(http.StatusUnauthorized)
		_ = json.NewEncoder(w).Encode(types.ErrorResponse("invalid credentials"))
		return
	}

	// Verifikasi password
	if !utils.CheckPasswordHash(req.Password, user.Password) {
		log.Printf("Login failed for NRP %s: incorrect password", req.NRP)
		w.WriteHeader(http.StatusUnauthorized)
		_ = json.NewEncoder(w).Encode(types.ErrorResponse("invalid credentials"))
		return
	}

	// Ambil secret key untuk JWT
	secretKey := os.Getenv("JWT_SECRET")
	if secretKey == "" {
		log.Println("JWT_SECRET is not set in environment variables")
		w.WriteHeader(http.StatusInternalServerError)
		_ = json.NewEncoder(w).Encode(types.ErrorResponse("server error"))
		return
	}

	// Generate token JWT
	token, err := utils.GenerateTokens(user.ID, user.Nrp, string(user.Role), secretKey)
	if err != nil {
		log.Printf("Error generating JWT token: %v", err)
		w.WriteHeader(http.StatusInternalServerError)
		_ = json.NewEncoder(w).Encode(types.ErrorResponse("could not generate token"))
		return
	}

	// Simpan sesi ke Redis
	err = h.cacheService.StoreSession(user.ID, token, 24*time.Hour)
	if err != nil {
		log.Printf("Failed to store session in Redis for user %s: %v", user.ID, err)
		w.WriteHeader(http.StatusInternalServerError)
		_ = json.NewEncoder(w).Encode(types.ErrorResponse("could not create session"))
		return
	}

	// Kirim respons sukses
	w.WriteHeader(http.StatusOK)
	_ = json.NewEncoder(w).Encode(map[string]string{"token": token})
}

func (h *AuthHandler) Logout(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	userID, ok := r.Context().Value("userID").(string)
	if !ok {

		w.WriteHeader(http.StatusUnauthorized)
		_ = json.NewEncoder(w).Encode(types.ErrorResponse("unauthorized"))
		return
	}

	// Validasi userID
	if userID == "" {
		w.WriteHeader(http.StatusUnauthorized)
		_ = json.NewEncoder(w).Encode(types.ErrorResponse("unauthorized"))
		return
	}

	err := h.cacheService.RemoveSession(userID)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		_ = json.NewEncoder(w).Encode(types.ErrorResponse("failed to logout"))
		return
	}

	w.WriteHeader(http.StatusOK)
	_ = json.NewEncoder(w).Encode(types.SuccessResponse("logged out"))
}

func (h *AuthHandler) RegisterFirstSuperAdmin(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	// Cek jumlah Super Admin yang sudah ada
	superAdmins, err := h.client.User.FindMany(
		db.User.Role.Equals(db.RoleSuperAdmin),
	).Exec(r.Context())

	if err != nil {
		log.Printf("Error checking super admin count: %v", err)
		w.WriteHeader(http.StatusInternalServerError)
		_ = json.NewEncoder(w).Encode(types.ErrorResponse("failed to check super admin"))
		return
	}

	// Batasi maksimal 2 super admin
	if len(superAdmins) >= 2 {
		log.Println("Super admin limit reached (2).")
		w.WriteHeader(http.StatusForbidden)
		_ = json.NewEncoder(w).Encode(types.ErrorResponse("maximum super admins reached"))
		return
	}

	// Decode JSON request
	var req types.RegisterSuperAdminRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		log.Printf("Invalid request body: %v", err)
		w.WriteHeader(http.StatusBadRequest)
		_ = json.NewEncoder(w).Encode(types.ErrorResponse("invalid request"))
		return
	}

	// Cek apakah NRP sudah ada
	existingUser, _ := h.client.User.FindUnique(
		db.User.Nrp.Equals(req.NRP),
	).Exec(r.Context())

	if existingUser != nil {
		log.Printf("Attempt to register with existing NRP: %s", req.NRP)
		w.WriteHeader(http.StatusConflict)
		_ = json.NewEncoder(w).Encode(types.ErrorResponse("nrp already exists"))
		return
	}

	// Hash password sebelum disimpan
	hashedPassword, err := utils.HashPassword(req.Password)
	if err != nil {
		log.Printf("Error hashing password: %v", err)
		w.WriteHeader(http.StatusInternalServerError)
		_ = json.NewEncoder(w).Encode(types.ErrorResponse("failed to process request"))
		return
	}

	// Buat Super Admin baru
	_, err = h.client.User.CreateOne(
		db.User.Nrp.Set(req.NRP),
		db.User.Name.Set(req.Name),
		db.User.Password.Set(hashedPassword),
		db.User.Role.Set(db.RoleSuperAdmin),
		db.User.Email.SetOptional(nil),
		db.User.Phone.SetOptional(nil),
		db.User.About.SetOptional(nil),
		db.User.ProfilePict.SetOptional(nil),
	).Exec(r.Context())

	if err != nil {
		log.Printf("Failed to create super admin: %v", err)
		w.WriteHeader(http.StatusInternalServerError)
		_ = json.NewEncoder(w).Encode(types.ErrorResponse("failed to create super admin"))
		return
	}

	log.Printf("Super admin created successfully: %s", req.NRP)
	w.WriteHeader(http.StatusCreated)
	_ = json.NewEncoder(w).Encode(types.SuccessResponse("super admin created"))
}

func (h *AuthHandler) Register(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	// Ambil role dari context dengan aman
	userRole, ok := r.Context().Value("role").(string)
	if !ok {
		log.Println("Unauthorized access: missing role in context")
		w.WriteHeader(http.StatusUnauthorized)
		_ = json.NewEncoder(w).Encode(types.ErrorResponse("unauthorized"))
		return
	}

	// Hanya SUPER_ADMIN yang bisa mendaftarkan user
	if userRole != "SUPER_ADMIN" {
		log.Printf("Forbidden: user with role %s attempted to register a user", userRole)
		w.WriteHeader(http.StatusForbidden)
		_ = json.NewEncoder(w).Encode(types.ErrorResponse("forbidden"))
		return
	}

	// Decode JSON request
	var req types.RegisterRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		log.Printf("Invalid request body: %v", err)
		w.WriteHeader(http.StatusBadRequest)
		_ = json.NewEncoder(w).Encode(types.ErrorResponse("invalid request"))
		return
	}

	// Cek role yang akan dibuat (SUPER_ADMIN tidak boleh dibuat)
	if req.Role == "SUPER_ADMIN" {
		log.Println("Attempt to register SUPER_ADMIN denied")
		w.WriteHeader(http.StatusForbidden)
		_ = json.NewEncoder(w).Encode(types.ErrorResponse("cannot create super admin"))
		return
	}

	// Validasi role yang diperbolehkan
	validRoles := map[string]bool{
		"ADMIN":     true,
		"ASISTEN":   true,
		"PRAKTIKAN": true,
	}
	if !validRoles[req.Role] {
		log.Printf("Invalid role attempted: %s", req.Role)
		w.WriteHeader(http.StatusBadRequest)
		_ = json.NewEncoder(w).Encode(types.ErrorResponse("invalid role"))
		return
	}

	// Cek apakah NRP sudah ada
	existingUser, _ := h.client.User.FindUnique(
		db.User.Nrp.Equals(req.NRP),
	).Exec(r.Context())

	if existingUser != nil {
		log.Printf("Attempt to register with existing NRP: %s", req.NRP)
		w.WriteHeader(http.StatusConflict)
		_ = json.NewEncoder(w).Encode(types.ErrorResponse("nrp already exists"))
		return
	}

	// Hash password sebelum disimpan
	hashedPassword, err := utils.HashPassword(req.Password)
	if err != nil {
		log.Printf("Error hashing password: %v", err)
		w.WriteHeader(http.StatusInternalServerError)
		_ = json.NewEncoder(w).Encode(types.ErrorResponse("failed to process request"))
		return
	}

	role := db.Role(req.Role)

	// Buat user baru
	_, err = h.client.User.CreateOne(
		db.User.Nrp.Set(req.NRP),
		db.User.Name.Set(req.Name),
		db.User.Password.Set(hashedPassword),
		db.User.Role.Set(role),
		db.User.Email.SetOptional(nil),
		db.User.Phone.SetOptional(nil),
		db.User.About.SetOptional(nil),
		db.User.ProfilePict.SetOptional(nil),
	).Exec(r.Context())

	if err != nil {
		log.Printf("Error creating user: %v", err)
		w.WriteHeader(http.StatusInternalServerError)
		_ = json.NewEncoder(w).Encode(types.ErrorResponse("failed to create user"))
		return
	}

	log.Printf("User created successfully: NRP %s, Role %s", req.NRP, req.Role)
	w.WriteHeader(http.StatusCreated)
	_ = json.NewEncoder(w).Encode(types.SuccessResponse("user created"))
}

func (h *AuthHandler) ChangePassword(w http.ResponseWriter, r *http.Request) {

	w.Header().Set("Content-Type", "application/json")

	// Ambil userID dari context (setelah user login)
	userID, ok := r.Context().Value("userID").(string)
	if !ok {
		w.WriteHeader(http.StatusUnauthorized)
		return
	}

	// Decode request body
	var req types.ChangePasswordRequest

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		w.WriteHeader(http.StatusBadRequest)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "invalid request"})
		return
	}

	// Validasi input
	if req.OldPassword == "" || req.NewPassword == "" {
		w.WriteHeader(http.StatusBadRequest)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "old_password and new_password are required"})
		return
	}

	if req.ConfirmNewPassword != req.NewPassword {
		w.WriteHeader(http.StatusBadRequest)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "new password are not matching"})
		return
	}

	// Ambil user dari database
	user, err := h.client.User.FindUnique(
		db.User.ID.Equals(userID),
	).Exec(r.Context())
	if err != nil {
		w.WriteHeader(http.StatusNotFound)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "user not found"})
		return
	}

	// Verifikasi password lama
	err = bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.OldPassword))
	if err != nil {
		w.WriteHeader(http.StatusUnauthorized)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "old password is incorrect"})
		return
	}

	// Hash password baru
	hashedPassword, err := utils.HashPassword(req.NewPassword)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "failed to hash password"})
		return
	}

	// Update password di database
	_, err = h.client.User.FindUnique(
		db.User.ID.Equals(userID),
	).Update(
		db.User.Password.Set(hashedPassword),
	).Exec(r.Context())
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "failed to update password"})
		return
	}

	// Kirim response sukses
	w.WriteHeader(http.StatusOK)
	_ = json.NewEncoder(w).Encode(map[string]string{"message": "password updated"})
}

func (h *AuthHandler) SendVerificationCode(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	var req struct {
		Email string `json:"email"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		w.WriteHeader(http.StatusBadRequest)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "invalid request"})
		return
	}

	// Cek user
	user, err := h.client.User.FindFirst(
		db.User.Email.Equals(req.Email),
	).Exec(r.Context())

	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "email not found"})
		return
	}

	// Gunakan `user.Email()` jika itu method, atau langsung `user.Email` jika itu field
	email, ok := user.Email() // Jika user.Email adalah field, ganti dengan: email := user.Email
	if !ok {
		w.WriteHeader(http.StatusInternalServerError)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "failed to get user email"})
		return
	}

	// Generate kode
	code := helper.GenerateVerificationCode()

	// Pastikan format kunci untuk cache konsisten
	cacheKey := fmt.Sprintf("verify:%s", email)

	// Simpan di cache
	err = h.cacheService.Set(
		cacheKey,
		code,
		10*time.Minute,
	)

	if err != nil {
		fmt.Printf("Error setting cache: %v\n", err)
		w.WriteHeader(http.StatusInternalServerError)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "failed to process request"})
		return
	}

	// Kirim email
	err = h.emailService.SendVerificationCode(email, code)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "failed to send email"})
		return
	}

	w.WriteHeader(http.StatusOK)
	_ = json.NewEncoder(w).Encode(map[string]string{"message": "verification code sent"})
}

func (h *AuthHandler) VerifyEmail(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	var req struct {
		Email string `json:"email"`
		Code  string `json:"code"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		w.WriteHeader(http.StatusBadRequest)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "invalid request"})
		return
	}

	// Pastikan format kunci untuk cache konsisten
	cacheKey := fmt.Sprintf("verify:%s", req.Email)

	// Ambil kode dari cache
	cachedCode, err := h.cacheService.Get(cacheKey)

	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "invalid or expired code"})
		return
	}

	cachedCodeStr := strings.TrimSpace(fmt.Sprintf("%v", cachedCode))
	requestCodeStr := strings.TrimSpace(req.Code)

	if cachedCodeStr != requestCodeStr {
		w.WriteHeader(http.StatusBadRequest)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "invalid code"})
		return
	}

	// Update status email verified
	_, err = h.client.User.FindUnique(
		db.User.Email.Equals(req.Email),
	).Update(
		db.User.EmailVerified.Set(true),
	).Exec(r.Context())

	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "failed to verify email"})
		return
	}

	// Hapus kode dari cache
	_ = h.cacheService.Delete(cacheKey)

	w.WriteHeader(http.StatusOK)
	_ = json.NewEncoder(w).Encode(map[string]string{"message": "email verified successfully"})
}

func (h *AuthHandler) ForgotPassword(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	var req struct {
		Email string `json:"email"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		w.WriteHeader(http.StatusBadRequest)
		_ = json.NewEncoder(w).Encode(types.ErrorResponse("invalid request"))
		return
	}

	// Cek user berdasarkan email
	user, err := h.client.User.FindFirst(
		db.User.Email.Equals(req.Email),
	).Exec(r.Context())
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		_ = json.NewEncoder(w).Encode(types.ErrorResponse("email not found"))
		return
	}

	// Generate reset token
	token := helper.GenerateResetToken()

	email, ok := user.Email()
	if !ok {
		w.WriteHeader(http.StatusInternalServerError)
		_ = json.NewEncoder(w).Encode(types.ErrorResponse("failed to get user email"))
		return
	}

	// Simpan token di Redis
	err = h.cacheService.SetResetPasswordToken(email, token)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		_ = json.NewEncoder(w).Encode(types.ErrorResponse("failed to process request"))
		return
	}

	email, ok = user.Email()
	if !ok {
		w.WriteHeader(http.StatusInternalServerError)
		_ = json.NewEncoder(w).Encode(types.ErrorResponse("failed to get user email"))
		return
	}
	// Kirim email reset password
	err = h.emailService.SendResetPasswordEmail(email, token)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		_ = json.NewEncoder(w).Encode(types.ErrorResponse("failed to send email"))
		return
	}

	w.WriteHeader(http.StatusOK)
	_ = json.NewEncoder(w).Encode(types.SuccessResponse("reset password link has been sent to your email"))
}

func (h *AuthHandler) ResetPassword(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	var req struct {
		Token           string `json:"token"`
		NewPassword     string `json:"new_password"`
		ConfirmPassword string `json:"confirm_password"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		w.WriteHeader(http.StatusBadRequest)
		_ = json.NewEncoder(w).Encode(types.ErrorResponse("invalid request"))
		return
	}

	// Validasi input
	if req.NewPassword == "" || req.ConfirmPassword == "" {
		w.WriteHeader(http.StatusBadRequest)
		_ = json.NewEncoder(w).Encode(types.ErrorResponse("password fields cannot be empty"))
		return
	}

	if req.NewPassword != req.ConfirmPassword {
		w.WriteHeader(http.StatusBadRequest)
		_ = json.NewEncoder(w).Encode(types.ErrorResponse("passwords do not match"))
		return
	}

	if len(req.NewPassword) < 8 {
		w.WriteHeader(http.StatusBadRequest)
		_ = json.NewEncoder(w).Encode(types.ErrorResponse("password must be at least 8 characters"))
		return
	}

	// Ambil email dari token di Redis
	email, err := h.cacheService.GetResetPasswordEmail(req.Token)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		_ = json.NewEncoder(w).Encode(types.ErrorResponse("invalid or expired token"))
		return
	}

	// Cari user berdasarkan email
	user, err := h.client.User.FindFirst(
		db.User.Email.Equals(email),
	).Exec(r.Context())
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		_ = json.NewEncoder(w).Encode(types.ErrorResponse("failed to process request"))
		return
	}

	// Hash password baru
	hashedPassword, err := utils.HashPassword(req.NewPassword)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		_ = json.NewEncoder(w).Encode(types.ErrorResponse("failed to process password"))
		return
	}

	// Update password
	_, err = h.client.User.FindUnique(
		db.User.ID.Equals(user.ID),
	).Update(
		db.User.Password.Set(hashedPassword),
	).Exec(r.Context())
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		_ = json.NewEncoder(w).Encode(types.ErrorResponse("failed to reset password"))
		return
	}

	w.WriteHeader(http.StatusOK)
	_ = json.NewEncoder(w).Encode(types.SuccessResponse("password has been reset successfully"))
}
