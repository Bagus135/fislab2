package main

import (
	"backend/config"
	"backend/handler"
	"backend/router"
	"log"
	"net/http"
)

func main() {
	// DB connection
	client := database.ConnectDB()
	defer database.DisconnectDB(client)

	// Instance handler
	authHandler := handler.NewAuthHandler(client)
	announcementHandler := handler.NewAnnouncementHandler(client)
	userHandler := handler.NewUserProfile(client)

	// Initializing router
	r := router.NewRouter(authHandler, announcementHandler, userHandler)

	// Running server
	log.Println("Server started on :8080")
	if err := http.ListenAndServe(":8080", r); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
