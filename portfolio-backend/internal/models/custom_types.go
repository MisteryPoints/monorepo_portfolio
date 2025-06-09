package models

import (
	"database/sql/driver"
	"fmt"
	"strings"
)

type StringArray []string

// Scan convierte de PostgreSQL a Go
func (a *StringArray) Scan(value interface{}) error {
	switch v := value.(type) {
	case string:
		// Remover las llaves `{}` y dividir por comas
		str := strings.Trim(v, "{}")
		if str == "" {
			*a = []string{}
		} else {
			*a = strings.Split(str, ",")
		}
	case []byte:
		str := strings.Trim(string(v), "{}")
		if str == "" {
			*a = []string{}
		} else {
			*a = strings.Split(str, ",")
		}
	default:
		return fmt.Errorf("unsupported type: %T", value)
	}
	return nil
}

// Value convierte de Go a PostgreSQL
func (a StringArray) Value() (driver.Value, error) {
	if len(a) == 0 {
		return "{}", nil
	}
	return "{" + strings.Join(a, ",") + "}", nil
}
