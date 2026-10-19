package generator

import "strconv"

var catBGPresets = []string{
	"c8dce8", "e8d8e5", "b0c7b6", "c2c768", "d8c8e8", "c8d8e8", "e0c8d0", "d0dfcc",
	"c8cce8", "d8c8e8", "c8e8e0", "e8d8c8", "d0d8e8", "c8e0d8", "9fc26d",
}

var catEyeFiles = []string{
	"eyes/sclera-01.svg", "eyes/sclera-02.svg", "eyes/sclera-03.svg",
	"eyes/sclera-04.svg", "eyes/sclera-05.svg", "eyes/sclera-06.svg",
}
var catMouthFiles = []string{
	"mouths/mouth-01.svg", "mouths/mouth-02.svg", "mouths/mouth-03.svg",
	"mouths/mouth-04.svg", "mouths/mouth-05.svg",
}

const catArtTransform = "translate(20, 60)"

type catAccessoryPreset struct {
	id, rel, transform string
	drawAfterFace      bool
}

var catAccessoryPresets = []catAccessoryPreset{
	{id: "glasses01", rel: "accessories/glasses-01.svg", transform: "translate(-10, -46)", drawAfterFace: true},
	{id: "bowTie01", rel: "accessories/bow-tie-01.svg", transform: "translate(-14, -24)", drawAfterFace: true},
	{id: "headphones01", rel: "accessories/headphones-01.svg", transform: "translate(-10, 0)", drawAfterFace: true},
	{id: "pawsMug01", rel: "accessories/paws-mug-01.svg", drawAfterFace: true},
	{id: "artistHat01", rel: "accessories/artist-hat-01.svg", transform: "translate(-14, -36) translate(512, 400) scale(1.08) translate(-512, -400)", drawAfterFace: true},
	{id: "stripedBeanie01", rel: "accessories/striped-beanie-01.svg"},
	{id: "pirateHat01", rel: "accessories/pirate-hat-01.svg", transform: "translate(-14, -36) translate(512, 400) scale(1.08) translate(-512, -400)", drawAfterFace: true},
}

var catBeanieFillPresets = []string{
	"da5340", "2563eb", "16a34a", "7c3aed", "0d9488", "b45309", "be123c", "0f766e", "1d4ed8", "c2410c",
}

func readCatSvg(rel string) string { return readSvgInnerFrom("cat", rel) }

func catBgHex(seed, explicitBg string) string {
	fallback := catBGPresets[seededIndex(seed+":cat-bg", len(catBGPresets))]
	return normalizeHex(explicitBg, fallback)
}

func pickCatAccessoryPreset(seed string) *catAccessoryPreset {
	if seededIndex(seed+":cat-acc", 100) < 55 {
		return nil
	}
	idx := seededIndex(seed+":cat-acc-preset", len(catAccessoryPresets))
	p := catAccessoryPresets[idx]
	return &p
}

func paintStripedBeanieInner(inner, seed string) string {
	main := catBeanieFillPresets[seededIndex(seed+":cat-beanie-fill", len(catBeanieFillPresets))]
	darkStrong := darkenHex(main, 44)
	darkMid := darkenHex(main, 36)
	darkSoft := darkenHex(main, 28)
	lightHi := lightenHex(main, 60)
	lightLo := lightenHex(main, 52)
	s := inner
	s = replaceCI(s, `fill="#8D96C9"`, `fill="#`+darkStrong+`"`)
	s = replaceCI(s, `fill="#8D97CA"`, `fill="#`+darkMid+`"`)
	s = replaceCI(s, `fill="#8E98CA"`, `fill="#`+darkSoft+`"`)
	s = replaceCI(s, `fill="#DBE3EF"`, `fill="#`+lightHi+`"`)
	s = replaceCI(s, `fill="#DAE2EF"`, `fill="#`+lightLo+`"`)
	return s
}

func paintArtistHatInner(inner, seed string) string {
	main := catBeanieFillPresets[seededIndex(seed+":cat-artist-hat-fill", len(catBeanieFillPresets))]
	splat := catBeanieFillPresets[seededIndex(seed+":cat-artist-splat-fill", len(catBeanieFillPresets))]
	light := lightenHex(main, 12)
	mid := darkenHex(main, 10)
	dark := darkenHex(main, 24)
	s := inner
	s = replaceCI(s, `fill="#444C70"`, `fill="#`+light+`"`)
	s = replaceCI(s, `fill="#2D395B"`, `fill="#`+mid+`"`)
	s = replaceCI(s, `fill="#2D3A5B"`, `fill="#`+dark+`"`)
	s = replaceCI(s, `fill="#E59754"`, `fill="#`+splat+`"`)
	return s
}

func paintPawsMugInner(inner, seed string) string {
	main := catBeanieFillPresets[seededIndex(seed+":cat-paws-mug-fill", len(catBeanieFillPresets))]
	mugMain := darkenHex(main, 8)
	mugLight := lightenHex(main, 14)
	s := inner
	s = replaceCI(s, `fill="#63AC54"`, `fill="#`+mugMain+`"`)
	s = replaceCI(s, `fill="#94BE61"`, `fill="#`+mugLight+`"`)
	return s
}

func paintCatHeadphonesInner(inner, seed string) string {
	main := catBeanieFillPresets[seededIndex(seed+":cat-headphones-fill", len(catBeanieFillPresets))]
	return replaceCI(inner, `fill="#46A9A0"`, `fill="#`+main+`"`)
}

func paintBowTieInner(inner, seed string) string {
	main := catBeanieFillPresets[seededIndex(seed+":cat-bow-tie-fill", len(catBeanieFillPresets))]
	light := lightenHex(main, 16)
	lightSoft := lightenHex(main, 10)
	dark := darkenHex(main, 14)
	darkSoft := darkenHex(main, 8)
	s := inner
	s = replaceCI(s, `fill="#E75E5D"`, `fill="#`+light+`"`)
	s = replaceCI(s, `fill="#E75E5C"`, `fill="#`+lightSoft+`"`)
	s = replaceCI(s, `fill="#E75F5D"`, `fill="#`+light+`"`)
	s = replaceCI(s, `fill="#D13A47"`, `fill="#`+dark+`"`)
	s = replaceCI(s, `fill="#D03A47"`, `fill="#`+darkSoft+`"`)
	return s
}

func paintCatGlassesInner(inner, seed string) string {
	main := catBeanieFillPresets[seededIndex(seed+":cat-glasses-fill", len(catBeanieFillPresets))]
	lens := lightenHex(main, 78)
	s := inner
	s = replaceCI(s, `fill="#53473F"`, `fill="#`+main+`"`)
	s = replaceCI(s, `fill:#f6d5ff`, `fill:#`+lens)
	return s
}

func paintCatAccessoryInner(acc *catAccessoryPreset, inner, seed string) string {
	if acc == nil {
		return inner
	}
	switch acc.id {
	case "glasses01":
		return paintCatGlassesInner(inner, seed)
	case "bowTie01":
		return paintBowTieInner(inner, seed)
	case "headphones01":
		return paintCatHeadphonesInner(inner, seed)
	case "pawsMug01":
		return paintPawsMugInner(inner, seed)
	case "artistHat01":
		return paintArtistHatInner(inner, seed)
	case "stripedBeanie01":
		return paintStripedBeanieInner(inner, seed)
	default:
		return inner
	}
}

// GenerateAvatarVectorCat renders a cat vector avatar SVG.
func GenerateAvatarVectorCat(opts AvatarVectorAssetOptions) string {
	seed := opts.Seed
	s := parseSize(opts.Size, 32, 1024, 128)
	bgHex := catBgHex(seed, opts.Bg)

	baseInner := stripInkscapeSodipodiMarkup(readCatSvg("base.svg"))
	eyeRel := catEyeFiles[seededIndex(seed+":cat-eyes", len(catEyeFiles))]
	eyesInner := stripInkscapeSodipodiMarkup(readCatSvg(eyeRel))
	mouthRel := catMouthFiles[seededIndex(seed+":cat-mouth", len(catMouthFiles))]
	mouthInner := stripInkscapeSodipodiMarkup(readCatSvg(mouthRel))

	accPreset := pickCatAccessoryPreset(seed)
	var accPainted string
	var accessoryBlock string
	if accPreset != nil {
		accInnerRaw := readCatSvg(accPreset.rel)
		accInner := stripInkscapeSodipodiMarkup(accInnerRaw)
		if accInner != "" {
			accPainted = paintCatAccessoryInner(accPreset, accInner, seed)
			tf := ""
			if accPreset.transform != "" {
				tf = ` transform="` + accPreset.transform + `"`
			}
			accessoryBlock = `<g id="cat-accessory"` + tf + `>` + accPainted + `</g>`
		}
	}

	faceLayers := `<g id="cat-eyes">` + eyesInner + `</g>
    <g id="cat-mouth">` + mouthInner + `</g>`

	var catArtInner string
	if accPreset != nil && accPreset.drawAfterFace {
		catArtInner = `<g id="cat-base">` + baseInner + `</g>
    ` + faceLayers + `
    ` + accessoryBlock
	} else {
		catArtInner = `<g id="cat-base">` + baseInner + `</g>
    ` + accessoryBlock + `
    ` + faceLayers
	}

	return `<svg xmlns="http://www.w3.org/2000/svg" width="` + strconv.Itoa(s) + `" height="` + strconv.Itoa(s) + `" viewBox="0 0 1024 1024">
  <rect width="1024" height="1024" fill="#` + bgHex + `"/>
  <g id="cat-art" transform="` + catArtTransform + `">
    ` + catArtInner + `
  </g>
</svg>`
}
