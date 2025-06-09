package handlers

import (
	"encoding/json"
	"net/http"

	"portfolio-backend/internal/utils"
)

type ContactForm struct {
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

	err = utils.SendEmail(form.Subject, form.Message)

	if form.Subject == "" || form.Message == "" {
		http.Error(w, "Todos los campos son Requeridos", http.StatusBadRequest)
		return
	}

	if err := utils.SendEmail(form.Subject, form.Message); err != nil {
		http.Error(w, "Erorr al enviar el Correo de Contacto", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"message": "Correo enviado de forma Satisfactoria"})
}
