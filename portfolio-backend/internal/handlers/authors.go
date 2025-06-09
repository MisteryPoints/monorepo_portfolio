package handlers

import (
	"encoding/json"
	"log"
	"net/http"
	"strings"
	"time"

	"portfolio-backend/internal/database"
	"portfolio-backend/internal/models"
	"portfolio-backend/internal/utils"
)

func GetAuthors(w http.ResponseWriter, r *http.Request) {
	var authors []models.Author

	result := database.DB.Find(&authors)

	if result.Error != nil {
		http.Error(w, "Error al obtener los autores", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(authors)
}

func AddAuthor(w http.ResponseWriter, r *http.Request) {
	contentType := r.Header.Get("Content-Type")
	var author models.Author

	if strings.HasPrefix(contentType, "multipart/form-data") {
		log.Println("Procesando multipart/form-data")
		handleMultipartFormAuthor(w, r, &author)
	} else if contentType == "application/json" {
		log.Println("Procesando application/json")
		handleJSONAuthor(w, r, &author)
	} else {
		http.Error(w, "Content-Type no soportado", http.StatusUnsupportedMediaType)
		return
	}

	if author.ID == "" {
		author.ID = "author-" + time.Now().Format("20060102150405")
	}

	if err := database.DB.Create(&author).Error; err != nil {
		log.Println("Error al crear el autor:", err)
		http.Error(w, "Error al crear el autor", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(author)
}

func DeleteAuthor(w http.ResponseWriter, r *http.Request) {
	id := r.URL.Query().Get("id")

	if id == "" {
		http.Error(w, "ID del autor no proporcionado", http.StatusBadRequest)
		return
	}

	result := database.DB.Delete(&models.Author{}, "id = ?", id)

	if result.Error != nil {
		http.Error(w, "Error al eliminar el autor", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	w.Write([]byte("Autor con ID: " + id + " eliminado correctamente"))
}

func UpdateAuthor(w http.ResponseWriter, r *http.Request) {
	contentType := r.Header.Get("Content-Type")
	var updatedAuthor models.Author

	if strings.HasPrefix(contentType, "multipart/form-data") {
		log.Println("Procesando multipart/form-data")
		handleMultipartFormAuthor(w, r, &updatedAuthor)
	} else if contentType == "application/json" {
		log.Println("Procesando application/json")
		handleJSONAuthor(w, r, &updatedAuthor)
	} else {
		http.Error(w, "Content-Type no soportado", http.StatusUnsupportedMediaType)
		return
	}

	if updatedAuthor.ID == "" {
		http.Error(w, "ID del autor es requerido", http.StatusBadRequest)
		return
	}

	// Verificar que el autor exista
	var existingAuthor models.Author
	if err := database.DB.First(&existingAuthor, "id = ?", updatedAuthor.ID).Error; err != nil {
		http.Error(w, "Autor no encontrado", http.StatusNotFound)
		return
	}

	// Actualizar los campos
	if updatedAuthor.Name != "" {
		existingAuthor.Name = updatedAuthor.Name
	}

	if updatedAuthor.Image != "" {
		existingAuthor.Image = updatedAuthor.Image
	}

	if err := database.DB.Save(&existingAuthor).Error; err != nil {
		log.Println("Error al actualizar el autor:", err)
		http.Error(w, "Error al actualizar el autor", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(existingAuthor)
}

func handleMultipartFormAuthor(w http.ResponseWriter, r *http.Request, author *models.Author) {
	err := r.ParseMultipartForm(10 << 20) // 10 MB
	if err != nil {
		log.Println("Error al procesar el formulario:", err)
		http.Error(w, "Error al procesar el formulario", http.StatusBadRequest)
		return
	}

	author.ID = r.FormValue("id")
	author.Name = r.FormValue("name")

	// Subir imagen a Cloudinary
	file, fileHeader, err := r.FormFile("image")
	if err == nil {
		defer file.Close()

		imageURL, err := utils.UploadImage(file, fileHeader.Filename)
		if err != nil {
			log.Println("Error al subir la imagen:", err)
		} else {
			author.Image = imageURL
		}
	}
}

func handleJSONAuthor(w http.ResponseWriter, r *http.Request, author *models.Author) {
	if err := json.NewDecoder(r.Body).Decode(&author); err != nil {
		log.Println("Error al leer el JSON del autor:", err)
		http.Error(w, "Error al leer el JSON del autor", http.StatusBadRequest)
		return
	}
}
