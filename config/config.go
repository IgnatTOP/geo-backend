package config

import (
	"os"

	"github.com/joho/godotenv"
)

// Config содержит конфигурацию приложения
type Config struct {
	Port        string
	DatabaseURL string
	JWTSecret   string
	Environment string
	UploadDir   string // Директория для загрузки файлов
}

// Load загружает конфигурацию из переменных окружения
func Load() *Config {
	// Загружаем .env файл если он существует
	// Пробуем загрузить из текущей директории и из директории backend
	_ = godotenv.Load()
	_ = godotenv.Load("../.env")
	_ = godotenv.Load(".env")

	uploadDir := getEnv("UPLOAD_DIR", "./uploads")
	// Создаем директорию если её нет
	if err := os.MkdirAll(uploadDir, 0755); err != nil {
		panic(err)
	}
	// Создаем поддиректории
	os.MkdirAll(uploadDir+"/images", 0755)
	os.MkdirAll(uploadDir+"/documents", 0755)
	os.MkdirAll(uploadDir+"/videos", 0755)
	os.MkdirAll(uploadDir+"/practices", 0755)
	os.MkdirAll(uploadDir+"/reports", 0755)

	return &Config{
		Port:        getEnv("PORT", "8080"),
		DatabaseURL: getEnv("DATABASE_URL", "postgres://postgres:123@localhost:5432/geografi_cheb?sslmode=disable"),
		JWTSecret:   getEnv("JWT_SECRET", "your-secret-key-change-in-production"),
		Environment: getEnv("ENVIRONMENT", "development"),
		UploadDir:   uploadDir,
	}
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}

