# pasteCTL_web

A modern, full-stack pastebin service for storing, sharing, and managing code snippets with real-time collaboration capabilities.

[![Go Report Card](https://goreportcard.com/badge/github.com/Sumedhvats/pasteCTL_web)](https://goreportcard.com/report/github.com/Sumedhvats/pasteCTL_web)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Go Reference](https://pkg.go.dev/badge/github.com/Sumedhvats/pasteCTL_web.svg)](https://pkg.go.dev/github.com/Sumedhvats/pasteCTL_web)
[![Release](https://img.shields.io/github/v/release/Sumedhvats/pasteCTL_web)](https://github.com/Sumedhvats/pasteCTL_web/releases)

## Overview

pasteCTL_web is a comprehensive code sharing platform designed for developers who need to share, collaborate on, and manage code snippets efficiently. Built as a monorepo architecture, it provides a robust Go backend, modern Next.js frontend, and powerful command-line interface for seamless integration into development workflows.

## Architecture

The platform consists of two main components:

- **Backend API**: RESTful API server built with Go and Gin framework
- **Web Frontend**: Responsive React application with Next.js and TypeScript

## Features

### Core Functionality
- **Paste Management**: Create, read, update, and delete code snippets
- **Syntax Highlighting**: Support for 20+ programming languages
- **Configurable Expiration**: Set custom expiry times (minutes to never)
- **Raw Content API**: Direct access to paste content for automation

### Real-time Collaboration
- **WebSocket Integration**: Real-time collaborative editing
- **Multi-user Support**: Multiple users can edit simultaneously
- **Live Updates**: See changes as they happen

### Developer Experience
- **Command-line Interface**: Available as a separate project at [pasteCTL_web CLI](https://github.com/Sumedhvats/pasteCTL_web_cli)
- **API Integration**: RESTful API for programmatic access
- **File Upload Support**: Direct file sharing capabilities

### Web Interface
- **Modern UI**: Clean, responsive design with dark mode support
- **Code Editor**: Full-featured editor with syntax highlighting
- **Mobile Optimized**: Works seamlessly across all devices

## Installation

### Prerequisites
- Go 1.21 or higher
- Node.js 18 or higher  
- PostgreSQL 12 or higher

### Backend Setup

```bash
# Clone repository
git clone https://github.com/Sumedhvats/pasteCTL_web.git
cd pasteCTL_web/backend

# Configure environment
cp .env.example .env
# Edit .env with your database credentials

# Install dependencies and run
go mod download
go run ./cmd/main.go
```

### Frontend Setup

```bash
cd ../frontend

# Install dependencies
npm install

# Configure environment
cp .env.local.example .env.local
# Edit .env.local with your API endpoint

# Start development server
npm run dev
```

### Command-Line Interface

For terminal-based workflows, install our dedicated CLI tool:

**[pasteCTL_web CLI](https://github.com/Sumedhvats/pasteCTL_web_cli)** - Full-featured command-line interface

```bash
# Install CLI
go install github.com/Sumedhvats/pasteCTL_web@latest

# Configure and use
pasteCTL_web config set frontend_url http://localhost:3000
pasteCTL_web create --file main.go
```

## Usage

### Web Interface

Navigate to `http://localhost:3000` to access the web interface where you can:
- Create new pastes with syntax highlighting
- Set expiration times and language types
- Share pastes via URL
- Edit pastes in real-time with collaborators

### Command Line Interface

For comprehensive terminal-based workflows, see our dedicated CLI project:

**[pasteCTL_web CLI Repository →](https://github.com/Sumedhvats/pasteCTL_web_cli)**

The CLI provides full paste management capabilities including:
- Create pastes from files or editor
- Retrieve and update existing pastes  
- Automatic language detection
- Configurable expiration settings

### API Integration

#### Create Paste
```bash
curl -X POST http://localhost:8080/api/pastes \
  -H "Content-Type: application/json" \
  -d '{
    "content": "package main\n\nfunc main() {\n    println(\"Hello, World!\")\n}",
    "language": "go",
    "expire": "24h"
  }'
```

#### Retrieve Paste
```bash
curl http://localhost:8080/api/pastes/abc123def
```

## API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/pastes` | Create a new paste |
| `GET` | `/api/pastes/:id` | Retrieve paste with metadata |
| `GET` | `/api/pastes/:id/raw` | Get raw paste content |
| `PUT` | `/api/pastes/:id` | Update existing paste |
| `DELETE` | `/api/pastes/:id` | Delete paste |
| `PATCH` | `/api/pastes/:id/views` | Increment view counter |
| `GET` | `/ws/pastes/:id` | WebSocket for real-time editing |

### Request/Response Examples

#### Create Paste Request
```json
{
  "content": "console.log('Hello, World!');",
  "language": "javascript",
  "expire": "1h"
}
```

#### Paste Response
```json
{
  "id": "abc123def",
  "content": "console.log('Hello, World!');",
  "language": "javascript",
  "created_at": "2025-01-15T10:30:00Z",
  "expire_at": "2025-01-15T11:30:00Z",
  "views": 0
}
```

## Supported Languages

The platform supports syntax highlighting for:

| Language | Extensions | Identifier |
|----------|------------|------------|
| Go | `.go` | `go` |
| Python | `.py` | `python` |
| JavaScript | `.js` | `javascript` |
| TypeScript | `.ts` | `typescript` |
| Java | `.java` | `java` |
| C++ | `.cpp`, `.cc` | `cpp` |
| C | `.c` | `c` |
| Rust | `.rs` | `rust` |
| PHP | `.php` | `php` |
| Ruby | `.rb` | `ruby` |
| Shell | `.sh` | `bash` |
| SQL | `.sql` | `sql` |
| JSON | `.json` | `json` |
| YAML | `.yml`, `.yaml` | `yaml` |
| Markdown | `.md` | `markdown` |
| HTML | `.html` | `html` |
| CSS | `.css` | `css` |
| XML | `.xml` | `xml` |

## Configuration

### Environment Variables

#### Backend
```env
DB_URL=postgres://user:password@localhost:5432/pasteCTL_web?sslmode=disable
PORT=8080
CORS_ORIGINS=http://localhost:3000
```

#### Frontend
```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:8080
NEXT_PUBLIC_WS_URL=ws://localhost:8080
```

## Development

### Project Structure

```
pasteCTL_web/
├── backend/           # Go API server
│   ├── cmd/          # Application entrypoints
│   ├── internal/     # Internal packages
│   └── pkg/          # Public packages
└── frontend/         # Next.js web application
    ├── app/          # App router pages
    ├── components/   # React components
    └── lib/          # Utility functions
```

### Running Tests

```bash
# Backend tests
cd backend && go test ./...

# Frontend tests  
cd frontend && npm test
```

### Database Migration

```bash
cd backend
go run ./cmd/migrate.go
```

## Deployment

### Backend
```bash
cd backend
go build -o pasteCTL_web-server ./cmd/main.go
./pasteCTL_web-server
```

### Frontend
```bash
cd frontend
npm run build
npm start
```

## Contributing

We welcome contributions to pasteCTL_web! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Setup

1. Fork the repository
2. Clone your fork: `git clone https://github.com/yourusername/pasteCTL_web.git`
3. Create a feature branch: `git checkout -b feature/amazing-feature`
4. Make your changes
5. Commit your changes: `git commit -m 'Add amazing feature'`
6. Push to your branch: `git push origin feature/amazing-feature`
7. Open a Pull Request

### Code Style

- **Go**: Follow standard Go formatting (`gofmt`, `golint`)
- **JavaScript/TypeScript**: Use Prettier and ESLint configurations
- **Commit Messages**: Follow [Conventional Commits](https://conventionalcommits.org/)

## Security

For security vulnerabilities, please email security@pasteCTL_web.com instead of using the issue tracker.

See our [Security Policy](SECURITY.md) for more details.

## Related Projects

- **[pasteCTL_web CLI](https://github.com/Sumedhvats/pasteCTL_web_cli)** - Command-line interface for terminal workflows

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

- **Issues**: [GitHub Issues](https://github.com/Sumedhvats/pasteCTL_web/issues)
- **Discussions**: [GitHub Discussions](https://github.com/Sumedhvats/pasteCTL_web/discussions)
- **CLI Tool**: [pasteCTL_web CLI Repository](https://github.com/Sumedhvats/pasteCTL_web_cli)

---

Made with ❤️ for the developer community..