package models

import (
	"time"

	"gorm.io/gorm"
)

// User представляет пользователя системы
type User struct {
	ID        uint           `json:"id" gorm:"primaryKey"`
	Name      string         `json:"name" gorm:"not null"`
	Email     string         `json:"email" gorm:"uniqueIndex;not null"`
	Password  string         `json:"-" gorm:"not null"` // Хеш пароля, не возвращаем в JSON
	Role      string         `json:"role" gorm:"default:'student';check:role IN ('student', 'admin')"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `json:"-" gorm:"index"`

	// Связи
	TestAttempts    []TestAttempt    `json:"-" gorm:"foreignKey:UserID"`
	TestGrades      []TestGrade      `json:"-" gorm:"foreignKey:UserID"`
	PracticeGrades  []PracticeGrade  `json:"-" gorm:"foreignKey:UserID"`
	Reports         []Report         `json:"-" gorm:"foreignKey:UserID"`
	PracticeSubmits []PracticeSubmit `json:"-" gorm:"foreignKey:UserID"`
}

// IsAdmin проверяет, является ли пользователь администратором
func (u *User) IsAdmin() bool {
	return u.Role == "admin"
}

