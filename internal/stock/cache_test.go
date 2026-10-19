package stock

import (
	"os"
	"path/filepath"
	"testing"
	"time"
)

func TestBuildCacheKeyStable(t *testing.T) {
	a := BuildCacheKey("freepik", "Nature", 800, 600, "cover", "webp", 82, "s1")
	b := BuildCacheKey("freepik", "nature", 800, 600, "cover", "WEBP", 82, "s1")
	if a != b {
		t.Fatalf("keys differ: %q vs %q", a, b)
	}
	if want := "v1|freepik|nature|w800|h600|fit:cover|fmt:webp|q:82|seed:s1"; a != want {
		t.Fatalf("got %q want %q", a, want)
	}
}

func TestCacheRoundTrip(t *testing.T) {
	dir := t.TempDir()
	key := BuildCacheKey("freepik", "cat", 10, 10, "cover", "png", 80, "")
	body := []byte{1, 2, 3, 4}
	if _, err := WriteCachedFile(dir, key, "png", body); err != nil {
		t.Fatal(err)
	}
	got, path, err := ReadCachedFile(dir, key, "png")
	if err != nil {
		t.Fatal(err)
	}
	if path == "" || len(got) != 4 {
		t.Fatalf("unexpected read: path=%q len=%d", path, len(got))
	}
	miss, _, err := ReadCachedFile(dir, key+"x", "png")
	if err != nil || miss != nil {
		t.Fatalf("expected miss, got %v err=%v", miss, err)
	}
	_ = filepath.Join(dir, "x")
}

func TestCleanupCache(t *testing.T) {
	dir := t.TempDir()
	p := filepath.Join(dir, "old.webp")
	if err := os.WriteFile(p, []byte("x"), 0o644); err != nil {
		t.Fatal(err)
	}
	past := time.Now().Add(-2 * time.Hour)
	if err := os.Chtimes(p, past, past); err != nil {
		t.Fatal(err)
	}
	removed, err := CleanupCache(dir, 60)
	if err != nil {
		t.Fatal(err)
	}
	if removed < 1 {
		t.Fatalf("expected removal, got %d", removed)
	}
}

func TestNormalizeFitFormat(t *testing.T) {
	if NormalizeFit("COVER") != "cover" {
		t.Fatal("fit")
	}
	if NormalizeFormat("jpg", "webp") != "jpeg" {
		t.Fatal("format")
	}
}
