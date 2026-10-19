package server

import (
	"encoding/json"
	"io/fs"
	"net/http"
	"strings"

	"github.com/chottodev/polka-go/internal/config"
	"github.com/chottodev/polka-go/internal/stock"
	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
)

type Server struct {
	cfg   config.Config
	stock *stock.Service
	static fs.FS
}

func New(cfg config.Config, staticFS fs.FS) *Server {
	return &Server{
		cfg: cfg,
		stock: &stock.Service{
			APIKey:         cfg.FreepikAPIKey,
			CacheDir:       cfg.StockCacheDir,
			TimeoutMs:      cfg.StockProviderTimeoutMs,
			DefaultFormat:  cfg.StockDefaultFormat,
			DefaultQuality: cfg.StockDefaultQuality,
			FallbackText:   cfg.StockFallbackText,
			MaxWidth:       cfg.StockMaxWidth,
			MaxHeight:      cfg.StockMaxHeight,
		},
		static: staticFS,
	}
}

func (s *Server) Handler() http.Handler {
	r := chi.NewRouter()
	r.Use(middleware.RequestID)
	r.Use(middleware.RealIP)
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)
	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   []string{"*"},
		AllowedMethods:   []string{"GET", "HEAD", "OPTIONS"},
		AllowedHeaders:   []string{"*"},
		AllowCredentials: false,
	}))

	r.Get("/health", s.handleHealth)
	r.Get("/openapi.json", s.handleOpenAPI)
	r.Get("/docs", s.handleDocs)
	r.Get("/docs/", s.handleDocs)

	r.Get("/wxh/{width}/{height}", s.handleWxh)
	r.Get("/wxh/{width}/{height}/{text}", s.handleWxhWithText)
	r.Get("/avatars/initials/{text}", s.handleAvatarInitials)
	r.Get("/avatars/vector/{kind}", s.handleAvatarVector)
	r.Get("/stock/{width}/{height}/{query}", s.handleStock)

	if s.static != nil {
		fileServer := http.FileServer(http.FS(s.static))
		r.Get("/", func(w http.ResponseWriter, req *http.Request) {
			http.ServeFileFS(w, req, s.static, "index.html")
		})
		r.NotFound(func(w http.ResponseWriter, req *http.Request) {
			if req.Method != http.MethodGet && req.Method != http.MethodHead {
				http.NotFound(w, req)
				return
			}
			name := strings.TrimPrefix(req.URL.Path, "/")
			if name != "" {
				if f, err := s.static.Open(name); err == nil {
					_ = f.Close()
					fileServer.ServeHTTP(w, req)
					return
				}
			}
			// SPA tabs: /wxh, /avatars, /stock
			http.ServeFileFS(w, req, s.static, "index.html")
		})
	}

	return r
}

func writeJSON(w http.ResponseWriter, status int, v any) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(v)
}

func writeSVG(w http.ResponseWriter, svg string) {
	w.Header().Set("Content-Type", "image/svg+xml; charset=utf-8")
	w.Header().Set("Cache-Control", "public, max-age=86400")
	_, _ = w.Write([]byte(svg))
}
