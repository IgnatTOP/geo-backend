package api

import (
	"geografi-cheb/backend/config"
	"geografi-cheb/backend/internal/handlers"

	"github.com/gin-gonic/gin"
	swaggerFiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"
	"gorm.io/gorm"
)

// SetupRoutes настраивает все маршруты API
func SetupRoutes(router *gin.Engine, db *gorm.DB, cfg *config.Config) {
	// Инициализация обработчиков
	h := handlers.NewHandlers(db, cfg)

	// Swagger документация
	router.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))

	// API v1
	v1 := router.Group("/api/v1")
	{
		// Публичные эндпоинты
		auth := v1.Group("/auth")
		{
			auth.POST("/register", h.Register)
			auth.POST("/login", h.Login)
		}

		// Защищенные эндпоинты (требуют авторизации)
		protected := v1.Group("")
		protected.Use(AuthMiddleware())
		{
			// Загрузка файлов
			upload := protected.Group("/upload")
			{
				upload.POST("/file", h.UploadFile)
			}
			// Пользователи
			users := protected.Group("/users")
			{
				users.GET("/me", h.GetCurrentUser)
				users.GET("/:id", h.GetUser)
			}

			// Уроки (пары)
			lessons := protected.Group("/lessons")
			{
				lessons.GET("", h.GetLessons)
				lessons.GET("/:id", h.GetLesson)
			}

			// Доклады
			reports := protected.Group("/reports")
			{
				reports.GET("", h.GetReports)
				reports.GET("/:id", h.GetReport)
				reports.POST("", h.CreateReport)
				reports.PUT("/:id", h.UpdateReport)
				reports.DELETE("/:id", h.DeleteReport)
			}

			// Тесты
			tests := protected.Group("/tests")
			{
				tests.GET("", h.GetTests)
				tests.GET("/:id", h.GetTest)
				tests.POST("/:id/attempt", h.CreateTestAttempt)
				tests.GET("/attempts", h.GetUserTestAttempts)
				tests.GET("/attempts/:id", h.GetTestAttempt)
			}

			// Практические задания
			practices := protected.Group("/practices")
			{
				practices.GET("", h.GetPractices)
				practices.GET("/:id", h.GetPractice)
				practices.POST("/:id/submit", h.SubmitPractice)
				practices.GET("/submits", h.GetUserPracticeSubmits)
				practices.GET("/submits/:id", h.GetPracticeSubmit)
			}

			// Факты
			facts := protected.Group("/facts")
			{
				facts.GET("", h.GetFacts)
				facts.GET("/:id", h.GetFact)
			}

			// Видео
			videos := protected.Group("/videos")
			{
				videos.GET("", h.GetVideos)
				videos.GET("/:id", h.GetVideo)
			}

			// Оценки (только просмотр для студентов)
			grades := protected.Group("/grades")
			{
				grades.GET("/tests", h.GetUserTestGrades)
				grades.GET("/practices", h.GetUserPracticeGrades)
			}

			// Админские эндпоинты
			admin := protected.Group("/admin")
			admin.Use(AdminMiddleware())
			{
				// Управление пользователями
				adminUsers := admin.Group("/users")
				{
					adminUsers.GET("", h.GetAllUsers)
					adminUsers.PUT("/:id", h.UpdateUser)
					adminUsers.DELETE("/:id", h.DeleteUser)
				}

				// Управление уроками
				adminLessons := admin.Group("/lessons")
				{
					adminLessons.POST("", h.CreateLesson)
					adminLessons.PUT("/:id", h.UpdateLesson)
					adminLessons.DELETE("/:id", h.DeleteLesson)
				}

				// Управление тестами
				adminTests := admin.Group("/tests")
				{
					adminTests.POST("", h.CreateTest)
					adminTests.PUT("/:id", h.UpdateTest)
					adminTests.DELETE("/:id", h.DeleteTest)
					adminTests.GET("/attempts", h.GetAllTestAttempts)
					adminTests.POST("/grades", h.CreateTestGrade)
					adminTests.PUT("/grades/:id", h.UpdateTestGrade)
					adminTests.DELETE("/grades/:id", h.DeleteTestGrade)
				}

				// Управление практическими заданиями
				adminPractices := admin.Group("/practices")
				{
					adminPractices.POST("", h.CreatePractice)
					adminPractices.PUT("/:id", h.UpdatePractice)
					adminPractices.DELETE("/:id", h.DeletePractice)
					adminPractices.GET("/submits", h.GetAllPracticeSubmits)
					adminPractices.POST("/grades", h.CreatePracticeGrade)
					adminPractices.PUT("/grades/:id", h.UpdatePracticeGrade)
					adminPractices.DELETE("/grades/:id", h.DeletePracticeGrade)
				}

				// Управление фактами
				adminFacts := admin.Group("/facts")
				{
					adminFacts.POST("", h.CreateFact)
					adminFacts.PUT("/:id", h.UpdateFact)
					adminFacts.DELETE("/:id", h.DeleteFact)
				}

				// Управление видео
				adminVideos := admin.Group("/videos")
				{
					adminVideos.POST("", h.CreateVideo)
					adminVideos.PUT("/:id", h.UpdateVideo)
					adminVideos.DELETE("/:id", h.DeleteVideo)
				}
			}
		}
	}
}
