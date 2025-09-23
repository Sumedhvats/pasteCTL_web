package ws

import (
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
)

var clients = make(map[string][]*websocket.Conn)
var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

func PasteHandler(c *gin.Context) {
	pasteID := c.Param("id")
	conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		fmt.Println("Upgrade Error:", err)
		return
	}
	defer conn.Close()
	clients[pasteID] = append(clients[pasteID], conn)

	for {
		_, message, err := conn.ReadMessage()
		if err != nil {
			fmt.Println("Read error", err)
			return
		}
		for _, cliend := range clients[pasteID] {
			if err := cliend.WriteMessage(websocket.TextMessage, message); err != nil {
				fmt.Println("Message sent error", err)

			}
		}
	}
}
