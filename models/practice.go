package models

import (
	"time"

	"gorm.io/gorm"
)

// Practice представляет практическое задание
type Practice struct {
	ID        uint           `json:"id" gorm:"primaryKey"`
	LessonID  uint           `json:"lesson_id" gorm:"not null;index"`
	Title     string         `json:"title" gorm:"not null"`
	FileURL   string         `json:"file_url"` // URL файла задания
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `json:"-" gorm:"index"`

	// Связи
	Lesson  Lesson           `json:"lesson,omitempty" gorm:"foreignKey:LessonID"`
	Submits []PracticeSubmit `json:"submits,omitempty" gorm:"foreignKey:PracticeID"`
	Grades  []PracticeGrade  `json:"grades,omitempty" gorm:"foreignKey:PracticeID"`
}

// PracticeSubmit представляет отправку практического задания пользователем
type PracticeSubmit struct {
	ID        uint           `json:"id" gorm:"primaryKey"`
	UserID    uint           `json:"user_id" gorm:"not null;index"`
	PracticeID uint          `json:"practice_id" gorm:"not null;index"`
	FileURL   string         `json:"file_url" gorm:"not null"` // URL загруженного файла
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `json:"-" gorm:"index"`

	// Связи
	User     User     `json:"user,omitempty" gorm:"foreignKey:UserID"`
	Practice Practice `json:"practice,omitempty" gorm:"foreignKey:PracticeID"`
}

// PracticeGrade представляет оценку практического задания, выставленную администратором
type PracticeGrade struct {
	ID          uint           `json:"id" gorm:"primaryKey"`
	UserID      uint           `json:"user_id" gorm:"not null;index"`
	PracticeID  uint           `json:"practice_id" gorm:"not null;index"`
	SubmitID    uint           `json:"submit_id" gorm:"index"` // Связь с отправкой
	Grade       float64        `json:"grade" gorm:"not null"`  // Оценка от преподавателя
	Comment     string         `json:"comment" gorm:"type:text"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `json:"-" gorm:"index"`

	// Связи
	User     User          `json:"user,omitempty" gorm:"foreignKey:UserID"`
	Practice Practice      `json:"practice,omitempty" gorm:"foreignKey:PracticeID"`
	Submit   PracticeSubmit `json:"submit,omitempty" gorm:"foreignKey:SubmitID"`
}

