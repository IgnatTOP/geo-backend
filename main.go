package main

import (
	"geografi-cheb/backend/api"
	"geografi-cheb/backend/config"
	"geografi-cheb/backend/db"
	_ "geografi-cheb/backend/docs" // Swagger документация
	"geografi-cheb/backend/pkg"
	"log"

	"github.com/gin-gonic/gin"
)

// @title Учебный портал по географии API
// @version 1.0
// @description API для учебного портала по географии
// @termsOfService http://swagger.io/terms/

// @contact.name API Support
// @contact.email support@geography.edu

// @license.name Apache 2.0
// @license.url http://www.apache.org/licenses/LICENSE-2.0.html

// @host localhost:8080
// @BasePath /api/v1

// @securityDefinitions.apikey BearerAuth
// @in header
// @name Authorization
// @description JWT токен авторизации. Формат: "Bearer {token}"

func main() {
	// Загрузка конфигурации
	cfg := config.Load()
	log.Printf("CORS: Allowed origins: %v", cfg.AllowedOrigins)

	// Инициализация базы данных
	database, err := db.Init(cfg.DatabaseURL)
	if err != nil {
		log.Fatalf("Ошибка подключения к БД: %v", err)
	}

	// Выполнение миграций
	if err := db.RunMigrations(database); err != nil {
		log.Fatalf("Ошибка миграций: %v", err)
	}

	// Создание администратора по умолчанию
	pkg.InitAdmin(database)

	// Настройка роутера
	router := gin.Default()

	// CORS middleware
	router.Use(func(c *gin.Context) {
		origin := c.GetHeader("Origin")
		allowed := resolveAllowedOrigin(origin, cfg.AllowedOrigins)
		
		// Set CORS headers if origin is allowed
		if allowed != "" {
			c.Writer.Header().Set("Access-Control-Allow-Origin", allowed)
			c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
			c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With")
			c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS, GET, PUT, DELETE, PATCH")
		}

		// Handle preflight requests
		if c.Request.Method == "OPTIONS" {
			if allowed != "" {
				c.AbortWithStatus(204)
			} else {
				// Log for debugging (remove in production if needed)
				log.Printf("CORS: Origin '%s' not allowed. Allowed origins: %v", origin, cfg.AllowedOrigins)
				c.AbortWithStatus(403)
			}
			return
		}

		c.Next()
	})

	// Статическая раздача загруженных файлов
	router.Static("/uploads", cfg.UploadDir)

	// Инициализация API
	api.SetupRoutes(router, database, cfg)

	// Запуск сервера
	// Слушаем на всех интерфейсах для работы в Docker/контейнере
	addr := "0.0.0.0:" + cfg.Port
	log.Printf("Сервер запущен на %s", addr)
	if err := router.Run(addr); err != nil {
		log.Fatalf("Ошибка запуска сервера: %v", err)
	}
}

func resolveAllowedOrigin(origin string, allowed []string) string {
	if len(allowed) == 0 {
		if origin == "" {
			return "*"
		}
		return origin
	}
	if origin == "" {
		return ""
	}
	for _, o := range allowed {
		if o == "*" {
			return origin
		}
		if o == origin {
			return origin
		}
	}
	return ""
}
