package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"
	"sync"

	"portfolio-backend/internal/database"
	"portfolio-backend/internal/models"
)

var (
	skillCounter int
	counterMutex sync.Mutex
)

func GetSkills(w http.ResponseWriter, r *http.Request) {
	var skills []models.Skill

	result := database.DB.Find(&skills)

	if result.Error != nil {
		http.Error(w, "Error al obtener los Skills", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(skills)
}

func AddSkill(w http.ResponseWriter, r *http.Request) {
	var skill models.Skill

	err := json.NewDecoder(r.Body).Decode(&skill)

	if err != nil {
		http.Error(w, "Error al leer el JSON de la Skill", http.StatusBadRequest)
		return
	}

	// Bloquear y aumentar el contador de forma segura
	counterMutex.Lock()
	skillCounter++
	skill.ID = "skill-" + fmt.Sprint(skillCounter)
	counterMutex.Unlock()

	if err := database.DB.Create(&skill).Error; err != nil {
		http.Error(w, "Error al crear el Skill", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(skill)
}

func DeleteSkill(w http.ResponseWriter, r *http.Request) {
	id := r.URL.Query().Get("id")

	if id == "" {
		http.Error(w, "ID de la Skill no proporcionado", http.StatusBadRequest)
		return
	}

	if err := database.DB.Delete(&models.Skill{}, "id = ?", id).Error; err != nil {
		http.Error(w, "Error al eliminar el Skill", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	w.Write([]byte("Skill con ID: " + id + " eliminada correctamente"))
}
