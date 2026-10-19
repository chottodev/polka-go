package stock

import (
	"os"
	"path/filepath"
	"time"
)

// CleanupCache removes files in cacheDir older than ttlSec seconds.
func CleanupCache(cacheDir string, ttlSec int) (removed int, err error) {
	if err := os.MkdirAll(cacheDir, 0o755); err != nil {
		return 0, err
	}
	ttl := time.Duration(ttlSec) * time.Second
	now := time.Now()
	entries, err := os.ReadDir(cacheDir)
	if err != nil {
		return 0, err
	}
	for _, entry := range entries {
		if entry.IsDir() {
			continue
		}
		info, err := entry.Info()
		if err != nil {
			continue
		}
		if now.Sub(info.ModTime()) > ttl {
			if err := os.Remove(filepath.Join(cacheDir, entry.Name())); err == nil {
				removed++
			}
		}
	}
	return removed, nil
}
