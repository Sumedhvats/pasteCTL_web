package server

import (
	"github.com/Sumedhvats/pasteCTL/internal/http"
	"github.com/gin-gonic/gin"
)

func NewRouter(handler *http.Handler)*gin.Engine {

	r := gin.Default()
	r.POST("/api/pastes", handler.CreatePasteHandler)
	r.GET("/api/pastes/:id", handler.GetPasteHandler)
	r.GET("/api/pastes/:id/raw", handler.GetContentHandler)
	r.PUT("/api/pastes/:id", handler.UpdatePasteHandler)
	r.PUT("/api/pastes/:id/view", handler.UpdateViewsHandler)
return r
}
