package generator

import (
	"regexp"
	"strconv"
)

var foxBGPresets = catBGPresets

type foxAccessoryPreset struct {
	kind, rel, transform string
}

var foxAccessoryPresets = []foxAccessoryPreset{
	{kind: "glasses", rel: "accessories/glasses-01.svg", transform: "translate(512, 512) scale(1.50) translate(-256, -256)"},
	{kind: "glasses", rel: "accessories/glasses-02.svg", transform: "translate(0, 4) translate(512, 512) scale(0.92) translate(-512, -512)"},
	{kind: "bowtie", rel: "accessories/bowtie-01.svg", transform: "translate(512, 820) scale(0.62) translate(-256, -256)"},
	{kind: "bandana", rel: "accessories/bandana-01.svg", transform: "translate(560, 853) scale(0.34) translate(-776.5, -336)"},
}

var foxGlassesFillPresets = []string{
	"0cc6c2", "ed4a87", "6b8ce8", "614b04", "5a7d5a", "8b5cf6", "5e2700", "14b8a6",
	"64748b", "dc2626", "7c3aed", "059669",
}

type foxEyePreset struct {
	id, sclera, scleraTransform string
}

var foxEyePresets = []foxEyePreset{
	{id: "sclera01", sclera: "eyes/sclera-01.svg"},
	{id: "sclera02", sclera: "eyes/sclera-02.svg", scleraTransform: "translate(0, 16)"},
}

var foxMouthFiles = []string{"mouths/mouth-01.svg", "mouths/mouth-02.svg", "mouths/mouth-03.svg"}

var foxFillFirstRe = regexp.MustCompile(`fill="#[^"]*"`)

func readFoxSvg(rel string) string { return readSvgInnerFrom("fox", rel) }

func foxBgHex(seed, explicitBg string) string {
	fallback := foxBGPresets[seededIndex(seed+":fox-bg", len(foxBGPresets))]
	return normalizeHex(explicitBg, fallback)
}

func pickFoxAccessoryPreset(seed string) *foxAccessoryPreset {
	if seededIndex(seed+":fox-acc", 100) < 55 {
		return nil
	}
	idx := seededIndex(seed+":fox-acc-preset", len(foxAccessoryPresets))
	p := foxAccessoryPresets[idx]
	return &p
}

func pickFoxGlassesFillHex(seed string) string {
	return foxGlassesFillPresets[seededIndex(seed+":fox-glasses-fill", len(foxGlassesFillPresets))]
}

func paintFoxGlassesInner(inner, fillHex string) string {
	return replaceFirst(foxFillFirstRe, inner, `fill="#`+fillHex+`"`)
}

func paintFoxAccessoryInner(acc *foxAccessoryPreset, inner, seed string) string {
	if acc == nil {
		return ""
	}
	if acc.kind == "glasses" || acc.kind == "bowtie" {
		return paintFoxGlassesInner(inner, pickFoxGlassesFillHex(seed))
	}
	return inner
}

func buildFoxEyesGroup(preset foxEyePreset) string {
	scleraInner := readFoxSvg(preset.sclera)
	return buildMirroredScleraGroup("fox", scleraInner, preset.scleraTransform)
}

// GenerateAvatarVectorFox renders a fox vector avatar SVG.
func GenerateAvatarVectorFox(opts AvatarVectorAssetOptions) string {
	seed := opts.Seed
	s := parseSize(opts.Size, 32, 1024, 128)
	bgHex := foxBgHex(seed, opts.Bg)

	baseInner := stripInkscapeSodipodiMarkup(readFoxSvg("base.svg"))
	eyePreset := foxEyePresets[seededIndex(seed+":fox-eyes", len(foxEyePresets))]
	eyes := buildFoxEyesGroup(eyePreset)
	mouthRel := foxMouthFiles[seededIndex(seed+":fox-mouth", len(foxMouthFiles))]
	mouthInner := readFoxSvg(mouthRel)

	var mouthBlock string
	if mouthRel == "mouths/mouth-03.svg" {
		mouthBlock = `<g id="fox-mouth" transform="translate(0, 16)">` + mouthInner + `</g>`
	} else {
		mouthBlock = `<g id="fox-mouth">` + mouthInner + `</g>`
	}

	accPreset := pickFoxAccessoryPreset(seed)
	var accessoryBlock string
	if accPreset != nil {
		accInnerRaw := readFoxSvg(accPreset.rel)
		accInner := stripInkscapeSodipodiMarkup(accInnerRaw)
		accessoryInner := paintFoxAccessoryInner(accPreset, accInner, seed)
		if accessoryInner != "" {
			tf := ""
			if accPreset.transform != "" {
				tf = ` transform="` + accPreset.transform + `"`
			}
			accessoryBlock = `<g id="fox-accessory"` + tf + `>` + accessoryInner + `</g>`
		}
	}

	return `<svg xmlns="http://www.w3.org/2000/svg" width="` + strconv.Itoa(s) + `" height="` + strconv.Itoa(s) + `" viewBox="0 0 1024 1024">
  <rect width="1024" height="1024" fill="#` + bgHex + `"/>
  <g id="fox-base">` + baseInner + `</g>
  ` + eyes + `
  ` + accessoryBlock + `
  ` + mouthBlock + `
</svg>`
}
