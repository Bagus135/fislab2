// config/server/server.go
package server

import (
	"log"
	"net/http"
	"os"
	"time"
)

func StartServer(router http.Handler) {
	// Buat direktori untuk upload jika belum ada
	err := os.MkdirAll("./data/private/profiles", 0755)
	if err != nil {
		return
	}

	// Setup server dengan timeout
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	srv := &http.Server{
		Handler:      router,
		Addr:         ":" + port,
		WriteTimeout: 15 * time.Second,
		ReadTimeout:  15 * time.Second,
		IdleTimeout:  60 * time.Second,
	}

	// Log server startup
	log.Println("Server starting on port", port)
	log.Fatal(srv.ListenAndServe())
}
