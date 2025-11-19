package db

import (
	"crypto/x509"
	"fmt"
	"geografi-cheb/backend/models"
	"net/url"
	"os"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

// Init инициализирует подключение к базе данных
func Init(databaseURL string) (*gorm.DB, error) {
	// Проверяем наличие SSL сертификата
	sslCertPath := os.Getenv("PGSSLROOTCERT")
	
	// Если сертификат указан, загружаем его и настраиваем SSL
	if sslCertPath != "" {
		// Проверяем существование файла
		if _, err := os.Stat(sslCertPath); err != nil {
			return nil, err
		}

		// Загружаем SSL сертификат для проверки валидности
		rootCert, err := os.ReadFile(sslCertPath)
		if err != nil {
			return nil, err
		}

		// Проверяем валидность сертификата
		caCertPool := x509.NewCertPool()
		if !caCertPool.AppendCertsFromPEM(rootCert) {
			return nil, fmt.Errorf("failed to parse SSL certificate from %s", sslCertPath)
		}

		// Устанавливаем переменную окружения для pgx
		// pgx автоматически использует PGSSLROOTCERT для SSL подключения
		os.Setenv("PGSSLROOTCERT", sslCertPath)

		// Убеждаемся, что в строке подключения указан sslmode=verify-full
		parsedURL, err := url.Parse(databaseURL)
		if err == nil {
			query := parsedURL.Query()
			sslmode := query.Get("sslmode")
			if sslmode == "" || sslmode == "disable" {
				query.Set("sslmode", "verify-full")
				parsedURL.RawQuery = query.Encode()
				databaseURL = parsedURL.String()
			}
		}
	}

	// Настраиваем GORM конфигурацию
	config := &gorm.Config{
		Logger: logger.Default.LogMode(logger.Info),
	}

	db, err := gorm.Open(postgres.Open(databaseURL), config)
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

