package server

import (
	"log"
	"net/http"
	"os"
)

func StartServer(handler http.Handler) {

	var port = os.Getenv("PORT")

	log.Printf("Server started on :%s\n", port)
	if err := http.ListenAndServe(":"+port, handler); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
