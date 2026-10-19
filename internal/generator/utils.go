package generator

import (
	"math"
	"regexp"
	"strconv"
	"strings"
)

func clamp(val, min, max int) int {
	if val < min {
		return min
	}
	if val > max {
		return max
	}
	return val
}

func escapeXml(str string) string {
	s := str
	s = strings.ReplaceAll(s, "&", "&amp;")
	s = strings.ReplaceAll(s, "<", "&lt;")
	s = strings.ReplaceAll(s, ">", "&gt;")
	s = strings.ReplaceAll(s, `"`, "&quot;")
	s = strings.ReplaceAll(s, "'", "&apos;")
	return s
}

func normalizeHex(raw, fallback string) string {
	candidate := strings.TrimSpace(strings.TrimPrefix(raw, "#"))
	candidate = strings.ToLower(candidate)
	if matched, _ := regexp.MatchString(`^[0-9a-f]{3}([0-9a-f]{3})?$`, candidate); matched {
		return candidate
	}
	return fallback
}

func parseSize(size interface{}, min, max, fallback int) int {
	if size == nil {
		return fallback
	}
	switch v := size.(type) {
	case int:
		if v == 0 {
			return fallback
		}
		return clamp(v, min, max)
	case int64:
		if v == 0 {
			return fallback
		}
		return clamp(int(v), min, max)
	case float64:
		if v == 0 {
			return fallback
		}
		return clamp(int(v), min, max)
	case string:
		if strings.TrimSpace(v) == "" {
			return fallback
		}
		n, err := strconv.ParseInt(strings.TrimSpace(v), 10, 64)
		if err != nil {
			return fallback
		}
		return clamp(int(n), min, max)
	default:
		return fallback
	}
}

func pickPalette(paletteKey string) avatarPalette {
	key := "soft"
	for _, k := range AvatarPaletteKeys {
		if k == paletteKey {
			key = paletteKey
			break
		}
	}
	return avatarPalettes[key]
}

func pickStyle(styleKey string) string {
	k := styleKey
	if k == "round" || k == "square" {
		return "flat"
	}
	for _, s := range AvatarStyleKeys {
		if s == k {
			return k
		}
	}
	return "flat"
}

func hashSeed(str string) uint32 {
	h := uint32(2166136261)
	s := str
	for i := 0; i < len(s); i++ {
		h ^= uint32(s[i])
		h *= 16777619
	}
	return h
}

func seededIndex(seed string, length int) int {
	if length == 0 {
		return 0
	}
	return int(hashSeed(seed) % uint32(length))
}

var initialsFontFamilyStacks = map[string]string{
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

// AvatarFamilyKeys lists allowed initials/avatar font family keys (stable order).
var AvatarFamilyKeys = []string{
	"system", "arial", "georgia", "times", "courier", "verdana", "trebuchet",
	"tahoma", "palatino", "garamond", "lucida", "impact", "comic", "segoe", "helvetica",
}

func resolveInitialsFamily(family string) string {
	k := strings.ToLower(family)
	if stack, ok := initialsFontFamilyStacks[k]; ok {
		return stack
	}
	return initialsFontFamilyStacks["arial"]
}

func replaceCI(s, old, new string) string {
	re := regexp.MustCompile("(?i)" + regexp.QuoteMeta(old))
	return re.ReplaceAllString(s, new)
}

func replaceFirst(re *regexp.Regexp, s, repl string) string {
	loc := re.FindStringIndex(s)
	if loc == nil {
		return s
	}
	return s[:loc[0]] + repl + s[loc[1]:]
}

func hexToRgb(hex string) (r, g, b int) {
	h := strings.TrimPrefix(hex, "#")
	if len(h) == 3 {
		h = string([]byte{h[0], h[0], h[1], h[1], h[2], h[2]})
	}
	n, _ := strconv.ParseInt(h, 16, 64)
	return int((n >> 16) & 255), int((n >> 8) & 255), int(n & 255)
}

func rgbToHsl(r, g, b int) (h, s, l float64) {
	rf, gf, bf := float64(r)/255, float64(g)/255, float64(b)/255
	max := math.Max(rf, math.Max(gf, bf))
	min := math.Min(rf, math.Min(gf, bf))
	l = (max + min) / 2
	if max == min {
		return 0, 0, l * 100
	}
	d := max - min
	if l > 0.5 {
		s = d / (2 - max - min)
	} else {
		s = d / (max + min)
	}
	switch max {
	case rf:
		h = (gf - bf) / d
		if gf < bf {
			h += 6
		}
		h /= 6
	case gf:
		h = ((bf-rf)/d + 2) / 6
	default:
		h = ((rf-gf)/d + 4) / 6
	}
	return h * 360, s * 100, l * 100
}

func hslToHex(h, s, l float64) string {
	h = math.Mod(h, 360)
	if h < 0 {
		h += 360
	}
	if s < 0 {
		s = 0
	}
	if s > 100 {
		s = 100
	}
	if l < 0 {
	 l = 0
	}
	if l > 100 {
		l = 100
	}
	s /= 100
	l /= 100
	a := s * math.Min(l, 1-l)
	f := func(n float64) string {
		k := math.Mod(n+h/30, 12)
		color := l - a*math.Max(math.Min(k-3, math.Min(9-k, 1)), -1)
		return strconv.FormatInt(int64(math.Round(255*color)), 16)
	}
	r := f(0)
	g := f(8)
	b := f(4)
	if len(r) == 1 {
		r = "0" + r
	}
	if len(g) == 1 {
		g = "0" + g
	}
	if len(b) == 1 {
		b = "0" + b
	}
	return r + g + b
}

type hairShades struct {
	base, mid, light string
	dark             string
}

func buildHairShadesMan(baseHex string) (base, mid, light string) {
	r, g, b := hexToRgb(baseHex)
	h, s, l := rgbToHsl(r, g, b)
	return baseHex, hslToHex(h, s, l+3), hslToHex(h, s, l+18)
}

func buildHairShadesFemale(baseHex string) hairShades {
	r, g, b := hexToRgb(baseHex)
	h, s, l := rgbToHsl(r, g, b)
	darkL := l - 8
	if darkL < 0 {
		darkL = 0
	}
	return hairShades{
		base:  baseHex,
		mid:   hslToHex(h, s, l+3),
		light: hslToHex(h, s, l+18),
		dark:  hslToHex(h, s, darkL),
	}
}

func clamp8(n int) int {
	if n < 0 {
		return 0
	}
	if n > 255 {
		return 255
	}
	return n
}

func hex2(n int) string {
	return fmtHex2(clamp8(n))
}

func fmtHex2(n int) string {
	s := strconv.FormatInt(int64(n), 16)
	if len(s) == 1 {
		return "0" + s
	}
	return s
}

func darkenHex(hex string, amount int) string {
	h := strings.ToLower(strings.TrimPrefix(hex, "#"))
	if matched, _ := regexp.MatchString(`^[0-9a-f]{6}$`, h); !matched {
		return h
	}
	r, _ := strconv.ParseInt(h[0:2], 16, 64)
	g, _ := strconv.ParseInt(h[2:4], 16, 64)
	b, _ := strconv.ParseInt(h[4:6], 16, 64)
	if amount == 0 {
		amount = 38
	}
	return hex2(int(r)-amount) + hex2(int(g)-amount) + hex2(int(b)-amount)
}

func lightenHex(hex string, amount int) string {
	h := strings.ToLower(strings.TrimPrefix(hex, "#"))
	if matched, _ := regexp.MatchString(`^[0-9a-f]{6}$`, h); !matched {
		return h
	}
	r, _ := strconv.ParseInt(h[0:2], 16, 64)
	g, _ := strconv.ParseInt(h[2:4], 16, 64)
	b, _ := strconv.ParseInt(h[4:6], 16, 64)
	if amount == 0 {
		amount = 38
	}
	return hex2(int(r)+amount) + hex2(int(g)+amount) + hex2(int(b)+amount)
}
