package stock

import (
	"bytes"
	"fmt"
	"image"
	"image/color"
	_ "image/gif"
	"image/jpeg"
	"image/png"
	"strings"

	"github.com/chai2010/webp"
	"github.com/disintegration/imaging"
	xwebp "golang.org/x/image/webp"
)

func NormalizeFormat(format, fallback string) string {
	f := strings.ToLower(format)
	if f == "" {
		f = strings.ToLower(fallback)
	}
	if f == "jpg" {
		return "jpeg"
	}
	if f == "jpeg" || f == "png" || f == "webp" {
		return f
	}
	fb := strings.ToLower(fallback)
	if fb == "" {
		return "webp"
	}
	if fb == "jpg" {
		return "jpeg"
	}
	return fb
}

func NormalizeFit(fit string) string {
	v := strings.ToLower(fit)
	if v == "contain" || v == "inside" || v == "cover" {
		return v
	}
	return "cover"
}

func decodeImage(data []byte) (image.Image, error) {
	img, _, err := image.Decode(bytes.NewReader(data))
	if err == nil {
		return img, nil
	}
	// Try webp explicitly (may not be registered in all builds).
	if w, werr := xwebp.Decode(bytes.NewReader(data)); werr == nil {
		return w, nil
	}
	return nil, err
}

func encodeImage(img image.Image, format string, quality int) ([]byte, error) {
	var buf bytes.Buffer
	switch format {
	case "png":
		if err := png.Encode(&buf, img); err != nil {
			return nil, err
		}
	case "jpeg":
		if err := jpeg.Encode(&buf, img, &jpeg.Options{Quality: quality}); err != nil {
			return nil, err
		}
	case "webp":
		if err := webp.Encode(&buf, img, &webp.Options{Quality: float32(quality)}); err != nil {
			return nil, err
		}
	default:
		return nil, fmt.Errorf("unsupported format: %s", format)
	}
	return buf.Bytes(), nil
}

// ResizeImage resizes and re-encodes an image buffer.
func ResizeImage(data []byte, width, height int, fit, format string, quality int, defaultFormat string) (out []byte, outFormat string, err error) {
	outFormat = NormalizeFormat(format, defaultFormat)
	fit = NormalizeFit(fit)
	q := quality
	if q < 1 || q > 100 {
		q = 82
	}

	img, err := decodeImage(data)
	if err != nil {
		return nil, "", err
	}

	var resized image.Image
	switch fit {
	case "inside":
		resized = imaging.Fit(img, width, height, imaging.Lanczos)
	case "contain":
		fitted := imaging.Fit(img, width, height, imaging.Lanczos)
		canvas := imaging.New(width, height, color.NRGBA{0, 0, 0, 0})
		x := (width - fitted.Bounds().Dx()) / 2
		y := (height - fitted.Bounds().Dy()) / 2
		resized = imaging.Paste(canvas, fitted, image.Pt(x, y))
	default: // cover
		resized = imaging.Fill(img, width, height, imaging.Center, imaging.Lanczos)
	}

	out, err = encodeImage(resized, outFormat, q)
	return out, outFormat, err
}
