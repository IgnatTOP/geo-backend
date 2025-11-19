package config

import (
	"bytes"
	"fmt"
	"log"
	"net/url"
	"os"
	"path/filepath"
	"strings"

	"github.com/joho/godotenv"
)

// Config содержит конфигурацию приложения
type Config struct {
	Port           string
	DatabaseURL    string
	JWTSecret      string
	Environment    string
	UploadDir      string   // Директория для загрузки файлов
	AllowedOrigins []string // Разрешенные источники для CORS
}

// loadEnvFile загружает .env файл, удаляя BOM если он присутствует
func loadEnvFile(filename string) error {
	data, err := os.ReadFile(filename)
	if err != nil {
		return err
	}

	// Удаляем UTF-8 BOM (Byte Order Mark) если он присутствует
	data = bytes.TrimPrefix(data, []byte("\xef\xbb\xbf"))

	// Парсим содержимое файла
	envMap, err := godotenv.Parse(bytes.NewReader(data))
	if err != nil {
		return err
	}

	// Устанавливаем переменные окружения
	for key, value := range envMap {
		os.Setenv(key, value)
	}

	return nil
}

// Load загружает конфигурацию из переменных окружения
func Load() *Config {
	// Загружаем .env файлы, если они существуют.
	// Сначала из корня проекта, потом из backend — чтобы локальный backend/.env переопределял общий .env.

	// Получаем текущую рабочую директорию
	wd, err := os.Getwd()
	if err != nil {
		log.Printf("Warning: не удалось получить рабочую директорию: %v", err)
		wd = "."
	}

	log.Printf("Текущая рабочая директория: %s", wd)

	// Пробуем загрузить .env из корня проекта (на уровень выше) - сначала
	rootEnv := filepath.Join(wd, "..", ".env")
	if _, err := os.Stat(rootEnv); err == nil {
		if err := loadEnvFile(rootEnv); err == nil {
			log.Printf("Загружен .env файл из корня: %s", rootEnv)
		} else {
			log.Printf("Ошибка загрузки .env из корня: %v", err)
		}
	}

	// Пробуем загрузить .env из текущей директории (backend/.env) - переопределяет корневой
	localEnv := filepath.Join(wd, ".env")
	if _, err := os.Stat(localEnv); err == nil {
		if err := loadEnvFile(localEnv); err == nil {
			log.Printf("Загружен .env файл из backend: %s", localEnv)
		} else {
			log.Printf("Ошибка загрузки .env из backend: %v", err)
		}
	} else {
		log.Printf("Файл .env не найден в: %s", localEnv)
	}

	// Fallback: пробуем относительные пути (на случай если Getwd() вернул неправильный путь)
	if _, err := os.Stat(".env"); err == nil {
		_ = loadEnvFile(".env")
	}
	if _, err := os.Stat("../.env"); err == nil {
		_ = loadEnvFile("../.env")
	}

	// Отладочный вывод: проверяем, загрузились ли переменные
	log.Printf("Проверка переменных окружения:")
	log.Printf("  POSTGRESQL_HOST: %s", os.Getenv("POSTGRESQL_HOST"))
	log.Printf("  POSTGRESQL_PORT: %s", os.Getenv("POSTGRESQL_PORT"))
	log.Printf("  POSTGRESQL_USER: %s", os.Getenv("POSTGRESQL_USER"))
	pwd := os.Getenv("POSTGRESQL_PASSWORD")
	if pwd != "" {
		log.Printf("  POSTGRESQL_PASSWORD: ***установлен***")
	} else {
		log.Printf("  POSTGRESQL_PASSWORD: не установлен")
	}
	log.Printf("  POSTGRESQL_DBNAME: %s", os.Getenv("POSTGRESQL_DBNAME"))

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

	databaseURL := getDatabaseURL()

	return &Config{
		Port:           getEnv("PORT", "8080"),
		DatabaseURL:    databaseURL,
		JWTSecret:      getEnv("JWT_SECRET", "your-secret-key-change-in-production"),
		Environment:    getEnv("ENVIRONMENT", "development"),
		UploadDir:      uploadDir,
		AllowedOrigins: getAllowedOrigins(),
	}
}

func getDatabaseURL() string {
	// Новая простая логика: подключаемся только по POSTGRESQL_* переменным.
	host := os.Getenv("POSTGRESQL_HOST")
	port := os.Getenv("POSTGRESQL_PORT")
	user := os.Getenv("POSTGRESQL_USER")
	password := os.Getenv("POSTGRESQL_PASSWORD")
	dbName := os.Getenv("POSTGRESQL_DBNAME")

	missing := make([]string, 0)
	if host == "" {
		missing = append(missing, "POSTGRESQL_HOST")
	}
	if port == "" {
		missing = append(missing, "POSTGRESQL_PORT")
	}
	if user == "" {
		missing = append(missing, "POSTGRESQL_USER")
	}
	if password == "" {
		missing = append(missing, "POSTGRESQL_PASSWORD")
	}
	if dbName == "" {
		missing = append(missing, "POSTGRESQL_DBNAME")
	}

	if len(missing) > 0 {
		panic(fmt.Sprintf("database config error: missing env vars: %s", strings.Join(missing, ", ")))
	}

	encodedPassword := url.QueryEscape(password)
	return fmt.Sprintf(
		"postgresql://%s:%s@%s:%s/%s",
		user,
		encodedPassword,
		host,
		port,
		dbName,
	)
}

func getAllowedOrigins() []string {
	defaultOrigins := "https://ignattop-geo-frontend-27ae.twc1.net,http://localhost:3000"
	// Поддерживаем оба варианта имени переменной: ALLOWED_ORIGINS и ALLOWED_ORIGIN
	raw := os.Getenv("ALLOWED_ORIGINS")
	if raw == "" {
		raw = os.Getenv("ALLOWED_ORIGIN")
	}
	if raw == "" {
		raw = defaultOrigins
	}

	// If env var is explicitly set to empty, use default instead
	if raw == "" {
		raw = defaultOrigins
	}

	parts := strings.Split(raw, ",")
	var origins []string
	for _, p := range parts {
		if trimmed := strings.TrimSpace(p); trimmed != "" {
			origins = append(origins, trimmed)
		}
	}

	// If no valid origins found, use default
	if len(origins) == 0 {
		parts = strings.Split(defaultOrigins, ",")
		for _, p := range parts {
			if trimmed := strings.TrimSpace(p); trimmed != "" {
				origins = append(origins, trimmed)
			}
		}
	}

	return origins
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}
