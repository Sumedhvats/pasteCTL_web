package middleware

import (
	"fmt"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/sumedhvats/rate-limiter-go/pkg/limiter"
)

// RateLimitMiddleware returns a Gin middleware that enforces per-IP rate
// limiting using the provided Limiter instance from rate-limiter-go.
//
// It sets standard rate-limit response headers on every request and returns
// a 429 JSON response when the limit is exceeded.
func RateLimitMiddleware(rateLimiter limiter.Limiter, cfg limiter.Config) gin.HandlerFunc {
	return func(c *gin.Context) {
		key := fmt.Sprintf("ip:%s", c.ClientIP())

		allowed, err := rateLimiter.Allow(key)
		if err != nil {
			// If the limiter errors, fail open to avoid blocking legitimate
			// traffic due to an internal issue (e.g. storage hiccup).
			c.Next()
			return
		}

		// Set standard rate-limit headers.
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
