package database

import (
	"backend/prisma/db"
	"log"
)

func ConnectDB() *db.PrismaClient {
	client := db.NewClient()
	if err := client.Prisma.Connect(); err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	return client
}

// DisconnectDB from database
func DisconnectDB(client *db.PrismaClient) {
	if err := client.Prisma.Disconnect(); err != nil {
		log.Printf("Failed to disconnect from database: %v", err)
	}
}
