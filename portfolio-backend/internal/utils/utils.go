package utils

// Compara dos slices de strings
func AreSlicesEqual(a, b []string) bool {
	if len(a) != len(b) {
		return false
	}

	// Crear mapas para contar las ocurrencias
	countA := make(map[string]int)
	countB := make(map[string]int)

	for _, item := range a {
		countA[item]++
	}

	for _, item := range b {
		countB[item]++
	}

	for key, count := range countA {
		if countB[key] != count {
			return false
		}
	}

	return true
}
