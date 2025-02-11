package router

import (
	"backend/handler"
	"backend/middleware"
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

	r := mux.NewRouter()

	// admin route
	r.HandleFunc("/api/admin/register", authHandler.Register).Methods("POST")

	api := r.PathPrefix("/api").Subrouter()
	api.Use(middleware.AuthMiddleware(os.Getenv("JWT_SECRET")))

	adminAPI := api.PathPrefix("/admin").Subrouter()
	adminAPI.Use(middleware.RoleCheck("SUPER_ADMIN", "ADMIN"))

	assistantAPI := api.PathPrefix("/assistant").Subrouter()
	assistantAPI.Use(middleware.RoleCheck("ASISTEN"))

	// Public routes
	r.HandleFunc("/api/login", authHandler.Login).Methods("POST")
	r.HandleFunc("/api/announcement", announcementHandler.GetAnnouncements).Methods("GET")

	// Announcement routes
	api.HandleFunc("/announcement", announcementHandler.CreateAnnouncement).Methods("POST")
	api.HandleFunc("/announcement", announcementHandler.UpdateAnnouncement).Methods("PUT")
	api.HandleFunc("/announcement", announcementHandler.DeleteAnnouncement).Methods("DELETE")

	// User routes
	adminAPI.HandleFunc("/users", userHandler.GetAllUsers).Methods("GET")
	adminAPI.HandleFunc("/users/{role}", userHandler.GetUsersByRole).Methods("GET")
	api.HandleFunc("/change-password", authHandler.ChangePassword).Methods("PUT")
	api.HandleFunc("/profile", userHandler.GetMyProfile).Methods("GET")
	api.HandleFunc("/profile/{id}", userHandler.GetUserProfile).Methods("GET")
	api.HandleFunc("/profile", userHandler.UpdateMyProfile).Methods("PUT")

	// Group routes
	adminAPI.HandleFunc("/groups", groupHandler.GetAllGroups).Methods("GET")
	adminAPI.HandleFunc("/groups/{id}", groupHandler.GetGroupById).Methods("GET")
	adminAPI.HandleFunc("/groups", groupHandler.CreateGroup).Methods("POST")
	adminAPI.HandleFunc("/groups", groupHandler.UpdateGroup).Methods("PUT")

	// Practicum routes
	api.HandleFunc("/practicum", practicumHandler.GetPracticum).Methods("GET")
	adminAPI.HandleFunc("/practicum", practicumHandler.CreatePracticum).Methods("POST")
	adminAPI.HandleFunc("/practicum", practicumHandler.UpdatePracticum).Methods("PUT")
	adminAPI.HandleFunc("/practicum", practicumHandler.DeletePracticum).Methods("DELETE")

	// Assistant routes
	adminAPI.HandleFunc("/assistant", assistantHandler.SetAssistant).Methods("POST")
	adminAPI.HandleFunc("/assistant", assistantHandler.GetAssistants).Methods("GET")

	// Grading routes
	assistantAPI.HandleFunc("/grade", gradeHandler.CreateGrade).Methods("POST")
	api.HandleFunc("/grade", gradeHandler.GetGrades).Methods("GET")
	api.HandleFunc("/grade/{id}", gradeHandler.GetGradeDetail).Methods("GET")

	// Schedule routes
	api.HandleFunc("/schedule", scheduleHandler.GetSchedules).Methods("GET")
	assistantAPI.HandleFunc("/set-schedule", scheduleHandler.SetSchedule).Methods("PUT")
	assistantAPI.HandleFunc("/schedule/mark-finished", scheduleHandler.SetFinished).Methods("POST")

	// Attendance routes
	assistantAPI.HandleFunc("/attendance/status/{id}", attendanceHandler.GetAttendanceStatus).Methods("GET")
	assistantAPI.HandleFunc("/attendance/generate", attendanceHandler.GenerateCode).Methods("POST")
	assistantAPI.HandleFunc("/attendance/update", attendanceHandler.UpdateAttendance).Methods("PUT")
	api.HandleFunc("/attendance", attendanceHandler.SubmitAttendance).Methods("POST")

	// Assistant status routes
	adminAPI.HandleFunc("/assistant/status", assistantHandler.GetAssistantStatus).Methods("GET")

	return r
}
