package models

type Skill struct {
	ID      string `json:"id" gorm:"primaryKey"`
	Name    string `json:"name"`
	Icon    string `json:"icon"`
	UrlDocs string `json:"urlDocs"`
}
