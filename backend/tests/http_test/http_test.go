package httptest

import (
	"bytes"
	"encoding/json"
	"errors"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/Sumedhvats/pasteCTL/internal/db"
	httpHandler "github.com/Sumedhvats/pasteCTL/internal/http"
	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
	"github.com/stretchr/testify/require"
)

type MockPasteService struct {
	mock.Mock
}

func (m *MockPasteService) CreatePaste(content, language string, expireMinutes int) (*db.Paste, error) {
	args := m.Called(content, language, expireMinutes)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*db.Paste), args.Error(1)
}
func (m *MockPasteService) GetPaste(id string) (*db.Paste, error) {
	args := m.Called(id)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*db.Paste), args.Error(1)
}
func (m *MockPasteService) GetContent(id string) (string, error) {
	args := m.Called(id)
	if args.Get(0) == nil {
		return "", args.Error(1)
	}
	return args.Get(0).(string), args.Error(1)
}

func (m *MockPasteService) UpdatePaste(id, content, language string) (*db.Paste, error) {
	args := m.Called(id, content, language)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*db.Paste), args.Error(1)
}

func (m *MockPasteService) UpdateViews(id string, views int) (*db.Paste, error) {
	args := m.Called(id, views)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*db.Paste), args.Error(1)
}

func (m *MockPasteService) DeleteExpiredPastes() error {
	args := m.Called()
	return args.Error(0)
}
func setupRouter(handler *httpHandler.Handler) *gin.Engine {
	gin.SetMode(gin.TestMode)
	r := gin.New()
	r.POST("/pastes", handler.CreatePasteHandler)
	r.GET("/pastes/:id", handler.GetPasteHandler)
	r.PUT("/pastes/:id", handler.UpdatePasteHandler)
	r.PATCH("/pastes/:id/views", handler.UpdateViewsHandler)
	r.GET("/pastes/:id/content", handler.GetContentHandler)
	return r
}
func TestCreatePasteHandler(t *testing.T) {
	t.Run("successfull creation with 1h expiry", func(t *testing.T) {
		mockService := new(MockPasteService)
		handler := httpHandler.NewHandler(mockService)
		router := setupRouter(handler)

		expireAt := time.Now().Add(1 * time.Hour)
		expectedPaste := &db.Paste{
			ID:       "abc123",
			Content:  "test content",
			Language: "go",
			ExpireAt: &expireAt,
			Views:    0,
		}
		mockService.On("CreatePaste", "test content", "go", 60).
			Return(expectedPaste, nil).Once()
		body := map[string]any{
			"content":  "test content",
			"language": "go",
			"expire":   "1h",
		}
		jsonBody, _ := json.Marshal(body)
		req := httptest.NewRequest("POST", "/pastes", bytes.NewReader(jsonBody))
		req.Header.Set("Content-Type", "application/json")
		w := httptest.NewRecorder()
		router.ServeHTTP(w, req)
		assert.Equal(t, http.StatusOK, w.Code)

		// Assert for a successful response body, not an error
		var responsePaste db.Paste
		err := json.NewDecoder(w.Body).Decode(&responsePaste)
		require.NoError(t, err) // Ensure decoding doesn't fail
		assert.Equal(t, expectedPaste.ID, responsePaste.ID)
		assert.Equal(t, expectedPaste.Content, responsePaste.Content)

		mockService.AssertExpectations(t)
	})

	t.Run("internal server error", func(t *testing.T) {
		mockService := new(MockPasteService)
		handler := httpHandler.NewHandler(mockService)
		router := setupRouter(handler)

		mockService.On("GetPaste", "abc123").
			Return(nil, errors.New("database connection failed")).
			Once()

		req := httptest.NewRequest("GET", "/pastes/abc123", nil)
		w := httptest.NewRecorder()

		router.ServeHTTP(w, req)

		assert.Equal(t, http.StatusInternalServerError, w.Code)
		mockService.AssertExpectations(t)
	})
}

func TestUpdatePasteHandler(t *testing.T) {
	t.Run("successfull updation of paste", func(t *testing.T) {
		mockService := new(MockPasteService)
		handler := httpHandler.NewHandler(mockService)
		router := setupRouter(handler)

		updatedPaste := &db.Paste{
			ID:       "abc123",
			Content:  "updated content",
			Language: "python",
		}

		mockService.On("UpdatePaste", "abc123", "updated content", "python").Return(updatedPaste, nil).Once()

		body := map[string]interface{}{
			"content":  "updated content",
			"language": "python",
		}
		jsonBody, _ := json.Marshal(body)
		req := httptest.NewRequest("PUT", "/pastes/abc123", bytes.NewReader(jsonBody))
		req.Header.Set("Content-Type", "application/json")
		w := httptest.NewRecorder()
		router.ServeHTTP(w, req)
		assert.Equal(t, http.StatusOK, w.Code)
		var response db.Paste
		err := json.NewDecoder(w.Body).Decode(&response)
		require.NoError(t, err)
		assert.Equal(t, "updated content", response.Content)
		assert.Equal(t, "python", response.Language)

		mockService.AssertExpectations(t)
	})

	t.Run("missing content", func(t *testing.T) {
		mockService := new(MockPasteService)
		handler := httpHandler.NewHandler(mockService)
		router := setupRouter(handler)

		body := map[string]interface{}{
			"language": "python",
		}
		jsonBody, _ := json.Marshal(body)
		
		req := httptest.NewRequest("PUT", "/pastes/abc123", bytes.NewReader(jsonBody))
		req.Header.Set("Content-Type", "application/json")
		w := httptest.NewRecorder()
		router.ServeHTTP(w, req)

		assert.Equal(t, http.StatusBadRequest, w.Code)
	})
}

// TestGetContentHandler tests the GetContent endpoint
func TestGetContentHandler(t *testing.T) {
	t.Run("successful content retrieval", func(t *testing.T) {
		mockService := new(MockPasteService)
		handler := httpHandler.NewHandler(mockService)
		router := setupRouter(handler)

		expectedPaste := &db.Paste{
			ID:      "abc123",
			Content: "raw paste content",
		}

		mockService.On("GetPaste", "abc123").
			Return(expectedPaste, nil).
			Once()

		req := httptest.NewRequest("GET", "/pastes/abc123/content", nil)
		w := httptest.NewRecorder()

		router.ServeHTTP(w, req)

		assert.Equal(t, http.StatusOK, w.Code)
		
		var response string
		err := json.NewDecoder(w.Body).Decode(&response)
		require.NoError(t, err)
		assert.Equal(t, "raw paste content", response)

		mockService.AssertExpectations(t)
	})
}