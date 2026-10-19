package stock

import (
	"bytes"
	"image"
	"image/color"
	"image/png"
	"testing"
)

func makePNG(w, h int) []byte {
	img := image.NewNRGBA(image.Rect(0, 0, w, h))
	for y := 0; y < h; y++ {
		for x := 0; x < w; x++ {
			img.Set(x, y, color.NRGBA{R: uint8(x), G: uint8(y), B: 100, A: 255})
		}
	}
	var buf bytes.Buffer
	_ = png.Encode(&buf, img)
	return buf.Bytes()
}

func TestResizeCover(t *testing.T) {
	src := makePNG(100, 50)
	out, format, err := ResizeImage(src, 40, 40, "cover", "png", 90, "webp")
	if err != nil {
		t.Fatal(err)
	}
	if format != "png" {
		t.Fatalf("format %s", format)
	}
	img, err := decodeImage(out)
	if err != nil {
		t.Fatal(err)
	}
	b := img.Bounds()
	if b.Dx() != 40 || b.Dy() != 40 {
		t.Fatalf("size %dx%d", b.Dx(), b.Dy())
	}
}

func TestFallbackRaster(t *testing.T) {
	out, format, err := CreateFallbackRaster(32, 24, "no image", "png", 80)
	if err != nil {
		t.Fatal(err)
	}
	if format != "png" || len(out) == 0 {
		t.Fatalf("bad fallback %s %d", format, len(out))
	}
}
