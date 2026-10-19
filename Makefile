.PHONY: build test run cleanup tidy

export PATH := $(HOME)/.local/go/bin:$(HOME)/go/bin:$(PATH)

build:
	mkdir -p bin
	go build -o bin/polka ./cmd/polka
	go build -o bin/cleanup-cache ./cmd/cleanup-cache

test:
	go test ./...

run: build
	./bin/polka

cleanup: build
	./bin/cleanup-cache

tidy:
	go mod tidy
