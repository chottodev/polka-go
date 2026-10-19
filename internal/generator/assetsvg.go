package generator

import (
	"path"
	"regexp"
	"strings"
)

var (
	svgInnerRe     = regexp.MustCompile(`(?is)<svg[^>]*>([\s\S]*)</svg>`)
	xmlDeclRe      = regexp.MustCompile(`(?i)<\?xml[^?]*\?>\s*`)
	sodipodiNamed  = regexp.MustCompile(`(?is)<sodipodi:namedview\b[\s\S]*?/>`)
	inkscapeSelf   = regexp.MustCompile(`(?is)<inkscape:[\w:-]+\b[\s\S]*?/>`)
	emptyDefsRe    = regexp.MustCompile(`(?is)<defs\b[^>]*/>\s*`)
	sodipodiAttrRe = regexp.MustCompile(`(?i)\s+sodipodi:[^\s=]+="[^"]*"`)
	inkscapeAttrRe = regexp.MustCompile(`(?i)\s+inkscape:[^\s=]+="[^"]*"`)
	idAttrRe       = regexp.MustCompile(`\bid="([^"]*)"`)
)

func readSvgInnerFrom(assetsSubdir, rel string) string {
	full := path.Join("avatar", "assets", assetsSubdir, rel)
	raw, err := avatarAssets.ReadFile(full)
	if err != nil {
		return ""
	}
	s := xmlDeclRe.ReplaceAllString(string(raw), "")
	m := svgInnerRe.FindStringSubmatch(s)
	if m == nil {
		return ""
	}
	return strings.TrimSpace(m[1])
}

func stripInkscapeSodipodiMarkup(inner string) string {
	s := inner
	s = sodipodiNamed.ReplaceAllString(s, "")
	s = inkscapeSelf.ReplaceAllString(s, "")
	s = emptyDefsRe.ReplaceAllString(s, "")
	s = sodipodiAttrRe.ReplaceAllString(s, "")
	s = inkscapeAttrRe.ReplaceAllString(s, "")
	return s
}

func suffixIds(xml, suf string) string {
	return idAttrRe.ReplaceAllStringFunc(xml, func(m string) string {
		sub := idAttrRe.FindStringSubmatch(m)
		if len(sub) < 2 {
			return m
		}
		return `id="` + sub[1] + suf + `"`
	})
}

func mirrorX1024(inner string) string {
	return `<g transform="translate(1024,0) scale(-1,1)">` + inner + `</g>`
}

func wrapTransform(inner, transform string) string {
	if transform == "" {
		return inner
	}
	return `<g transform="` + transform + `">` + inner + `</g>`
}

func buildMirroredScleraGroup(idPrefix, scleraInner, scleraTransform string) string {
	left := wrapTransform(scleraInner, scleraTransform)
	right := mirrorX1024(wrapTransform(suffixIds(scleraInner, "-r"), scleraTransform))
	return `<g id="` + idPrefix + `-eyes"><g id="` + idPrefix + `-sclera-left">` + left + `</g>` + right + `</g>`
}
