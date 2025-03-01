package main

import (
	"backend/config/database"
	"backend/config/server"
	"backend/cron"
	"backend/handler"
	"backend/router"
	"backend/service"
)

func main() {
	// DB connection
	client := database.ConnectDB()
	defer database.DisconnectDB(client)

	// Inisialisasi cron job
	cronJob := cron.NewCron(client)
	cronJob.StartCronJobs()

	emailService := service.NewEmailService()
	cacheService := service.NewCacheService()

	// Instance handler
	authHandler := handler.NewAuthHandler(client, emailService, cacheService)
	announcementHandler := handler.NewAnnouncementHandler(client)
	userHandler := handler.NewUserHandler(client)
	groupHandler := handler.NewGroupHandler(client)
	practicumHandler := handler.NewPracticumHandler(client)
	assistantHandler := handler.NewAssistantHandler(client)
	scheduleHandler := handler.NewScheduleHandler(client)
	gradeHandler := handler.NewGradeHandler(client)
	attendanceHandler := handler.NewAttendanceHandler(client, cacheService)

	// Initializing router
	r := router.NewRouter(
		authHandler,
		announcementHandler,
		userHandler,
		groupHandler,
		practicumHandler,
		assistantHandler,
		scheduleHandler,
		gradeHandler,
		attendanceHandler,
	)

	// Running server
	server.StartServer(r)

	// Jaga aplikasi tetap berjalan
	select {}
}
