package config

import (
	"fmt"
	"net/url"
	"os"
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

	databaseURL := getEnv("DATABASE_URL", "postgres://postgres:123@localhost:5432/geografi_cheb?sslmode=disable")
	// URL-кодируем пароль в строке подключения, если он содержит специальные символы
	databaseURL = encodeDatabaseURL(databaseURL)

	return &Config{
		Port:           getEnv("PORT", "8080"),
		DatabaseURL:    databaseURL,
		JWTSecret:      getEnv("JWT_SECRET", "your-secret-key-change-in-production"),
		Environment:    getEnv("ENVIRONMENT", "development"),
		UploadDir:      uploadDir,
		AllowedOrigins: getAllowedOrigins(),
	}
}

func getAllowedOrigins() []string {
	defaultOrigins := "https://ignattop-geo-frontend-27ae.twc1.net,http://localhost:3000"
	raw := getEnv("ALLOWED_ORIGINS", defaultOrigins)

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

// encodeDatabaseURL правильно кодирует пароль в строке подключения к БД
func encodeDatabaseURL(databaseURL string) string {
	// Пытаемся распарсить URL
	parsedURL, err := url.Parse(databaseURL)
	if err != nil {
		// Если не удалось распарсить из-за некорректных символов в пароле,
		// разбираем строку вручную
		return encodeDatabaseURLManual(databaseURL)
	}

	// Если пароль уже закодирован или его нет, возвращаем как есть
	if parsedURL.User == nil {
		return databaseURL
	}

	password, hasPassword := parsedURL.User.Password()
	if !hasPassword {
		return databaseURL
	}

	// Кодируем пароль для использования в URL
	encodedPassword := url.QueryEscape(password)

	// Пересобираем URL с закодированным паролем
	parsedURL.User = url.UserPassword(parsedURL.User.Username(), encodedPassword)

	return parsedURL.String()
}

// encodeDatabaseURLManual разбирает строку подключения вручную и кодирует пароль
func encodeDatabaseURLManual(databaseURL string) string {
	// Формат: postgres://user:password@host:port/db?params
	if !strings.HasPrefix(databaseURL, "postgres://") && !strings.HasPrefix(databaseURL, "postgresql://") {
		return databaseURL
	}

	// Находим позицию @ (разделитель между userinfo и host)
	atPos := strings.Index(databaseURL, "@")
	if atPos == -1 {
		return databaseURL
	}

	// Извлекаем часть до @ (userinfo)
	userinfo := databaseURL[strings.Index(databaseURL, "://")+3 : atPos]
	rest := databaseURL[atPos:]

	// Разделяем userinfo на username и password
	colonPos := strings.Index(userinfo, ":")
	if colonPos == -1 {
		return databaseURL
	}

	username := userinfo[:colonPos]
	password := userinfo[colonPos+1:]

	// Кодируем пароль
	encodedPassword := url.QueryEscape(password)

	// Пересобираем URL
	prefix := databaseURL[:strings.Index(databaseURL, "://")+3]
	return fmt.Sprintf("%s%s:%s%s", prefix, username, encodedPassword, rest)
}
