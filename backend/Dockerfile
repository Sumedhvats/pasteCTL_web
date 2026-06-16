FROM golang:1.26-alpine as builder

RUN apk add git ca-certificates tzdata
WORKDIR /backend
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -ldflags="-w -s" -o /app/main ./cmd

FROM alpine:latest as runner
RUN apk add --no-cache ca-certificates tzdata
RUN adduser -D -g '' appuser
WORKDIR /app
COPY --from=builder /app/main .
USER appuser
EXPOSE 8080
ENTRYPOINT ["./main"]
