package main

import (
	"log"

	"github.com/Sumedhvats/pasteCTL/cmd/server"
	"github.com/Sumedhvats/pasteCTL/internal/db"
	"github.com/Sumedhvats/pasteCTL/internal/http"
	"github.com/Sumedhvats/pasteCTL/internal/pasteService"
	"github.com/Sumedhvats/pasteCTL/internal/scheduledJob"
)

func main() {
	db.Init()
	defer db.Close()
	pasteRepo := db.NewRepo()
	pasteService := pasteService.NewPasteService(pasteRepo)
	go Scheduledjob.StartScheduler(pasteService)
	handler := http.NewHandler(pasteService)
	r := server.NewRouter(handler)
	log.Println("Server starting on :8080...")
    if err := r.Run(":8080"); err != nil {
        log.Fatalf("Server failed to start: %v", err)
    }
	
}
