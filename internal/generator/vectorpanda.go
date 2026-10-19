package generator

import (
	"regexp"
	"strconv"
)

const (
	pandaGlassesTransform = "translate(512, 488) scale(1.50) translate(-256, -256)"
	pandaHatTransform     = "translate(500, 245) scale(0.75) rotate(4) translate(-256, -256)"
)

var pandaGlassesFillPresets = []string{
	"0cc6c2", "e86b9a", "6b8ce8", "c9a227", "5a7d5a", "8b5cf6", "f97316", "14b8a6",
	"64748b", "dc2626", "7c3aed", "059669",
}

var pandaHatFillPresets = []string{
	"6468e8", "b45309", "0d9488", "be185d", "4f46e5", "ca8a04", "15803d", "c2410c",
	"7e22ce", "0369a1", "a16207", "9f1239",
}

var pandaMouthFiles = []string{"mouths/mouth-02.svg", "mouths/mouth-03.svg", "mouths/mouth-04.svg"}

type pandaEyePreset struct {
	id, sclera, scleraTransform string
}

var pandaEyePresets = []pandaEyePreset{
	{id: "sclera02", sclera: "eyes/sclera-02.svg"},
	{id: "sclera01", sclera: "eyes/sclera-01.svg", scleraTransform: "translate(354, 458)"},
}

var pandaBGPresets = []string{
	"c8dce8", "e8d8e5", "b0c7b6", "e8e0c6", "d8c8e8", "c8d8e8", "e0c8d0", "d0dfcc",
	"c8cce8", "e8d8c6", "d8c8e8", "c8e8e0", "e8d8c8", "d0d8e8", "c8e0d8", "e0d8c8",
}

var pandaFillFirstRe = regexp.MustCompile(`fill="#[^"]*"`)

func readPandaSvg(rel string) string { return readSvgInnerFrom("panda", rel) }

func mirrorXPanda(inner string) string {
	return `<g transform="translate(1024,0) scale(-1,1)">` + inner + `</g>`
}

func wrapScleraTo1024(inner, transform string) string {
	if transform == "" {
		return inner
	}
	return `<g transform="` + transform + `">` + inner + `</g>`
}

func buildPandaEyesGroup(preset pandaEyePreset) string {
	scleraInner := readPandaSvg(preset.sclera)
	t := preset.scleraTransform
	left := wrapScleraTo1024(scleraInner, t)
	right := mirrorXPanda(wrapScleraTo1024(suffixIds(scleraInner, "-r"), t))
	return `<g id="panda-eyes"><g id="panda-sclera-left">` + left + `</g>` + right + `</g>`
}

func pandaBgHex(seed, explicitBg string) string {
	fallback := pandaBGPresets[seededIndex(seed+":panda-bg", len(pandaBGPresets))]
	return normalizeHex(explicitBg, fallback)
}

func pickPandaAccessoryRel(seed string) string {
	r := seededIndex(seed+":panda-acc", 100)
	if r < 48 {
		return ""
	}
	if r < 58 {
		return "accessories/blush-01.svg"
	}
	if r < 68 {
		return "accessories/leaf-01.svg"
	}
	if r < 78 {
		return "accessories/glasses-01.svg"
	}
	return "accessories/hat-01.svg"
}

func pickPandaGlassesFillHex(seed string) string {
	return pandaGlassesFillPresets[seededIndex(seed+":panda-glasses-fill", len(pandaGlassesFillPresets))]
}

func paintPandaGlassesInner(inner, fillHex string) string {
	return replaceFirst(pandaFillFirstRe, inner, `fill="#`+fillHex+`"`)
}

func pickPandaHatFillHex(seed string) string {
	return pandaHatFillPresets[seededIndex(seed+":panda-hat-fill", len(pandaHatFillPresets))]
}

func paintPandaHatInner(inner, fillHex string) string {
	return replaceCI(inner, `fill="#6468e8"`, `fill="#`+fillHex+`"`)
}

// GenerateAvatarVectorPanda renders a panda vector avatar SVG.
func GenerateAvatarVectorPanda(opts AvatarVectorAssetOptions) string {
	seed := opts.Seed
	s := parseSize(opts.Size, 32, 1024, 128)
	bgHex := pandaBgHex(seed, opts.Bg)

	baseInner := stripInkscapeSodipodiMarkup(readPandaSvg("base.svg"))
	eyePreset := pandaEyePresets[seededIndex(seed+":panda-eyes", len(pandaEyePresets))]
	eyes := buildPandaEyesGroup(eyePreset)
	mouthRel := pandaMouthFiles[seededIndex(seed+":panda-mouth", len(pandaMouthFiles))]
	mouthInner := readPandaSvg(mouthRel)

	accRel := pickPandaAccessoryRel(seed)
	var accInner string
	if accRel != "" {
		accInner = readPandaSvg(accRel)
	}

	var blushBlock, glassesBlock, leafBlock, hatBlock string
	if accRel == "accessories/blush-01.svg" && accInner != "" {
		blushBlock = `<g id="panda-blush">` + accInner + `</g>`
	}
	if accRel == "accessories/glasses-01.svg" && accInner != "" {
		glassesInner := paintPandaGlassesInner(accInner, pickPandaGlassesFillHex(seed))
		glassesBlock = `<g id="panda-glasses" transform="` + pandaGlassesTransform + `">` + glassesInner + `</g>`
	}
	if accRel == "accessories/leaf-01.svg" && accInner != "" {
		leafBlock = `<g id="panda-accessory">` + accInner + `</g>`
	}
	if accRel == "accessories/hat-01.svg" && accInner != "" {
		hatInner := paintPandaHatInner(accInner, pickPandaHatFillHex(seed))
		hatBlock = `<g id="panda-hat" transform="` + pandaHatTransform + `">` + hatInner + `</g>`
	}

	return `<svg xmlns="http://www.w3.org/2000/svg" width="` + strconv.Itoa(s) + `" height="` + strconv.Itoa(s) + `" viewBox="0 0 1024 1024">
  <rect width="1024" height="1024" fill="#` + bgHex + `"/>
  <g id="panda-base">` + baseInner + `</g>
  ` + blushBlock + `
  ` + eyes + `
  ` + glassesBlock + `
  <g id="panda-mouth">` + mouthInner + `</g>
  ` + leafBlock + `
  ` + hatBlock + `
</svg>`
}
