package handlers

import (
	"encoding/json"
	"log"
	"net/http"
	"strconv"
	"strings"
	"time"

	"portfolio-backend/internal/database"
	"portfolio-backend/internal/models"
	"portfolio-backend/internal/utils"
)

func GetProjects(w http.ResponseWriter, r *http.Request) {
	lang := r.URL.Query().Get("lang")
	cacheKey := "projects:" + lang

	if data, ok := CacheGet(cacheKey); ok {
		w.Header().Set("Content-Type", "application/json")
		w.Header().Set("X-Cache", "HIT")
		w.Write(data)
		return
	}

	var projects []models.Project
	var filters models.ProjectFilter

	filters.Technologies = r.URL.Query()["technologies"]
	filters.Search = r.URL.Query().Get("search")
	filters.StartDate = r.URL.Query().Get("startDate")
	filters.EndDate = r.URL.Query().Get("endDate")

	page, _ := strconv.Atoi(r.URL.Query().Get("page"))
	limit, _ := strconv.Atoi(r.URL.Query().Get("limit"))

	if page <= 0 {
		page = 1
	}
	if limit <= 0 {
		limit = 10
	}
	offset := (page - 1) * limit

	query := database.DB.Preload("Technologies")

	if len(filters.Technologies) > 0 {
		skillQuery := `
			SELECT ps.project_id 
			FROM project_skills ps
			JOIN skills s ON ps.skill_id = s.id
			WHERE LOWER(s.name) IN (?)
		`
		techList := make([]interface{}, len(filters.Technologies))
		for i, tech := range filters.Technologies {
			techList[i] = strings.ToLower(tech)
		}

		var projectIDs []string
		if err := database.DB.Raw(skillQuery, techList).Scan(&projectIDs).Error; err != nil {
			log.Println("Error en la consulta de tecnologías:", err)
			http.Error(w, "Error al filtrar proyectos por tecnologías", http.StatusInternalServerError)
			return
		}

		if len(projectIDs) > 0 {
			query = query.Where("id IN (?)", projectIDs)
		} else {
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusOK)
			json.NewEncoder(w).Encode([]models.Project{})
			return
		}
	}

	if filters.Search != "" {
		query = query.Where("name ILIKE ? OR content ILIKE ?", "%"+filters.Search+"%", "%"+filters.Search+"%")
	}

	if filters.StartDate != "" && filters.EndDate != "" {
		start, _ := time.Parse("2006-01-02", filters.StartDate)
		end, _ := time.Parse("2006-01-02", filters.EndDate)
		query = query.Where("created_at BETWEEN ? AND ?", start, end)
	}

	query.Limit(limit).Offset(offset).Find(&projects)

	for i, project := range projects {
		var technologies []models.Skill
		if len(project.TechnologiesIds) > 0 {
			if err := database.DB.Where("id IN ?", project.TechnologiesIds).Find(&technologies).Error; err != nil {
				log.Println("Error al cargar tecnologías para el proyecto:", project.ID, err)
			}
		}
		projects[i].Technologies = technologies
	}

	for i := range projects {
		localizeProject(&projects[i], lang)
	}

	CacheSet(cacheKey, projects)

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(projects)
}

func localizeProject(p *models.Project, lang string) {
	if lang == "es" {
		if p.NameES != "" {
			p.Name = p.NameES
		}
		if p.ContentES != "" {
			p.Content = p.ContentES
		}
		if p.ArchitectureES != "" {
			p.Architecture = p.ArchitectureES
		}
	} else {
		if p.NameEN != "" {
			p.Name = p.NameEN
		}
		if p.ContentEN != "" {
			p.Content = p.ContentEN
		}
		if p.ArchitectureEN != "" {
			p.Architecture = p.ArchitectureEN
		}
	}
}

func GetProject(w http.ResponseWriter, r *http.Request) {
	id := r.URL.Query().Get("id")
	if id == "" {
		http.Error(w, "ID del Proyecto no proporcionado", http.StatusBadRequest)
		return
	}

	var project models.Project
	result := database.DB.Preload("Technologies").First(&project, "id = ?", id)
	if result.Error != nil {
		http.Error(w, "Proyecto no encontrado", http.StatusNotFound)
		return
	}

	lang := r.URL.Query().Get("lang")
	localizeProject(&project, lang)

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(project)
}

func AddProject(w http.ResponseWriter, r *http.Request) {
	contentType := r.Header.Get("Content-Type")
	var project models.Project

	if strings.HasPrefix(contentType, "multipart/form-data") {
		log.Println("Procesando multipart/form-data")
		handleMultipartFormProject(w, r, &project)
	} else if contentType == "application/json" {
		log.Println("Procesando application/json")
		handleJSONProject(w, r, &project)
	} else {
		http.Error(w, "Content-Type no soportado", http.StatusUnsupportedMediaType)
		return
	}

	if project.GithubURL != "" && !utils.IsValidURL(project.GithubURL) {
		http.Error(w, "La URL de Github no es válida", http.StatusBadRequest)
		return
	}
	if project.Url != "" && !utils.IsValidURL(project.Url) {
		http.Error(w, "La URL del proyecto no es válida", http.StatusBadRequest)
		return
	}

	var skills []models.Skill
	if len(project.TechnologiesIds) > 0 {
		if err := database.DB.Where("id IN ?", project.TechnologiesIds).Find(&skills).Error; err != nil {
			log.Println("Error al cargar tecnologías para el proyecto:", err)
		}
	}

	newProject := models.Project{
		ID:              "project-" + time.Now().Format("20060102150405"),
		Name:            project.Name,
		Content:         project.Content,
		TechnologiesIds: project.TechnologiesIds,
		Technologies:    skills,
		GithubURL:       project.GithubURL,
		Url:             project.Url,
		Images:          project.Images,
	}

	if err := database.DB.Create(&newProject).Error; err != nil {
		log.Println("Error al crear el proyecto:", err)
		http.Error(w, "Error al crear el proyecto", http.StatusInternalServerError)
		return
	}

	CacheInvalidate("projects")

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(newProject)
}

func DeleteProject(w http.ResponseWriter, r *http.Request) {
	id := r.URL.Query().Get("id")
	if id == "" {
		http.Error(w, "ID del Proyecto no proporcionado", http.StatusBadRequest)
		return
	}

	if err := database.DB.Delete(&models.Project{}, "id = ?", id).Error; err != nil {
		http.Error(w, "Error al eliminar el Proyecto", http.StatusInternalServerError)
		return
	}

	CacheInvalidate("projects")

	w.WriteHeader(http.StatusOK)
	w.Write([]byte("Proyecto eliminado con ID: " + id + " eliminado correctamente"))
}

func UpdateProject(w http.ResponseWriter, r *http.Request) {
	contentType := r.Header.Get("Content-Type")
	var updatedProject models.Project

	if strings.HasPrefix(contentType, "multipart/form-data") {
		log.Println("Procesando multipart/form-data")
		handleMultipartFormProject(w, r, &updatedProject)
	} else if contentType == "application/json" {
		log.Println("Procesando application/json")
		handleJSONProject(w, r, &updatedProject)
	} else {
		http.Error(w, "Content-Type no soportado", http.StatusUnsupportedMediaType)
		return
	}

	if updatedProject.ID == "" {
		http.Error(w, "El ID del Proyecto es requerido", http.StatusBadRequest)
		return
	}

	var existingProject models.Project
	if err := database.DB.Preload("Technologies").First(&existingProject, "id = ?", updatedProject.ID).Error; err != nil {
		http.Error(w, "Proyecto no encontrado", http.StatusNotFound)
		return
	}

	if updatedProject.Name != "" {
		existingProject.Name = updatedProject.Name
	}
	if updatedProject.Content != "" {
		existingProject.Content = updatedProject.Content
	}
	if updatedProject.GithubURL != "" {
		if !utils.IsValidURL(updatedProject.GithubURL) {
			http.Error(w, "URL de Github no es válida", http.StatusBadRequest)
			return
		}
		existingProject.GithubURL = updatedProject.GithubURL
	}
	if updatedProject.Url != "" {
		if !utils.IsValidURL(updatedProject.Url) {
			http.Error(w, "URL del proyecto no es válida", http.StatusBadRequest)
			return
		}
		existingProject.Url = updatedProject.Url
	}
	if len(updatedProject.Images) > 0 {
		existingProject.Images = updatedProject.Images
	}

	var skills []models.Skill
	if len(updatedProject.TechnologiesIds) > 0 {
		if err := database.DB.Where("id IN ?", updatedProject.TechnologiesIds).Find(&skills).Error; err != nil {
			log.Println("Error al cargar tecnologías para el proyecto:", existingProject.ID, err)
		} else {
			log.Println("Tecnologías encontradas:", skills)
			existingProject.Technologies = skills
			existingProject.TechnologiesIds = updatedProject.TechnologiesIds
		}
	}

	if err := database.DB.Save(&existingProject).Error; err != nil {
		http.Error(w, "Error al actualizar el Proyecto", http.StatusInternalServerError)
		return
	}

	CacheInvalidate("projects")

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(existingProject)
}

func handleMultipartFormProject(w http.ResponseWriter, r *http.Request, project *models.Project) {
	err := r.ParseMultipartForm(10 << 20)
	if err != nil {
		log.Println("Error al procesar el formulario:", err)
		http.Error(w, "Error al procesar el formulario", http.StatusBadRequest)
		return
	}

	project.Name = r.FormValue("name")
	project.Content = r.FormValue("content")
	project.GithubURL = r.FormValue("githubUrl")
	project.Url = r.FormValue("url")
	project.TechnologiesIds = r.Form["technologiesIds"]

	var imageUrls []string
	files := r.MultipartForm.File["images"]
	for _, fileHeader := range files {
		file, err := fileHeader.Open()
		if err != nil {
			log.Println("Error al abrir archivo:", err)
			continue
		}
		defer file.Close()

		uploadedUrl, err := utils.UploadImage(file, fileHeader.Filename)
		if err != nil {
			log.Println("Error al subir imagen:", err)
			continue
		}
		imageUrls = append(imageUrls, uploadedUrl)
	}
	project.Images = imageUrls
}

func handleJSONProject(w http.ResponseWriter, r *http.Request, project *models.Project) {
	if err := json.NewDecoder(r.Body).Decode(&project); err != nil {
		log.Println("Error al leer el JSON:", err)
		http.Error(w, "Error al leer el JSON", http.StatusBadRequest)
	}
	if project.Images == nil {
		project.Images = []string{}
	}
}
