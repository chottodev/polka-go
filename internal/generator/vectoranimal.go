package generator

import "strconv"

// AvatarVectorAnimalOptions configures GenerateAvatarVectorAnimal.
type AvatarVectorAnimalOptions struct {
	Kind    string
	Size    interface{}
	Palette string
	Style   string
	Bg, Fg  string
	Seed    string
}

func getKindBySeed(kind, seed string) string {
	if kind != "" && kind != "animal" {
		return kind
	}
	idx := seededIndex(seed, len(AvatarAnimalKindKeys))
	return AvatarAnimalKindKeys[idx]
}

func animalFace(kind string) string {
	switch kind {
	case "cat":
		return `<path d="M17 24l6-7 5 7M47 24l-6-7-5 7"/><circle cx="24" cy="33" r="2"/><circle cx="40" cy="33" r="2"/><path d="M28 41h8l-4 4z"/>`
	case "dog":
		return `<path d="M18 25c-3 2-5 6-4 10M46 25c3 2 5 6 4 10"/><circle cx="24" cy="33" r="2"/><circle cx="40" cy="33" r="2"/><ellipse cx="32" cy="40" rx="4" ry="3"/>`
	case "panda":
		return `<circle cx="23" cy="31" r="6"/><circle cx="41" cy="31" r="6"/><circle cx="24" cy="33" r="2" fill="#fff"/><circle cx="40" cy="33" r="2" fill="#fff"/><ellipse cx="32" cy="40" rx="4" ry="3"/>`
	case "fox":
		return `<path d="M18 24l5-7 4 6M46 24l-5-7-4 6"/><circle cx="24" cy="33" r="2"/><circle cx="40" cy="33" r="2"/><path d="M28 40h8l-4 5z"/>`
	default:
		return `<circle cx="24" cy="33" r="2"/><circle cx="40" cy="33" r="2"/>`
	}
}

// GenerateAvatarVectorAnimal renders an animal avatar (asset-based or simple fallback).
func GenerateAvatarVectorAnimal(opts AvatarVectorAnimalOptions) string {
	s := parseSize(opts.Size, 32, 1024, 48)
	p := pickPalette(opts.Palette)
	st := pickStyle(opts.Style)
	face := getKindBySeed(opts.Kind, opts.Seed)
	switch face {
	case "panda":
		return GenerateAvatarVectorPanda(AvatarVectorAssetOptions{Size: opts.Size, Bg: opts.Bg, Seed: opts.Seed})
	case "fox":
		return GenerateAvatarVectorFox(AvatarVectorAssetOptions{Size: opts.Size, Bg: opts.Bg, Seed: opts.Seed})
	case "dog":
		return GenerateAvatarVectorDog(AvatarVectorAssetOptions{Size: opts.Size, Bg: opts.Bg, Seed: opts.Seed})
	case "cat":
		return GenerateAvatarVectorCat(AvatarVectorAssetOptions{Size: opts.Size, Bg: opts.Bg, Seed: opts.Seed})
	}

	bgHex := normalizeHex(opts.Bg, p.Bg)
	fgHex := normalizeHex(opts.Fg, p.Fg)
	body := "#" + p.A1
	if st == "duotone" {
		body = "#" + p.A2
	}
	stroke := `fill="#` + fgHex + `"`
	if st == "outline" {
		stroke = `stroke="#` + fgHex + `" stroke-width="3" fill="none"`
	}

	return `<svg xmlns="http://www.w3.org/2000/svg" width="` + strconv.Itoa(s) + `" height="` + strconv.Itoa(s) + `" viewBox="0 0 64 64">
  <rect width="64" height="64" rx="32" fill="#` + bgHex + `"/>
  <circle cx="32" cy="35" r="19" fill="` + body + `"/>
  <g ` + stroke + `>
    ` + animalFace(face) + `
  </g>
</svg>`
}
