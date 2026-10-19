package generator

import "strconv"

// PatternOptions configures GeneratePattern.
type PatternOptions struct {
	Width, Height interface{}
	Bg, Fg        string
	Pattern       string
	Rounded       interface{}
}

// GeneratePattern renders a tiled pattern placeholder SVG.
func GeneratePattern(opts PatternOptions) string {
	width := clamp(parseSize(opts.Width, 1, 4000, 300), 1, 4000)
	height := clamp(parseSize(opts.Height, 1, 4000, 300), 1, 4000)
	bg := opts.Bg
	if bg == "" {
		bg = "eeeeee"
	}
	fg := opts.Fg
	if fg == "" {
		fg = "cccccc"
	}
	pattern := opts.Pattern
	if pattern == "" {
		pattern = "grid"
	}
	rounded := parseSize(opts.Rounded, 0, 10000, 0)
	spacing := 20

	var patternDef string
	switch pattern {
	case "dots":
		r := 2
		half := float64(spacing) / 2
		patternDef = `<defs><pattern id="pat" x="0" y="0" width="` + strconv.Itoa(spacing) + `" height="` + strconv.Itoa(spacing) + `" patternUnits="userSpaceOnUse">
        <circle cx="` + strconv.FormatFloat(half, 'f', -1, 64) + `" cy="` + strconv.FormatFloat(half, 'f', -1, 64) + `" r="` + strconv.Itoa(r) + `" fill="#` + fg + `"/>
      </pattern></defs>`
	case "lines":
		patternDef = `<defs><pattern id="pat" x="0" y="0" width="` + strconv.Itoa(spacing) + `" height="` + strconv.Itoa(spacing) + `" patternUnits="userSpaceOnUse">
        <line x1="0" y1="` + strconv.Itoa(spacing) + `" x2="` + strconv.Itoa(spacing) + `" y2="0" stroke="#` + fg + `" stroke-width="1"/>
      </pattern></defs>`
	case "crosshatch":
		patternDef = `<defs><pattern id="pat" x="0" y="0" width="` + strconv.Itoa(spacing) + `" height="` + strconv.Itoa(spacing) + `" patternUnits="userSpaceOnUse">
        <line x1="0" y1="0" x2="` + strconv.Itoa(spacing) + `" y2="` + strconv.Itoa(spacing) + `" stroke="#` + fg + `" stroke-width="0.5"/>
        <line x1="` + strconv.Itoa(spacing) + `" y1="0" x2="0" y2="` + strconv.Itoa(spacing) + `" stroke="#` + fg + `" stroke-width="0.5"/>
      </pattern></defs>`
	default:
		patternDef = `<defs><pattern id="pat" x="0" y="0" width="` + strconv.Itoa(spacing) + `" height="` + strconv.Itoa(spacing) + `" patternUnits="userSpaceOnUse">
        <path d="M ` + strconv.Itoa(spacing) + ` 0 L 0 0 0 ` + strconv.Itoa(spacing) + `" fill="none" stroke="#` + fg + `" stroke-width="0.5"/>
      </pattern></defs>`
	}

	return `<svg xmlns="http://www.w3.org/2000/svg" width="` + strconv.Itoa(width) + `" height="` + strconv.Itoa(height) + `" viewBox="0 0 ` + strconv.Itoa(width) + ` ` + strconv.Itoa(height) + `">
  ` + patternDef + `
  <rect width="` + strconv.Itoa(width) + `" height="` + strconv.Itoa(height) + `" fill="#` + bg + `" rx="` + strconv.Itoa(rounded) + `" ry="` + strconv.Itoa(rounded) + `"/>
  <rect width="` + strconv.Itoa(width) + `" height="` + strconv.Itoa(height) + `" fill="url(#pat)" rx="` + strconv.Itoa(rounded) + `" ry="` + strconv.Itoa(rounded) + `"/>
</svg>`
}
