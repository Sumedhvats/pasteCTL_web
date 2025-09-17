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
	err := godotenv.Load()
	if err != nil {
		log.Fatal(err)
	}

	connStr := os.Getenv("DATABASE_URL")
	pool, err := pgxpool.New(context.Background(), connStr)
	if err != nil {
		log.Fatal(err)
	}

	if err := pool.Ping(context.Background()); err != nil {
		log.Fatal(err)
	}

	DB = pool

	_, err = DB.Exec(context.Background(), `
		CREATE TABLE IF NOT EXISTS pastes(
			id TEXT PRIMARY KEY,
			content TEXT NOT NULL,
			language TEXT NOT NULL,
			created_at TIMESTAMP NOT NULL DEFAULT NOW(),
			expire_at TIMESTAMP,
			views INT NOT NULL DEFAULT 0
		);
	`)
	if err != nil {
		log.Fatal(err)
	}

	log.Println("Database initialized")
}

func Close() {
	DB.Close()
}
