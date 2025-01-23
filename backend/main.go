package main

import (
	"fmt"
	"github.com/joho/godotenv"
	"log"
	"net/http"
	"os"
	"time"
)

func main() {

	err := godotenv.Load()
	if err != nil {
		log.Fatal("Error loading .env file")
	}
	fmt.Printf("Start server!" + os.Getenv("PORT"+"\n"))

	server := &http.Server{
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
