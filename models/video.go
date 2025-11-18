package models

import (
	"time"

	"gorm.io/gorm"
)

// Video представляет видеоматериал
type Video struct {
	ID        uint           `json:"id" gorm:"primaryKey"`
	LessonID  uint           `json:"lesson_id" gorm:"index"`
	Title     string         `json:"title" gorm:"not null"`
	URL       string         `json:"url" gorm:"not null"` // Ссылка на видео (YouTube, Vimeo и т.д.)
	Type      string         `json:"type" gorm:"default:'youtube'"` // Тип: youtube, vimeo, direct
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `json:"-" gorm:"index"`

	// Связи
	Lesson Lesson `json:"lesson,omitempty" gorm:"foreignKey:LessonID"`
}

