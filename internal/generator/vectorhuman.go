package generator

import "strconv"

// AvatarVectorHumanOptions configures GenerateAvatarVectorHuman.
type AvatarVectorHumanOptions struct {
	Kind    string
	Size    interface{}
	Palette string
	Style   string
	Bg, Fg  string
	Seed    string
}

func styleStroke(style, color string) string {
	switch style {
	case "outline":
		return `fill="none" stroke="` + color + `" stroke-width="4"`
	case "duotone":
		return `fill="` + color + `" opacity="0.88"`
	default:
		return `fill="` + color + `"`
	}
}

// GenerateAvatarVectorHuman renders a simple human silhouette avatar.
func GenerateAvatarVectorHuman(opts AvatarVectorHumanOptions) string {
	s := parseSize(opts.Size, 32, 1024, 48)
	p := pickPalette(opts.Palette)
	st := pickStyle(opts.Style)
	bgHex := normalizeHex(opts.Bg, p.Bg)
	fgHex := normalizeHex(opts.Fg, p.Fg)
	accentA, accentB, tone := p.A1, p.A2, p.A3
	variant := len(opts.Seed) % 2

	headFill := "#" + tone
	if st == "duotone" {
		headFill = "#" + accentA
	}
	bodyFill := "#" + accentA
	if st == "duotone" {
		bodyFill = "#" + accentB
	}
	line := "#" + fgHex

	var hairPath string
	if opts.Kind == "female" {
		hairPath = `<path d="M32 20c10 0 17 8 17 17v6H15v-6c0-9 7-17 17-17z" ` + styleStroke(st, line) + `/>`
	} else {
		hairPath = `<path d="M18 28c0-9 7-16 14-16 8 0 14 7 14 16v5H18z" ` + styleStroke(st, line) + `/>`
	}

	var accessory string
	if variant == 1 {
		accessory = `<circle cx="32" cy="55" r="3" fill="#` + accentB + `"/>`
	} else {
		accessory = `<rect x="28" y="52" width="8" height="6" rx="2" fill="#` + accentB + `"/>`
	}

	return `<svg xmlns="http://www.w3.org/2000/svg" width="` + strconv.Itoa(s) + `" height="` + strconv.Itoa(s) + `" viewBox="0 0 64 64">
  <rect width="64" height="64" rx="32" fill="#` + bgHex + `"/>
  ` + hairPath + `
  <circle cx="32" cy="28" r="12" fill="` + headFill + `" />
  <path d="M14 58c1-12 9-19 18-19s17 7 18 19H14z" fill="` + bodyFill + `" />
  ` + accessory + `
</svg>`
}
