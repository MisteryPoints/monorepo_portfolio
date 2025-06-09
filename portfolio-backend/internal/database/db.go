package database

import (
	"log"
	"os"

	"portfolio-backend/internal/models"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var DB *gorm.DB

func InitDB() {
	dsn := os.Getenv("DATABASE_URL")

	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})

	if err != nil {
		log.Fatal("❌ Error al Conectar con la Base de Datos:", err)
	}

	err = db.AutoMigrate(&models.Author{}, &models.Post{}, &models.Project{}, &models.Skill{}, &models.Badge{})

	if err != nil {
		log.Fatal("❌ Error al Migrar la Base de Datos:", err)
	}

	DB = db
	log.Println("✅ Conexión a la Base de Datos Exitosa")
}

func ToPgArray(arr []string) string {
	if len(arr) == 0 {
		return "{}"
	}

	result := "{"
	for i, item := range arr {
		result += `"` + item + `"`
		if i < len(arr)-1 {
			result += ","
		}
	}
	result += "}"
	return result
}
