package models

type Project struct {
	ID              string      `json:"id" gorm:"primaryKey"`
	Name            string      `json:"name"`
	Content         string      `json:"content"`
	TechnologiesIds StringArray `json:"technologiesIds" gorm:"type:text[]"` // Guardado como text[]
	Technologies    []Skill     `json:"technologies" gorm:"many2many:project_skills;"`
	GithubURL       string      `json:"githubUrl"`
	Url             string      `json:"url"`
	Images          StringArray `json:"images" gorm:"type:text[]"`
}
