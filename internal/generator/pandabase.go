package generator

import "path"

const PandaBaseSVGPath = "avatar/assets/panda/base.svg"

// ReadPandaBaseSvg returns the embedded panda base.svg contents.
func ReadPandaBaseSvg() (string, error) {
	raw, err := avatarAssets.ReadFile(path.Join("avatar", "assets", "panda", "base.svg"))
	if err != nil {
		return "", err
	}
	return string(raw), nil
}
