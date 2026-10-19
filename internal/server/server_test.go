package server_test

import (
	"encoding/json"
	"io"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"testing/fstest"

	"github.com/chottodev/polka-go/internal/config"
	"github.com/chottodev/polka-go/internal/server"
)

func testServer(t *testing.T) http.Handler {
	t.Helper()
	cfg := config.Config{
		Port:                 4700,
		PlaceholderMaxWidth:  4000,
		PlaceholderMaxHeight: 4000,
		StockMaxWidth:        4096,
		StockMaxHeight:       4096,
		StockCacheDir:        t.TempDir(),
		StockDefaultFormat:   "png",
		StockDefaultQuality:  80,
		StockFallbackText:    "no image",
		StockProviderTimeoutMs: 100,
	}
	static := fstest.MapFS{
		"index.html": &fstest.MapFile{Data: []byte("<html>ok</html>")},
	}
	return server.New(cfg, static).Handler()
}

func TestHealth(t *testing.T) {
	h := testServer(t)
	req := httptest.NewRequest(http.MethodGet, "/health", nil)
	rec := httptest.NewRecorder()
	h.ServeHTTP(rec, req)
	if rec.Code != 200 {
		t.Fatalf("status %d", rec.Code)
	}
	var body map[string]any
	if err := json.Unmarshal(rec.Body.Bytes(), &body); err != nil {
		t.Fatal(err)
	}
	if body["status"] != "ok" || body["service"] != "polka" {
		t.Fatalf("%v", body)
	}
}

func TestWxhSVG(t *testing.T) {
	h := testServer(t)
	req := httptest.NewRequest(http.MethodGet, "/wxh/120/80?text=Hi&bg=111111&fg=eeeeee", nil)
	rec := httptest.NewRecorder()
	h.ServeHTTP(rec, req)
	if rec.Code != 200 {
		t.Fatalf("status %d body=%s", rec.Code, rec.Body.String())
	}
	ct := rec.Header().Get("Content-Type")
	if !strings.Contains(ct, "image/svg+xml") {
		t.Fatalf("ct %s", ct)
	}
	body := rec.Body.String()
	if !strings.Contains(body, "<svg") || !strings.Contains(body, "Hi") {
		t.Fatalf("svg body: %s", body[:min(200, len(body))])
	}
}

func TestWxhBadWidth(t *testing.T) {
	h := testServer(t)
	req := httptest.NewRequest(http.MethodGet, "/wxh/0/80", nil)
	rec := httptest.NewRecorder()
	h.ServeHTTP(rec, req)
	if rec.Code != 400 {
		t.Fatalf("status %d", rec.Code)
	}
}

func TestAvatarInitials(t *testing.T) {
	h := testServer(t)
	req := httptest.NewRequest(http.MethodGet, "/avatars/initials/AB?size=64", nil)
	rec := httptest.NewRecorder()
	h.ServeHTTP(rec, req)
	if rec.Code != 200 || !strings.Contains(rec.Body.String(), "<svg") {
		t.Fatalf("%d %s", rec.Code, rec.Body.String())
	}
}

func TestAvatarSeedAffectsOutput(t *testing.T) {
	h := testServer(t)
	get := func(path string) string {
		req := httptest.NewRequest(http.MethodGet, path, nil)
		rec := httptest.NewRecorder()
		h.ServeHTTP(rec, req)
		if rec.Code != 200 {
			t.Fatalf("%s -> %d", path, rec.Code)
		}
		return rec.Body.String()
	}
	if get("/avatars/vector/man?size=64&seed=aaa") == get("/avatars/vector/man?size=64&seed=bbb") {
		t.Fatal("vector seed ignored")
	}
	if get("/avatars/initials/AB?size=64&seed=aaa") == get("/avatars/initials/AB?size=64&seed=bbb") {
		t.Fatal("initials seed ignored")
	}
}

func TestAvatarVector(t *testing.T) {
	h := testServer(t)
	for _, kind := range []string{"man", "female", "cat", "dog", "panda", "fox"} {
		req := httptest.NewRequest(http.MethodGet, "/avatars/vector/"+kind+"?size=64&seed=t", nil)
		rec := httptest.NewRecorder()
		h.ServeHTTP(rec, req)
		if rec.Code != 200 || !strings.HasPrefix(strings.TrimSpace(rec.Body.String()), "<svg") {
			t.Fatalf("%s: %d", kind, rec.Code)
		}
	}
}

func TestOpenAPI(t *testing.T) {
	h := testServer(t)
	req := httptest.NewRequest(http.MethodGet, "/openapi.json", nil)
	rec := httptest.NewRecorder()
	h.ServeHTTP(rec, req)
	if rec.Code != 200 {
		t.Fatal(rec.Code)
	}
	var doc map[string]any
	if err := json.Unmarshal(rec.Body.Bytes(), &doc); err != nil {
		t.Fatal(err)
	}
	if doc["openapi"] == nil {
		t.Fatal("missing openapi")
	}
}

func TestStockFallbackWithoutKey(t *testing.T) {
	h := testServer(t)
	req := httptest.NewRequest(http.MethodGet, "/stock/40/30/nature?format=png", nil)
	rec := httptest.NewRecorder()
	h.ServeHTTP(rec, req)
	if rec.Code != 200 {
		t.Fatalf("status %d %s", rec.Code, rec.Body.String())
	}
	ct := rec.Header().Get("Content-Type")
	if !strings.HasPrefix(ct, "image/") {
		t.Fatalf("ct %s", ct)
	}
	body, _ := io.ReadAll(rec.Body)
	if len(body) < 20 {
		t.Fatalf("short body %d", len(body))
	}
	if rec.Header().Get("X-Polka-Stock-Source") != "fallback" {
		t.Fatalf("source %s", rec.Header().Get("X-Polka-Stock-Source"))
	}
}

func min(a, b int) int {
	if a < b {
		return a
	}
	return b
}
