package main

import (
	"backend/handler"
	"backend/prisma/db"
	"backend/router"
	"github.com/joho/godotenv"
	"log"
	"net/http"
	"os"
	"time"
)

func main() {

	// Load environment variables
	err := godotenv.Load()
	if err != nil {
		log.Fatal("Error loading .env file")
	}

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

	// Buat router
	r := router.NewRouter(authHandler)

	// Jalankan server
	server := &http.Server{
		Handler:        r,
		Addr:           ":" + os.Getenv("PORT"+"\n"),
		ReadTimeout:    5 * time.Second,
		WriteTimeout:   10 * time.Second,
		MaxHeaderBytes: 1 << 20,
	}

	serverErr := server.ListenAndServe()
	if serverErr != nil {
		panic(serverErr)
	}
}
