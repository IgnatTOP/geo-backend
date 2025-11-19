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

// getDatabaseURL строит строку подключения к БД на основе переменных окружения.
// Приоритет:
// 1) DATABASE_URL (как есть, с автоматическим кодированием пароля)
// 2) Набор переменных POSTGRESQL_* (как на Timeweb Cloud)
// 3) Локальный дефолт для разработки.
func getDatabaseURL() string {
	// В production на сервере Timeweb жёстко используем проверенную строку подключения.
	// Это убирает всю зависимость от переменных окружения для БД.
	if os.Getenv("ENVIRONMENT") == "production" {
		// Пароль полностью URL‑кодирован: h^M+4+kjXnm(VH -> h%5EM%2B4%2BkjXnm%28VH
		return "postgresql://gen_user:h%5EM%2B4%2BkjXnm%28VH@77.233.221.83:5432/default_db"
	}

	// 1. Явно заданный DATABASE_URL
	if raw := getEnv("DATABASE_URL", ""); raw != "" {
		return encodeDatabaseURL(raw)
	}

	// 2. Сборка URL из POSTGRESQL_* (Timeweb)
	host := os.Getenv("POSTGRESQL_HOST")
	if host == "" {
		host = os.Getenv("POSTGRESQL_Host")
	}
	port := os.Getenv("POSTGRESQL_PORT")
	if port == "" {
		port = "5432"
	}
	user := os.Getenv("POSTGRESQL_USER")
	if user == "" {
		user = os.Getenv("POSTGRESQL_USERNAME")
	}
	password := os.Getenv("POSTGRESQL_PASSWORD")
	dbName := os.Getenv("POSTGRESQL_DATABASE")
	if dbName == "" {
		// Поддерживаем имя переменной, которое часто отдает Timeweb: POSTGRESQL_DBNAME
		dbName = os.Getenv("POSTGRESQL_DBNAME")
	}

	if host != "" && user != "" && password != "" && dbName != "" {
		encodedPassword := url.QueryEscape(password)
		sslmode := os.Getenv("POSTGRESQL_SSLMODE")
		if sslmode == "" {
			// По требованию убираем работу с кастомными сертификатами.
			// Если БД требует SSL, на Timeweb обычно достаточно sslmode=require.
			sslmode = "require"
		}

		return fmt.Sprintf(
			"postgresql://%s:%s@%s:%s/%s?sslmode=%s",
			user,
			encodedPassword,
			host,
			port,
			dbName,
			sslmode,
		)
	}

	// 3. Локальный дефолт
	return "postgres://postgres:123@localhost:5432/geografi_cheb?sslmode=disable"
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

	// Проверяем, закодирован ли пароль уже (содержит ли % символы URL-кодирования)
	// Если пароль уже закодирован, не кодируем его снова
	if decodedPassword, err := url.QueryUnescape(password); err == nil && decodedPassword != password {
		// Пароль уже закодирован, возвращаем как есть
		return databaseURL
	}

	// Кодируем пароль только если он не закодирован
	encodedPassword := url.QueryEscape(password)

	// Пересобираем URL
	prefix := databaseURL[:strings.Index(databaseURL, "://")+3]
	return fmt.Sprintf("%s%s:%s%s", prefix, username, encodedPassword, rest)
}
