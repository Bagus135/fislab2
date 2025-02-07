package main

import (
	"backend/config/database"
	"backend/config/server"
	"backend/handler"
	"backend/router"
)

func main() {
	// DB connection
	client := database.ConnectDB()
	defer database.DisconnectDB(client)

	// Instance handler
	authHandler := handler.NewAuthHandler(client)
	announcementHandler := handler.NewAnnouncementHandler(client)
	userHandler := handler.NewUserProfile(client)
	groupHandler := handler.NewGroupHandler(client)
	practicumHandler := handler.NewPracticumHandler(client)
	assistantHandler := handler.NewAssistantHandler(client)
	scheduleHandler := handler.NewScheduleHandler(client)

	// Initializing router
	r := router.NewRouter(
		authHandler,
		announcementHandler,
		userHandler,
		groupHandler,
		practicumHandler,
		assistantHandler,
		scheduleHandler,
	)

	// Running server
	server.StartServer("8080", r)
}
