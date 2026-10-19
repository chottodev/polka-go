package stock

import (
	"bytes"
	"image"
	"image/color"
	"image/draw"
	"image/png"

	"github.com/chottodev/polka-go/internal/generator"
	"github.com/disintegration/imaging"
)

// CreateFallbackSVG builds a placeholder SVG used when Freepik fails.
func CreateFallbackSVG(width, height int, text string, maxWidth, maxHeight int) string {
	return generator.GeneratePlaceholder(generator.PlaceholderOptions{
		Width: width, Height: height,
		Bg: "e5e7eb", Fg: "6b7280",
		Text: text, Rounded: 0,
		MaxWidth: maxWidth, MaxHeight: maxHeight,
	})
}

// CreateFallbackRaster builds a solid-color raster when SVG→raster is unavailable.
func CreateFallbackRaster(width, height int, text string, format string, quality int) ([]byte, string, error) {
	img := imaging.New(width, height, color.NRGBA{R: 0xe5, G: 0xe7, B: 0xeb, A: 0xff})
	// Simple centered bar as visual marker (no font dependency).
	barW := width / 3
	if barW < 8 {
		barW = 8
	}
	barH := height / 12
	if barH < 4 {
		barH = 4
	}
	bar := imaging.New(barW, barH, color.NRGBA{R: 0x6b, G: 0x72, B: 0x80, A: 0xff})
	img = imaging.PasteCenter(img, bar)
	_ = text

	format = NormalizeFormat(format, "webp")
	out, err := encodeImage(img, format, quality)
	if err != nil {
		// Always able to fall back to PNG via stdlib.
		var buf bytes.Buffer
		rgba := image.NewNRGBA(image.Rect(0, 0, width, height))
		draw.Draw(rgba, rgba.Bounds(), &image.Uniform{C: color.NRGBA{R: 0xe5, G: 0xe7, B: 0xeb, A: 0xff}}, image.Point{}, draw.Src)
		if err2 := png.Encode(&buf, rgba); err2 != nil {
			return nil, "", err
		}
		return buf.Bytes(), "png", nil
	}
	return out, format, nil
}
