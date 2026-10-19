package generator

type avatarPalette struct {
	Bg, Fg, A1, A2, A3 string
}

var (
	AvatarKindKeys = []string{
		"man", "male", "female", "cat", "dog", "panda", "fox",
	}

	AvatarAnimalKindKeys = []string{"cat", "dog", "panda", "fox"}
	AvatarHumanKindKeys  = []string{"male", "female"}

	AvatarStyleKeys   = []string{"flat", "outline", "duotone"}
	AvatarPaletteKeys = []string{"soft", "vivid", "earth", "mono", "ocean"}
	AvatarSizePresetValues = []int{16, 32, 48, 64, 72, 96, 128, 192, 256, 384, 512}

	avatarPalettes = map[string]avatarPalette{
		"soft":  {Bg: "f4e7ff", Fg: "3f2a56", A1: "d9c2ff", A2: "b28aff", A3: "8a63d2"},
		"vivid": {Bg: "ffe8e8", Fg: "4f1422", A1: "ff7b89", A2: "ff4d6d", A3: "c1121f"},
		"earth": {Bg: "efe5d7", Fg: "3b2f2a", A1: "c8a97e", A2: "a67c52", A3: "6f4e37"},
		"mono":  {Bg: "f2f2f2", Fg: "222222", A1: "c7c7c7", A2: "8f8f8f", A3: "545454"},
		"ocean": {Bg: "e6f3ff", Fg: "12324a", A1: "78c4d4", A2: "3aa6c1", A3: "1d6f8a"},
	}
)
