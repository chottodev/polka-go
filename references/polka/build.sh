#!/usr/bin/env bash
# Build Docker image. Set TAG (and optionally IMAGE) for the image reference.
# Examples:
#   TAG=1.2.3 ./build.sh
#   TAG=dev IMAGE=myregistry/polka ./build.sh

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TAG="${TAG:-latest}"
IMAGE="${IMAGE:-antirek/polka}"

docker build \
  -f "${ROOT_DIR}/Dockerfile" \
  -t "${IMAGE}:${TAG}" \
  "${ROOT_DIR}"

docker push "${IMAGE}:${TAG}"

echo "Built ${IMAGE}:${TAG}"
