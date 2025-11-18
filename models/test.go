package models

import (
	"time"

	"gorm.io/gorm"
)

// Test представляет тест
type Test struct {
	ID        uint           `json:"id" gorm:"primaryKey"`
	LessonID  uint           `json:"lesson_id" gorm:"not null;index"`
	Title     string         `json:"title" gorm:"not null"`
	Description string       `json:"description" gorm:"type:text"` // Описание теста
	Type      string         `json:"type" gorm:"default:'single'"` // Тип: single (один правильный), multiple (несколько правильных)
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `json:"-" gorm:"index"`

	// Связи
	Lesson   Lesson         `json:"lesson,omitempty" gorm:"foreignKey:LessonID"`
	Questions []TestQuestion `json:"questions,omitempty" gorm:"foreignKey:TestID;order:order"`
	Attempts []TestAttempt   `json:"attempts,omitempty" gorm:"foreignKey:TestID"`
	Grades   []TestGrade     `json:"grades,omitempty" gorm:"foreignKey:TestID"`
}

// TestAttempt представляет попытку прохождения теста пользователем
type TestAttempt struct {
	ID        uint           `json:"id" gorm:"primaryKey"`
	UserID    uint           `json:"user_id" gorm:"not null;index"`
	TestID    uint           `json:"test_id" gorm:"not null;index"`
	Answers   string         `json:"answers" gorm:"type:text"` // JSON строка с ответами пользователя {question_id: answer_index}
	Score     float64        `json:"score"`                    // Автоматически подсчитанный балл (0-100)
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `json:"-" gorm:"index"`

	// Связи
	User User `json:"user,omitempty" gorm:"foreignKey:UserID"`
	Test Test `json:"test,omitempty" gorm:"foreignKey:TestID"`
}

// TestGrade представляет оценку теста, выставленную администратором
type TestGrade struct {
	ID        uint           `json:"id" gorm:"primaryKey"`
	UserID    uint           `json:"user_id" gorm:"not null;index"`
	TestID    uint           `json:"test_id" gorm:"not null;index"`
	AttemptID uint           `json:"attempt_id" gorm:"index"` // Связь с попыткой
	Grade     float64        `json:"grade" gorm:"not null"`   // Оценка от преподавателя
	Comment   string         `json:"comment" gorm:"type:text"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `json:"-" gorm:"index"`

	// Связи
	User    User `json:"user,omitempty" gorm:"foreignKey:UserID"`
	Test    Test `json:"test,omitempty" gorm:"foreignKey:TestID"`
	Attempt TestAttempt `json:"attempt,omitempty" gorm:"foreignKey:AttemptID"`
}

