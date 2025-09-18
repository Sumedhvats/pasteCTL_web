package main

import (
	"github.com/Sumedhvats/pasteCTL/internal/db"
	"github.com/Sumedhvats/pasteCTL/internal/http"
	"github.com/Sumedhvats/pasteCTL/internal/pasteService"
	"github.com/gin-gonic/gin"
)

func main() {
	db.Init()
	defer db.Close()
	pasteRepo := db.NewRepo()
	pasteService := pasteService.NewPasteService(pasteRepo)
	handler := http.NewHandler(pasteService)
	r := gin.Default()
	r.POST("/api/pastes", handler.CreatePasteHandler)
	r.GET("/api/pastes/{id}", handler.GetPasteHandler)
	r.GET("/api/pastes/{id}/raw", handler.GetContentHandler)
	r.PUT("/api/pastes/{id}", handler.UpdatePasteHandler)
	r.PUT("/api/pastes/{id}/view", handler.UpdateViewsHandler)
}
