package generator

import (
	"strconv"
	"strings"
)

var wxhFontFamilyStacks = map[string]string{
	"system":    "system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif",
	"arial":     "Arial, Helvetica, sans-serif",
	"georgia":   "Georgia, Times New Roman, Times, serif",
	"times":     "Times New Roman, Times, serif",
	"courier":   "Courier New, Courier, monospace",
	"verdana":   "Verdana, Geneva, sans-serif",
	"trebuchet": "Trebuchet MS, Helvetica, sans-serif",
	"tahoma":    "Tahoma, Geneva, sans-serif",
	"palatino":  "Palatino, Palatino Linotype, serif",
	"garamond":  "Garamond, serif",
	"lucida":    "Lucida Console, Lucida Sans Typewriter, monospace",
	"impact":    "Impact, Haettenschweiler, Arial Narrow, sans-serif",
	"comic":     "Comic Sans MS, Comic Sans, cursive",
	"segoe":     "Segoe UI, Roboto, Helvetica, Arial, sans-serif",
	"helvetica": "Helvetica, Arial, sans-serif",
}

// WxhFontFamilyKeys lists placeholder font family preset keys.
var WxhFontFamilyKeys = []string{
	"system", "arial", "georgia", "times", "courier", "verdana", "trebuchet",
	"tahoma", "palatino", "garamond", "lucida", "impact", "comic", "segoe", "helvetica",
}

func resolvePlaceholderFontFamily(family string) string {
	if family == "" {
		return wxhFontFamilyStacks["arial"]
	}
	k := strings.ToLower(family)
	if stack, ok := wxhFontFamilyStacks[k]; ok {
		return stack
	}
	return wxhFontFamilyStacks["arial"]
}

func autoFontSize(width, height int, text string) int {
	maxDim := width
	if height < maxDim {
		maxDim = height
	}
	charCount := len([]rune(text))
	if charCount == 0 {
		charCount = 1
	}
	fs := int(float64(maxDim) / (float64(charCount)*0.6 + 1))
	return clamp(fs, 10, int(float64(maxDim)*0.8))
}

// PlaceholderOptions configures GeneratePlaceholder.
type PlaceholderOptions struct {
	Width, Height   interface{}
	Bg, Fg, Text    string
	Rounded         interface{}
	FontSize        interface{}
	Family          string
	Gradient        string
	MaxWidth        interface{}
	MaxHeight       interface{}
}

// GeneratePlaceholder renders a basic dimension placeholder SVG.
func GeneratePlaceholder(opts PlaceholderOptions) string {
	wMax := parseSize(opts.MaxWidth, 1, 100000, 4000)
	hMax := parseSize(opts.MaxHeight, 1, 100000, 4000)
	width := clamp(parseSize(opts.Width, 1, wMax, 300), 1, wMax)
	height := clamp(parseSize(opts.Height, 1, hMax, 300), 1, hMax)
	bg := opts.Bg
	if bg == "" {
		bg = "cccccc"
	}
	fg := opts.Fg
	if fg == "" {
		fg = "333333"
	}
	text := opts.Text
	if text == "" {
		text = strconv.Itoa(width) + "×" + strconv.Itoa(height)
	}
	rounded := parseSize(opts.Rounded, 0, 10000, 0)
	fontSize := parseSize(opts.FontSize, 1, 10000, autoFontSize(width, height, text))
	fontStack := resolvePlaceholderFontFamily(opts.Family)

	var bgFill, defs string
	if opts.Gradient != "" {
		parts := strings.Split(opts.Gradient, "-")
		dir := "h"
		if len(parts) > 0 && parts[0] != "" {
			dir = parts[0]
		}
		c1 := bg
		c2 := bg
		if len(parts) > 1 && parts[1] != "" {
			c1 = parts[1]
		}
		if len(parts) > 2 && parts[2] != "" {
			c2 = parts[2]
		}
		x2, y2 := "1", "0"
		if dir == "v" {
			x2, y2 = "0", "1"
		}
		defs = `<defs><linearGradient id="grad" x1="0" y1="0" x2="` + x2 + `" y2="` + y2 + `">
      <stop offset="0%" stop-color="#` + c1 + `"/>
      <stop offset="100%" stop-color="#` + c2 + `"/>
    </linearGradient></defs>`
		bgFill = "url(#grad)"
	} else {
		bgFill = "#" + bg
	}

	return `<svg xmlns="http://www.w3.org/2000/svg" width="` + strconv.Itoa(width) + `" height="` + strconv.Itoa(height) + `" viewBox="0 0 ` + strconv.Itoa(width) + ` ` + strconv.Itoa(height) + `">
  ` + defs + `
  <rect width="` + strconv.Itoa(width) + `" height="` + strconv.Itoa(height) + `" fill="` + bgFill + `" rx="` + strconv.Itoa(rounded) + `" ry="` + strconv.Itoa(rounded) + `"/>
  <text x="50%" y="50%" dominant-baseline="central" text-anchor="middle"
        font-family='` + fontStack + `' font-size="` + strconv.Itoa(fontSize) + `" fill="#` + fg + `">` + escapeXml(text) + `</text>
</svg>`
}
