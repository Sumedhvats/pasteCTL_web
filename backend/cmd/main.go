package main

import (
	"log"

	Scheduledjob "github.com/Sumedhvats/pasteCTL/cmd/scheduledJob"
	"github.com/Sumedhvats/pasteCTL/internal/db"
	"github.com/Sumedhvats/pasteCTL/internal/http"
	pasteService "github.com/Sumedhvats/pasteCTL/internal/paste"
	"github.com/gin-gonic/gin"
)

func main() {
	db.Init()
	defer db.Close()
	pasteRepo := db.NewRepo()
	pasteService := pasteService.NewPasteService(pasteRepo)
	go Scheduledjob.StartScheduler(pasteService)
	handler := http.NewHandler(pasteService)
	log.Println("Server starting on :8080...")
	r := gin.Default()
	r.POST("/api/pastes", handler.CreatePasteHandler)
	r.GET("/api/pastes/:id", handler.GetPasteHandler)
	r.GET("/api/pastes/:id/raw", handler.GetContentHandler)
	r.PUT("/api/pastes/:id", handler.UpdatePasteHandler)
	r.PUT("/api/pastes/:id/view", handler.UpdateViewsHandler)
	if err := r.Run(":8080"); err != nil {
        log.Fatalf("Server failed to start: %v", err)
    }
	
}
