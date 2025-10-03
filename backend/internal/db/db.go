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
	log.Println("Database initialized")
}
func Close() {
	if DB != nil {
		DB.Close()
	}
}