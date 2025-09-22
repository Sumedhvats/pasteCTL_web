# pasteCTL

pasteCTL is a modern, full-stack pastebin service for storing, sharing, and managing code snippets and text. It's built as a monorepo with a robust Go backend, a sleek Next.js frontend, and a command-line interface (CLI).

## ✨ Features

-   **Go Backend:** A RESTful API built with Go and Gin, backed by a PostgreSQL database.
-   **Web-based Interface:** A responsive frontend with syntax highlighting and live editing.
-   **Command-Line Interface:** Create, fetch, and update pastes directly from your terminal.
-   **Real-time Collaboration:** Edit pastes in real-time with multiple users using WebSockets.
-   **Paste Management:** Support for paste creation, updates, deletion, and configurable expiry.

## 🚀 Getting Started

### Prerequisites

-   **Go** (version 1.18+)
-   **Node.js** (version 18+)
-   **PostgreSQL**

### Backend Setup

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/Sumedhvats/pasteCTL.git](https://github.com/Sumedhvats/pasteCTL.git)
    cd pasteCTL/backend
    ```

2.  **Create a `.env` file** with your database connection string:
    ```ini
    DB_URL="postgres://user:password@localhost:5432/pastectl?sslmode=disable"
    ```

3.  **Run the server:**
    ```bash
    go run ./cmd/main.go
    ```
    The backend will run on `http://localhost:8080`.

### Frontend Setup

1.  **Navigate to the frontend directory:**
    ```bash
    cd ../frontend
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Start the development server:**
    ```bash
    npm run dev
    ```
    The frontend will be available at `http://localhost:3000`.

### CLI Setup

1.  **Navigate to the CLI directory:**
    ```bash
    cd ../cli
    ```

2.  **Run the CLI tool** with commands like:
    ```bash
    go run . upload your_file.go
    ```

## 🧪 API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| **`POST`** | `/api/pastes` | Creates a new paste. |
| **`GET`** | `/api/pastes/:id` | Retrieves a paste. |
| **`GET`** | `/api/pastes/:id/raw` | Retrieves content as plain text. |
| **`PUT`** | `/api/pastes/:id` | Updates an existing paste. |
| **`DELETE`** | `/api/pastes/:id` | Deletes a paste. |
| **`PATCH`** | `/api/pastes/:id/views` | Increments the view counter. |
| **`GET`** | `/ws/pastes/:id` | WebSocket endpoint for real-time editing. |

## 🤝 Contributing

Feel free to submit issues or pull requests to improve the project.

## 📄 License

This project is licensed under the MIT License.