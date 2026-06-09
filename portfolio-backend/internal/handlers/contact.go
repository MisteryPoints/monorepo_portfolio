package handlers

import (
	"encoding/json"
	"net/http"

	"portfolio-backend/internal/utils"
)

type ContactForm struct {
	Name    string `json:"name"`
	Email   string `json:"email"`
	Subject string `json:"subject"`
	Message string `json:"message"`
}

func ContactFormHandler(w http.ResponseWriter, r *http.Request) {
	var form ContactForm

	err := json.NewDecoder(r.Body).Decode(&form)
	if err != nil {
		http.Error(w, "Error al leer el JSON del Formulario de Contacto", http.StatusBadRequest)
		return
	}

	if form.Name == "" || form.Email == "" || form.Subject == "" || form.Message == "" {
		http.Error(w, "Todos los campos son Requeridos", http.StatusBadRequest)
		return
	}

	err = utils.SendEmail(form.Subject, form.Message)
	if err != nil {
		http.Error(w, "Error al enviar el Correo de Contacto", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"message": "Correo enviado de forma Satisfactoria"})
}
