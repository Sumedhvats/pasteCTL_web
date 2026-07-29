package middleware

import (
	"fmt"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/sumedhvats/rate-limiter-go/pkg/limiter"
)

func RateLimitMiddleware(rateLimiter limiter.Limiter, cfg limiter.Config) gin.HandlerFunc {
	return func(c *gin.Context) {
		key := fmt.Sprintf("ip:%s", c.ClientIP())

		allowed, err := rateLimiter.Allow(key)
		if err != nil {
			c.Next()
			return
		}
		c.Header("X-RateLimit-Limit", strconv.Itoa(cfg.Rate))

		if !allowed {
			resetAt := time.Now().Add(cfg.Window).Unix()
			c.Header("X-RateLimit-Remaining", "0")
			c.Header("X-RateLimit-Reset", strconv.FormatInt(resetAt, 10))
			c.Header("Retry-After", strconv.Itoa(int(cfg.Window.Seconds())))

			c.AbortWithStatusJSON(http.StatusTooManyRequests, gin.H{
				"error": "Rate limit exceeded. Please try again later.",
			})
			return
		}

		c.Next()
	}
}
