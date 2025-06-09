package utils

import (
	"context"
	"errors"
	"log"
	"mime/multipart"
	"os"

	"github.com/cloudinary/cloudinary-go/v2"
	"github.com/cloudinary/cloudinary-go/v2/api/uploader"
)

var Cloudinary *cloudinary.Cloudinary

func boolPtr(b bool) *bool {
	return &b
}

// InitCloudinary inicializa el cliente de Cloudinary
func InitCloudinary() {
	cloudName := os.Getenv("CLOUDINARY_CLOUD_NAME")
	apiKey := os.Getenv("CLOUDINARY_API_KEY")
	apiSecret := os.Getenv("CLOUDINARY_API_SECRET")

	cld, err := cloudinary.NewFromParams(
		cloudName,
		apiKey,
		apiSecret,
	)

	if err != nil {
		log.Fatal("Error al inicializar Cloudinary:", err)
	}

	Cloudinary = cld
	log.Println("Cloudinary inicializado correctamente")
}

// UploadImage sube una imagen a Cloudinary
func UploadImage(file multipart.File, filename string) (string, error) {
	ctx := context.Background()

	if Cloudinary == nil {
		errMsg := "Cloudinary no está inicializado"
		log.Println(errMsg)
		return "", errors.New(errMsg)
	}

	uploadResp, err := Cloudinary.Upload.Upload(ctx, file, uploader.UploadParams{
		PublicID:       "portfolio/" + filename,
		Folder:         "portfolio",
		UseFilename:    boolPtr(true),
		UniqueFilename: boolPtr(true),
	})

	if err != nil {
		log.Println("Error al subir la imagen:", err)
		return "", err
	}

	return uploadResp.SecureURL, nil
}
