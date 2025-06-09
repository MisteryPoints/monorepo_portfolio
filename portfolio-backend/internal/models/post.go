package models

type Post struct {
	ID        string      `json:"id" gorm:"primaryKey"`
	Subject   string      `json:"subject"`
	Content   string      `json:"content"`
	AuthorID  string      `json:"authorId"`
	Author    Author      `json:"author" gorm:"foreignKey:AuthorID"`
	Badges    StringArray `json:"badges" gorm:"type:text[]"`
	Images    StringArray `json:"images" gorm:"type:text[]"`
	Link      string      `json:"link"`
	CreatedAt string      `json:"createdAt"`
}
