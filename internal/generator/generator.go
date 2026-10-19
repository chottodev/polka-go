package generator

import (
	"regexp"
	"strings"
)

// AvatarVectorAssetOptions configures asset-based vector avatars.
type AvatarVectorAssetOptions struct {
	Size interface{}
	Bg   string
	Seed string
}

// AvatarVectorOptions configures GenerateAvatarVector.
type AvatarVectorOptions struct {
	Kind    string
	Size    interface{}
	Palette string
	Style   string
	Bg, Fg  string
	Seed    string
}

// GenerateAvatar is an alias for GenerateAvatarInitials with Initials field.
func GenerateAvatar(initials string, bg, fg string, size interface{}, fontSize interface{}, family, palette string) string {
	return GenerateAvatarInitials(AvatarInitialsOptions{
		Text: initials, Bg: bg, Fg: fg, Size: size, Font: fontSize, Family: family, Palette: palette,
	})
}

func applyRoundStyle(svg, style string) string {
	if style != "round" || svg == "" {
		return svg
	}
	openTagRe := regexp.MustCompile(`^<svg\b[^>]*>`)
	loc := openTagRe.FindStringIndex(svg)
	if loc == nil {
		return svg
	}
	openTag := svg[loc[0]:loc[1]]
	inner := openTagRe.ReplaceAllString(svg, "")
	inner = regexp.MustCompile(`</svg>\s*$`).ReplaceAllString(inner, "")
	return openTag + `<defs><clipPath id="avatarRoundClip"><circle cx="50%" cy="50%" r="50%"/></clipPath></defs><g clip-path="url(#avatarRoundClip)">` + inner + `</g></svg>`
}

// GenerateAvatarVector dispatches to the appropriate vector avatar generator.
func GenerateAvatarVector(opts AvatarVectorOptions) string {
	kind := opts.Kind
	apply := func(svg string) string { return applyRoundStyle(svg, opts.Style) }

	if kind == "man" {
		return apply(GenerateAvatarVectorMan(AvatarVectorAssetOptions{Size: opts.Size, Bg: opts.Bg, Seed: opts.Seed}))
	}
	if kind == "female" {
		return apply(GenerateAvatarVectorFemale(AvatarVectorAssetOptions{Size: opts.Size, Bg: opts.Bg, Seed: opts.Seed}))
	}
	for _, hk := range AvatarHumanKindKeys {
		if hk == kind {
			return apply(GenerateAvatarVectorHuman(AvatarVectorHumanOptions{
				Kind: kind, Size: opts.Size, Palette: opts.Palette, Style: opts.Style,
				Bg: opts.Bg, Fg: opts.Fg, Seed: opts.Seed,
			}))
		}
	}
	return apply(GenerateAvatarVectorAnimal(AvatarVectorAnimalOptions{
		Kind: kind, Size: opts.Size, Palette: opts.Palette, Style: opts.Style,
		Bg: opts.Bg, Fg: opts.Fg, Seed: opts.Seed,
	}))
}

// SeededIndex exposes deterministic index selection for tests and callers.
func SeededIndex(seed string, length int) int {
	return seededIndex(seed, length)
}

// HashSeed exposes FNV-1a-style seed hashing matching the JS implementation.
func HashSeed(str string) uint32 {
	return hashSeed(str)
}

func containsKind(keys []string, kind string) bool {
	for _, k := range keys {
		if k == kind {
			return true
		}
	}
	return false
}

// KindIsHuman reports whether kind is in AvatarHumanKindKeys.
func KindIsHuman(kind string) bool {
	return containsKind(AvatarHumanKindKeys, kind)
}

// NormalizeKind lowercases kind string.
func NormalizeKind(kind string) string {
	return strings.ToLower(kind)
}
