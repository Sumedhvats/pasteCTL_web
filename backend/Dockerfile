FROM golang:1.26
RUN apt-get install -y --no-install-recommends git ca-certificates tzdata
WORKDIR /backend
COPY . .
RUN go mod download
RUN go build -o main cmd/main.go
RUN chmod +x main
EXPOSE 8080
CMD ["./main"]
