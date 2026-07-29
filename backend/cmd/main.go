package main

import (
	"fmt"
	"log"
	"os"
	"strconv"
	"time"

	Scheduledjob "github.com/Sumedhvats/pasteCTL_web/cmd/scheduledJob"
	"github.com/Sumedhvats/pasteCTL_web/internal/db"
	"github.com/Sumedhvats/pasteCTL_web/internal/http"
	rateLimitMiddleware "github.com/Sumedhvats/pasteCTL_web/internal/middleware"
	pasteService "github.com/Sumedhvats/pasteCTL_web/internal/paste"
	"github.com/Sumedhvats/pasteCTL_web/internal/ws"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	"github.com/sumedhvats/rate-limiter-go/pkg/limiter"
	"github.com/sumedhvats/rate-limiter-go/pkg/storage"
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
	err := godotenv.Load()
	if err != nil {
		fmt.Print("cannot load env")
	}
	frontend_url := os.Getenv("FRONTEND_URL")
	config := cors.DefaultConfig()
	config.AllowOrigins = []string{"https://www.paste.svats.me", "https://www.paste.svats.me/", "https://paste.svats.me", "https://paste.svats.me/", "https://localhost:3000", frontend_url}
	config.AllowMethods = []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"}
	config.AllowHeaders = []string{"Origin", "Content-Type", "Authorization", "Accept", "User-Agent", "Cache-Control", "Pragma"}
	config.ExposeHeaders = []string{"Content-Length"}
	config.AllowCredentials = true
	config.MaxAge = 12 * time.Hour

	r.Use(cors.New(config))

	rateLimit := 10
	if v := os.Getenv("RATE_LIMIT"); v != "" {
		if parsed, err := strconv.Atoi(v); err == nil && parsed > 0 {
			rateLimit = parsed
		}
	}
	rlConfig := limiter.Config{
		Rate:   rateLimit,
		Window: 1 * time.Minute,
	}
	store := storage.NewMemoryStorage()
	rateLimiter := limiter.NewSlidingWindowLimiter(store, rlConfig)
	r.Use(rateLimitMiddleware.RateLimitMiddleware(rateLimiter, rlConfig))
	log.Printf("Rate limiting enabled: %d requests/minute per IP", rateLimit)

	r.GET("/api/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "ok"})
	})
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
