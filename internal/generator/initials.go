package generator

import (
	"strconv"
	"strings"
)

// AvatarInitialsOptions configures GenerateAvatarInitials.
type AvatarInitialsOptions struct {
	Text    string
	Size    interface{}
	Bg      string
	Fg      string
	Font    interface{}
	Family  string
	Palette string
	Seed    string
}

// GenerateAvatarInitials renders a circular initials avatar SVG.
func GenerateAvatarInitials(opts AvatarInitialsOptions) string {
	s := parseSize(opts.Size, 32, 1024, 48)
	p := pickPalette(opts.Palette)
	initials := strings.ToUpper(strings.TrimSpace(opts.Text))
	if initials == "" {
		initials = "?"
	}
	runes := []rune(initials)
	if len(runes) > 3 {
		initials = string(runes[:3])
	}

	fallbackBg := p.A2
	fallbackFg := p.Fg
	if opts.Seed != "" {
		accents := []string{p.A1, p.A2, p.A3, p.Bg}
		fallbackBg = accents[seededIndex(opts.Seed+":initials-bg", len(accents))]
		fgs := []string{p.Fg, p.A3, p.A2}
		fallbackFg = fgs[seededIndex(opts.Seed+":initials-fg", len(fgs))]
	}
	bgHex := normalizeHex(opts.Bg, fallbackBg)
	fgHex := normalizeHex(opts.Fg, fallbackFg)
	fontSize := int(float64(s) * 0.42)
	if opts.Font != nil {
		if n := parseSize(opts.Font, 1, 1024, 0); n > 0 {
			fontSize = n
		}
	}
	fontFamily := resolveInitialsFamily(opts.Family)
	r := float64(s) / 2

	return `<svg xmlns="http://www.w3.org/2000/svg" width="` + strconv.Itoa(s) + `" height="` + strconv.Itoa(s) + `" viewBox="0 0 ` + strconv.Itoa(s) + ` ` + strconv.Itoa(s) + `">
  <circle cx="` + strconv.FormatFloat(r, 'f', -1, 64) + `" cy="` + strconv.FormatFloat(r, 'f', -1, 64) + `" r="` + strconv.FormatFloat(r, 'f', -1, 64) + `" fill="#` + bgHex + `"/>
  <text x="50%" y="50%" dominant-baseline="central" text-anchor="middle"
        font-family='` + fontFamily + `' font-weight="700" font-size="` + strconv.Itoa(fontSize) + `" fill="#` + fgHex + `">` + escapeXml(initials) + `</text>
</svg>`
}
