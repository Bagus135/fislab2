package router

import (
	"backend/handler"
	"backend/middleware"
	"github.com/gorilla/mux"
	"os"
)

func NewRouter(authHandler *handler.AuthHandler, announcementHandler *handler.AnnouncementHandler) *mux.Router {
	r := mux.NewRouter()

	// Public routes (tidak memerlukan autentikasi)
	r.HandleFunc("/api/register", authHandler.Register).Methods("POST")
	r.HandleFunc("/api/login", authHandler.Login).Methods("POST")
	r.HandleFunc("/api/announcement", announcementHandler.GetAnnouncements).Methods("GET") // Semua user bisa akses

	// Protected routes (memerlukan autentikasi)
	api := r.PathPrefix("/api").Subrouter()
	api.Use(middleware.AuthMiddleware(os.Getenv("JWT_SECRET")))

	// Announcement routes
	api.HandleFunc("/announcement", announcementHandler.CreateAnnouncement).Methods("POST")   // Hanya SUPER_ADMIN dan ADMIN
	api.HandleFunc("/announcement", announcementHandler.UpdateAnnouncement).Methods("PUT")    // Hanya SUPER_ADMIN dan ADMIN
	api.HandleFunc("/announcement", announcementHandler.DeleteAnnouncement).Methods("DELETE") // Hanya SUPER_ADMIN dan ADMIN

	return r
}
