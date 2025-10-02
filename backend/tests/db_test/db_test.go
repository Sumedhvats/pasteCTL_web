package db_test

import (
	"context"
	"os"
	"path/filepath"
	"testing"
	"time"

	"github.com/Sumedhvats/pasteCTL/internal/db"
	"github.com/jackc/pgx/v5"
	"github.com/stretchr/testify/assert"
	"github.com/testcontainers/testcontainers-go"
	"github.com/testcontainers/testcontainers-go/modules/postgres"
	"github.com/testcontainers/testcontainers-go/wait"
)

func setupTestDB(t *testing.T) {
	t.Helper()

	dbName := "pastes"
	dbUser := "sumedh"
	dbPassword := "q23rgv"
	ctx := context.Background()
	pgContainer, err := postgres.Run(
		ctx,
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

	// Set env for db.Init()
	os.Setenv("DATABASE_URL", connString)

	db.Init()

	t.Cleanup(func() {
		db.Close()
	})
}

func TestCreateGetUpdateDeletePaste(t *testing.T) {
	setupTestDB(t)

	repo := db.NewRepo()
	now := time.Now().Add(10 * time.Minute)

	paste := &db.Paste{
		ID:        "testingId",
		Content:   "Hello, world!",
		Language:  "go",
		CreatedAt: time.Now(),
		ExpireAt:  &now,
		Views:     0,
	}

	//  Create
	err := repo.CreatePaste(paste)
	assert.NoError(t, err)

	// Get
	fetched, err := repo.GetPaste("testingId")
	assert.NoError(t, err)
	assert.NotNil(t, fetched)
	assert.Equal(t, "Hello, world!", fetched.Content)
	assert.Equal(t, "go", fetched.Language)

	// Update
	paste.Content = "Hello, everyone!"
	err = repo.UpdatePaste(paste)
	assert.NoError(t, err)

	fetched2, err := repo.GetPaste("testingId")
	assert.NoError(t, err)
	assert.NotNil(t, fetched2)
	assert.Equal(t, "Hello, everyone!", fetched2.Content)

	//  Expire + DeleteExpired
	expiresTime := time.Now().Add(-10 * time.Minute)
	paste.ExpireAt = &expiresTime
	_, err = db.DB.Exec(context.Background(),
		"UPDATE pastes SET expire_at=$1 WHERE id=$2", paste.ExpireAt, paste.ID)
	assert.NoError(t, err)

	err = repo.DeleteExpired()
	assert.NoError(t, err)

	// Should be gone
	temp, err := repo.GetPaste(paste.ID)
	assert.ErrorIs(t, err,pgx.ErrNoRows)
	assert.Nil(t, temp)
}
