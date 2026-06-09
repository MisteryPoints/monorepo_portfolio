package routes

import (
	"portfolio-backend/internal/handlers"

	"github.com/gorilla/mux"
)

func SetupRoutes() *mux.Router {
	r := mux.NewRouter()

	api := r.PathPrefix("/api").Subrouter()

	// Posts
	api.HandleFunc("/get-posts", handlers.GetPosts).Methods("GET")
	api.HandleFunc("/get-post", handlers.GetPost).Methods("GET")
	api.HandleFunc("/add-post", handlers.AddPost).Methods("POST")
	api.HandleFunc("/delete-post", handlers.DeletePost).Methods("DELETE")
	api.HandleFunc("/update-post", handlers.UpdatePost).Methods("PUT")

	// Contact
	api.HandleFunc("/contact-form", handlers.ContactFormHandler).Methods("POST")

	// Author
	api.HandleFunc("/get-authors", handlers.GetAuthors).Methods("GET")
	api.HandleFunc("/add-author", handlers.AddAuthor).Methods("POST")
	api.HandleFunc("/delete-author", handlers.DeleteAuthor).Methods("DELETE")
	api.HandleFunc("/update-author", handlers.UpdateAuthor).Methods("PUT")

	// Projects
	api.HandleFunc("/get-projects", handlers.GetProjects).Methods("GET")
	api.HandleFunc("/get-project", handlers.GetProject).Methods("GET")
	api.HandleFunc("/add-project", handlers.AddProject).Methods("POST")
	api.HandleFunc("/delete-project", handlers.DeleteProject).Methods("DELETE")
	api.HandleFunc("/update-project", handlers.UpdateProject).Methods("PUT")

	// Badges
	api.HandleFunc("/add-badge", handlers.AddBadge).Methods("POST")
	api.HandleFunc("/delete-badge", handlers.RemoveBadge).Methods("DELETE")

	// Skills
	api.HandleFunc("/get-skills", handlers.GetSkills).Methods("GET")
	api.HandleFunc("/get-skill-tree", handlers.GetSkillTree).Methods("GET")
	api.HandleFunc("/add-skill", handlers.AddSkill).Methods("POST")
	api.HandleFunc("/delete-skill", handlers.DeleteSkill).Methods("DELETE")
	api.HandleFunc("/get-translations", handlers.GetTranslations).Methods("GET")

	return r
}
