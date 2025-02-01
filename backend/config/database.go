package config

import (
	"backend/prisma/db"
)

type DB struct {
	Prisma *db.PrismaClient
}
