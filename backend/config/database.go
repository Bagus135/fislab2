package config

import (
	"backend/prisma/db"
)

type DB struct {
	Prisma *db.PrismaClient
}

func ConnectDB() (*DB, error) {
	client := db.NewClient()
	err := client.Connect()
	if err != nil {
		return nil, err
	}

	return &DB{
		Prisma: client,
	}, nil
}
