package config

import (
	"os"
	"path/filepath"
	"strconv"
	"strings"

	"github.com/joho/godotenv"
)

const Version = "1.0.5"

// Config holds runtime settings loaded from environment.
type Config struct {
	NodeEnv               string
	Port                  int
	PublicOrigin          string
	PlaceholderMaxWidth   int
	PlaceholderMaxHeight  int
	FreepikAPIKey         string
	StockMaxWidth         int
	StockMaxHeight        int
	StockCacheDir         string
	StockCacheTTLSec      int
	StockProviderTimeoutMs int
	StockDefaultFormat    string
	StockDefaultQuality   int
	StockFallbackText     string
}

func intEnv(name string, fallback, min, max int) int {
	raw := os.Getenv(name)
	if raw == "" {
		return fallback
	}
	n, err := strconv.Atoi(raw)
	if err != nil {
		return fallback
	}
	if min != 0 && n < min {
		n = min
	}
	if max != 0 && n > max {
		n = max
	}
	return n
}

// Load reads .env (if present) and environment variables.
// repoRoot is used to resolve relative STOCK_CACHE_DIR.
func Load(repoRoot string) Config {
	_ = godotenv.Load(filepath.Join(repoRoot, ".env"))
	_ = godotenv.Load()

	cacheDir := os.Getenv("STOCK_CACHE_DIR")
	if cacheDir == "" {
		cacheDir = ".cache/polka-stock"
	}
	if !filepath.IsAbs(cacheDir) {
		cacheDir = filepath.Join(repoRoot, cacheDir)
	}

	return Config{
		NodeEnv:                firstNonEmpty(os.Getenv("NODE_ENV"), "development"),
		Port:                   intEnv("PORT", 4700, 1, 65535),
		PublicOrigin:           strings.TrimRight(os.Getenv("PUBLIC_ORIGIN"), "/"),
		PlaceholderMaxWidth:    intEnv("PLACEHOLDER_MAX_WIDTH", 4000, 1, 32000),
		PlaceholderMaxHeight:   intEnv("PLACEHOLDER_MAX_HEIGHT", 4000, 1, 32000),
		FreepikAPIKey:          os.Getenv("FREEPIK_API_KEY"),
		StockMaxWidth:          intEnv("STOCK_MAX_WIDTH", 4096, 1, 32000),
		StockMaxHeight:         intEnv("STOCK_MAX_HEIGHT", 4096, 1, 32000),
		StockCacheDir:          cacheDir,
		StockCacheTTLSec:       intEnv("STOCK_CACHE_TTL_SEC", 2592000, 60, 31536000),
		StockProviderTimeoutMs: intEnv("STOCK_PROVIDER_TIMEOUT_MS", 6000, 100, 20000),
		StockDefaultFormat:     firstNonEmpty(os.Getenv("STOCK_DEFAULT_FORMAT"), "webp"),
		StockDefaultQuality:    intEnv("STOCK_DEFAULT_QUALITY", 82, 1, 100),
		StockFallbackText:      firstNonEmpty(os.Getenv("STOCK_FALLBACK_TEXT"), "no image"),
	}
}

func firstNonEmpty(values ...string) string {
	for _, v := range values {
		if v != "" {
			return v
		}
	}
	return ""
}
