package router

import (
	"backend/handler"
	"backend/middleware"
	"github.com/gorilla/mux"
	"os"
)

func NewRouter(authHandler *handler.AuthHandler) *mux.Router {
	r := mux.NewRouter()

	// Public routes
	r.HandleFunc("/api/login", authHandler.Login).Methods("POST")

	// Protected routes
	api := r.PathPrefix("/api/").Subrouter()
	api.Use(middleware.AuthMiddleware(os.Getenv("JWT_SECRET")))

	adminAPI := api.PathPrefix("/admin").Subrouter()
	adminAPI.Use(middleware.RoleCheck("SUPER_ADMIN", "ADMIN"))

	assistantAPI := api.PathPrefix("/assistant").Subrouter()
	assistantAPI.Use(middleware.RoleCheck("ASISTEN"))

	r.HandleFunc("/api/register", authHandler.Register).Methods("POST")

	return r
}
