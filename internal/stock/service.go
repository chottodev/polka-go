package stock

import (
	"log"
	"time"
)

// Service orchestrates cache + Freepik + resize + fallback.
type Service struct {
	APIKey         string
	CacheDir       string
	TimeoutMs      int
	DefaultFormat  string
	DefaultQuality int
	FallbackText   string
	MaxWidth       int
	MaxHeight      int
}

type GetImageParams struct {
	Width, Height  int
	Query          string
	Fit, Format    string
	Quality        int
	Provider, Seed string
}

type GetImageResult struct {
	Body   []byte
	Format string
	Source string // cache_hit | freepik_ok | fallback
}

func (s *Service) GetImage(p GetImageParams) (*GetImageResult, error) {
	provider := p.Provider
	if provider == "" {
		provider = "freepik"
	}
	fit := NormalizeFit(p.Fit)
	format := NormalizeFormat(p.Format, s.DefaultFormat)
	quality := p.Quality
	if quality < 1 || quality > 100 {
		quality = s.DefaultQuality
	}

	if err := EnsureCacheDir(s.CacheDir); err != nil {
		return nil, err
	}

	cacheKey := BuildCacheKey(provider, p.Query, p.Width, p.Height, fit, format, quality, p.Seed)
	if body, _, err := ReadCachedFile(s.CacheDir, cacheKey, format); err != nil {
		return nil, err
	} else if body != nil {
		return &GetImageResult{Body: body, Format: format, Source: "cache_hit"}, nil
	}

	started := time.Now()
	picked, err := FetchFreepikImage(s.APIKey, p.Query, p.Seed, p.Width, p.Height, s.TimeoutMs)
	var out []byte
	var outFormat string
	source := "freepik_ok"
	if err != nil {
		log.Printf("[stock] freepik fallback query=%q err=%v elapsed=%s", p.Query, err, time.Since(started))
		out, outFormat, err = CreateFallbackRaster(p.Width, p.Height, s.FallbackText, format, quality)
		if err != nil {
			return nil, err
		}
		source = "fallback"
	} else {
		out, outFormat, err = ResizeImage(picked.Original, p.Width, p.Height, fit, format, quality, s.DefaultFormat)
		if err != nil {
			log.Printf("[stock] resize failed, using fallback: %v", err)
			out, outFormat, err = CreateFallbackRaster(p.Width, p.Height, s.FallbackText, format, quality)
			if err != nil {
				return nil, err
			}
			source = "fallback"
		}
	}

	if _, err := WriteCachedFile(s.CacheDir, cacheKey, outFormat, out); err != nil {
		log.Printf("[stock] cache write failed: %v", err)
	}
	return &GetImageResult{Body: out, Format: outFormat, Source: source}, nil
}
