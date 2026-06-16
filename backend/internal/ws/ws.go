package ws

import (
	"log/slog"
	"net/http"
	"sync"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
)

type hub struct {
	mu    sync.RWMutex
	rooms map[string]map[*websocket.Conn]struct{}
}

var h = &hub{
	rooms: make(map[string]map[*websocket.Conn]struct{}),
}

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

func (h *hub) addClient(pasteID string, conn *websocket.Conn) {
	h.mu.Lock()
	defer h.mu.Unlock()
	if h.rooms[pasteID] == nil {
		h.rooms[pasteID] = make(map[*websocket.Conn]struct{})
	}
	h.rooms[pasteID][conn] = struct{}{}
}
func (h *hub) removeClient(pasteID string, conn *websocket.Conn) {
	h.mu.Lock()
	defer h.mu.Unlock()
	if conns, ok := h.rooms[pasteID]; ok {
		delete(conns, conn)
		if len(conns) == 0 {
			delete(h.rooms, pasteID)
		}
	}
}

func (h *hub) broadcast(pasteID string, sender *websocket.Conn, msg []byte) {
	h.mu.RLock()
	conns := make([]*websocket.Conn, 0, len(h.rooms[pasteID]))
	for c := range h.rooms[pasteID] {
		if c != sender {
			conns = append(conns, c)
		}
	}
	h.mu.RUnlock()

	for _, c := range conns {
		if err := c.WriteMessage(websocket.TextMessage, msg); err != nil {
			slog.Warn("broadcast write failed", "paste_id", pasteID, "error", err)
			c.Close()
		}
	}
}

func PasteHandler(c *gin.Context) {
	pasteID := c.Param("id")

	conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		slog.Error("websocket upgrade failed", "paste_id", pasteID, "error", err)
		return
	}
	defer func() {
		h.removeClient(pasteID, conn)
		conn.Close()
	}()

	h.addClient(pasteID, conn)
	slog.Info("client connected", "paste_id", pasteID)

	for {
		_, message, err := conn.ReadMessage()
		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseNormalClosure) {
				slog.Warn("unexpected close", "paste_id", pasteID, "error", err)
			}
			return
		}
		h.broadcast(pasteID, conn, message)
	}
}
