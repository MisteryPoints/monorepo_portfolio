package handlers

import (
	"encoding/json"
	"net/http"
	"portfolio-backend/internal/database"
	"portfolio-backend/internal/models"
)

func GetTranslations(w http.ResponseWriter, r *http.Request) {
	lang := r.URL.Query().Get("lang")
	if lang == "" {
		lang = "en"
	}

	cacheKey := "translations:" + lang
	if data, ok := CacheGet(cacheKey); ok {
		w.Header().Set("Content-Type", "application/json")
		w.Header().Set("X-Cache", "HIT")
		w.Write(data)
		return
	}

	var translations []models.Translation
	if err := database.DB.Where("lang = ?", lang).Find(&translations).Error; err != nil {
		http.Error(w, "Failed to fetch translations", http.StatusInternalServerError)
		return
	}

	result := make(map[string]string)
	for _, t := range translations {
		result[t.Key] = t.Value
	}

	CacheSet(cacheKey, result)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(result)
}
