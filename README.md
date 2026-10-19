# Polka (Go)

HTTP-сервис **placeholder-контента** на Go: плейсхолдеры **WxH** (SVG), **аватары** (SVG), **сток** (Freepik + ресайз + кеш). Порт [chottodev/polka](https://github.com/chottodev/polka).

План порта: [docs/PLAN.md](docs/PLAN.md).

## Быстрый старт

```bash
cp .env.example .env   # при необходимости FREEPIK_API_KEY
go mod tidy
go test ./...
go build -o bin/polka ./cmd/polka
./bin/polka            # http://localhost:4700
```

Или `make build && make run`.

Очистка кеша стока:

```bash
go run ./cmd/cleanup-cache
```

## API

| Метод | Путь | Назначение |
|--------|------|------------|
| GET | `/health` | status, service, version |
| GET | `/openapi.json` | OpenAPI 3 |
| GET | `/docs` | Swagger UI |
| GET | `/wxh/:w/:h` | SVG плейсхолдер |
| GET | `/wxh/:w/:h/:text` | SVG с текстом в path |
| GET | `/avatars/initials/:text` | SVG инициалы |
| GET | `/avatars/vector/:kind` | SVG вектор (`man`, `female`, `cat`, …) |
| GET | `/stock/:w/:h/:query` | растр webp/jpeg/png |

UI-конструкторы: `/`, `/wxh`, `/avatars`, `/stock`.

## Docker

```bash
docker build -t polka-go:local .
docker run --rm -p 4700:4700 -e FREEPIK_API_KEY=... polka-go:local
```
