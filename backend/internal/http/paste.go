package http

import (
	"errors"
	"log"
	"net/http"
	"time"

	pasteService "github.com/Sumedhvats/pasteCTL/internal/paste"
	"github.com/gin-gonic/gin"
)
var (
    ErrPasteNotFound = errors.New("paste not found")
    ErrPasteExpired  = errors.New("paste has expired")
)
type Handler struct {
	Service pasteService.PasteService
}

func NewHandler(svc pasteService.PasteService) *Handler {
	return &Handler{
		Service: svc,
	}
}

func (h *Handler) CreatePasteHandler(c *gin.Context) {
	type CreatePasteRequest struct {
		Content  string `json:"content" binding:"required"`
		Language string `json:"language" binding:"required"`
		Expire   string `json:"expire"` // "1h", "24h", "7d", "never"
	}

	var req CreatePasteRequest
	if err := c.BindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body or missing fields"})
		return
	}
expireMinutes := 0
if req.Expire != "" && req.Expire != "never" {
    duration, err := parseExpiry(req.Expire) // time.Duration
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid expire format"})
        return
    }
    expireMinutes = int(duration.Minutes())
}

p, err := h.Service.CreatePaste(req.Content, req.Language, expireMinutes)
	if err != nil {
		log.Printf("Failed to create paste: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create paste"})
		return
	}

	c.JSON(http.StatusOK, p)
}

// parseExpiry converts "1h", "24h", "7d" into time.Duration
func parseExpiry(expire string) (time.Duration, error) {
	switch expire {
	case "1h":
		return time.Hour, nil
	case "24h":
		return 24 * time.Hour, nil
	case "7d":
		return 7 * 24 * time.Hour, nil
	default:
		return 0, errors.New("invalid expiry")
	}
}


func (h *Handler) UpdatePasteHandler(c *gin.Context) {
    id := c.Param("id")
    if id == "" {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Paste ID is required"})
        return
    }

    type UpdatePasteRequest struct {
        Content  string `json:"content" binding:"required"`
        Language string `json:"language"`
    }

    var req UpdatePasteRequest
    if err := c.BindJSON(&req); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid or incomplete request"})
        return
    }

    p, err := h.Service.UpdatePaste(id, req.Content, req.Language)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update paste"})
        return
    }

    c.JSON(http.StatusOK, p)
}


func (h *Handler) UpdateViewsHandler(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Paste ID is required"})
		return
	}
	p, err := h.Service.UpdateViews(id, 1)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update views"})
		return
	}
	c.JSON(http.StatusOK, p)
}

func (h *Handler) GetPasteHandler(c *gin.Context) {
    id := c.Param("id")
    if id == "" {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Paste ID is required"})
        return
    }

    p, err := h.Service.GetPaste(id)
    if err != nil {
        switch err {
        case ErrPasteNotFound:
            c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
        case ErrPasteExpired:
            c.JSON(http.StatusGone, gin.H{"error": err.Error()})
        default:
            log.Printf("Internal error fetching paste: %v", err)
            c.JSON(http.StatusInternalServerError, gin.H{"error": "internal server error"})
        }
        return
    }

    c.JSON(http.StatusOK, p)
}

func (h *Handler) GetContentHandler(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Paste ID is required"})
		return
	}
	p, err := h.Service.GetPaste(id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update views"})
		return
	}
	c.JSON(http.StatusOK, p.Content)
}
