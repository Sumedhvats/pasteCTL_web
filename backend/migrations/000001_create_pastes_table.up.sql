		CREATE TABLE IF NOT EXISTS pastes(
			id TEXT PRIMARY KEY,
			content TEXT NOT NULL,
			language TEXT NOT NULL,
			created_at TIMESTAMP NOT NULL DEFAULT NOW(),
			expire_at TIMESTAMP,
			views INT NOT NULL DEFAULT 0
		);
	