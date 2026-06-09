package models

type Translation struct {
	ID    uint   `json:"id" gorm:"primaryKey"`
	Key   string `json:"key" gorm:"index:idx_key_lang,unique"`
	Lang  string `json:"lang" gorm:"index:idx_key_lang,unique"`
	Value string `json:"value"`
}
