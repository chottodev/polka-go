FROM golang:1.24-bookworm AS build
WORKDIR /src
COPY go.mod go.sum* ./
RUN go mod download
COPY . .
RUN go mod tidy && CGO_ENABLED=0 go build -o /out/polka ./cmd/polka \
 && CGO_ENABLED=0 go build -o /out/cleanup-cache ./cmd/cleanup-cache

FROM gcr.io/distroless/static-debian12:nonroot
WORKDIR /
ENV PORT=4700 \
    STOCK_CACHE_DIR=/var/cache/polka-stock
COPY --from=build /out/polka /polka
COPY --from=build /out/cleanup-cache /cleanup-cache
EXPOSE 4700
USER nonroot:nonroot
ENTRYPOINT ["/polka"]
