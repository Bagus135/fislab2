package handler

import (
	"backend/prisma/db"
	"backend/service"
	"backend/types"
	"backend/utils"
	"encoding/json"
	"fmt"
	"golang.org/x/crypto/bcrypt"
	"math/rand"
	"net/http"
	"os"
	"time"
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
	var req types.LoginRequest

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		fmt.Printf("Error decoding request: %v\n", err)
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusBadRequest)
		_ = json.NewEncoder(w).Encode(types.ErrorResponse("invalid request"))
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
		_ = json.NewEncoder(w).Encode(types.ErrorResponse("invalid credentials"))
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
		_ = json.NewEncoder(w).Encode(types.ErrorResponse("invalid credentials"))
		return
	}

	// Jika berhasil, kirim token
	secretKey := os.Getenv("JWT_SECRET")
	if secretKey == "" {
		fmt.Printf("Error getting JWT_SECRET environment variable\n")
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusInternalServerError)
		_ = json.NewEncoder(w).Encode(types.ErrorResponse("server error"))
		return
	}

	token, err := utils.GenerateTokens(user.ID, user.Nrp, string(user.Role), secretKey)
	if err != nil {
		fmt.Printf("Error generating JWT: %v\n", err)
		w.WriteHeader(http.StatusInternalServerError)
		_ = json.NewEncoder(w).Encode(types.ErrorResponse("could not generating token"))
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	_ = json.NewEncoder(w).Encode(map[string]string{"token": token})
}

func (h *AuthHandler) Register(w http.ResponseWriter, r *http.Request) {
	var req types.RegisterRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusBadRequest)
		_ = json.NewEncoder(w).Encode(types.ErrorResponse("invalid request"))
		return
	}

	// Cek apakah NRP sudah ada
	existingUser, _ := h.client.User.FindUnique(
		db.User.Nrp.Equals(req.NRP),
	).Exec(r.Context())

	if existingUser != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusConflict)
		_ = json.NewEncoder(w).Encode(types.ErrorResponse("nrp already exists"))
		return
	}

	// Hash password
	hashedPassword, err := utils.HashPassword(req.Password)
	if err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusInternalServerError)
		_ = json.NewEncoder(w).Encode(types.ErrorResponse("failed to process request"))
		return
	}

	role := db.Role(req.Role)

	// Create user
	_, err = h.client.User.CreateOne(
		db.User.Nrp.Set(req.NRP),
		db.User.Name.Set(req.Name),
		db.User.Email.Set(""),
		db.User.Phone.Set(""),
		db.User.About.Set(""),
		db.User.Password.Set(hashedPassword),
		db.User.Role.Set(role),
	).Exec(r.Context())

	if err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusInternalServerError)
		_ = json.NewEncoder(w).Encode(types.ErrorResponse("failed to create user"))
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	_ = json.NewEncoder(w).Encode(types.SuccessResponse("user created"))
}

func (h *AuthHandler) ChangePassword(w http.ResponseWriter, r *http.Request) {
	// Ambil userID dari context (setelah user login)
	userID, ok := r.Context().Value("userID").(string)
	if !ok {
		w.WriteHeader(http.StatusUnauthorized)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "userID not found in context"})
		return
	}

	fmt.Printf("UserID from context: %s\n", userID)

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
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "new_password and confirm_new_password are not matching"})
	}

	// Ambil user dari database
	user, err := h.client.User.FindUnique(
		db.User.ID.Equals(userID),
	).Exec(r.Context())
	if err != nil {
		fmt.Printf("Error finding user: %v\n", err)
		w.WriteHeader(http.StatusNotFound)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "user not found"})
		return
	}

	fmt.Printf("Found user: %+v\n", user)
	fmt.Printf("Stored password hash: %s\n", user.Password)
	fmt.Printf("Old password attempt: %s\n", req.OldPassword)

	// Verifikasi password lama
	err = bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.OldPassword))
	if err != nil {
		w.WriteHeader(http.StatusUnauthorized)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "old password is incorrect"})
		return
	}

	// Hash password baru
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.NewPassword), bcrypt.DefaultCost)
	if err != nil {
		fmt.Printf("Error hashing new password: %v\n", err)
		w.WriteHeader(http.StatusInternalServerError)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "failed to hash password"})
		return
	}

	// Update password di database
	updatedUser, err := h.client.User.FindUnique(
		db.User.ID.Equals(userID),
	).Update(
		db.User.Password.Set(string(hashedPassword)),
	).Exec(r.Context())
	if err != nil {
		fmt.Printf("Error updating password: %v\n", err)
		w.WriteHeader(http.StatusInternalServerError)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "failed to update password"})
		return
	}

	fmt.Printf("Password updated user: %s\n", updatedUser.ID)

	// Kirim response sukses
	w.WriteHeader(http.StatusOK)
	_ = json.NewEncoder(w).Encode(map[string]string{"message": "password updated"})
}

// Generate kode verifikasi 6 digit
func generateResetToken() string {

	timestamp := time.Now().Unix()

	// Generate random string
	source := rand.NewSource(time.Now().UnixNano())
	r := rand.New(source)

	// Generate 32 random bytes
	randomBytes := make([]byte, 32)
	for i := range randomBytes {
		randomBytes[i] = byte(r.Intn(256))
	}

	// Gabungkan timestamp dan random bytes
	token := fmt.Sprintf("%d-%x", timestamp, randomBytes)
	return token
}

// Generate kode verifikasi 6 digit
func generateVerificationCode() string {
	source := rand.NewSource(time.Now().UnixNano())
	r := rand.New(source)
	return fmt.Sprintf("%06d", r.Intn(900000)+100000)
}

func (h *AuthHandler) SendVerificationCode(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	ctx := r.Context()

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
	).Exec(ctx)

	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "email not found"})
		return
	}

	// Generate kode
	code := generateVerificationCode()

	// Simpan di cache
	err = h.cacheService.Set(
		fmt.Sprintf("verify:%s", user.Email),
		code,
		10*time.Minute,
	)

	if err != nil {
		fmt.Printf("Error: %v\n", err)
		w.WriteHeader(http.StatusInternalServerError)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "failed to process request"})
		return
	}

	// Kirim email
	err = h.emailService.SendVerificationCode(user.Email, code)
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
	ctx := r.Context()

	var req struct {
		Email string `json:"email"`
		Code  string `json:"code"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		w.WriteHeader(http.StatusBadRequest)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "invalid request"})
		return
	}

	// Ambil kode dari cache
	code, err := h.cacheService.Get(fmt.Sprintf("verify:%s", req.Email))
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "invalid or expired code"})
		return
	}

	if code != req.Code {
		w.WriteHeader(http.StatusBadRequest)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "invalid code"})
		return
	}

	// Update status email verified
	_, err = h.client.User.FindUnique(
		db.User.Email.Equals(req.Email),
	).Update(
		db.User.EmailVerified.Set(true),
	).Exec(ctx)

	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "failed to verify email"})
		return
	}

	// Hapus kode dari cache
	_ = h.cacheService.Delete(fmt.Sprintf("verify:%s", req.Email))

	w.WriteHeader(http.StatusOK)
	_ = json.NewEncoder(w).Encode(map[string]string{"message": "email verified successfully"})
}

func (h *AuthHandler) ForgotPassword(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	ctx := r.Context()

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
	).Exec(ctx)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		_ = json.NewEncoder(w).Encode(types.ErrorResponse("email not found"))
		return
	}

	// Generate reset token
	token := generateResetToken()
	expiredAt := time.Now().Add(10 * time.Minute)

	// Invalidate token lama
	_, err = h.client.PasswordReset.FindMany(
		db.PasswordReset.UserID.Equals(user.ID),
		db.PasswordReset.Used.Equals(false),
	).Update(
		db.PasswordReset.Used.Set(true),
	).Exec(ctx)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "failed to reset password"})
		return
	}

	// Buat token baru
	_, err = h.client.PasswordReset.CreateOne(
		db.PasswordReset.User.Link(
			db.User.ID.Equals(user.ID),
		),
		db.PasswordReset.Token.Set(token),
		db.PasswordReset.ExpiredAt.Set(expiredAt),
		db.PasswordReset.Used.Set(false),
	).Exec(ctx)
	if err != nil {
		fmt.Printf("Error creating new token: %v\n", err)
		w.WriteHeader(http.StatusInternalServerError)
		_ = json.NewEncoder(w).Encode(types.ErrorResponse("failed to generate token"))
		return
	}

	// Kirim email reset password
	err = h.emailService.SendResetPasswordEmail(user.Email, token)
	if err != nil {
		fmt.Printf("Error sending email: %v\n", err)
		w.WriteHeader(http.StatusInternalServerError)
		_ = json.NewEncoder(w).Encode(types.ErrorResponse("failed to send email"))
		return
	}

	w.WriteHeader(http.StatusOK)
	_ = json.NewEncoder(w).Encode(types.SuccessResponse("reset password link has been sent to your email"))
}

func (h *AuthHandler) ResetPassword(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	ctx := r.Context()

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

	// Cek token reset password
	resetToken, err := h.client.PasswordReset.FindFirst(
		db.PasswordReset.Token.Equals(req.Token),
		db.PasswordReset.Used.Equals(false),
		db.PasswordReset.ExpiredAt.Gt(time.Now()),
	).With(
		db.PasswordReset.User.Fetch(),
	).Exec(ctx)
	if err != nil {
		fmt.Printf("Error finding reset token: %v\n", err)
		w.WriteHeader(http.StatusBadRequest)
		_ = json.NewEncoder(w).Encode(types.ErrorResponse("invalid or expired token"))
		return
	}

	// Hash password baru
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.NewPassword), bcrypt.DefaultCost)
	if err != nil {
		fmt.Printf("Error hashing password: %v\n", err)
		w.WriteHeader(http.StatusInternalServerError)
		_ = json.NewEncoder(w).Encode(types.ErrorResponse("failed to process password"))
		return
	}

	// Update password
	_, err = h.client.User.FindUnique(
		db.User.ID.Equals(resetToken.UserID),
	).Update(
		db.User.Password.Set(string(hashedPassword)),
	).Exec(ctx)
	if err != nil {
		fmt.Printf("Error updating password: %v\n", err)
		w.WriteHeader(http.StatusInternalServerError)
		_ = json.NewEncoder(w).Encode(types.ErrorResponse("failed to reset password"))
		return
	}

	// Mark token sebagai used
	_, err = h.client.PasswordReset.FindUnique(
		db.PasswordReset.ID.Equals(resetToken.ID),
	).Update(
		db.PasswordReset.Used.Set(true),
	).Exec(ctx)
	if err != nil {
		fmt.Printf("Error marking token as used: %v\n", err)
		w.WriteHeader(http.StatusInternalServerError)
		_ = json.NewEncoder(w).Encode(types.ErrorResponse("failed to update token status"))
		return
	}

	w.WriteHeader(http.StatusOK)
	_ = json.NewEncoder(w).Encode(types.SuccessResponse("password has been reset successfully"))
}
