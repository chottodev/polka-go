package generator

import "strconv"

var dogBGPresets = catBGPresets

type dogEyePreset struct {
	id, sclera string
}

var dogEyePresets = []dogEyePreset{
	{id: "sclera01", sclera: "eyes/sclera-01.svg"},
	{id: "sclera02", sclera: "eyes/sclera-02.svg"},
}

var dogMouthFiles = []string{"mouths/mouth-01.svg", "mouths/mouth-02.svg", "mouths/mouth-03.svg"}
var dogBrowFiles = []string{"brows/brow-01.svg", "brows/brow-02.svg"}

var dogScarfFillPresets = catBeanieFillPresets

type dogAccessoryPreset struct {
	id, rel, transform string
}

var dogAccessoryPresets = []dogAccessoryPreset{
	{id: "paw01", rel: "accessories/paw-01.svg", transform: "translate(750, 780) scale(0.525) rotate(-8) translate(-512, -512)"},
	{id: "scarf01", rel: "accessories/scarf-01.svg"},
	{id: "glasses01", rel: "accessories/glasses-01.svg", transform: "translate(0, 18)"},
	{id: "headset01", rel: "accessories/headset-01.svg"},
	{id: "cap01", rel: "accessories/cap-01.svg", transform: "translate(256, 140) scale(0.33333335)"},
}

func readDogSvg(rel string) string { return readSvgInnerFrom("dog", rel) }

func dogBgHex(seed, explicitBg string) string {
	fallback := dogBGPresets[seededIndex(seed+":dog-bg", len(dogBGPresets))]
	return normalizeHex(explicitBg, fallback)
}

func paintDogScarfInner(inner, seed string) string {
	main := dogScarfFillPresets[seededIndex(seed+":dog-scarf-fill", len(dogScarfFillPresets))]
	shadow := darkenHex(main, 42)
	s := inner
	s = replaceCI(s, `fill="#DA5340"`, `fill="#`+main+`"`)
	s = replaceCI(s, `fill="#A4362C"`, `fill="#`+shadow+`"`)
	return s
}

func paintDogCapInner(inner, seed string) string {
	main := dogScarfFillPresets[seededIndex(seed+":dog-scarf-fill", len(dogScarfFillPresets))]
	dark := darkenHex(main, 70)
	light := lightenHex(main, 40)
	s := inner
	s = replaceCI(s, `fill="#EC2827"`, `fill="#`+main+`"`)
	s = replaceCI(s, `fill="#AB0409"`, `fill="#`+dark+`"`)
	s = replaceCI(s, `fill="#AA0409"`, `fill="#`+dark+`"`)
	s = replaceCI(s, `fill="#F25451"`, `fill="#`+light+`"`)
	return s
}

func paintDogAccessoryInner(acc *dogAccessoryPreset, inner, seed string) string {
	if acc == nil {
		return inner
	}
	switch acc.id {
	case "scarf01":
		return paintDogScarfInner(inner, seed)
	case "glasses01":
		fill := dogScarfFillPresets[seededIndex(seed+":dog-scarf-fill", len(dogScarfFillPresets))]
		return replaceCI(inner, `fill="#53473F"`, `fill="#`+fill+`"`)
	case "cap01":
		return paintDogCapInner(inner, seed)
	default:
		return inner
	}
}

func buildDogEyesGroup(preset dogEyePreset) string {
	eyesInner := readDogSvg(preset.sclera)
	return `<g id="dog-eyes">` + eyesInner + `</g>`
}

func buildDogBrowsGroup(browRel string) string {
	browsInner := readDogSvg(browRel)
	return `<g id="dog-brows">` + browsInner + `</g>`
}

func pickDogAccessoryPreset(seed string) *dogAccessoryPreset {
	if seededIndex(seed+":dog-acc", 100) < 55 {
		return nil
	}
	idx := seededIndex(seed+":dog-acc-preset", len(dogAccessoryPresets))
	p := dogAccessoryPresets[idx]
	return &p
}

// GenerateAvatarVectorDog renders a dog vector avatar SVG.
func GenerateAvatarVectorDog(opts AvatarVectorAssetOptions) string {
	seed := opts.Seed
	s := parseSize(opts.Size, 32, 1024, 128)
	bgHex := dogBgHex(seed, opts.Bg)

	baseInner := stripInkscapeSodipodiMarkup(readDogSvg("base.svg"))
	eyePreset := dogEyePresets[seededIndex(seed+":dog-eyes", len(dogEyePresets))]
	eyes := buildDogEyesGroup(eyePreset)
	browRel := dogBrowFiles[seededIndex(seed+":dog-brows", len(dogBrowFiles))]
	brows := buildDogBrowsGroup(browRel)
	mouthRel := dogMouthFiles[seededIndex(seed+":dog-mouth", len(dogMouthFiles))]
	mouthInner := readDogSvg(mouthRel)

	accPreset := pickDogAccessoryPreset(seed)
	var accessoryBlock string
	if accPreset != nil {
		accInnerRaw := readDogSvg(accPreset.rel)
		accInner := stripInkscapeSodipodiMarkup(accInnerRaw)
		accPainted := paintDogAccessoryInner(accPreset, accInner, seed)
		if accPainted != "" {
			tf := ""
			if accPreset.transform != "" {
				tf = ` transform="` + accPreset.transform + `"`
			}
			accessoryBlock = `<g id="dog-accessory"` + tf + `>` + accPainted + `</g>`
		}
	}

	return `<svg xmlns="http://www.w3.org/2000/svg" width="` + strconv.Itoa(s) + `" height="` + strconv.Itoa(s) + `" viewBox="0 0 1024 1024">
  <rect width="1024" height="1024" fill="#` + bgHex + `"/>
  <g id="dog-base">` + baseInner + `</g>
  ` + eyes + `
  ` + brows + `
  ` + accessoryBlock + `
  <g id="dog-mouth">` + mouthInner + `</g>
</svg>`
}
