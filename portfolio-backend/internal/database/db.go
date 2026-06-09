package database

import (
	"log"
	"os"
	"time"

	"portfolio-backend/internal/models"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var DB *gorm.DB

func InitDB() {
	dsn := os.Getenv("DATABASE_URL")

	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{
		SkipDefaultTransaction: true,
		PrepareStmt:            true,
	})

	if err != nil {
		log.Fatal("❌ Error al Conectar con la Base de Datos:", err)
	}

	sqlDB, err := db.DB()
	if err != nil {
		log.Fatal("❌ Error al obtener sql.DB:", err)
	}

	sqlDB.SetMaxIdleConns(5)
	sqlDB.SetMaxOpenConns(10)
	sqlDB.SetConnMaxLifetime(30 * time.Minute)
	sqlDB.SetConnMaxIdleTime(5 * time.Minute)

	err = db.AutoMigrate(&models.Author{}, &models.Post{}, &models.Project{}, &models.Skill{}, &models.Badge{}, &models.Translation{})
	if err != nil {
		log.Fatal("❌ Error al Migrar la Base de Datos:", err)
	}

	DB = db
	log.Println("✅ Conexión a la Base de Datos Exitosa")

	go keepAlive()
}

func keepAlive() {
	ticker := time.NewTicker(3 * time.Minute)
	defer ticker.Stop()

	for range ticker.C {
		sqlDB, err := DB.DB()
		if err != nil {
			log.Println("⚠️ KeepAlive: error obteniendo sql.DB:", err)
			continue
		}
		if err := sqlDB.Ping(); err != nil {
			log.Println("⚠️ KeepAlive: ping falló:", err)
		}
	}
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
