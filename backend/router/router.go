package router

import (
	"backend/handler"
	"backend/middleware"
	"backend/service"
	"github.com/gorilla/mux"
	"os"
)

func NewRouter(
	authHandler *handler.AuthHandler,
	announcementHandler *handler.AnnouncementHandler,
	userHandler *handler.UserHandler,
	groupHandler *handler.GroupHandler,
	practicumHandler *handler.PracticumHandler,
	assistantHandler *handler.AssistantHandler,
	scheduleHandler *handler.ScheduleHandler,
	gradeHandler *handler.GradeHandler,
	attendanceHandler *handler.AttendanceHandler,
) *mux.Router {
	// Inisialisasi service dan middleware
	cacheService := service.NewCacheService()
	secretKey := os.Getenv("JWT_SECRET")

	// Buat router utama
	r := mux.NewRouter()

	// Subrouter untuk API dengan prefix `/api`
	api := r.PathPrefix("/api").Subrouter()
	api.Use(middleware.AuthMiddleware(secretKey, cacheService))

	// Subrouter untuk admin dengan prefix `/api/admin`
	adminAPI := api.PathPrefix("/admin").Subrouter()
	adminAPI.Use(middleware.RoleCheck("SUPER_ADMIN", "ADMIN"))

	// Subrouter untuk asisten dengan prefix `/api/assistant`
	assistantAPI := api.PathPrefix("/assistant").Subrouter()
	assistantAPI.Use(middleware.RoleCheck("ASISTEN"))

	// ======================
	// Public Routes (Tanpa Auth)
	// ======================
	r.HandleFunc("/api/register-first-super-admin", authHandler.RegisterFirstSuperAdmin).Methods("POST")
	r.HandleFunc("/api/login", authHandler.Login).Methods("POST")
	r.HandleFunc("/api/announcement", announcementHandler.GetAnnouncements).Methods("GET")
	r.HandleFunc("/api/forgot-password", authHandler.ForgotPassword).Methods("POST")
	r.HandleFunc("/api/reset-password", authHandler.ResetPassword).Methods("POST")

	// ======================
	// Auth Routes (Memerlukan Auth)
	// ======================
	api.HandleFunc("/logout", authHandler.Logout).Methods("POST")
	api.HandleFunc("/change-password", authHandler.ChangePassword).Methods("PUT")
	api.HandleFunc("/profile", userHandler.GetMyProfile).Methods("GET")
	api.HandleFunc("/profile/{id}", userHandler.GetUserProfile).Methods("GET")
	api.HandleFunc("/profile", userHandler.UpdateMyProfile).Methods("PUT")
	api.HandleFunc("/verify-email", authHandler.VerifyEmail).Methods("POST")
	api.HandleFunc("/send-verification-code", authHandler.SendVerificationCode).Methods("POST")

	// ======================
	// Admin Routes (Memerlukan Role Admin/Super Admin)
	// ======================
	adminAPI.HandleFunc("/register", authHandler.Register).Methods("POST")
	adminAPI.HandleFunc("/users", userHandler.GetAllUsers).Methods("GET")
	adminAPI.HandleFunc("/users/{role}", userHandler.GetUsersByRole).Methods("GET")
	adminAPI.HandleFunc("/groups", groupHandler.GetAllGroups).Methods("GET")
	adminAPI.HandleFunc("/groups/{id}", groupHandler.GetGroupById).Methods("GET")
	adminAPI.HandleFunc("/groups", groupHandler.CreateGroup).Methods("POST")
	adminAPI.HandleFunc("/groups", groupHandler.UpdateGroup).Methods("PUT")
	adminAPI.HandleFunc("/practicum", practicumHandler.CreatePracticum).Methods("POST")
	adminAPI.HandleFunc("/practicum", practicumHandler.UpdatePracticum).Methods("PUT")
	adminAPI.HandleFunc("/practicum", practicumHandler.DeletePracticum).Methods("DELETE")
	adminAPI.HandleFunc("/assistant", assistantHandler.SetAssistant).Methods("POST")
	adminAPI.HandleFunc("/assistant", assistantHandler.GetAssistants).Methods("GET")
	adminAPI.HandleFunc("/assistant/status", assistantHandler.GetAssistantStatus).Methods("GET")

	// ======================
	// Assistant Routes (Memerlukan Role Asisten)
	// ======================
	assistantAPI.HandleFunc("/grade", gradeHandler.CreateGrade).Methods("POST")
	assistantAPI.HandleFunc("/set-schedule", scheduleHandler.SetSchedule).Methods("PUT")
	assistantAPI.HandleFunc("/schedule/mark-finished", scheduleHandler.SetFinished).Methods("POST")
	assistantAPI.HandleFunc("/attendance/status/{id}", attendanceHandler.GetAttendanceStatus).Methods("GET")
	assistantAPI.HandleFunc("/attendance/generate", attendanceHandler.GenerateCode).Methods("POST")
	assistantAPI.HandleFunc("/attendance/update", attendanceHandler.UpdateAttendance).Methods("PUT")

	// ======================
	// Shared Routes (Bisa Diakses oleh Semua Role yang Terautentikasi)
	// ======================
	api.HandleFunc("/announcement", announcementHandler.CreateAnnouncement).Methods("POST")
	api.HandleFunc("/announcement", announcementHandler.UpdateAnnouncement).Methods("PUT")
	api.HandleFunc("/announcement", announcementHandler.DeleteAnnouncement).Methods("DELETE")
	api.HandleFunc("/practicum", practicumHandler.GetPracticum).Methods("GET")
	api.HandleFunc("/grade", gradeHandler.GetGrades).Methods("GET")
	api.HandleFunc("/grade/{id}", gradeHandler.GetGradeDetail).Methods("GET")
	api.HandleFunc("/schedule", scheduleHandler.GetSchedules).Methods("GET")
	api.HandleFunc("/attendance", attendanceHandler.SubmitAttendance).Methods("POST")

	return r
}
