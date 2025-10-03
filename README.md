# PasteCTL Web

A modern code snippet sharing platform with syntax highlighting and expirable pastes. Built with Next.js frontend and Go backend.

## Overview

PasteCTL Web is a lightweight pastebin alternative that allows developers to share code snippets quickly and securely. Each paste can be configured with custom expiry times and supports syntax highlighting for multiple programming languages.

## Features

- **Syntax Highlighting**: Support for multiple programming languages with automatic syntax detection
- **Custom Expiry Times**: Set pastes to expire after 1 hour, 24 hours, or custom durations
- **Live Editing**: Real-time collaborative editing using WebSocket connections
- **View Tracking**: Monitor paste view counts
- **Raw Content Access**: Retrieve paste content in raw format via API
- **CLI Integration**: Access and manage pastes from the command line using [PasteCTL CLI](https://github.com/sumedhvats/pastectl)
- **Automatic Cleanup**: Scheduled job to delete expired pastes

## Architecture

### Frontend
- **Framework**: Next.js with React
- **Styling**: Tailwind CSS
- **Deployment**: AWS Amplify
- **Live URL**: [paste.sumedh.app](https://www.paste.sumedh.app)

### Backend
- **Language**: Go 1.24.0
- **Framework**: Gin Web Framework
- **Database**: PostgreSQL (via pgx driver)
- **WebSocket**: Gorilla WebSocket for live editing
- **Deployment**: AWS EC2
- **Testing**: Testcontainers for integration tests

## Tech Stack

### Backend Dependencies
- **Gin**: Web framework with CORS support
- **pgx/v5**: PostgreSQL driver and toolkit
- **Gorilla WebSocket**: WebSocket implementation
- **godotenv**: Environment variable management
- **Testcontainers**: Testing with containerized PostgreSQL

## Getting Started

### Prerequisites
- Go 1.24.0 or higher
- PostgreSQL database
- Node.js 18+ (for frontend)

### Backend Setup

1. Clone the repository:
```bash
git clone https://github.com/sumedhvats/pastectl_web.git
cd pastectl_web
```

2. Install dependencies:
```bash
go mod download
```

3. Configure environment variables:
Create a `.env` file in the root directory:
```env
DATABASE_URL=postgresql://user:password@localhost:5432/pastes
FRONTEND_URL=http://localhost:3000
```

4. Run the server:
```bash
go run main.go
```

The backend server will start on `http://localhost:8080`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

The frontend will be available at `http://localhost:3000`

## API Endpoints

### Paste Operations
- `POST /api/pastes` - Create a new paste
- `GET /api/pastes/:id` - Get paste by ID
- `GET /api/pastes/:id/raw` - Get raw paste content
- `PUT /api/pastes/:id` - Update existing paste
- `PUT /api/pastes/:id/view` - Increment view count

### WebSocket
- `GET /api/ws/:id` - WebSocket endpoint for live editing

## Database Schema

The application uses PostgreSQL with the following main table structure:

```sql
CREATE TABLE pastes (
    id VARCHAR PRIMARY KEY,
    content TEXT NOT NULL,
    language VARCHAR NOT NULL,
    expire_at TIMESTAMP,
    views INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);
```

## Testing

The project includes comprehensive test coverage:

### Running Tests

```bash
# Run all tests
go test ./...

# Run tests with coverage
go test -cover ./...

# Run specific test suite
go test ./internal/db/...
go test ./internal/http/...
go test ./internal/paste/...
```

### Test Structure
- **Database Tests**: Integration tests using Testcontainers with PostgreSQL
- **HTTP Handler Tests**: Unit tests with mocked services
- **Service Tests**: Integration tests for business logic

## Project Structure

```
pastectl_web/
├── cmd/
│   └── scheduledJob/      # Background job for cleanup
├── internal/
│   ├── db/                # Database layer
│   ├── http/              # HTTP handlers
│   ├── paste/             # Business logic
│   └── ws/                # WebSocket handlers
├── migrations/            # Database migrations
├── tests/                 # Test suites
│   ├── db_test/
│   ├── http_test/
│   └── service_test/
├── frontend/              # Next.js application
│   ├── app/
│   │   └── paste/
│   ├── components/
│   └── public/
├── main.go
└── go.mod
```

## CLI Integration

PasteCTL includes a dedicated command-line interface for terminal users. Visit the [PasteCTL CLI repository](https://github.com/sumedhvats/pastectl) for installation and usage instructions.

## Deployment

### Backend (AWS EC2)
The Go backend is deployed on AWS EC2 with the following configuration:
- PostgreSQL database
- Environment variables configured via `.env`
- CORS enabled for frontend domain

### Frontend (AWS Amplify)
The Next.js frontend is deployed on AWS Amplify with automatic deployments on push to main branch.

## Environment Variables

### Backend
| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `FRONTEND_URL` | Frontend application URL for CORS | Yes |

### Frontend
Configuration is handled through Next.js environment variables (refer to frontend documentation).

## Scheduled Jobs

The application includes a background scheduler that runs periodic tasks:
- **Expired Paste Cleanup**: Automatically deletes pastes that have exceeded their expiry time

## Security Features

- CORS configuration for cross-origin requests
- Input validation on all endpoints
- SQL injection prevention via parameterized queries
- Automatic expiry of sensitive content

## Performance

- Connection pooling for database operations
- Efficient WebSocket connections for live editing
- Automatic cleanup to prevent database bloat

## Development

### Running in Development Mode

Backend:
```bash
go run main.go
```

Frontend:
```bash
cd frontend
npm run dev
```

### Code Quality

The project follows Go best practices:
- Proper error handling
- Interface-based design for testability
- Dependency injection
- Comprehensive test coverage

## Related Projects

- [PasteCTL CLI](https://github.com/sumedhvats/pastectl) - Command-line interface for PasteCTL

## Support

For issues, questions, or contributions, please visit the [GitHub Issues](https://github.com/sumedhvats/pastectl_web/issues) page.


Made with ❤️ for the developer community..