# Polka

HTTP-сервис **placeholder-контента**: плейсхолдеры **WxH** (SVG), **аватары** (SVG: инициалы и векторные пресеты), **стоковые изображения** по ключевому слову (растр через **Freepik API** + **sharp**, кеш на диске). Один процесс **Express** отдаёт **REST API**, **OpenAPI** и статическую **Vue 3**-оболочку с конструкторами URL.

Монорепозиторий (**npm workspaces**): `apps/server` (API + статика), `packages/ui` (Vite + Vue 3), `packages/generator` (SVG-генераторы), `packages/config` (dotenv).

Актуальная **версия релиза** указана в корневом `package.json` (поле `version`).

## Скриншоты интерфейса

Конструкторы трёх вкладок (локальный запуск, ширина окна ~1280px). **Как и что снимать** (сценарий, режимы, ключевые слова): [`.cursor/commands/screenshots.md`](.cursor/commands/screenshots.md).

| Вкладка | Файл |
|--------|------|
| **WxH** | `images/wxh.png` |
| **Аватары** | `images/avatars.png` |
| **Сток** | `images/stock.png` |

**WxH** — плейсхолдер и превью SVG.

![Конструктор WxH](images/wxh.png)

**Аватары** — векторный режим и персонаж (см. сценарий в `screenshots.md`).

![Конструктор аватаров](images/avatars.png)

**Сток** — параметры Freepik, кнопка «Применить» и превью после загрузки (нужен `FREEPIK_API_KEY` в `.env`).

![Конструктор стока](images/stock.png)

## Быстрый старт (локально)

```bash
npm install
npm run build    # собирает UI в apps/server/public
npm start        # поднимает сервер (порт по умолчанию 4700)
```

Альтернатива: `./start.sh` из корня (сборка UI + `npm start`).

Разработка UI с hot-reload:

```bash
npm run dev -w @polka/ui
```

в отдельном терминале — `npm start` (Vite проксирует API, см. `packages/ui/vite.config.js`).

Переменные окружения: скопируйте `.env.example` в `.env` в **корне** репозитория. Для секции **Stock** обязателен `FREEPIK_API_KEY` (см. ниже).

## Docker

```bash
TAG=latest IMAGE=antirek/polka ./build.sh
# или: npm run docker:build
```

Скрипт собирает multi-stage образ и пытается выполнить `docker push` (нужны права на реестр). Локальный запуск без push:

```bash
docker build -t polka:local .
docker run --rm -p 4700:4700 -e FREEPIK_API_KEY=... polka:local
```

Кеш стока в контейнере: каталог по умолчанию `/var/cache/polka-stock` (см. `STOCK_CACHE_DIR` в `Dockerfile` / `.env.example`).

## Веб-интерфейс

После `npm start` откройте `http://localhost:4700`:

| Маршрут | Содержимое |
|--------|------------|
| `/wxh` | Конструктор плейсхолдера WxH, превью, копирование URL |
| `/avatars` | Режимы: инициалы и векторные аватары, превью |
| `/stock` | Поиск стока (Freepik), параметры размера/формата, превью по кнопке «Применить» |

Язык интерфейса: русский. Ссылка **«Документация API»** ведёт на Swagger UI (`/docs`).

## API

| Метод | Путь | Назначение |
|--------|------|------------|
| GET | `/health` | Проверка живости: `status`, `service`, `version` |
| GET | `/openapi.json` | Сводная OpenAPI 3 (слияние express-openapi) |
| GET | `/docs` | Swagger UI |
| GET | `/wxh/:width/:height` | SVG плейсхолдер. Query: `bg`, `fg`, `text`, `rounded`, `font` (px), `family` (пресет шрифта), `gradient` |
| GET | `/wxh/:width/:height/:text` | То же, текст в path (URL-encoding) |
| GET | `/avatars/initials/:text` | SVG по инициалам. Query: `size`, `palette`, `family`, `font`, `bg`, `fg`, `seed` |
| GET | `/avatars/vector/:kind` | Векторный SVG-аватар. `kind`: см. enum в OpenAPI (например `man`, `male`, `female`, `cat`, `dog`, `panda`, `fox`). Query: `size`, `palette`, `style` (`flat` / `outline` / `duotone`), `bg`, `fg`, `seed` |
| GET | `/stock/:width/:height/:query` | **Растр** (webp/jpeg/png): поиск в **Freepik** (только free/freemium-фильтр), ресайз, кеш. Query: `fit` (`cover` / `contain` / `inside`), `format`, `quality`, `provider=freepik`, `seed`. Таймаут к Freepik — см. `STOCK_PROVIDER_TIMEOUT_MS`; при сбое — изображение-заглушка с текстом `STOCK_FALLBACK_TEXT` |

Подробности по стоку и кешу: [docs/STOCK_IMPLEMENTATION_PLAN.md](docs/STOCK_IMPLEMENTATION_PLAN.md). Общий план проекта: [docs/PLAN.md](docs/PLAN.md).

## Очистка кеша стока (отдельная команда)

Фоновых задач внутри API-процесса нет. Удаление старых файлов из `STOCK_CACHE_DIR` — отдельным запуском:

```bash
npm run cron:cleanup-cache
```

Интервал «старости» файлов задаётся `STOCK_CACHE_TTL_SEC` (см. `.env.example`).

## Фичи: что есть и что в планах

Легенда: **готово** · **частично** · **не сделано**

### 1. Аватарки (SVG)

| Фича | Статус |
|------|--------|
| Инициалы, палитры, размеры (presets), шрифты | **готово** |
| Векторные пресеты (в т.ч. люди, животные) | **готово** |
| Палитры | **готово** (`soft` / `vivid` / `earth` / `mono` / `ocean`) |
| Режим «инкогнито» | **не сделано** |
| Конструктор URL во Vue | **готово** (вкладки WxH, Аватары, Сток) |

### 2. Плейсхолдеры WxH (SVG)

| Фича | Статус |
|------|--------|
| Произвольные width × height (в пределах лимитов) | **готово** |
| Подпись, фон, скругление, градиент, выбор `family` | **готово** |
| Отдача PNG/JPEG вместо SVG для WxH | **не сделано** |

### 3. Сток + ресайз (растр)

| Фича | Статус |
|------|--------|
| Провайдер Freepik, фильтр free, ориентация по W/H | **готово** |
| Ресайз (sharp), форматы webp/jpeg/png, кеш файлов | **готово** |
| UI-конструктор (`/stock`) | **готово** |
| Другие провайдеры (Pexels и т.д.) | **не сделано** |

### 4. Паттерны / прочее

| Фича | Статус |
|------|--------|
| `generatePattern` в генераторе | **частично** (логика есть, отдельного HTTP-префикса нет) |

### Инфраструктура

| Фича | Статус |
|------|--------|
| Express, CORS, express-openapi, маршруты в `apps/server/routes` | **готово** |
| SPA fallback, статика UI | **готово** |
| Локальная разработка на Windows (явные `app.get` для путей API) | **готово** (`apps/server/index.js`) |
| Dockerfile, `build.sh` | **готово** |
| Тесты, CI | **не сделано** |

---

## Дальнейшее развитие (черновик)

1. Расширение стока: дополнительные провайдеры, единая политика лимитов и ошибок.
2. WxH: опциональная растровая отдача при необходимости.
3. Отдельные endpoints для паттернов и «текст на картинке» при росте требований.
4. Тесты и CI.

Приоритеты можно согласовать отдельно; опорные документы — [docs/PLAN.md](docs/PLAN.md) и [docs/STOCK_IMPLEMENTATION_PLAN.md](docs/STOCK_IMPLEMENTATION_PLAN.md).
