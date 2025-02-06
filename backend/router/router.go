package router

import (
	"backend/handler"
	"backend/middleware"
	"github.com/gorilla/mux"
	"os"
)

func NewRouter(authHandler *handler.AuthHandler, announcementHandler *handler.AnnouncementHandler, userHandler *handler.UserProfile, groupHandler *handler.GroupHandler) *mux.Router {
	r := mux.NewRouter()

	// admin route
	r.HandleFunc("/api/admin/register", authHandler.Register).Methods("POST")

	// Public routes
	r.HandleFunc("/api/login", authHandler.Login).Methods("POST")
	r.HandleFunc("/api/announcement", announcementHandler.GetAnnouncements).Methods("GET") // Semua user bisa akses

	// Protected routes (memerlukan autentikasi)
	api := r.PathPrefix("/api").Subrouter()
	api.Use(middleware.AuthMiddleware(os.Getenv("JWT_SECRET")))

	// Announcement routes
	api.HandleFunc("/announcement", announcementHandler.CreateAnnouncement).Methods("POST")   // Hanya SUPER_ADMIN dan ADMIN
	api.HandleFunc("/announcement", announcementHandler.UpdateAnnouncement).Methods("PUT")    // Hanya SUPER_ADMIN dan ADMIN
	api.HandleFunc("/announcement", announcementHandler.DeleteAnnouncement).Methods("DELETE") // Hanya SUPER_ADMIN dan ADMIN

	// Change password & profile routes
	api.HandleFunc("/change-password", authHandler.ChangePassword).Methods("PUT")
	api.HandleFunc("/profile/", userHandler.GetMyProfile).Methods("GET")
	api.HandleFunc("/profile/{id}", userHandler.GetUserProfile).Methods("GET")
	api.HandleFunc("/profile/", userHandler.UpdateMyProfile).Methods("PUT")

	adminAPI := api.PathPrefix("/admin").Subrouter()
	adminAPI.Use(middleware.RoleCheck("SUPER_ADMIN", "ADMIN"))
	adminAPI.HandleFunc("/groups", groupHandler.GetAllGroups).Methods("GET")
	adminAPI.HandleFunc("/groups/{id}", groupHandler.GetGroupById).Methods("GET")
	adminAPI.HandleFunc("/groups", groupHandler.CreateGroup).Methods("POST")
	//adminAPI.HandleFunc("/groups", groupHandler.UpdateGroup).Methods("PUT")

	return r
}
