package generator

import "strconv"

var manBGPresets = []string{
	"c8dce8",
	"e8d8e5",
	"b0c7b6",
	"c2c768",
	"d8c8e8",
	"c8d8e8",
	"e0c8d0",
	"d0dfcc",
	"c8cce8",
	"d8c8e8",
	"c8e8e0",
	"e8d8c8",
	"d0d8e8",
	"c8e0d8",
	"9fc26d",
}

var manEyesFiles = []string{
	"eyes/eye-01.svg",
	"eyes/eye-02.svg",
	"eyes/eye-03.svg",
}

var manBrowsFiles = []string{
	"brows/brow-01.svg",
	"brows/brow-02.svg",
}

var manNoseFiles = []string{
	"noses/nose-01.svg",
	"noses/nose-02.svg",
	"noses/nose-03.svg",
}

var manMouthFiles = []string{
	"mouths/mouth-01.svg",
	"mouths/mouth-02.svg",
	"mouths/mouth-03.svg",
	"mouths/mouth-04.svg",
	"mouths/mouth-05.svg",
}

var manHairFiles = []string{
	"hairs/hair-01.svg",
	"hairs/hair-02.svg",
	"hairs/hair-03.svg",
	"hairs/hair-04.svg",
	"hairs/hair-05.svg",
	"hairs/hair-06.svg",
	"hairs/hair-07.svg",
}

var manClothFiles = []string{
	"cloth/cloth-01.svg",
	"cloth/cloth-02.svg",
	"cloth/cloth-03.svg",
	"cloth/cloth-04.svg",
	"cloth/cloth-05.svg",
}

var manAccessoriesFiles = []string{
	"accessories/glasses-01.svg",
	"accessories/headphones-01.svg",
	"accessories/headphones-02.svg",
}

var manBeardsFiles = []string{
	"beards/beard-01.svg",
	"beards/beard-02.svg",
}

var manMustachesFiles = []string{
	"mustaches/mustache-01.svg",
	"mustaches/mustache-02.svg",
	"mustaches/mustache-03.svg",
	"mustaches/mustache-04.svg",
}

const manBlushFile = "blush/blush-01.svg"

type manClothScheme struct{ base, shade, accent, tie string }
var manClothFillPresets = []manClothScheme{
	{base: "c34132", shade: "a9392b", accent: "c34132", tie: "2f6db3"},
	{base: "2f6db3", shade: "24528a", accent: "2f6db3", tie: "c34132"},
	{base: "2f8f5b", shade: "226a43", accent: "2f8f5b", tie: "7d4bb3"},
	{base: "7d4bb3", shade: "5f3889", accent: "7d4bb3", tie: "b36a2f"},
	{base: "b36a2f", shade: "8a5123", accent: "b36a2f", tie: "2f8f5b"},
	{base: "4a4a4a", shade: "2f2f2f", accent: "4a4a4a", tie: "c34132"},
}

var manHairBrowFillPresets = []string{"1f1a17", "2b211d", "3a2a22", "4a3428", "5a4130", "6a4d38", "7a5a42", "cc931f", "a84f2a"}

var manGlassesFillPresets = []string{"2f2a25", "1a1a2e", "c0392b", "1a5276", "1e8449", "6c3483", "b7950b", "2e4057", "a04000", "212f3d"}

type manHeadphonesScheme struct{ dark, light, mid string }
var manHeadphonesFillPresets = []manHeadphonesScheme{
	{dark: "3E8937", light: "BFDA6F", mid: "408A39"},
	{dark: "2f6db3", light: "7eb3e8", mid: "4a8bc7"},
	{dark: "c34132", light: "e88a7e", mid: "d65a4a"},
	{dark: "7d4bb3", light: "b88ae8", mid: "9a6bc7"},
	{dark: "b36a2f", light: "e8b87e", mid: "c7894a"},
	{dark: "4a4a4a", light: "9a9a9a", mid: "6a6a6a"},
}

func readManSvg(rel string) string { return readSvgInnerFrom("man", rel) }

func paintManBaseInner(inner, bgHex string) string {
	s := inner
	s = replaceCI(s, `fill="#ADD0DF"`, `fill="#`+bgHex+`"`)
	return s
}

func paintManClothInner(inner, seed string) string {
	scheme := manClothFillPresets[seededIndex(seed+":man-cloth-fill", len(manClothFillPresets))]
	s := inner
	s = replaceCI(s, `fill="#C34132"`, `fill="#`+scheme.base+`"`)
	s = replaceCI(s, `fill="#A9392B"`, `fill="#`+scheme.shade+`"`)
	s = replaceCI(s, `fill="#C34334"`, `fill="#`+scheme.accent+`"`)
	s = replaceCI(s, `fill="#A2C5E7"`, `fill="#`+scheme.base+`"`)
	s = replaceCI(s, `fill="#5788B7"`, `fill="#`+scheme.shade+`"`)
	s = replaceCI(s, `fill="#5587B6"`, `fill="#`+scheme.accent+`"`)
	s = replaceCI(s, `fill="#A1C4E5"`, `fill="#`+scheme.base+`"`)
	s = replaceCI(s, `fill="#F36925"`, `fill="#`+scheme.base+`"`)
	s = replaceCI(s, `fill="#C44E1A"`, `fill="#`+scheme.shade+`"`)
	s = replaceCI(s, `fill="#C24A16"`, `fill="#`+scheme.shade+`"`)
	s = replaceCI(s, `fill="#C14915"`, `fill="#`+scheme.shade+`"`)
	s = replaceCI(s, `fill="#B14214"`, `fill="#`+scheme.shade+`"`)
	s = replaceCI(s, `fill="#A03C13"`, `fill="#`+scheme.shade+`"`)
	s = replaceCI(s, `fill="#A43F15"`, `fill="#`+scheme.accent+`"`)
	s = replaceCI(s, `fill="#59595B"`, `fill="#`+scheme.base+`"`)
	s = replaceCI(s, `fill="#5E6062"`, `fill="#`+scheme.base+`"`)
	s = replaceCI(s, `fill="#303137"`, `fill="#`+scheme.base+`"`)
	s = replaceCI(s, `fill="#38393F"`, `fill="#`+scheme.base+`"`)
	s = replaceCI(s, `fill="#39393F"`, `fill="#`+scheme.base+`"`)
	s = replaceCI(s, `fill="#37373E"`, `fill="#`+scheme.base+`"`)
	s = replaceCI(s, `fill="#2A2B30"`, `fill="#`+scheme.shade+`"`)
	s = replaceCI(s, `fill="#2A2B2F"`, `fill="#`+scheme.shade+`"`)
	s = replaceCI(s, `fill="#303F5E"`, `fill="#`+scheme.base+`"`)
	s = replaceCI(s, `fill="#21314C"`, `fill="#`+scheme.shade+`"`)
	s = replaceCI(s, `fill="#64213A"`, `fill="#`+scheme.tie+`"`)
	s = replaceCI(s, `fill="#551932"`, `fill="#`+scheme.tie+`"`)
	return s
}

func paintManHairInner(inner, fillHex string) string {
	base, mid, light := buildHairShadesMan(fillHex)
	s := inner
	s = replaceCI(s, `fill="#6A4532"`, `fill="#`+base+`"`)
	s = replaceCI(s, `fill="#B8833C"`, `fill="#`+base+`"`)
	s = replaceCI(s, `fill="#B8833B"`, `fill="#`+base+`"`)
	s = replaceCI(s, `fill="#0A0F14"`, `fill="#`+base+`"`)
	s = replaceCI(s, `fill="#0E0D0F"`, `fill="#`+base+`"`)
	s = replaceCI(s, `fill="#0E0E10"`, `fill="#`+base+`"`)
	s = replaceCI(s, `fill="#0D0D0F"`, `fill="#`+base+`"`)
	s = replaceCI(s, `fill="#121112"`, `fill="#`+base+`"`)
	s = replaceCI(s, `fill="#141214"`, `fill="#`+base+`"`)
	s = replaceCI(s, `fill="#241F1F"`, `fill="#`+mid+`"`)
	s = replaceCI(s, `fill="#2A2424"`, `fill="#`+mid+`"`)
	s = replaceCI(s, `fill="#2B2424"`, `fill="#`+mid+`"`)
	s = replaceCI(s, `fill="#2C2525"`, `fill="#`+mid+`"`)
	s = replaceCI(s, `fill="#131215"`, `fill="#`+base+`"`)
	s = replaceCI(s, `fill="#0F1011"`, `fill="#`+base+`"`)
	s = replaceCI(s, `fill="#212123"`, `fill="#`+base+`"`)
	s = replaceCI(s, `fill="#202022"`, `fill="#`+base+`"`)
	s = replaceCI(s, `fill="#2C2B2E"`, `fill="#`+mid+`"`)
	s = replaceCI(s, `fill="#2B2A2D"`, `fill="#`+mid+`"`)
	s = replaceCI(s, `fill="#2A292C"`, `fill="#`+mid+`"`)
	s = replaceCI(s, `fill="#29292C"`, `fill="#`+mid+`"`)
	s = replaceCI(s, `fill="#28282B"`, `fill="#`+mid+`"`)
	s = replaceCI(s, `fill="#432015"`, `fill="#`+base+`"`)
	s = replaceCI(s, `fill="#411F14"`, `fill="#`+base+`"`)
	s = replaceCI(s, `fill="#230E07"`, `fill="#`+base+`"`)
	s = replaceCI(s, `fill="#251009"`, `fill="#`+base+`"`)
	s = replaceCI(s, `fill="#281109"`, `fill="#`+base+`"`)
	s = replaceCI(s, `fill="#391A11"`, `fill="#`+base+`"`)
	s = replaceCI(s, `fill="#250F08"`, `fill="#`+mid+`"`)
	s = replaceCI(s, `fill="#230E08"`, `fill="#`+mid+`"`)
	s = replaceCI(s, `fill="#BE8B40"`, `fill="#`+mid+`"`)
	s = replaceCI(s, `fill="#D7A557"`, `fill="#`+light+`"`)
	s = replaceCI(s, `fill="#D6A456"`, `fill="#`+light+`"`)
	return s
}

func paintManBrowInner(inner, fillHex string) string {
	s := inner
	s = replaceCI(s, `fill="#423130"`, `fill="#`+fillHex+`"`)
	s = replaceCI(s, `fill="#C48E41"`, `fill="#`+fillHex+`"`)
	return s
}

func paintManBeardInner(inner, fillHex string) string {
	s := inner
	s = replaceCI(s, `fill="#4C2F1F"`, `fill="#`+fillHex+`"`)
	s = replaceCI(s, `fill="#4c2f1f"`, `fill="#`+fillHex+`"`)
	s = replaceCI(s, `fill="#5F3A2A"`, `fill="#`+fillHex+`"`)
	s = replaceCI(s, `fill="#0E1012"`, `fill="#`+fillHex+`"`)
	return s
}

func paintManMustacheInner(inner, fillHex string) string {
	s := inner
	s = replaceCI(s, `fill="#5F3A2A"`, `fill="#`+fillHex+`"`)
	s = replaceCI(s, `fill="#503223"`, `fill="#`+fillHex+`"`)
	s = replaceCI(s, `fill="#6F432E"`, `fill="#`+fillHex+`"`)
	s = replaceCI(s, `fill="#7D4B37"`, `fill="#`+fillHex+`"`)
	return s
}

func paintManHeadphonesInner(inner, seed string) string {
	scheme := manHeadphonesFillPresets[seededIndex(seed+":man-headphones-fill", len(manHeadphonesFillPresets))]
	s := inner
	s = replaceCI(s, `fill="#3E8937"`, `fill="#`+scheme.dark+`"`)
	s = replaceCI(s, `fill="#BFDA6F"`, `fill="#`+scheme.light+`"`)
	s = replaceCI(s, `fill="#408A39"`, `fill="#`+scheme.mid+`"`)
	s = replaceCI(s, `fill="#FDFCFB"`, `fill="#`+scheme.light+`"`)
	s = replaceCI(s, `fill="#FCFBFB"`, `fill="#`+scheme.light+`"`)
	return s
}

func paintManGlassesInner(inner, seed string) string {
	color := manGlassesFillPresets[seededIndex(seed+":man-glasses-fill", len(manGlassesFillPresets))]
	s := inner
	s = replaceCI(s, `fill="#2f2a25"`, `fill="#`+color+`"`)
	s = replaceCI(s, `fill:#2f2a25`, `fill:#`+color)
	return s
}

func manBgHex(seed, explicitBg string) string {
	fallback := manBGPresets[seededIndex(seed+":man-bg", len(manBGPresets))]
	return normalizeHex(explicitBg, fallback)
}

func pickManHairBrowFillHex(seed string) string {
	return manHairBrowFillPresets[seededIndex(seed+":man-hair-brow-fill", len(manHairBrowFillPresets))]
}

// GenerateAvatarVectorMan renders a man vector avatar SVG.
func GenerateAvatarVectorMan(opts AvatarVectorAssetOptions) string {
	seed := opts.Seed
	s := parseSize(opts.Size, 32, 1024, 128)
	bgHex := manBgHex(seed, opts.Bg)
	baseInner := paintManBaseInner(stripInkscapeSodipodiMarkup(readManSvg("base.svg")), bgHex)
	hairBrowFillHex := pickManHairBrowFillHex(seed)
	browRel := manBrowsFiles[seededIndex(seed+":man-brow", len(manBrowsFiles))]
	browsInner := paintManBrowInner(stripInkscapeSodipodiMarkup(readManSvg(browRel)), hairBrowFillHex)
	eyesRel := manEyesFiles[seededIndex(seed+":man-eyes", len(manEyesFiles))]
	eyesInner := stripInkscapeSodipodiMarkup(readManSvg(eyesRel))
	noseRel := manNoseFiles[seededIndex(seed+":man-nose", len(manNoseFiles))]
	noseInner := stripInkscapeSodipodiMarkup(readManSvg(noseRel))
	mouthRel := manMouthFiles[seededIndex(seed+":man-mouth", len(manMouthFiles))]
	mouthInner := stripInkscapeSodipodiMarkup(readManSvg(mouthRel))
	isMouthModern := mouthRel != "mouths/mouth-01.svg"
	hairRel := manHairFiles[seededIndex(seed+":man-hair", len(manHairFiles))]
	hairInner := paintManHairInner(stripInkscapeSodipodiMarkup(readManSvg(hairRel)), hairBrowFillHex)
	blushInner := stripInkscapeSodipodiMarkup(readManSvg(manBlushFile))
	clothRel := manClothFiles[seededIndex(seed+":man-cloth", len(manClothFiles))]
	clothInner := paintManClothInner(stripInkscapeSodipodiMarkup(readManSvg(clothRel)), seed)
	blushBlock := ""
	if seededIndex(seed+":man-blush", 100) < 30 {
		blushBlock = `<g id="man-blush">` + blushInner + `</g>`
	}
	hasAccessory := seededIndex(seed+":man-accessory", 100) < 45
	var accessoryRel string
	if hasAccessory {
		accessoryRel = manAccessoriesFiles[seededIndex(seed+":man-accessory-pick", len(manAccessoriesFiles))]
	}
	var accessoryInner string
	if hasAccessory {
		accessoryRaw := stripInkscapeSodipodiMarkup(readManSvg(accessoryRel))
		switch accessoryRel {
		case "accessories/headphones-01.svg", "accessories/headphones-02.svg":
			accessoryInner = paintManHeadphonesInner(accessoryRaw, seed)
		case "accessories/glasses-01.svg":
			accessoryInner = paintManGlassesInner(accessoryRaw, seed)
		default:
			accessoryInner = accessoryRaw
		}
	}
	accessoryBlock := ""
	if accessoryInner != "" {
		accessoryBlock = `<g id="man-accessory">` + accessoryInner + `</g>`
	}
	facialHairRoll := seededIndex(seed+":man-facial-hair", 100)
	hasBeard := facialHairRoll < 40
	hasMustache := !hasBeard && facialHairRoll < 55
	var beardRel string
	if hasBeard {
		beardRel = manBeardsFiles[seededIndex(seed+":man-beard-pick", len(manBeardsFiles))]
	}
	var beardInner string
	if hasBeard {
		beardInner = paintManBeardInner(stripInkscapeSodipodiMarkup(readManSvg(beardRel)), hairBrowFillHex)
	}
	beardBlock := ""
	if beardInner != "" {
		beardBlock = `<g id="man-beard">` + beardInner + `</g>`
	}
	beardAllowsMouth := beardRel == "beards/beard-02.svg"
	mouthModernBlock := ""
	if isMouthModern && (!hasBeard || beardAllowsMouth) {
		mouthModernBlock = `<g id="man-mouth">` + mouthInner + `</g>`
	}
	mouthLegacyBlock := ""
	if !isMouthModern && (!hasBeard || beardAllowsMouth) {
		mouthLegacyBlock = `<g id="man-mouth" transform="translate(10, 20)">` + mouthInner + `</g>`
	}
	var mustacheInner string
	if hasMustache {
		mustacheRel := manMustachesFiles[seededIndex(seed+":man-mustache-pick", len(manMustachesFiles))]
		mustacheInner = paintManMustacheInner(stripInkscapeSodipodiMarkup(readManSvg(mustacheRel)), hairBrowFillHex)
	}
	mustacheBlock := ""
	if mustacheInner != "" {
		mustacheBlock = `<g id="man-mustache">` + mustacheInner + `</g>`
	}
	return `<svg xmlns="http://www.w3.org/2000/svg" width="` + strconv.Itoa(s) + `" height="` + strconv.Itoa(s) + `" viewBox="0 0 1024 1024">
  <rect width="1024" height="1024" fill="#` + bgHex + `"/>
  <g id="man-art">
    <g id="man-base">` + baseInner + `</g>
    <g id="man-cloth">` + clothInner + `</g>
    ` + blushBlock + `
    ` + beardBlock + `
    <g id="man-hair">` + hairInner + `</g>
    <g id="man-eyes">` + eyesInner + `</g>
    <g id="man-nose">` + noseInner + `</g>
    ` + mouthModernBlock + `
    <g id="man-face-parts" transform="translate(0, 9) scale(1.369)">
      <g id="man-brows">` + browsInner + `</g>
      ` + mouthLegacyBlock + `
    </g>
    ` + mustacheBlock + `
    ` + accessoryBlock + `
  </g>
</svg>`
}

