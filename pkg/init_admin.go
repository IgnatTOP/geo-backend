package pkg

import (
	"geografi-cheb/backend/models"
	"log"

	"gorm.io/gorm"
)

// InitAdmin создает администратора по умолчанию, если его еще нет
func InitAdmin(db *gorm.DB) {
	var admin models.User
	result := db.Where("email = ?", "admin@geography.edu").First(&admin)

	// Если администратор уже существует, выходим
	if result.Error == nil {
		log.Println("Администратор уже существует")
		return
	}

	// Создаем нового администратора
	hashedPassword, err := HashPassword("admin123")
	if err != nil {
		log.Printf("Ошибка хеширования пароля администратора: %v", err)
		return
	}

	admin = models.User{
		Name:     "Администратор",
		Email:    "admin@geography.edu",
		Password: hashedPassword,
		Role:     "admin",
	}

	if err := db.Create(&admin).Error; err != nil {
		log.Printf("Ошибка создания администратора: %v", err)
		return
	}

	log.Println("========================================")
	log.Println("✅ АДМИНИСТРАТОР СОЗДАН ПО УМОЛЧАНИЮ")
	log.Println("========================================")
	log.Println("Email:    admin@geography.edu")
	log.Println("Пароль:   admin123")
	log.Println("Роль:     admin")
	log.Println("========================================")
}

