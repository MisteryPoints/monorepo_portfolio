package main

import (
	"log"
	"net/http"
	"os"

	"portfolio-backend/internal/database"
	"portfolio-backend/internal/routes"
	"portfolio-backend/internal/utils"

	"github.com/joho/godotenv"
)

func main() {
	err := godotenv.Load()
	if err != nil {
		log.Println("No se pudo cargar el archivo .env")
	}

	database.InitDB()
	utils.InitCloudinary()

	r := routes.SetupRoutes()

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080" // Default port if not specified in .env
	}

	log.Printf("Servidor escuchando en el puerto %s", port)
	log.Fatal(http.ListenAndServe(":"+port, r))
}
