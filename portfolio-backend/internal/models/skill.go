package models

type Skill struct {
	ID       string `json:"id" gorm:"primaryKey"`
	Name     string `json:"name"`
	NameEN   string `json:"nameEn"`
	NameES   string `json:"nameEs"`
	Icon     string `json:"icon"`
	UrlDocs  string `json:"urlDocs"`
	ParentID string `json:"parentId"`
	Category string `json:"category"`
	Level    int    `json:"level"`
}
