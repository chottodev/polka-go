package stock

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"time"
)

type FreepikResult struct {
	Provider    string
	Orientation string
	ResourceID  any
	Title       string
	SourceURL   string
	Original    []byte
}

func resolveOrientation(width, height int) string {
	if width <= 0 || height <= 0 {
		return "landscape"
	}
	if width == height {
		return "square"
	}
	if width > height {
		return "landscape"
	}
	return "portrait"
}

func buildSearchURL(term, seed string, width, height int) string {
	u, _ := url.Parse("https://api.freepik.com/v1/resources")
	q := u.Query()
	q.Set("term", term)
	q.Set("limit", "20")
	q.Set("filters[license][freemium]", "1")
	orient := resolveOrientation(width, height)
	q.Set("filters[orientation]["+orient+"]", "1")
	if seed != "" {
		q.Set("order", "recent")
	}
	u.RawQuery = q.Encode()
	return u.String()
}

func pickBySeed(items []map[string]any, seed string) map[string]any {
	if len(items) == 0 {
		return nil
	}
	if seed == "" {
		return items[0]
	}
	var hash uint32
	for i := 0; i < len(seed); i++ {
		hash = (hash*31 + uint32(seed[i]))
	}
	return items[int(hash)%len(items)]
}

func getImageURL(item map[string]any) string {
	if item == nil {
		return ""
	}
	if image, ok := item["image"].(map[string]any); ok {
		if source, ok := image["source"].(map[string]any); ok {
			if u, ok := source["url"].(string); ok && u != "" {
				return u
			}
		}
		if u, ok := image["url"].(string); ok && u != "" {
			return u
		}
	}
	if preview, ok := item["preview"].(map[string]any); ok {
		if u, ok := preview["url"].(string); ok {
			return u
		}
	}
	return ""
}

func fetchJSON(ctx context.Context, client *http.Client, rawURL, apiKey string) (map[string]any, error) {
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, rawURL, nil)
	if err != nil {
		return nil, err
	}
	req.Header.Set("x-freepik-api-key", apiKey)
	req.Header.Set("Accept-Language", "ru-RU")
	res, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer res.Body.Close()
	body, err := io.ReadAll(res.Body)
	if err != nil {
		return nil, err
	}
	if res.StatusCode < 200 || res.StatusCode >= 300 {
		return nil, fmt.Errorf("Freepik API %d: %s", res.StatusCode, string(body))
	}
	var payload map[string]any
	if err := json.Unmarshal(body, &payload); err != nil {
		return nil, err
	}
	return payload, nil
}

func fetchBuffer(ctx context.Context, client *http.Client, rawURL string) ([]byte, error) {
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, rawURL, nil)
	if err != nil {
		return nil, err
	}
	res, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer res.Body.Close()
	if res.StatusCode < 200 || res.StatusCode >= 300 {
		return nil, fmt.Errorf("Image download %d", res.StatusCode)
	}
	return io.ReadAll(res.Body)
}

// FetchFreepikImage searches Freepik and downloads one free/freemium image.
func FetchFreepikImage(apiKey, query, seed string, width, height, timeoutMs int) (*FreepikResult, error) {
	if apiKey == "" {
		return nil, fmt.Errorf("FREEPIK_API_KEY is not set")
	}
	if timeoutMs <= 0 {
		timeoutMs = 3000
	}
	client := &http.Client{Timeout: time.Duration(timeoutMs) * time.Millisecond}
	ctx, cancel := context.WithTimeout(context.Background(), time.Duration(timeoutMs)*time.Millisecond)
	defer cancel()

	orientation := resolveOrientation(width, height)
	searchURL := buildSearchURL(query, seed, width, height)
	payload, err := fetchJSON(ctx, client, searchURL, apiKey)
	if err != nil {
		return nil, err
	}
	rawItems, _ := payload["data"].([]any)
	items := make([]map[string]any, 0, len(rawItems))
	for _, it := range rawItems {
		if m, ok := it.(map[string]any); ok {
			items = append(items, m)
		}
	}
	picked := pickBySeed(items, seed)
	if picked == nil {
		return nil, fmt.Errorf("No free images found")
	}
	sourceURL := getImageURL(picked)
	if sourceURL == "" {
		return nil, fmt.Errorf("Freepik result has no source image")
	}
	original, err := fetchBuffer(ctx, client, sourceURL)
	if err != nil {
		return nil, err
	}
	return &FreepikResult{
		Provider:    "freepik",
		Orientation: orientation,
		ResourceID:  picked["id"],
		Title:       fmt.Sprint(picked["title"]),
		SourceURL:   sourceURL,
		Original:    original,
	}, nil
}
