package server

import (
	"net/http"
	"net/url"
	"strconv"
	"strings"

	"github.com/chottodev/polka-go/internal/config"
	"github.com/chottodev/polka-go/internal/generator"
	"github.com/chottodev/polka-go/internal/stock"
	"github.com/go-chi/chi/v5"
)

func (s *Server) handleHealth(w http.ResponseWriter, _ *http.Request) {
	writeJSON(w, http.StatusOK, map[string]any{
		"status":  "ok",
		"service": "polka",
		"version": config.Version,
	})
}

func (s *Server) handleWxh(w http.ResponseWriter, r *http.Request) {
	width, height, ok := parseDims(w, chi.URLParam(r, "width"), chi.URLParam(r, "height"), s.cfg.PlaceholderMaxWidth, s.cfg.PlaceholderMaxHeight)
	if !ok {
		return
	}
	q := r.URL.Query()
	svg := generator.GeneratePlaceholder(generator.PlaceholderOptions{
		Width: width, Height: height,
		Bg: q.Get("bg"), Fg: q.Get("fg"), Text: q.Get("text"),
		Rounded: q.Get("rounded"), FontSize: q.Get("font"),
		Family: q.Get("family"), Gradient: q.Get("gradient"),
		MaxWidth: s.cfg.PlaceholderMaxWidth, MaxHeight: s.cfg.PlaceholderMaxHeight,
	})
	writeSVG(w, svg)
}

func (s *Server) handleWxhWithText(w http.ResponseWriter, r *http.Request) {
	width, height, ok := parseDims(w, chi.URLParam(r, "width"), chi.URLParam(r, "height"), s.cfg.PlaceholderMaxWidth, s.cfg.PlaceholderMaxHeight)
	if !ok {
		return
	}
	text := chi.URLParam(r, "text")
	if decoded, err := url.PathUnescape(text); err == nil {
		text = decoded
	}
	q := r.URL.Query()
	svg := generator.GeneratePlaceholder(generator.PlaceholderOptions{
		Width: width, Height: height,
		Bg: q.Get("bg"), Fg: q.Get("fg"), Text: text,
		Rounded: q.Get("rounded"), FontSize: q.Get("font"),
		Family: q.Get("family"), Gradient: q.Get("gradient"),
		MaxWidth: s.cfg.PlaceholderMaxWidth, MaxHeight: s.cfg.PlaceholderMaxHeight,
	})
	writeSVG(w, svg)
}

func (s *Server) handleAvatarInitials(w http.ResponseWriter, r *http.Request) {
	text := chi.URLParam(r, "text")
	decoded, err := url.PathUnescape(text)
	if err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "Неверная кодировка текста"})
		return
	}
	q := r.URL.Query()
	svg := generator.GenerateAvatarInitials(generator.AvatarInitialsOptions{
		Text: decoded,
		Size: q.Get("size"), Bg: q.Get("bg"), Fg: q.Get("fg"),
		Palette: q.Get("palette"), Family: q.Get("family"), Font: q.Get("font"),
		Seed: q.Get("seed"),
	})
	writeSVG(w, svg)
}

func (s *Server) handleAvatarVector(w http.ResponseWriter, r *http.Request) {
	kind := chi.URLParam(r, "kind")
	q := r.URL.Query()
	svg := generator.GenerateAvatarVector(generator.AvatarVectorOptions{
		Kind: kind, Size: q.Get("size"), Palette: q.Get("palette"),
		Style: q.Get("style"), Bg: q.Get("bg"), Fg: q.Get("fg"), Seed: q.Get("seed"),
	})
	writeSVG(w, svg)
}

func (s *Server) handleStock(w http.ResponseWriter, r *http.Request) {
	width, height, ok := parseDims(w, chi.URLParam(r, "width"), chi.URLParam(r, "height"), s.cfg.StockMaxWidth, s.cfg.StockMaxHeight)
	if !ok {
		return
	}
	q := r.URL.Query()
	provider := strings.ToLower(q.Get("provider"))
	if provider == "" {
		provider = "freepik"
	}
	if provider != "freepik" {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "Неверный provider"})
		return
	}
	query := chi.URLParam(r, "query")
	if decoded, err := url.PathUnescape(query); err == nil {
		query = decoded
	}
	query = strings.TrimSpace(query)
	if query == "" {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "Пустой запрос поиска"})
		return
	}
	quality := s.cfg.StockDefaultQuality
	if raw := q.Get("quality"); raw != "" {
		if n, err := strconv.Atoi(raw); err == nil {
			if n < 1 {
				n = 1
			}
			if n > 100 {
				n = 100
			}
			quality = n
		}
	}

	result, err := s.stock.GetImage(stock.GetImageParams{
		Width: width, Height: height, Query: query,
		Fit: q.Get("fit"), Format: q.Get("format"), Quality: quality,
		Provider: provider, Seed: strings.TrimSpace(q.Get("seed")),
	})
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "Ошибка обработки stock-запроса"})
		return
	}
	w.Header().Set("Content-Type", "image/"+result.Format)
	w.Header().Set("Cache-Control", "public, max-age=86400")
	w.Header().Set("X-Polka-Stock-Source", result.Source)
	_, _ = w.Write(result.Body)
}

func parseDims(w http.ResponseWriter, widthStr, heightStr string, maxW, maxH int) (int, int, bool) {
	width, errW := strconv.Atoi(widthStr)
	height, errH := strconv.Atoi(heightStr)
	if errW != nil || width < 1 || width > maxW {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "Неверная ширина"})
		return 0, 0, false
	}
	if errH != nil || height < 1 || height > maxH {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "Неверная высота"})
		return 0, 0, false
	}
	return width, height, true
}
