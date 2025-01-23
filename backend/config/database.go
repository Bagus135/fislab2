package config

import (
	"backend/prisma/db"
	"github.com/rs/zerolog/log"
)

func ConnectDB() (*db.PrismaClient, error) {
	client := &db.PrismaClient{}
	if err := client.Connect(); err != nil {
		return nil, err
	}
	log.Info().Msg("Connected to database!")
	return client, nil
}
