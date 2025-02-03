package config

import (
	"log"
	"net/http"
)

func StartServer(port string, handler http.Handler) {
	log.Printf("Server started on :%s\n", port)
	if err := http.ListenAndServe(":"+port, handler); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
