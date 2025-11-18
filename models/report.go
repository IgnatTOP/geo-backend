package models

import (
	"time"

	"gorm.io/gorm"
)

// Report представляет доклад (файл, загруженный пользователем)
type Report struct {
	ID        uint           `json:"id" gorm:"primaryKey"`
	UserID    uint           `json:"user_id" gorm:"not null;index"`
	LessonID  uint           `json:"lesson_id" gorm:"index"`
	Title     string         `json:"title" gorm:"not null"`
	FileURL   string         `json:"file_url" gorm:"not null"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `json:"-" gorm:"index"`

	// Связи
	User   User   `json:"user,omitempty" gorm:"foreignKey:UserID"`
	Lesson Lesson `json:"lesson,omitempty" gorm:"foreignKey:LessonID"`
}

