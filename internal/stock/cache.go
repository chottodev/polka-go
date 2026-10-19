package stock

import (
	"crypto/sha1"
	"encoding/hex"
	"fmt"
	"os"
	"path/filepath"
	"strings"
)

func NormalizeExt(format string) string {
	f := strings.ToLower(format)
	if f == "jpg" {
		return "jpeg"
	}
	if f == "jpeg" || f == "png" || f == "webp" {
		return f
	}
	return "webp"
}

func keyToHash(key string) string {
	sum := sha1.Sum([]byte(key))
	return hex.EncodeToString(sum[:])
}

// BuildCacheKey builds a deterministic cache key matching the Node implementation.
func BuildCacheKey(provider, query string, width, height int, fit, format string, quality int, seed string) string {
	return strings.Join([]string{
		"v1",
		strings.ToLower(provider),
		strings.ToLower(strings.TrimSpace(query)),
		fmt.Sprintf("w%d", width),
		fmt.Sprintf("h%d", height),
		"fit:" + fit,
		"fmt:" + NormalizeExt(format),
		fmt.Sprintf("q:%d", quality),
		"seed:" + strings.TrimSpace(seed),
	}, "|")
}

func cacheFilePath(cacheDir, key, format string) string {
	return filepath.Join(cacheDir, keyToHash(key)+"."+NormalizeExt(format))
}

func EnsureCacheDir(cacheDir string) error {
	return os.MkdirAll(cacheDir, 0o755)
}

func ReadCachedFile(cacheDir, key, format string) ([]byte, string, error) {
	path := cacheFilePath(cacheDir, key, format)
	body, err := os.ReadFile(path)
	if err != nil {
		if os.IsNotExist(err) {
			return nil, "", nil
		}
		return nil, "", err
	}
	return body, path, nil
}

func WriteCachedFile(cacheDir, key, format string, body []byte) (string, error) {
	path := cacheFilePath(cacheDir, key, format)
	if err := os.WriteFile(path, body, 0o644); err != nil {
		return "", err
	}
	return path, nil
}
