package generator

import "strconv"

var femaleBGPresets = []string{
	"f5e6f0",
	"e8d8f5",
	"f5e8d8",
	"d8f0e8",
	"f0d8e8",
	"e8f0d8",
	"f5d8e8",
	"d8e8f5",
	"f0e8d8",
	"e8d8f0",
	"fce4ec",
	"e8eaf6",
	"e0f2f1",
	"fff8e1",
	"f3e5f5",
}

var femaleEyesFiles = []string{
	"eyes/eye-01.svg",
	"eyes/eye-02.svg",
	"eyes/eye-03.svg",
	"eyes/eye-04.svg",
	"eyes/eye-05.svg",
}

var femaleBrowsFiles = []string{
	"brows/brow-01.svg",
	"brows/brow-02.svg",
}

var femaleHairFiles = []string{
	"hairs/hair-01.svg",
	"hairs/hair-02.svg",
	"hairs/hair-03.svg",
	"hairs/hair-04.svg",
	"hairs/hair-05.svg",
	"hairs/hair-06.svg",
}

var femaleClothFiles = []string{
	"cloth/cloth-01.svg",
	"cloth/cloth-02.svg",
	"cloth/cloth-03.svg",
	"cloth/cloth-04.svg",
}

var femaleMouthFiles = []string{
	"mouths/mouth-01.svg",
	"mouths/mouth-02.svg",
	"mouths/mouth-03.svg",
	"mouths/mouth-04.svg",
	"mouths/mouth-05.svg",
}

var femaleNoseFiles = []string{
	"noses/nose-01.svg",
	"noses/nose-02.svg",
}

const femaleBlushFile = "blush/blush-01.svg"

type femaleClothScheme struct{ base, shade, dark string }
var femaleClothFillPresets = []femaleClothScheme{
	{base: "c34132", shade: "a9392b", dark: "8a2d22"},
	{base: "2f6db3", shade: "24528a", dark: "1a3d6b"},
	{base: "2f8f5b", shade: "226a43", dark: "174d30"},
	{base: "7d4bb3", shade: "5f3889", dark: "452868"},
	{base: "b36a2f", shade: "8a5123", dark: "663c1a"},
	{base: "4a4a4a", shade: "2f2f2f", dark: "1a1a1a"},
	{base: "b03060", shade: "8a2449", dark: "661833"},
	{base: "2f8fa0", shade: "226a78", dark: "174d58"},
}

var femaleHairFillPresets = []string{"1f1a17", "2b211d", "3a2a22", "4a3428", "5a4130", "6a4d38", "7a5a42", "cc931f", "a84f2a", "c35521", "8b4513", "d2691e"}

var femaleAccessoryColorPresets = []string{"1b8cff", "da5340", "2563eb", "16a34a", "7c3aed", "0d9488", "b45309", "be123c", "0f766e", "1d4ed8", "c2410c", "ec4899", "f59e0b"}


type femaleAccessoryPreset struct {
	id, rel, transform string
	drawAfterFace, drawBeforeHair bool
}

var femaleAccessoryPresets = []femaleAccessoryPreset{
	{id: "earrings01", rel: "accessories/earrings-01.svg", drawAfterFace: true},
	{id: "earrings02", rel: "accessories/earrings-02.svg", drawAfterFace: true},
	{id: "necklace01", rel: "accessories/necklace-01.svg", drawAfterFace: true},
	{id: "hairband01", rel: "accessories/hairband-01.svg", drawAfterFace: true},
	{id: "glasses01", rel: "accessories/glasses-01.svg", drawBeforeHair: true},
}

func readFemaleSvg(rel string) string { return readSvgInnerFrom("female", rel) }

func lightenChannel(c, a int) string {
	return fmtHex2(clamp8(c + a))
}

func paintFemaleAccessoryInner(inner, seed, accId string) string {

	color := femaleAccessoryColorPresets[seededIndex(seed+":female-acc-color", len(femaleAccessoryColorPresets))]
	r, g, b := hexToRgb(color)
	colorLight := lightenChannel(r, 40) + lightenChannel(g, 40) + lightenChannel(b, 40)
	colorMid := lightenChannel(r, 20) + lightenChannel(g, 20) + lightenChannel(b, 20)
	switch accId {
	case "necklace01":
		chain := femaleAccessoryColorPresets[seededIndex(seed+":necklace-chain", len(femaleAccessoryColorPresets))]
		drop := femaleAccessoryColorPresets[seededIndex(seed+":necklace-drop", len(femaleAccessoryColorPresets))]
		center := femaleAccessoryColorPresets[seededIndex(seed+":necklace-center", len(femaleAccessoryColorPresets))]
		bead1 := femaleAccessoryColorPresets[seededIndex(seed+":necklace-bead1", len(femaleAccessoryColorPresets))]
		bead2 := femaleAccessoryColorPresets[seededIndex(seed+":necklace-bead2", len(femaleAccessoryColorPresets))]
		s := inner
		s = replaceCI(s, "fill:#5A482E", "fill:#"+chain)
		s = replaceCI(s, "fill:#53E7D3", "fill:#"+drop)
		s = replaceCI(s, "fill:#37C4B3", "fill:#"+center)
		s = replaceCI(s, "fill:#FDF276", "fill:#"+center)
		s = replaceCI(s, "fill:#E28883", "fill:#"+bead1)
		s = replaceCI(s, "fill:#E3DAB3", "fill:#"+bead2)
		return s
	case "glasses01":
		frame := femaleAccessoryColorPresets[seededIndex(seed+":glasses-frame", len(femaleAccessoryColorPresets))]
		lens := femaleAccessoryColorPresets[seededIndex(seed+":glasses-lens", len(femaleAccessoryColorPresets))]
		s := inner
		s = replaceCI(s, `fill="#31373D"`, `fill="#`+frame+`"`)
		s = replaceCI(s, "fill:#70687b", "fill:#"+lens)
		return s
	case "hairband01":
		main := femaleAccessoryColorPresets[seededIndex(seed+":hairband-main", len(femaleAccessoryColorPresets))]
		shade := femaleAccessoryColorPresets[seededIndex(seed+":hairband-shade", len(femaleAccessoryColorPresets))]
		s := inner
		s = replaceCI(s, `fill="#EA839E"`, `fill="#`+main+`"`)
		s = replaceCI(s, `fill="#B93A3C"`, `fill="#`+shade+`"`)
		return s
	}
	s := inner
	s = replaceCI(s, `stroke="#1b8cff"`, `stroke="#`+color+`"`)
	s = replaceCI(s, `fill="#1b8cff"`, `fill="#`+color+`"`)
	s = replaceCI(s, "fill:#16786C", "fill:#"+color)
	s = replaceCI(s, "fill:#36E3CC", "fill:#"+colorLight)
	s = replaceCI(s, "fill:#37C4B3", "fill:#"+colorMid)
	s = replaceCI(s, "fill:#53E7D3", "fill:#"+colorLight)
	s = replaceCI(s, "fill:#EFBA50", "fill:#"+colorLight)
	s = replaceCI(s, "fill:#FDF276", "fill:#"+colorLight)
	s = replaceCI(s, "fill:#E28883", "fill:#"+colorMid)
	s = replaceCI(s, "fill:#E3DAB3", "fill:#"+colorMid)
	s = replaceCI(s, "fill:#16786c", "fill:#"+color)
	s = replaceCI(s, "fill:#36e3cc", "fill:#"+colorLight)
	s = replaceCI(s, "fill:#37c4b3", "fill:#"+colorMid)
	s = replaceCI(s, "fill:#53e7d3", "fill:#"+colorLight)
	s = replaceCI(s, "fill:#efba50", "fill:#"+colorLight)
	s = replaceCI(s, "fill:#fdf276", "fill:#"+colorLight)
	s = replaceCI(s, "fill:#e28883", "fill:#"+colorMid)
	s = replaceCI(s, "fill:#e3dab3", "fill:#"+colorMid)
	return s
}

func paintFemaleBrowInner(inner, fillHex string) string {
	s := inner
	s = replaceCI(s, `fill="#A13818"`, `fill="#`+fillHex+`"`)
	return s
}

func paintFemaleHairInner(inner, fillHex string) string {
	shades := buildHairShadesFemale(fillHex)
	s := inner
	s = replaceCI(s, `fill="#C35521"`, `fill="#`+shades.base+`"`)
	s = replaceCI(s, `fill="#C35420"`, `fill="#`+shades.base+`"`)
	s = replaceCI(s, `fill="#C45521"`, `fill="#`+shades.base+`"`)
	s = replaceCI(s, `fill="#A13618"`, `fill="#`+shades.dark+`"`)
	s = replaceCI(s, `fill="#A23618"`, `fill="#`+shades.dark+`"`)
	s = replaceCI(s, `fill="#A23718"`, `fill="#`+shades.dark+`"`)
	s = replaceCI(s, `fill="#A03618"`, `fill="#`+shades.dark+`"`)
	s = replaceCI(s, `fill="#261815"`, `fill="#`+shades.base+`"`)
	s = replaceCI(s, `fill="#3C2923"`, `fill="#`+shades.base+`"`)
	s = replaceCI(s, `fill="#2E1E19"`, `fill="#`+shades.dark+`"`)
	s = replaceCI(s, `fill="#251613"`, `fill="#`+shades.base+`"`)
	s = replaceCI(s, `fill="#5C3D29"`, `fill="#`+shades.mid+`"`)
	s = replaceCI(s, `fill="#5B3D29"`, `fill="#`+shades.mid+`"`)
	s = replaceCI(s, `fill="#5B3C29"`, `fill="#`+shades.mid+`"`)
	s = replaceCI(s, `fill="#5A3C29"`, `fill="#`+shades.mid+`"`)
	s = replaceCI(s, `fill="#5C3E2A"`, `fill="#`+shades.mid+`"`)
	s = replaceCI(s, `fill="#5A3D29"`, `fill="#`+shades.mid+`"`)
	s = replaceCI(s, `fill="#271815"`, `fill="#`+shades.base+`"`)
	s = replaceCI(s, `fill="#593D2C"`, `fill="#`+shades.mid+`"`)
	s = replaceCI(s, `fill="#5B3E2C"`, `fill="#`+shades.mid+`"`)
	s = replaceCI(s, `fill="#5A3E2C"`, `fill="#`+shades.mid+`"`)
	s = replaceCI(s, `fill="#5A3D2C"`, `fill="#`+shades.mid+`"`)
	s = replaceCI(s, `fill="#2c1c15"`, `fill="#`+shades.base+`"`)
	s = replaceCI(s, `fill="#2c1d15"`, `fill="#`+shades.base+`"`)
	s = replaceCI(s, `fill="#2d1d16"`, `fill="#`+shades.base+`"`)
	s = replaceCI(s, `fill="#2D1D17"`, `fill="#`+shades.base+`"`)
	s = replaceCI(s, `fill="#2C1C16"`, `fill="#`+shades.base+`"`)
	s = replaceCI(s, `fill="#3e2b24"`, `fill="#`+shades.mid+`"`)
	s = replaceCI(s, `fill="#3f2c24"`, `fill="#`+shades.mid+`"`)
	s = replaceCI(s, `fill="#3f2c25"`, `fill="#`+shades.mid+`"`)
	s = replaceCI(s, `fill="#3F2C25"`, `fill="#`+shades.mid+`"`)
	s = replaceCI(s, `fill="#854A29"`, `fill="#`+shades.light+`"`)
	s = replaceCI(s, `fill="#de491e"`, `fill="#`+shades.light+`"`)
	s = replaceCI(s, `fill="#dd4b20"`, `fill="#`+shades.light+`"`)
	s = replaceCI(s, `fill="#bd2e15"`, `fill="#`+shades.base+`"`)
	s = replaceCI(s, `fill="#bd2e16"`, `fill="#`+shades.base+`"`)
	s = replaceCI(s, `fill="#BD2E15"`, `fill="#`+shades.base+`"`)
	return s
}

func paintFemaleClothInner(inner, seed string) string {
	scheme := femaleClothFillPresets[seededIndex(seed+":female-cloth-fill", len(femaleClothFillPresets))]
	s := inner
	s = replaceCI(s, `fill="#FEFEFE"`, `fill="#`+scheme.base+`"`)
	s = replaceCI(s, `fill="#D7DADE"`, `fill="#`+scheme.shade+`"`)
	s = replaceCI(s, `fill="#D4D7DC"`, `fill="#`+scheme.dark+`"`)
	s = replaceCI(s, `fill="#FBF7F3"`, `fill="#`+scheme.base+`"`)
	s = replaceCI(s, `fill="#FBF7F2"`, `fill="#`+scheme.base+`"`)
	s = replaceCI(s, `fill="#D3D7DC"`, `fill="#`+scheme.shade+`"`)
	s = replaceCI(s, `fill="#D0D5D9"`, `fill="#`+scheme.shade+`"`)
	s = replaceCI(s, `fill="#D9DADB"`, `fill="#`+scheme.shade+`"`)
	s = replaceCI(s, `fill="#CBD1D6"`, `fill="#`+scheme.dark+`"`)
	s = replaceCI(s, `fill="#A3B2BE"`, `fill="#`+scheme.dark+`"`)
	s = replaceCI(s, `fill="#C6C3C1"`, `fill="#`+scheme.dark+`"`)
	s = replaceCI(s, `fill="#FCF6ED"`, `fill="#`+scheme.base+`"`)
	s = replaceCI(s, `fill="#DCCEC0"`, `fill="#`+scheme.shade+`"`)
	s = replaceCI(s, `fill="#F1E2C1"`, `fill="#`+scheme.base+`"`)
	s = replaceCI(s, `fill="#6C4B38"`, `fill="#`+scheme.shade+`"`)
	s = replaceCI(s, `fill="#6C4C39"`, `fill="#`+scheme.shade+`"`)
	s = replaceCI(s, `fill="#6D4D39"`, `fill="#`+scheme.shade+`"`)
	s = replaceCI(s, `fill="#6C4A37"`, `fill="#`+scheme.shade+`"`)
	s = replaceCI(s, `fill="#6B4A37"`, `fill="#`+scheme.shade+`"`)
	s = replaceCI(s, `fill="#366938"`, `fill="#`+scheme.dark+`"`)
	s = replaceCI(s, `fill="#07451A"`, `fill="#`+scheme.dark+`"`)
	s = replaceCI(s, `fill="#9B442B"`, `fill="#`+scheme.dark+`"`)
	s = replaceCI(s, `fill="#672016"`, `fill="#`+scheme.dark+`"`)
	s = replaceCI(s, `fill="#B97452"`, `fill="#`+scheme.shade+`"`)
	return s
}


func pickFemaleAccessoryPreset(seed string) *femaleAccessoryPreset {
	if seededIndex(seed+":female-acc", 100) < 50 {
		return nil
	}
	idx := seededIndex(seed+":female-acc-preset", len(femaleAccessoryPresets))
	p := femaleAccessoryPresets[idx]
	return &p
}

func femaleBgHex(seed, explicitBg string) string {
	fallback := femaleBGPresets[seededIndex(seed+":female-bg", len(femaleBGPresets))]
	return normalizeHex(explicitBg, fallback)
}

func pickFemaleHairFillHex(seed string) string {
	return femaleHairFillPresets[seededIndex(seed+":female-hair-fill", len(femaleHairFillPresets))]
}

// GenerateAvatarVectorFemale renders a female vector avatar SVG.
func GenerateAvatarVectorFemale(opts AvatarVectorAssetOptions) string {
	seed := opts.Seed
	s := parseSize(opts.Size, 32, 1024, 128)
	bgHex := femaleBgHex(seed, opts.Bg)
	baseInner := stripInkscapeSodipodiMarkup(readFemaleSvg("base.svg"))
	clothRel := femaleClothFiles[seededIndex(seed+":female-cloth", len(femaleClothFiles))]
	clothInner := paintFemaleClothInner(stripInkscapeSodipodiMarkup(readFemaleSvg(clothRel)), seed)
	hairFillHex := pickFemaleHairFillHex(seed)
	hairRel := femaleHairFiles[seededIndex(seed+":female-hair", len(femaleHairFiles))]
	hairInner := paintFemaleHairInner(stripInkscapeSodipodiMarkup(readFemaleSvg(hairRel)), hairFillHex)
	eyesRel := femaleEyesFiles[seededIndex(seed+":female-eyes", len(femaleEyesFiles))]
	eyesInner := stripInkscapeSodipodiMarkup(readFemaleSvg(eyesRel))
	browsRel := femaleBrowsFiles[seededIndex(seed+":female-brows", len(femaleBrowsFiles))]
	browsInner := paintFemaleBrowInner(stripInkscapeSodipodiMarkup(readFemaleSvg(browsRel)), hairFillHex)
	mouthRel := femaleMouthFiles[seededIndex(seed+":female-mouth", len(femaleMouthFiles))]
	mouthInner := stripInkscapeSodipodiMarkup(readFemaleSvg(mouthRel))
	noseRel := femaleNoseFiles[seededIndex(seed+":female-nose", len(femaleNoseFiles))]
	noseInner := stripInkscapeSodipodiMarkup(readFemaleSvg(noseRel))
	blushInner := stripInkscapeSodipodiMarkup(readFemaleSvg(femaleBlushFile))
	blushBlock := ""
	if seededIndex(seed+":female-blush", 100) < 50 {
		blushBlock = `<g id="female-blush">` + blushInner + `</g>`
	}
	accPreset := pickFemaleAccessoryPreset(seed)
	var accPainted string
	var accessoryBlock string
	if accPreset != nil {
		accInnerRaw := readFemaleSvg(accPreset.rel)
		accInner := stripInkscapeSodipodiMarkup(accInnerRaw)
		if accInner != "" {
			accPainted = paintFemaleAccessoryInner(accInner, seed, accPreset.id)
			tf := ""
			if accPreset.transform != "" {
				tf = ` transform="` + accPreset.transform + `"`
			}
			accessoryBlock = `<g id="female-accessory"` + tf + `>` + accPainted + `</g>`
		}
	}
	accessoryBlockBefore := ""
	accessoryBlockBeforeHair := ""
	accessoryBlockAfter := ""
	if accPreset != nil && accPainted != "" {
		if !accPreset.drawAfterFace && !accPreset.drawBeforeHair {
			accessoryBlockBefore = accessoryBlock
			accessoryBlock = ""
		}
		if accPreset.drawBeforeHair {
			accessoryBlockBeforeHair = accessoryBlock
			accessoryBlock = ""
		}
		if accPreset.drawAfterFace {
			accessoryBlockAfter = accessoryBlock
			accessoryBlock = ""
		}
	}
	return `<svg xmlns="http://www.w3.org/2000/svg" width="` + strconv.Itoa(s) + `" height="` + strconv.Itoa(s) + `" viewBox="0 0 1028 1024">
  <rect width="1028" height="1024" fill="#` + bgHex + `"/>
  <g id="female-art">
    <g id="female-base">` + baseInner + `</g>
    <g id="female-cloth">` + clothInner + `</g>
    ` + accessoryBlockBefore + `
    <g id="female-eyes">` + eyesInner + `</g>
    <g id="female-brows">` + browsInner + `</g>
    ` + blushBlock + `
    ` + accessoryBlockBeforeHair + `
    <g id="female-hair">` + hairInner + `</g>
    <g id="female-nose">` + noseInner + `</g>
    <g id="female-mouth">` + mouthInner + `</g>
    ` + accessoryBlockAfter + `
  </g>
</svg>`
}

