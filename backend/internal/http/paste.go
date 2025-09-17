package http

import (
	"log"
	"net/http"
	"time"

	"github.com/Sumedhvats/pasteCTL/internal/db"
	"github.com/gin-gonic/gin"
)

type PasteService interface {
	CreatePaste(content string, lang string, expireMinutes int) (*db.Paste, error)
	GetPaste(id string) (*db.Paste, error)
	GetContent(id string) (string, error)
	UpdatePaste(id string,content string, lang string)(*db.Paste,error)
	UpdateViews(id string,count int)(*db.Paste,error)

}
type Handler struct {
	Service PasteService
}

func NewHandler(svc PasteService) *Handler {
	return &Handler{
		Service: svc,
	}
}
func (h *Handler) CreatePasteHandler(c *gin.Context) {
	type CreatePasteRequest struct {
		Content  string `json:"content" binding:"required"`
		Language string `json:"language" binding:"required"`
		Expire   string `json:"expire"`
	}
	var req CreatePasteRequest
	if err := c.Bind(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body or missing fields"})
		return
	}
	expireMinutes := 0
	if req.Expire != "never" && req.Expire != "" {
		duration, err := time.ParseDuration(req.Expire)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid expire format"})
			return
		}
		expireMinutes = int(duration.Minutes())
	}
	p, err := h.Service.CreatePaste(req.Content, req.Language, expireMinutes)
	if err != nil {
		log.Printf("Failed  to create paste: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create paste"})
		return
	}
	c.JSON(http.StatusOK, p)
}

func (h *Handler) UpdatePasteHandler(c *gin.Context) {
	type UpdatePasteRequest struct {
		Content  string `json:"content"`
		ID       string `json:"id" binding:"required"`
		Language string `json:"language" `
	}
	var req UpdatePasteRequest
	if err := c.Bind(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid or incomplete request"})
	}
	p,err:=h.Service.UpdatePaste(req.ID,req.Content,req.Language)
	if err!=nil{
		c.JSON(http.StatusInternalServerError,gin.H{"error": "Failed to update paste"})
		return
	}
	c.JSON(http.StatusOK,p)
}

func (h *Handler)UpdateViewsHandler(c *gin.Context){
	id := c.Param("id")
    if id == "" {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Paste ID is required"})
        return
    }
	p,err:=h.Service.UpdateViews(id,1)
	if err!=nil {
		c.JSON(http.StatusInternalServerError,gin.H{"error": "Failed to update views"})
		return
	}
	c.JSON(http.StatusOK,p)
}
func (h *Handler)GetPasteHandler(c *gin.Context){
	 id := c.Param("id")
    if id == "" {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Paste ID is required"})
        return
    }

	p,err:=h.Service.GetPaste(id)
	if err!=nil {
		c.JSON(http.StatusInternalServerError,gin.H{"error": "Failed to update views"})
		return
	}
	c.JSON(http.StatusOK,p)
}
 func (h *Handler)GetContentHandler(c *gin.Context){
	id := c.Param("id")
    if id == "" {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Paste ID is required"})
        return
    }
	p,err:=h.Service.GetPaste(id)
	if err!=nil {
		c.JSON(http.StatusInternalServerError,gin.H{"error": "Failed to update views"})
		return
	}
	c.JSON(http.StatusOK,p.Content)
}