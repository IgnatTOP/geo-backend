package models

import (
	"time"

	"gorm.io/gorm"
)

// TestQuestion представляет вопрос в тесте
type TestQuestion struct {
	ID        uint           `json:"id" gorm:"primaryKey"`
	TestID    uint           `json:"test_id" gorm:"not null;index"`
	Question  string         `json:"question" gorm:"not null;type:text"`
	Options   string         `json:"options" gorm:"type:text;not null"` // JSON массив вариантов ответов
	CorrectAnswer int        `json:"correct_answer" gorm:"not null"` // Индекс правильного ответа (0-based)
	Order     int            `json:"order" gorm:"default:0"` // Порядок вопроса в тесте
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `json:"-" gorm:"index"`

	// Связи
	Test Test `json:"test,omitempty" gorm:"foreignKey:TestID"`
}

