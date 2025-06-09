package handlers

import (
	"encoding/json"
	"net/http"

	"portfolio-backend/internal/database"
	"portfolio-backend/internal/models"
)

type Badge struct {
	PostID string `json:"postId"`
	Badge  string `json:"badge"`
}

func AddBadge(w http.ResponseWriter, r *http.Request) {
	var req Badge

	// Decodificamos el JSON del cuerpo de la solicitud
	err := json.NewDecoder(r.Body).Decode(&req)

	if err != nil {
		http.Error(w, "Error al decodificar el JSON del Badge", http.StatusBadRequest)
		return
	}

	if req.PostID == "" || req.Badge == "" {
		http.Error(w, "PostID y Badge son requeridos", http.StatusBadRequest)
		return
	}

	// Buscamos el post en la base de datos
	var post models.Post
	result := database.DB.First(&post, "id = ?", req.PostID)

	if result.Error != nil {
		http.Error(w, "Post no encontrado", http.StatusNotFound)
		return
	}

	// Verificar si el badge ya existe
	for _, badge := range post.Badges {
		if badge == req.Badge {
			http.Error(w, "El badge ya existe", http.StatusConflict)
			return
		}
	}

	// Agregar el badge
	post.Badges = append(post.Badges, req.Badge)

	// Guardamos los cambios en la base de datos
	result = database.DB.Save(&post)

	if result.Error != nil {
		http.Error(w, "Error al actualizar los Badges", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(post)
}

func RemoveBadge(w http.ResponseWriter, r *http.Request) {
	var req Badge

	// Decodificamos el JSON del cuerpo de la solicitud
	err := json.NewDecoder(r.Body).Decode(&req)

	if err != nil {
		http.Error(w, "Error al decodificar el JSON del Badge", http.StatusBadRequest)
		return
	}

	if req.PostID == "" || req.Badge == "" {
		http.Error(w, "PostID y Badge son requeridos", http.StatusBadRequest)
		return
	}

	// Buscamos el post en la base de datos
	var post models.Post

	result := database.DB.First(&post, "id = ?", req.PostID)

	if result.Error != nil {
		http.Error(w, "Post no encontrado", http.StatusNotFound)
		return
	}

	// Remover el badge
	newBadges := []string{}
	for _, badge := range post.Badges {
		if badge != req.Badge {
			newBadges = append(newBadges, badge)
		}
	}

	post.Badges = newBadges

	// Guardamos los cambios en la base de datos
	result = database.DB.Save(&post)

	if result.Error != nil {
		http.Error(w, "Error al actualizar los Badges", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(post)
}
