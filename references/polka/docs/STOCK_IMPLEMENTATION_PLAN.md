# Polka — план реализации секции Stock (UI + backend + cache + resize)

Цель: в UI Polka пользователь вводит ключевое слово и размер, backend получает изображение у провайдера (Freepik), ресайзит, кеширует и возвращает готовую картинку. Повторные запросы с теми же параметрами должны обслуживаться из кеша без запроса к Freepik.

## 1) Сценарий MVP

1. UI отправляет `GET /stock/:width/:height/:query` (+ query params).
2. Backend проверяет кеш.
3. При miss backend ищет изображение у Freepik.
4. Backend скачивает исходник, ресайзит через `sharp`, сохраняет в кеш.
5. Backend отдает готовую картинку.
6. Повторный запрос с теми же параметрами отдается из кеша.
7. Если Freepik API не ответил за 3 секунды, backend отдает локальную fallback-картинку нужного размера с текстом `no image`.

## 2) API контракт (черновик)

- Путь: `GET /stock/{width}/{height}/{query}`
- Query:
  - `fit=cover|contain|inside` (default `cover`)
  - `format=webp|jpeg|png` (default `webp`)
  - `quality=1..100` (default `82`)
  - `provider=freepik` (пока один провайдер)
  - `seed` (опционально для детерминированного выбора)
- Ответ:
  - binary image (`image/webp`, `image/jpeg`, `image/png`)
  - заголовки кеширования (`Cache-Control`, `ETag`)

## 3) Backend архитектура

### 3.1 Provider слой (Freepik)

Файлы:
- `apps/server/lib/stock/providers/freepik.js`

Функции:
- `searchResources(term, options)` -> список кандидатов
- `pickResource(candidates, seed)` -> выбор ресурса
- `downloadResource(url)` -> `Buffer`
- Все вызовы Freepik оборачиваются в timeout `3000ms` (`AbortController`).
- Для free-only контента в запросе к Freepik использовать фильтр лицензии:
  - `filters[license][freemium]=1`

Нормализация ответа:
- `provider`, `resourceId`, `title`, `sourceUrl`, `previewUrl`

### 3.2 Resize слой (`sharp`)

Файлы:
- `apps/server/lib/stock/resize.js`

Функции:
- `resizeImage(buffer, { width, height, fit, format, quality })`

### 3.3 Cache слой

Файлы:
- `apps/server/lib/stock/cache.js`

MVP:
- файловый кеш (L2) на диске
- TTL (без контроля общего размера директории)
- ключ кеша содержит:
  - provider/resource id
  - width/height/fit/format/quality
  - version (`v1`)
- имя файла: hash(key), без дополнительных meta-файлов

Удаление протухших файлов:
- API-сервер не запускает фоновые процессы очистки;
- очистка выполняется отдельным cron-процессом (вне API);
- cron удаляет файлы кеша старше 30 дней из `STOCK_CACHE_DIR` по `mtime` файла;
- при запросе сервер проверяет наличие файла по ключу:
  - если файл найден, сразу отдает его;
  - если файла нет, получает изображение у Freepik, ресайзит и кладет в кеш.

### 3.4 Fallback изображение (локальное)

Файлы:
- `apps/server/lib/stock/fallback.js`

Логика:
- генерация локального изображения под запрошенные `width/height` с надписью `no image`;
- использовать существующий генератор плейсхолдера в проекте (SVG fallback) без внешних API;
- fallback рендерится в запрошенном формате (`webp|jpeg|png`) через resize/pipeline;
- fallback тоже кладется в кеш по отдельному ключу (`provider=fallback`) для повторного быстрого ответа.

Опционально этап 2:
- L1 in-memory LRU для ускорения горячих запросов
- single-flight lock против параллельных одинаковых miss

## 4) Конфиг и переменные окружения

В `packages/config` + `.env.example` добавить:

- `FREEPIK_API_KEY`
- `STOCK_MAX_WIDTH`
- `STOCK_MAX_HEIGHT`
- `STOCK_CACHE_DIR` (например `/var/cache/polka-stock`)
- `STOCK_CACHE_TTL_SEC` (например `604800`)
- `STOCK_PROVIDER_TIMEOUT_MS` (`3000`)
- `STOCK_DEFAULT_FORMAT` (`webp`)
- `STOCK_DEFAULT_QUALITY` (`82`)
- `STOCK_FALLBACK_TEXT` (`no image`)

## 5) Docker + `sharp`

### 5.1 Установка

- Добавить зависимость:
  - `npm i sharp -w @polka/server`

### 5.2 Контейнер

- В Docker создать кеш-директорию:
  - `/var/cache/polka-stock`
- Убедиться, что процесс может туда писать.
- Для прода подключать volume на `STOCK_CACHE_DIR`.
- Cron-очистку запускать отдельным процессом/контейнером, не в API-процессе.

### 5.3 Проверка совместимости

- Прогон `./build.sh` + запуск контейнера.
- Smoke-тест, что `sharp` реально работает внутри контейнера.

## 6) Интеграция с express-openapi

- Новый роут:
  - `apps/server/routes/stock/{width}/{height}/{query}.js`
- Новый файл общих параметров:
  - `apps/server/lib/stockQueryParams.js` (по аналогии с `wxhQueryParams.js`)
- Добавить OpenAPI описание:
  - параметры path/query
  - ответы `200/400/404/502`

## 7) UI план

- Добавить вкладку `Сток` рядом с `WxH` и `Аватары`.
- Конструктор слева:
  - ключевое слово, width, height, fit, format, quality
- Справа:
  - итоговый URL (редактируемый, абсолютный),
  - кнопки copy/open,
  - превью.
- Поведение аналогично текущим конструкторам.

## 8) Порядок работ

1. Конфиг + env переменные.
2. Freepik provider client.
3. Resize (`sharp`).
4. File cache.
5. Скрипт cleanup для cron (удаление файлов старше 30 дней).
6. Команда запуска cleanup в root `package.json`: `cron:cleanup-cache`.
7. `/stock` роут + OpenAPI.
8. UI вкладка.
9. Docker доработка.
10. Проверки (локально и в контейнере).

## 9) Критерии готовности

- `GET /stock/:w/:h/:query` возвращает картинку корректного размера.
- Повторный идентичный запрос идет из кеша.
- В контейнере `sharp` работает стабильно.
- Кеш пишет/читает из `STOCK_CACHE_DIR`.
- При timeout Freepik (`3s`) корректно возвращается локальный fallback `no image` нужного размера.
- UI-вкладка `Сток` полностью рабочая.

## 10) Зафиксированные решения

1. Используем только **free**-ресурсы Freepik (premium исключаем на этапе MVP).
2. Формат по умолчанию: `webp`.
3. TTL кеша: **1 месяц** (`STOCK_CACHE_TTL_SEC=2592000`).
4. Кеш без контроля общего размера: обычная директория с файлами.
5. `seed` добавляем для детерминированного выбора ресурса.
6. Лимиты размеров для MVP:
   - `STOCK_MAX_WIDTH=4096`
   - `STOCK_MAX_HEIGHT=4096`
7. В UI итоговый URL должен быть **абсолютным**.
8. Timeout внешнего API Freepik: **3 секунды**, при превышении отдаем локальную fallback-картинку с текстом `no image`.
9. Удаление протухших файлов делает отдельный cron-процесс, запускаемый отдельной командой из root `package.json`.
10. Имя root-команды для cron-cleanup: `cron:cleanup-cache`.
11. Путь кеша задается только через env-переменную `STOCK_CACHE_DIR` (без хардкода пути в коде).
