FROM golang:1.25-alpine AS builder
ENV CGO_ENABLED=0 \
    GOOS=linux \
    GOARCH=amd64
WORKDIR /build
COPY go.mod go.sum ./
COPY .env /app/.env
RUN go mod tidy
COPY . .
RUN go build -o /pastectl ./cmd/main.go
FROM alpine:3.21 AS FINAL
RUN apk add --no-cache ca-certificates
COPY --from=builder /pastectl /bin/pastectl
RUN chmod +x /bin/pastectl
EXPOSE 8080
CMD ["/bin/pastectl"]
