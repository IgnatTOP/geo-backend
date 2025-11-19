package db

import (
	"crypto/tls"
	"crypto/x509"
	"geografi-cheb/backend/models"
	"os"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

// Init инициализирует подключение к базе данных
func Init(databaseURL string) (*gorm.DB, error) {
	// Проверяем наличие SSL сертификата
	sslCertPath := os.Getenv("PGSSLROOTCERT")
	if sslCertPath != "" {
		// Загружаем SSL сертификат
		rootCert, err := os.ReadFile(sslCertPath)
		if err != nil {
			return nil, err
		}

		// Создаем пул сертификатов
		caCertPool := x509.NewCertPool()
		if !caCertPool.AppendCertsFromPEM(rootCert) {
			return nil, err
		}

		// Настраиваем TLS конфигурацию (хотя lib/pq использует переменную окружения)
		_ = &tls.Config{
			RootCAs: caCertPool,
		}

		// lib/pq автоматически использует переменную окружения PGSSLROOTCERT
		// поэтому просто убеждаемся, что она установлена
		os.Setenv("PGSSLROOTCERT", sslCertPath)
	}

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

