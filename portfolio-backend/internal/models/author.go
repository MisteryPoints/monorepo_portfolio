package models

type Author struct {
	ID    string `json:"id" gorm:"primaryKey"`
	Name  string `json:"name"`
	Image string `json:"image"`
}
