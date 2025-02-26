package router

import (
	"backend/handler"
	"backend/middleware"
	"backend/service"
	"net/http"
	"os"

	"github.com/gorilla/mux"
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

	// Middleware keamanan global - diterapkan ke semua route
	r.Use(middleware.SecurityHeaders) // Tambahkan middleware keamanan global
	r.Use(middleware.RateLimiter)     // Tambahkan rate limiter untuk mencegah brute force
	r.Use(middleware.CORS)
	r.Use(middleware.ContentSecurityPolicy)

	// Subrouter untuk API dengan prefix `/api`
	api := r.PathPrefix("/api").Subrouter()

	// Middleware yang diaplikasikan ke semua route API
	api.Use(middleware.RequestValidation) // Validasi request untuk serangan
	api.Use(middleware.LogRequest)

	// Subrouter untuk route yang memerlukan autentikasi
	protectedAPI := api.NewRoute().Subrouter()
	protectedAPI.Use(middleware.AuthMiddleware(secretKey, cacheService))

	// Subrouter untuk admin dengan prefix `/api/admin`
	adminAPI := protectedAPI.PathPrefix("/admin").Subrouter()
	adminAPI.Use(middleware.RoleCheck("SUPER_ADMIN", "ADMIN"))

	// Subrouter untuk asisten dengan prefix `/api/assistant`
	assistantAPI := protectedAPI.PathPrefix("/assistant").Subrouter()
	assistantAPI.Use(middleware.RoleCheck("ASISTEN"))

	// Endpoint untuk file statis yang aman
	// Handler file statis dengan validasi dan sanitasi path
	fileServer := http.FileServer(http.Dir("./data/private"))
	r.PathPrefix("/files/").Handler(http.StripPrefix("/files/", middleware.SecureFileServer(fileServer)))

	// ======================
	// Public Routes (Tanpa Auth)
	// ======================
	api.HandleFunc("/register-first-super-admin", authHandler.RegisterFirstSuperAdmin).Methods("POST")
	api.HandleFunc("/login", authHandler.Login).Methods("POST")
	api.HandleFunc("/announcement", announcementHandler.GetAnnouncements).Methods("GET")
	api.HandleFunc("/forgot-password", authHandler.ForgotPassword).Methods("POST")
	api.HandleFunc("/reset-password", authHandler.ResetPassword).Methods("POST")

	// ======================
	// Auth Routes (Memerlukan Auth)
	// ======================
	protectedAPI.HandleFunc("/logout", authHandler.Logout).Methods("POST")
	protectedAPI.HandleFunc("/change-password", authHandler.ChangePassword).Methods("PUT")
	protectedAPI.HandleFunc("/profile/me", userHandler.GetMyProfile).Methods("GET")
	protectedAPI.HandleFunc("/profile/{id}", userHandler.GetUserProfile).Methods("GET")
	protectedAPI.HandleFunc("/profile", userHandler.UpdateMyProfile).Methods("PUT")
	protectedAPI.HandleFunc("/profile/picture", userHandler.UploadProfilePicture).Methods("POST") // Tambahkan endpoint upload
	protectedAPI.HandleFunc("/profile/picture/{id}", userHandler.GetProfilePicture).Methods("GET")
	protectedAPI.HandleFunc("/profile/picture/delete", userHandler.DeleteProfilePicture).Methods("DELETE")
	protectedAPI.HandleFunc("/verify-email", authHandler.VerifyEmail).Methods("POST")
	protectedAPI.HandleFunc("/send-verification-code", authHandler.SendVerificationCode).Methods("POST")

	// ======================
	// Admin Routes (Memerlukan Role Admin/Super Admin)
	// ======================
	adminAPI.HandleFunc("/register", authHandler.Register).Methods("POST")
	adminAPI.HandleFunc("/users", userHandler.GetAllUsers).Methods("GET")
	adminAPI.HandleFunc("/users/delete", userHandler.DeleteUser).Methods("DELETE")
	adminAPI.HandleFunc("/users/{role}", userHandler.GetUsersByRole).Methods("GET")
	adminAPI.HandleFunc("/groups", groupHandler.GetAllGroups).Methods("GET")
	adminAPI.HandleFunc("/groups/{id}", groupHandler.GetGroupById).Methods("GET")
	adminAPI.HandleFunc("/groups", groupHandler.CreateGroup).Methods("POST")
	adminAPI.HandleFunc("/groups", groupHandler.UpdateGroup).Methods("PUT")
	adminAPI.HandleFunc("/groups/delete", groupHandler.DeleteGroup).Methods("DELETE")
	adminAPI.HandleFunc("/practicum", practicumHandler.CreatePracticum).Methods("POST")
	adminAPI.HandleFunc("/practicum", practicumHandler.UpdatePracticum).Methods("PUT")
	adminAPI.HandleFunc("/practicum", practicumHandler.DeletePracticum).Methods("DELETE")
	adminAPI.HandleFunc("/grade/all", gradeHandler.GetAllGrades).Methods("GET")
	adminAPI.HandleFunc("/schedules", scheduleHandler.GetAllSchedulesForAdmin).Methods("GET")
	adminAPI.HandleFunc("/assistant/practicum", assistantHandler.SetAssistantToPracticum).Methods("POST")
	adminAPI.HandleFunc("/assistant/practicum/update", assistantHandler.UpdateAssistantPracticum).Methods("PUT")
	adminAPI.HandleFunc("/assistant/practicum/remove", assistantHandler.RemoveAssistantsFromPracticum).Methods("DELETE")
	adminAPI.HandleFunc("/assistant", assistantHandler.GetAssistants).Methods("GET")
	adminAPI.HandleFunc("/assistant/status", assistantHandler.GetAssistantStatus).Methods("GET")
	adminAPI.HandleFunc("/assistant/group", assistantHandler.SetAssistantToGroup).Methods("POST")
	adminAPI.HandleFunc("/assistant/group/update", assistantHandler.UpdateAssistantGroupAssignment).Methods("PUT")
	adminAPI.HandleFunc("/assistant/group/remove", assistantHandler.RemoveAssistantFromGroup).Methods("DELETE")

	// ======================
	// Assistant Routes (Memerlukan Role Asisten)
	// ======================
	assistantAPI.HandleFunc("/grade", gradeHandler.CreateGrade).Methods("POST")
	assistantAPI.HandleFunc("/grade/update/{id}", gradeHandler.UpdateGrade).Methods("PUT")
	assistantAPI.HandleFunc("/set-schedule", scheduleHandler.SetSchedule).Methods("PUT")
	assistantAPI.HandleFunc("/schedule/mark-finished", scheduleHandler.SetFinished).Methods("POST")
	assistantAPI.HandleFunc("/attendance/status/{id}", attendanceHandler.GetAttendanceStatus).Methods("GET")
	assistantAPI.HandleFunc("/attendance/generate", attendanceHandler.GenerateCode).Methods("POST")
	assistantAPI.HandleFunc("/attendance/update", attendanceHandler.UpdateAttendance).Methods("PUT")

	// ======================
	// Shared Routes (Bisa Diakses oleh Semua Role yang Terautentikasi)
	// ======================
	protectedAPI.HandleFunc("/schedules/check", scheduleHandler.GetAllSchedules).Methods("GET")
	protectedAPI.HandleFunc("/announcement", announcementHandler.CreateAnnouncement).Methods("POST")
	protectedAPI.HandleFunc("/announcement", announcementHandler.UpdateAnnouncement).Methods("PUT")
	protectedAPI.HandleFunc("/announcement", announcementHandler.DeleteAnnouncement).Methods("DELETE")
	protectedAPI.HandleFunc("/practicum", practicumHandler.GetPracticum).Methods("GET")
	protectedAPI.HandleFunc("/grade", gradeHandler.GetGrades).Methods("GET")
	protectedAPI.HandleFunc("/grade/{id}", gradeHandler.GetGradeDetail).Methods("GET")
	protectedAPI.HandleFunc("/schedules/me", scheduleHandler.GetSchedules).Methods("GET")
	protectedAPI.HandleFunc("/schedules/nearest", scheduleHandler.GetNearestSchedules).Methods("GET")
	protectedAPI.HandleFunc("/attendance", attendanceHandler.SubmitAttendance).Methods("POST")

	return r
}
