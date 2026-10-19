package main

import (
	"fmt"
	"log"
	"os"
	"path/filepath"

	"github.com/chottodev/polka-go/internal/config"
	"github.com/chottodev/polka-go/internal/stock"
)

func main() {
	repoRoot := findRepoRoot()
	cfg := config.Load(repoRoot)
	removed, err := stock.CleanupCache(cfg.StockCacheDir, cfg.StockCacheTTLSec)
	if err != nil {
		log.Fatal(err)
	}
	fmt.Printf("cleanup-cache done: removed=%d dir=%s\n", removed, cfg.StockCacheDir)
}

func findRepoRoot() string {
	if v := os.Getenv("POLKA_ROOT"); v != "" {
		return v
	}
	wd, err := os.Getwd()
	if err != nil {
		return "."
	}
	dir := wd
	for {
		if _, err := os.Stat(filepath.Join(dir, "go.mod")); err == nil {
			return dir
		}
		parent := filepath.Dir(dir)
		if parent == dir {
			return wd
		}
		dir = parent
	}
}
