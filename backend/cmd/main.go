package main

import (
	"fmt"
	"log"
	"os"
	"time"

	Scheduledjob "github.com/Sumedhvats/pasteCTL/cmd/scheduledJob"
	"github.com/Sumedhvats/pasteCTL/internal/db"
	"github.com/Sumedhvats/pasteCTL/internal/http"
	pasteService "github.com/Sumedhvats/pasteCTL/internal/paste"
	"github.com/Sumedhvats/pasteCTL/internal/ws"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
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
	err:=godotenv.Load()
	if err!=nil {
		fmt.Print("cannot load env")
	}
	frontend_url:=os.Getenv("FRONTEND_URL")
	config := cors.DefaultConfig()
	config.AllowOrigins = []string{"http://localhost:3000", frontend_url}
	config.AllowMethods = []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"}
	config.AllowHeaders = []string{"Origin", "Content-Type", "Authorization", "Accept", "User-Agent", "Cache-Control", "Pragma"}
	config.ExposeHeaders = []string{"Content-Length"}
	config.AllowCredentials = true
	config.MaxAge = 12 * time.Hour

	r.Use(cors.New(config))
	r.POST("/api/pastes", handler.CreatePasteHandler)
	r.GET("/api/pastes/:id", handler.GetPasteHandler)
	r.GET("/api/pastes/:id/raw", handler.GetContentHandler)
	r.PUT("/api/pastes/:id", handler.UpdatePasteHandler)
	r.PUT("/api/pastes/:id/view", handler.UpdateViewsHandler)
	r.GET("/api/ws/:id", ws.PasteHandler)
	if err := r.Run(":8080"); err != nil {
		log.Fatalf("Server failed to start: %v", err)
	}
}
