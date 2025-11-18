package models

import (
	"time"

	"gorm.io/gorm"
)

// Lesson представляет учебную пару (урок)
type Lesson struct {
	ID        uint           `json:"id" gorm:"primaryKey"`
	Number    int            `json:"number" gorm:"not null;uniqueIndex"`
	Topic     string         `json:"topic" gorm:"not null"`
	Content   string         `json:"content" gorm:"type:text"`
	Images    string         `json:"images" gorm:"type:text"` // JSON массив URL фотографий
	Documents string         `json:"documents" gorm:"type:text"` // JSON массив URL документов
	VideoFiles string        `json:"video_files" gorm:"type:text"` // JSON массив URL видеофайлов
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `json:"-" gorm:"index"`

	// Связи
	Reports         []Report         `json:"reports,omitempty" gorm:"foreignKey:LessonID"`
	Practices       []Practice       `json:"practices,omitempty" gorm:"foreignKey:LessonID"`
	Videos          []Video          `json:"videos,omitempty" gorm:"foreignKey:LessonID"`
	Tests           []Test           `json:"tests,omitempty" gorm:"foreignKey:LessonID"`
}

