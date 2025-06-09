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
	var projects []models.Project
	var filters models.ProjectFilter

	// Obtenemos los parámetros de búsqueda desde la URL
	filters.Technologies = r.URL.Query()["technologies"]
	filters.Search = r.URL.Query().Get("search")
	filters.StartDate = r.URL.Query().Get("startDate")
	filters.EndDate = r.URL.Query().Get("endDate")

	// Paginación
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

	// Filtrar por tecnologías
	if len(filters.Technologies) > 0 {
		var projectIDs []string

		// Consulta optimizada con JOIN a `skills` usando ILIKE
		skillQuery := `
			SELECT ps.project_id 
			FROM project_skills ps
			JOIN skills s ON ps.skill_id = s.id
			WHERE LOWER(s.name) IN (?)
		`

		// Convertir los nombres a minúsculas para asegurar case-insensitivity
		techList := make([]interface{}, len(filters.Technologies))
		for i, tech := range filters.Technologies {
			techList[i] = strings.ToLower(tech)
		}

		// Ejecutar la consulta
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

	// Filtrar por nombre o contenido
	if filters.Search != "" {
		query = query.Where("name ILIKE ? OR content ILIKE ?", "%"+filters.Search+"%", "%"+filters.Search+"%")
	}

	// Filtrar por fecha de inicio y fin
	if filters.StartDate != "" && filters.EndDate != "" {
		start, _ := time.Parse("2006-01-02", filters.StartDate)
		end, _ := time.Parse("2006-01-02", filters.EndDate)
		query = query.Where("created_at BETWEEN ? AND ?", start, end)
	}

	// Paginación
	query.Limit(limit).Offset(offset).Find(&projects)

	// Asignar tecnologías a cada proyecto
	for i, project := range projects {
		var technologies []models.Skill

		if len(project.TechnologiesIds) > 0 {
			// Convertir el array a una cadena 'skill-1','skill-2'
			techList := "'" + strings.Join(project.TechnologiesIds, "','") + "'"

			// Realizar la consulta correctamente
			query := "SELECT * FROM skills WHERE id IN (" + techList + ")"
			if err := database.DB.Raw(query).Scan(&technologies).Error; err != nil {
				log.Println("Error al cargar tecnologías para el proyecto:", project.ID, err)
			}
		}

		projects[i].Technologies = technologies
	}

	// Respuesta en JSON
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(projects)
}

func GetProject(w http.ResponseWriter, r *http.Request) {
	// Obtenemos el ID del proyecto desde la URL
	id := r.URL.Query().Get("id")

	// Validamos que el ID no esté vacío
	if id == "" {
		http.Error(w, "ID del Proyecto no proporcionado", http.StatusBadRequest)
		return
	}

	var project []models.Project

	// Buscamos el Proyecto en la base de datos, con las tecnologías relacionadas
	result := database.DB.Preload("Technologies").Find(&project)

	// Validamos si hubo un error al buscar el proyecto
	if result.Error != nil {
		http.Error(w, "Error al obtener el Proyecto", http.StatusInternalServerError)
		return
	}

	// Validamos si el proyecto no fue encontrado
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)

	// Convertimos y escribimos el resultado como JSON
	json.NewEncoder(w).Encode(project)
}

// AddProject maneja tanto multipart/form-data como application/json
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

	// Verificar URLs
	if !utils.IsValidURL(project.GithubURL) || !utils.IsValidURL(project.Url) {
		http.Error(w, "Una o ambas URLs no son válidas", http.StatusBadRequest)
		return
	}

	// Verificar y obtener tecnologías
	var skills []models.Skill
	if len(project.TechnologiesIds) > 0 {
		// Convertir el array a una cadena 'skill-1','skill-2'
		techList := "'" + strings.Join(project.TechnologiesIds, "','") + "'"

		// Realizar la consulta correctamente
		query := "SELECT * FROM skills WHERE id IN (" + techList + ")"
		if err := database.DB.Raw(query).Scan(&skills).Error; err != nil {
			log.Println("Error al cargar tecnologías para el proyecto:", project.ID, err)
		}
	}

	// Crear el proyecto
	newProject := models.Project{
		ID:              "project-" + time.Now().Format("20060102150405"),
		Name:            project.Name,
		Content:         project.Content,
		TechnologiesIds: []string{database.ToPgArray(project.TechnologiesIds)},
		Technologies:    skills,
		GithubURL:       project.GithubURL,
		Url:             project.Url,
		Images:          project.Images,
	}

	// Guardar el proyecto
	if err := database.DB.Create(&newProject).Error; err != nil {
		log.Println("Error al crear el proyecto:", err)
		http.Error(w, "Error al crear el proyecto", http.StatusInternalServerError)
		return
	}

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

	w.WriteHeader(http.StatusOK)
	w.Write([]byte("Proyecto eliminado con ID: " + id + " eliminado correctamente"))
}

// UpdateProject - Actualizar proyecto con soporte para JSON y Multipart Form
func UpdateProject(w http.ResponseWriter, r *http.Request) {
	contentType := r.Header.Get("Content-Type")
	var updatedProject models.Project

	// Verificar el Content-Type
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

	// Verificar que el ID no esté vacío
	if updatedProject.ID == "" {
		http.Error(w, "El ID del Proyecto es requerido", http.StatusBadRequest)
		return
	}

	// Buscar el proyecto existente
	var existingProject models.Project

	if err := database.DB.Preload("Technologies").First(&existingProject, "id = ?", updatedProject.ID).Error; err != nil {
		http.Error(w, "Proyecto no encontrado", http.StatusNotFound)
		return
	}

	// Actualizar los campos enviados
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

	// Verificar tecnologías si se proporciona un nuevo `technologiesIds`
	var skills []models.Skill
	if len(existingProject.TechnologiesIds) > 0 {
		// Convertir el array a una cadena 'skill-1','skill-2'
		techList := "'" + strings.Join(updatedProject.TechnologiesIds, "','") + "'"

		log.Println("Lista de tecnologías:", techList)
		// Realizar la consulta correctamente
		query := "SELECT * FROM skills WHERE id IN (" + techList + ")"
		if err := database.DB.Raw(query).Scan(&skills).Error; err != nil {
			log.Println("Error al cargar tecnologías para el proyecto:", existingProject.ID, err)
		} else {
			log.Println("Tecnologías encontradas:", skills)
			existingProject.Technologies = skills
			existingProject.TechnologiesIds = updatedProject.TechnologiesIds
		}
	}

	// Guardar los cambios en la base de datos
	if err := database.DB.Save(&existingProject).Error; err != nil {
		http.Error(w, "Error al actualizar el Proyecto", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(existingProject)
}

// handleMultipartFormProject maneja el caso de multipart/form-data
func handleMultipartFormProject(w http.ResponseWriter, r *http.Request, project *models.Project) {
	err := r.ParseMultipartForm(10 << 20) // 10 MB
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

	// Subir imágenes a Cloudinary
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

// handleJSONProject maneja el caso de application/json
func handleJSONProject(w http.ResponseWriter, r *http.Request, project *models.Project) {
	if err := json.NewDecoder(r.Body).Decode(&project); err != nil {
		log.Println("Error al leer el JSON:", err)
		http.Error(w, "Error al leer el JSON", http.StatusBadRequest)
		return
	} else {
		log.Println("JSON recibido:", project.ID, project.Name, project.Content, project.GithubURL, project.Url, project.TechnologiesIds)
	}

	// Si no se envían imágenes, inicializar el slice vacío
	if project.Images == nil {
		project.Images = []string{}
	}
}
