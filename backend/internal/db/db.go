package db

import (
	"context"
	"log"
	"os"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/joho/godotenv"
)

var DB *pgxpool.Pool
func Init() {
	godotenv.Load()

	connStr := os.Getenv("DATABASE_URL")
	if connStr == "" {
		log.Fatal("DATABASE_URL environment variable is not set")
	}
	pool, err := pgxpool.New(context.Background(), connStr)
	if err != nil {
		log.Fatalf("Unable to create connection pool: %v\n", err)
	}

	if err := pool.Ping(context.Background()); err != nil {
		log.Fatalf("Unable to ping database: %v\n", err)
	}

	DB = pool
	log.Println("Database connected")
	createTableSQL := `
		CREATE TABLE IF NOT EXISTS pastes(
			id TEXT PRIMARY KEY,
			content TEXT NOT NULL,
			language TEXT NOT NULL,
			created_at TIMESTAMP NOT NULL DEFAULT NOW(),
			expire_at TIMESTAMP,
			views INT NOT NULL DEFAULT 0
		);`
	if _, err := pool.Exec(context.Background(), createTableSQL); err != nil {
		log.Fatalf("Failed to run migration: %v\n", err)
	}
	log.Println("Database initialized (migration applied)")
}
func Close() {
	if DB != nil {
		DB.Close()
	}
}