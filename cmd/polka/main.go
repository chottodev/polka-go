package main

import (
	"fmt"
	"io/fs"
	"log"
	"net/http"
	"os"
	"path/filepath"

	"github.com/chottodev/polka-go/internal/config"
	"github.com/chottodev/polka-go/internal/server"
	"github.com/chottodev/polka-go/web"
)

func main() {
	repoRoot := findRepoRoot()
	cfg := config.Load(repoRoot)

	staticRoot, err := fs.Sub(web.Static, "static")
	if err != nil {
		log.Fatal(err)
	}

	srv := server.New(cfg, staticRoot)
	addr := fmt.Sprintf(":%d", cfg.Port)
	log.Printf("polka http://localhost%s", addr)
	if err := http.ListenAndServe(addr, srv.Handler()); err != nil {
		log.Fatal(err)
	}
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
