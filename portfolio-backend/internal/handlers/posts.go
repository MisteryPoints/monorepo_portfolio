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

func GetPosts(w http.ResponseWriter, r *http.Request) {
	cacheKey := "posts"

	if data, ok := CacheGet(cacheKey); ok {
		w.Header().Set("Content-Type", "application/json")
		w.Header().Set("X-Cache", "HIT")
		w.Write(data)
		return
	}

	var posts []models.Post
	var filters models.PostFilter

	filters.Badges = r.URL.Query()["badges"]
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

	query := database.DB.Preload("Author")

	if len(filters.Badges) > 0 {
		badgeList := make([]interface{}, len(filters.Badges))
		for i, badge := range filters.Badges {
			badgeList[i] = strings.ToLower(badge)
		}

		badgeQuery := `
			SELECT id 
			FROM posts 
			WHERE LOWER(badges::text) LIKE ANY (ARRAY[?])
		`
		var postIDs []string
		if err := database.DB.Raw(badgeQuery, badgeList).Scan(&postIDs).Error; err != nil {
			log.Println("Error al filtrar posts por badges:", err)
			http.Error(w, "Error al filtrar posts por badges", http.StatusInternalServerError)
			return
		}

		if len(postIDs) > 0 {
			query = query.Where("id IN ?", postIDs)
		} else {
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusOK)
			json.NewEncoder(w).Encode([]models.Post{})
			return
		}
	}

	if filters.Search != "" {
		query = query.Where("LOWER(subject) ILIKE ? OR LOWER(content) ILIKE ?", "%"+strings.ToLower(filters.Search)+"%", "%"+strings.ToLower(filters.Search)+"%")
	}

	if filters.StartDate != "" && filters.EndDate != "" {
		start, _ := time.Parse("2006-01-02", filters.StartDate)
		end, _ := time.Parse("2006-01-02", filters.EndDate)
		query = query.Where("created_at BETWEEN ? AND ?", start, end)
	}

	query.Limit(limit).Offset(offset).Find(&posts)

	CacheSet(cacheKey, posts)

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(posts)
}

func GetPost(w http.ResponseWriter, r *http.Request) {
	id := r.URL.Query().Get("id")
	if id == "" {
		http.Error(w, "ID del Post no proporcionado", http.StatusBadRequest)
		return
	}

	var post models.Post
	result := database.DB.Preload("Author").First(&post, "id = ?", id)
	if result.Error != nil {
		http.Error(w, "Post no encontrado", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(post)
}

func AddPost(w http.ResponseWriter, r *http.Request) {
	contentType := r.Header.Get("Content-Type")
	var newPost models.Post

	if strings.HasPrefix(contentType, "multipart/form-data") {
		log.Println("Procesando multipart/form-data")
		handleMultipartFormPost(w, r, &newPost)
	} else if contentType == "application/json" {
		log.Println("Procesando application/json")
		handleJSONPost(w, r, &newPost)
	} else {
		http.Error(w, "Content-Type no soportado", http.StatusUnsupportedMediaType)
		return
	}

	if newPost.Link != "" && !utils.IsValidURL(newPost.Link) {
		http.Error(w, "URL del post no es válida", http.StatusBadRequest)
		return
	}

	if newPost.AuthorID != "" {
		var author models.Author
		if err := database.DB.First(&author, "id = ?", newPost.AuthorID).Error; err != nil {
			http.Error(w, "Autor no encontrado", http.StatusNotFound)
			return
		}
	}

	var verifiedBadges []string
	for _, badge := range newPost.Badges {
		var existingBadge models.Badge
		if err := database.DB.First(&existingBadge, "name = ?", badge).Error; err != nil {
			newBadge := models.Badge{ID: "badge-" + badge, Name: badge}
			if err := database.DB.Create(&newBadge).Error; err != nil {
				http.Error(w, "Error al crear el Badge: "+badge, http.StatusInternalServerError)
				return
			}
		}
		verifiedBadges = append(verifiedBadges, badge)
	}

	post := models.Post{
		ID:        "post-" + time.Now().Format("20060102150405"),
		Subject:   newPost.Subject,
		Content:   newPost.Content,
		AuthorID:  newPost.AuthorID,
		Badges:    verifiedBadges,
		Images:    newPost.Images,
		Link:      newPost.Link,
		CreatedAt: time.Now().Format(time.RFC3339),
	}

	if err := database.DB.Create(&post).Error; err != nil {
		http.Error(w, "Error al crear el post", http.StatusInternalServerError)
		return
	}

	CacheInvalidate("posts")

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(post)
}

func DeletePost(w http.ResponseWriter, r *http.Request) {
	id := r.URL.Query().Get("id")
	if id == "" {
		http.Error(w, "ID del post no proporcionado", http.StatusBadRequest)
		return
	}

	if err := database.DB.Delete(&models.Post{}, "id = ?", id).Error; err != nil {
		http.Error(w, "Error al eliminar el post", http.StatusInternalServerError)
		return
	}

	CacheInvalidate("posts")

	w.WriteHeader(http.StatusOK)
	w.Write([]byte("Post con ID " + id + " eliminado correctamente"))
}

func UpdatePost(w http.ResponseWriter, r *http.Request) {
	contentType := r.Header.Get("Content-Type")
	var updatedPost models.Post

	if strings.HasPrefix(contentType, "multipart/form-data") {
		log.Println("Procesando multipart/form-data")
		handleMultipartFormPost(w, r, &updatedPost)
	} else if contentType == "application/json" {
		log.Println("Procesando application/json")
		handleJSONPost(w, r, &updatedPost)
	} else {
		http.Error(w, "Content-Type no soportado", http.StatusUnsupportedMediaType)
		return
	}

	if updatedPost.ID == "" {
		http.Error(w, "El ID del Post es requerido", http.StatusBadRequest)
		return
	}

	var existingPost models.Post
	if err := database.DB.Preload("Author").First(&existingPost, "id = ?", updatedPost.ID).Error; err != nil {
		http.Error(w, "Post no encontrado", http.StatusNotFound)
		return
	}

	if updatedPost.Subject != "" {
		existingPost.Subject = updatedPost.Subject
	}
	if updatedPost.Content != "" {
		existingPost.Content = updatedPost.Content
	}
	if updatedPost.Link != "" {
		if !utils.IsValidURL(updatedPost.Link) {
			http.Error(w, "URL del post no es válida", http.StatusBadRequest)
			return
		}
		existingPost.Link = updatedPost.Link
	}
	if len(updatedPost.Images) > 0 {
		existingPost.Images = updatedPost.Images
	}

	if len(updatedPost.Badges) > 0 {
		var verifiedBadges []string
		for _, badge := range updatedPost.Badges {
			var existingBadge models.Badge
			if err := database.DB.First(&existingBadge, "name = ?", badge).Error; err != nil {
				newBadge := models.Badge{ID: "badge-" + badge, Name: badge}
				if err := database.DB.Create(&newBadge).Error; err != nil {
					http.Error(w, "Error al crear el Badge: "+badge, http.StatusInternalServerError)
					return
				}
			}
			verifiedBadges = append(verifiedBadges, badge)
		}
		existingPost.Badges = verifiedBadges
	}

	if updatedPost.AuthorID != "" && updatedPost.AuthorID != existingPost.AuthorID {
		var author models.Author
		if err := database.DB.First(&author, "id = ?", updatedPost.AuthorID).Error; err != nil {
			http.Error(w, "Autor no encontrado", http.StatusNotFound)
			return
		}
		existingPost.AuthorID = updatedPost.AuthorID
	}

	if err := database.DB.Save(&existingPost).Error; err != nil {
		http.Error(w, "Error al actualizar el post", http.StatusInternalServerError)
		return
	}

	CacheInvalidate("posts")

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(existingPost)
}

func handleMultipartFormPost(w http.ResponseWriter, r *http.Request, post *models.Post) {
	err := r.ParseMultipartForm(10 << 20)
	if err != nil {
		log.Println("Error al procesar el formulario:", err)
		http.Error(w, "Error al procesar el formulario", http.StatusBadRequest)
		return
	}

	post.Subject = r.FormValue("subject")
	post.Content = r.FormValue("content")
	post.AuthorID = r.FormValue("authorId")
	post.Link = r.FormValue("link")
	post.Badges = r.Form["badges"]

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
	post.Images = imageUrls
}

func handleJSONPost(w http.ResponseWriter, r *http.Request, post *models.Post) {
	var raw map[string]interface{}
	if err := json.NewDecoder(r.Body).Decode(&raw); err != nil {
		http.Error(w, "Error al leer el JSON del Post", http.StatusBadRequest)
		return
	}

	if subject, ok := raw["subject"].(string); ok {
		post.Subject = subject
	} else if title, ok := raw["title"].(string); ok {
		post.Subject = title
	}

	if content, ok := raw["content"].(string); ok {
		post.Content = content
	}

	if authorId, ok := raw["authorId"].(string); ok {
		post.AuthorID = authorId
	}

	if badges, ok := raw["badges"].([]interface{}); ok {
		for _, b := range badges {
			if s, ok := b.(string); ok {
				post.Badges = append(post.Badges, s)
			}
		}
	} else if tags, ok := raw["tags"].([]interface{}); ok {
		for _, t := range tags {
			if s, ok := t.(string); ok {
				post.Badges = append(post.Badges, s)
			}
		}
	}

	if images, ok := raw["images"].([]interface{}); ok {
		for _, img := range images {
			if s, ok := img.(string); ok {
				post.Images = append(post.Images, s)
			}
		}
	}
	if post.Images == nil {
		post.Images = []string{}
	}

	if link, ok := raw["link"].(string); ok {
		post.Link = link
	}

	if id, ok := raw["id"].(string); ok {
		post.ID = id
	}
}
