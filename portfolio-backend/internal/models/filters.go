package models

type ProjectFilter struct {
	Technologies StringArray `json:"technologies"`
	StartDate    string      `json:"startDate"`
	EndDate      string      `json:"endDate"`
	Search       string      `json:"search"`
	Page         int         `json:"page"`
	Limit        int         `json:"limit"`
}

type PostFilter struct {
	Badges    StringArray `json:"badges"`
	StartDate string      `json:"startDate"`
	EndDate   string      `json:"endDate"`
	Search    string      `json:"search"`
	Page      int         `json:"page"`
	Limit     int         `json:"limit"`
}
