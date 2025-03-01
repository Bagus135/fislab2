package cron

import (
	"backend/prisma/db"
	"context"
	"log"
	"time"

	"github.com/go-co-op/gocron/v2"
)

// Cron adalah struct yang menyimpan dependency untuk cron job
type Cron struct {
	client *db.PrismaClient
}

// NewCron membuat instance baru dari Cron
func NewCron(client *db.PrismaClient) *Cron {
	return &Cron{client: client}
}

// StartCronJobs memulai semua cron job yang diperlukan
func (c *Cron) StartCronJobs() {
	// Buat scheduler baru
	scheduler, err := gocron.NewScheduler()
	if err != nil {
		log.Fatalf("failed create scheduler: %v\n", err)
	}

	// Jadwalkan tugas untuk dijalankan setiap 2 bulan
	_, err = scheduler.NewJob(
		gocron.CronJob("0 0 1 */2 *", false),
		gocron.NewTask(c.DeleteExpiredAttendanceCodes),
	)
	if err != nil {
		log.Fatalf("failed to start cron job: %v\n", err)
	}

	// Mulai scheduler
	scheduler.Start()

	log.Println("Cron job started")
}

func (c *Cron) DeleteExpiredAttendanceCodes() {
	// Buat context dengan timeout
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// Hitung waktu sekarang
	now := time.Now()

	// Hapus attendanceCode yang expiredAt-nya sudah lewat
	_, err := c.client.AttendanceCode.FindMany(
		db.AttendanceCode.ExpiredAt.Before(now),
	).Delete().Exec(ctx)

	if err != nil {
		log.Printf("Gagal menghapus attendanceCode: %v\n", err)
		return
	}

	log.Println("AttendanceCode yang kadaluarsa berhasil dihapus")
}
