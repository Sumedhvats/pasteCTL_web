package servicetest

import (
	"context"
	"os"
	"path/filepath"
	"testing"
	"time"

	"github.com/Sumedhvats/pasteCTL_web/internal/db"
	pasteService "github.com/Sumedhvats/pasteCTL_web/internal/paste"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"github.com/testcontainers/testcontainers-go"
	"github.com/testcontainers/testcontainers-go/modules/postgres"
	"github.com/testcontainers/testcontainers-go/wait"
)

func setupServiceTest(t *testing.T) pasteService.PasteService {
	t.Helper()
	dbName := "pastes"
	dbUser := "sumedh"
	dbPassword := "q23rgv"
	ctx := context.Background()
	pgContainer, err := postgres.Run(ctx,
		"postgres",
		postgres.WithInitScripts(filepath.Join("..","testDATA_DB", "testdata.sql")),
		postgres.WithDatabase(dbName),
		postgres.WithUsername(dbUser),
		postgres.WithPassword(dbPassword),
		postgres.BasicWaitStrategies(),
		testcontainers.WithWaitStrategy(
			wait.ForLog("database system is ready to accept connections").
			WithOccurrence(2).
			WithStartupTimeout(10*time.Second)),
		)
			if err != nil {
		t.Fatal(err)
	}
	t.Cleanup(func() {
		if err := pgContainer.Terminate(ctx); err != nil {
			t.Fatalf("failed to terminate pgContainer: %s", err)
		}
	})

	connString, err := pgContainer.ConnectionString(ctx, "sslmode=disable")
	assert.NoError(t, err)
	os.Setenv("DATABASE_URL", connString)
db.Init()
repo:=db.NewRepo()
service:=pasteService.NewPasteService(repo)
return service

}

func TestPasteService_CreateAndGet(t *testing.T) {
	service := setupServiceTest(t)

	// Test case: Creating a paste with empty content should fail
	_, err := service.CreatePaste("", "go", 0)
	assert.EqualError(t, err, "content and language required")


	content := "Hello from a service test!"
	lang := "go"
	expireMinutes := 10

	createdPaste, err := service.CreatePaste(content, lang, expireMinutes)
	require.NoError(t, err) 
	require.NotNil(t, createdPaste)

	assert.NotEmpty(t, createdPaste.ID)
	assert.Equal(t, content, createdPaste.Content)
	assert.WithinDuration(t, time.Now().Add(10*time.Minute), *createdPaste.ExpireAt, time.Second)

	fetchedPaste, err := service.GetPaste(createdPaste.ID)
	require.NoError(t, err)
	require.NotNil(t, fetchedPaste)

	assert.Equal(t, createdPaste.ID, fetchedPaste.ID)
	assert.Equal(t, content, fetchedPaste.Content)
}

func TestPasteService_Update(t *testing.T) {
	service := setupServiceTest(t)

	// 1. Create an initial paste
	original, err := service.CreatePaste("original content", "text", 10)
	require.NoError(t, err)

	// 2. Update the paste
	newContent := "updated content!"
	newLang := "markdown"
	updatedPaste, err := service.UpdatePaste(original.ID, newContent, newLang)
	require.NoError(t, err)
	require.NotNil(t, updatedPaste)
	assert.Equal(t, newContent, updatedPaste.Content)
	verifiedPaste, err := service.GetPaste(original.ID)
	require.NoError(t, err)
	require.NotNil(t, verifiedPaste)
	assert.Equal(t, newContent, verifiedPaste.Content)
	assert.Equal(t, newLang, verifiedPaste.Language)
}

func TestPasteService_GetPaste_Scenarios(t *testing.T) {
	service := setupServiceTest(t)

	// Test case: Getting a paste that does not exist
	_, err := service.GetPaste("non-existent-id")

	assert.ErrorIs(t, err, pasteService.ErrPasteNotFound)

	expiredPaste, err := service.CreatePaste("this will expire", "text", -1) // Expired 1 minute ago
	require.NoError(t, err)

	_, err = service.GetPaste(expiredPaste.ID)
	assert.ErrorIs(t, err, pasteService.ErrPasteExpired)
}

func TestPasteService_UpdateViews(t *testing.T) {
	service := setupServiceTest(t)

	// 1. Create a paste, which starts with 0 views
	paste, err := service.CreatePaste("a paste to be viewed", "text", 10)
	require.NoError(t, err)


	assert.Equal(t, 0, paste.Views)

	_, err = service.UpdateViews(paste.ID, 5) // Set view count to 5
	require.NoError(t, err)

	fetchedPaste, err := service.GetPaste(paste.ID)
	require.NoError(t, err)
	assert.Equal(t, 5, fetchedPaste.Views)
}

func TestPasteService_DeleteExpiredPastes(t *testing.T) {
	service := setupServiceTest(t)

	// 1. Create one paste that is expired and one that is not
	expiredPaste, err := service.CreatePaste("I am expired", "text", -5) // Expired 5 minutes ago
	require.NoError(t, err)

	activePaste, err := service.CreatePaste("I am still active", "text", 30) // Expires in 30 minutes
	require.NoError(t, err)

	err = service.DeleteExpiredPastes()
	require.NoError(t, err)

	_, err = service.GetPaste(expiredPaste.ID)
	assert.ErrorIs(t, err, pasteService.ErrPasteNotFound)

	_, err = service.GetPaste(activePaste.ID)
	assert.NoError(t, err)
}
