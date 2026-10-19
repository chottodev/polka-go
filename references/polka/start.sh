#!/usr/bin/env bash
# Сборка UI и запуск сервера (из корня монорепо).
# Требуются зависимости: npm install

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT_DIR"

npm run build
exec npm start
