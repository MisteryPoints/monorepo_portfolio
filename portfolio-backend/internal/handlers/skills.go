package handlers

import (
	"encoding/json"
	"net/http"
	"time"

	"portfolio-backend/internal/database"
	"portfolio-backend/internal/models"
)

func GetSkills(w http.ResponseWriter, r *http.Request) {
	lang := r.URL.Query().Get("lang")
	cacheKey := "skills:" + lang

	if data, ok := CacheGet(cacheKey); ok {
		w.Header().Set("Content-Type", "application/json")
		w.Header().Set("X-Cache", "HIT")
		w.Write(data)
		return
	}

	var skills []models.Skill
	result := database.DB.Find(&skills)
	if result.Error != nil {
		http.Error(w, "Error al obtener los Skills", http.StatusInternalServerError)
		return
	}

	for i := range skills {
		localizeSkill(&skills[i], lang)
	}

	CacheSet(cacheKey, skills)

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(skills)
}

func localizeSkill(s *models.Skill, lang string) {
	if lang == "es" {
		if s.NameES != "" {
			s.Name = s.NameES
		}
	} else {
		if s.NameEN != "" {
			s.Name = s.NameEN
		}
	}
}

func AddSkill(w http.ResponseWriter, r *http.Request) {
	var skill models.Skill
	err := json.NewDecoder(r.Body).Decode(&skill)
	if err != nil {
		http.Error(w, "Error al leer el JSON de la Skill", http.StatusBadRequest)
		return
	}

	skill.ID = "skill-" + time.Now().Format("20060102150405")

	if err := database.DB.Create(&skill).Error; err != nil {
		http.Error(w, "Error al crear el Skill", http.StatusInternalServerError)
		return
	}

	CacheInvalidate("skills")
	CacheInvalidate("skillTree")

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

	CacheInvalidate("skills")
	CacheInvalidate("skillTree")

	w.WriteHeader(http.StatusOK)
	w.Write([]byte("Skill con ID: " + id + " eliminada correctamente"))
}

type SkillNode struct {
	models.Skill
	Children []*SkillNode `json:"children"`
}

func GetSkillTree(w http.ResponseWriter, r *http.Request) {
	lang := r.URL.Query().Get("lang")
	cacheKey := "skillTree:" + lang

	if data, ok := CacheGet(cacheKey); ok {
		w.Header().Set("Content-Type", "application/json")
		w.Header().Set("X-Cache", "HIT")
		w.Write(data)
		return
	}

	var skills []models.Skill
	if err := database.DB.Find(&skills).Error; err != nil {
		http.Error(w, "Error al obtener los Skills", http.StatusInternalServerError)
		return
	}

	skillMap := make(map[string]*SkillNode)
	var rootNodes []*SkillNode

	for _, s := range skills {
		skillMap[s.ID] = &SkillNode{
			Skill:    s,
			Children: []*SkillNode{},
		}
	}

	for _, s := range skills {
		node := skillMap[s.ID]
		localizeSkill(&node.Skill, lang)
		if s.ParentID == "" {
			rootNodes = append(rootNodes, node)
		} else {
			if parent, ok := skillMap[s.ParentID]; ok {
				parent.Children = append(parent.Children, node)
			} else {
				rootNodes = append(rootNodes, node)
			}
		}
	}

	CacheSet(cacheKey, rootNodes)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(rootNodes)
}
