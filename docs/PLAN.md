# План: Polka → Go (`polka-go`)

Референс: [chottodev/polka](https://github.com/chottodev/polka).

## Цель

Полный порт HTTP-сервиса placeholder-контента на Go с паритетом API:

| Метод | Путь | Назначение |
|--------|------|------------|
| GET | `/health` | status, service, version |
| GET | `/openapi.json` | OpenAPI 3 |
| GET | `/docs` | Swagger UI |
| GET | `/wxh/:width/:height` | SVG плейсхолдер |
| GET | `/wxh/:width/:height/:text` | SVG с текстом в path |
| GET | `/avatars/initials/:text` | SVG инициалы |
| GET | `/avatars/vector/:kind` | SVG векторный аватар |
| GET | `/stock/:width/:height/:query` | растр Freepik + кеш |
| — | `cleanup-cache` | CLI очистки кеша стока |

Плюс статическая UI-оболочка (конструкторы URL) и переменные окружения как в `.env.example` оригинала.

## Архитектура Go

```
cmd/polka/              — HTTP-сервер
cmd/cleanup-cache/      — очистка STOCK_CACHE_DIR по TTL
internal/config/        — env (PORT, FREEPIK_*, STOCK_*, PLACEHOLDER_*)
internal/generator/     — SVG: WxH, initials, vector (+ embed assets)
internal/stock/         — Freepik, disk cache, resize, fallback
internal/server/        — chi router, handlers, CORS, static, OpenAPI
web/static/             — SPA-конструкторы (HTML/JS)
docs/PLAN.md            — этот план
```

## Этапы

1. **Generator** — порт `@polka/generator` + SVG assets через `embed`.
2. **Config / Stock** — dotenv-эквивалент, Freepik client, sha1-кеш, resize (cover/contain/inside → webp/jpeg/png).
3. **HTTP** — маршруты 1:1, `/docs` + `/openapi.json`, SPA fallback.
4. **Тесты** — generator unit, stock cache/resize, HTTP smoke (`httptest`).
5. **Сборка** — `go test ./...`, `go build -o bin/polka ./cmd/polka`.

## Замены стека

| Node | Go |
|------|-----|
| Express + express-openapi | `net/http` + `go-chi/chi` |
| sharp | `disintegration/imaging` + webp codec |
| dotenv | `joho/godotenv` + ручной парсинг |
| Vue 3 SPA | лёгкая static UI (тот же UX конструкторов) |
| swagger-ui-express | встроенный Swagger UI (CDN) + `openapi.yaml` |

## Не в scope (как в оригинале «не сделано»)

- PNG/JPEG для WxH, инкогнито-аватары, провайдеры кроме Freepik, отдельный HTTP для patterns.
