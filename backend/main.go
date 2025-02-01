package main

import (
	"backend/handler"
	"backend/prisma/db"
	"backend/router"
	"log"
	"net/http"
)

func main() {
	// Buat instance Prisma Client
	client := db.NewClient()
	if err := client.Prisma.Connect(); err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	defer func() {
		if err := client.Prisma.Disconnect(); err != nil {
			log.Printf("Failed to disconnect from database: %v", err)
		}
	}()

	// Buat instance AuthHandler
	authHandler := handler.NewAuthHandler(client)
	announcementHandler := handler.NewAnnouncementHandler(client)
	userHandler := handler.NewUserProfile(client)

	// Initialising router
	r := router.NewRouter(authHandler, announcementHandler, userHandler)

	// Jalankan server
	log.Println("Server started on :8080")
	if err := http.ListenAndServe(
		":8080", r); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
