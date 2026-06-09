package models

type Project struct {
	ID              string      `json:"id" gorm:"primaryKey"`
	Name            string      `json:"name"`
	NameEN          string      `json:"nameEn"`
	NameES          string      `json:"nameEs"`
	Content         string      `json:"content"`
	ContentEN       string      `json:"contentEn"`
	ContentES       string      `json:"contentEs"`
	TechnologiesIds StringArray `json:"technologiesIds" gorm:"type:text[]"`
	Technologies    []Skill     `json:"technologies" gorm:"many2many:project_skills;"`
	GithubURL       string      `json:"githubUrl"`
	Url             string      `json:"url"`
	Images          StringArray `json:"images" gorm:"type:text[]"`
	Architecture    string      `json:"architecture"`
	ArchitectureEN  string      `json:"architectureEn"`
	ArchitectureES  string      `json:"architectureEs"`
}
