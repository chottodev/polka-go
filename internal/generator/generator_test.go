package generator

import (
	"strings"
	"testing"
)

func TestGeneratePlaceholder(t *testing.T) {
	svg := GeneratePlaceholder(PlaceholderOptions{
		Width: 200, Height: 100, Text: "Hello", Bg: "cccccc", Fg: "333333",
	})
	if !strings.Contains(svg, `width="200"`) || !strings.Contains(svg, `height="100"`) {
		t.Fatalf("missing dimensions: %s", svg)
	}
	if !strings.Contains(svg, "Hello") {
		t.Fatalf("missing text: %s", svg)
	}
}

func TestGenerateAvatarInitials(t *testing.T) {
	svg := GenerateAvatarInitials(AvatarInitialsOptions{Text: "ab", Size: 64, Palette: "soft"})
	if !strings.HasPrefix(svg, "<svg") {
		t.Fatalf("expected svg: %s", svg)
	}
	if !strings.Contains(svg, "AB") {
		t.Fatalf("expected uppercase initials: %s", svg)
	}
}

func TestSeededIndexDeterministic(t *testing.T) {
	a := SeededIndex("test-seed", 17)
	b := SeededIndex("test-seed", 17)
	if a != b {
		t.Fatalf("expected deterministic index, got %d and %d", a, b)
	}
	if a < 0 || a >= 17 {
		t.Fatalf("index out of range: %d", a)
	}
}

func TestGenerateAvatarVectorKinds(t *testing.T) {
	kinds := []string{"man", "female", "cat", "dog", "panda", "fox"}
	for _, kind := range kinds {
		svg := GenerateAvatarVector(AvatarVectorOptions{Kind: kind, Size: 128, Seed: "unit-test"})
		if !strings.HasPrefix(strings.TrimSpace(svg), "<svg") {
			t.Fatalf("kind %s: expected svg prefix, got %q", kind, svg[:min(40, len(svg))])
		}
		if len(strings.TrimSpace(svg)) == 0 {
			t.Fatalf("kind %s: empty svg", kind)
		}
	}
}

func min(a, b int) int {
	if a < b {
		return a
	}
	return b
}

func TestHashSeedMatchesJS(t *testing.T) {
	cases := map[string]uint32{
		"":          2166136261,
		"a":         3826002220,
		"b":         3876335077,
		"demo":      2935829814,
		"test-seed": 3638103021,
		"1":         873244444,
		"2":         923577301,
	}
	for s, want := range cases {
		if got := HashSeed(s); got != want {
			t.Errorf("HashSeed(%q)=%d want %d", s, got, want)
		}
	}
}

func TestInitialsSeedChangesColors(t *testing.T) {
	a := GenerateAvatarInitials(AvatarInitialsOptions{Text: "AB", Size: 64, Palette: "soft", Seed: "alpha"})
	b := GenerateAvatarInitials(AvatarInitialsOptions{Text: "AB", Size: 64, Palette: "soft", Seed: "beta"})
	if a == b {
		t.Fatal("expected different SVG for different seeds")
	}
	if !strings.Contains(a, "<svg") || !strings.Contains(b, "AB") {
		t.Fatal("invalid svg")
	}
}

func TestVectorSeedChangesOutput(t *testing.T) {
	a := GenerateAvatarVector(AvatarVectorOptions{Kind: "man", Size: 96, Seed: "one", Style: "round"})
	b := GenerateAvatarVector(AvatarVectorOptions{Kind: "man", Size: 96, Seed: "two", Style: "round"})
	if a == b {
		t.Fatal("expected different SVG for different seeds")
	}
}
