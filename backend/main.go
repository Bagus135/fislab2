package main

import (
	"backend/config"
	"backend/handler"
	"backend/router"
)

func main() {
	// DB connection
	client := config.ConnectDB()
	defer config.DisconnectDB(client)

	// Instance handler
	authHandler := handler.NewAuthHandler(client)
	announcementHandler := handler.NewAnnouncementHandler(client)
	userHandler := handler.NewUserProfile(client)

	// Initializing router
	r := router.NewRouter(authHandler, announcementHandler, userHandler)

	// Running server
	config.StartServer("8080", r)
}
