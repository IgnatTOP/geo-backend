package db

import (
	"geografi-cheb/backend/models"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

// Init инициализирует подключение к базе данных
func Init(databaseURL string) (*gorm.DB, error) {
	db, err := gorm.Open(postgres.Open(databaseURL), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Info),
	})
	if err != nil {
		return nil, err
	}

	return db, nil
}

// RunMigrations выполняет миграции базы данных
func RunMigrations(db *gorm.DB) error {
	return db.AutoMigrate(
		&models.User{},
		&models.Lesson{},
		&models.Test{},
		&models.TestQuestion{},
		&models.TestAttempt{},
		&models.TestGrade{},
		&models.Practice{},
		&models.PracticeSubmit{},
		&models.PracticeGrade{},
		&models.Report{},
		&models.Fact{},
		&models.Video{},
	)
}

