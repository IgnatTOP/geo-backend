package handlers

import (
	"geografi-cheb/backend/config"
	"geografi-cheb/backend/models"
	"geografi-cheb/backend/pkg"
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// Handlers содержит все обработчики запросов1
type Handlers struct {
	DB     *gorm.DB
	Config *config.Config
}

// NewHandlers создает новый экземпляр обработчиков
func NewHandlers(db *gorm.DB, cfg *config.Config) *Handlers {
	// Устанавливаем JWT секрет
	pkg.SetJWTSecret(cfg.JWTSecret)
	return &Handlers{
		DB:     db,
		Config: cfg,
	}
}

// RegisterRequest структура запроса регистрации
type RegisterRequest struct {
	Name     string `json:"name" binding:"required,min=2,max=100"`
	Email    string `json:"email" binding:"required,email,max=255"`
	Password string `json:"password" binding:"required,min=6,max=100"`
}

// LoginRequest структура запроса входа
type LoginRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

// Register регистрирует нового пользователя
// @Summary Регистрация пользователя
// @Description Создает нового пользователя с ролью "student" по умолчанию
// @Tags auth
// @Accept json
// @Produce json
// @Param request body RegisterRequest true "Данные регистрации"
// @Success 201 {object} map[string]interface{}
// @Failure 400 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /auth/register [post]
func (h *Handlers) Register(c *gin.Context) {
	var req RegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Проверяем, существует ли пользователь
	var existingUser models.User
	if err := h.DB.Where("email = ?", req.Email).First(&existingUser).Error; err == nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Пользователь с таким email уже существует"})
		return
	}

	// Хешируем пароль
	hashedPassword, err := pkg.HashPassword(req.Password)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка хеширования пароля"})
		return
	}

	// Создаем пользователя
	user := models.User{
		Name:     req.Name,
		Email:    req.Email,
		Password: hashedPassword,
		Role:     "student", // По умолчанию роль студента
	}

	if err := h.DB.Create(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка создания пользователя"})
		return
	}

	// Генерируем токен для автоматического входа после регистрации
	token, err := pkg.GenerateToken(user.ID, user.Email, user.Role)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка генерации токена"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "Пользователь успешно зарегистрирован",
		"token": token,
		"user": gin.H{
			"id":    user.ID,
			"name":  user.Name,
			"email": user.Email,
			"role":  user.Role,
		},
	})
}

// Login выполняет вход пользователя
// @Summary Вход пользователя
// @Description Авторизует пользователя и возвращает JWT токен
// @Tags auth
// @Accept json
// @Produce json
// @Param request body LoginRequest true "Данные входа"
// @Success 200 {object} map[string]interface{}
// @Failure 400 {object} map[string]string
// @Failure 401 {object} map[string]string
// @Router /auth/login [post]
func (h *Handlers) Login(c *gin.Context) {
	var req LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Ищем пользователя
	var user models.User
	if err := h.DB.Where("email = ?", req.Email).First(&user).Error; err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Неверный email или пароль"})
		return
	}

	// Проверяем пароль
	if !pkg.CheckPassword(req.Password, user.Password) {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Неверный email или пароль"})
		return
	}

	// Генерируем токен
	token, err := pkg.GenerateToken(user.ID, user.Email, user.Role)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка генерации токена"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"token": token,
		"user": gin.H{
			"id":    user.ID,
			"name":  user.Name,
			"email": user.Email,
			"role":  user.Role,
		},
	})
}

// GetCurrentUser возвращает текущего авторизованного пользователя
// @Summary Получить текущего пользователя
// @Description Возвращает информацию о текущем авторизованном пользователе
// @Tags users
// @Security BearerAuth
// @Produce json
// @Success 200 {object} models.User
// @Failure 401 {object} map[string]string
// @Router /users/me [get]
func (h *Handlers) GetCurrentUser(c *gin.Context) {
	userID, _ := c.Get("user_id")
	
	var user models.User
	if err := h.DB.First(&user, userID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Пользователь не найден"})
		return
	}

	c.JSON(http.StatusOK, user)
}

// GetUser возвращает пользователя по ID
// @Summary Получить пользователя
// @Description Возвращает информацию о пользователе по ID
// @Tags users
// @Security BearerAuth
// @Produce json
// @Param id path int true "ID пользователя"
// @Success 200 {object} models.User
// @Failure 404 {object} map[string]string
// @Router /users/{id} [get]
func (h *Handlers) GetUser(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil || id == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Неверный ID пользователя"})
		return
	}
	
	var user models.User
	if err := h.DB.First(&user, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Пользователь не найден"})
		return
	}

	c.JSON(http.StatusOK, user)
}

// GetLessons возвращает список всех уроков
// @Summary Получить список уроков
// @Description Возвращает список всех учебных пар (уроков)
// @Tags lessons
// @Security BearerAuth
// @Produce json
// @Success 200 {array} models.Lesson
// @Router /lessons [get]
func (h *Handlers) GetLessons(c *gin.Context) {
	var lessons []models.Lesson
	h.DB.Order("number ASC").Find(&lessons)
	c.JSON(http.StatusOK, lessons)
}

// GetLesson возвращает урок по ID
// @Summary Получить урок
// @Description Возвращает информацию об уроке по ID со всеми связанными материалами
// @Tags lessons
// @Security BearerAuth
// @Produce json
// @Param id path int true "ID урока"
// @Success 200 {object} models.Lesson
// @Failure 404 {object} map[string]string
// @Router /lessons/{id} [get]
func (h *Handlers) GetLesson(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil || id == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Неверный ID урока"})
		return
	}
	
	var lesson models.Lesson
	if err := h.DB.Preload("Reports").Preload("Practices").Preload("Videos").Preload("Tests").Preload("Tests.Questions").First(&lesson, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Урок не найден"})
		return
	}

	c.JSON(http.StatusOK, lesson)
}

// CreateLesson создает новый урок (только для админа)
// @Summary Создать урок
// @Description Создает новый учебный урок (только для администратора)
// @Tags admin
// @Security BearerAuth
// @Accept json
// @Produce json
// @Param request body models.Lesson true "Данные урока"
// @Success 201 {object} models.Lesson
// @Failure 400 {object} map[string]string
// @Router /admin/lessons [post]
func (h *Handlers) CreateLesson(c *gin.Context) {
	var lesson models.Lesson
	if err := c.ShouldBindJSON(&lesson); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := h.DB.Create(&lesson).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Ошибка создания урока"})
		return
	}

	c.JSON(http.StatusCreated, lesson)
}

// UpdateLesson обновляет урок (только для админа)
func (h *Handlers) UpdateLesson(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil || id == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Неверный ID урока"})
		return
	}
	
	var lesson models.Lesson
	if err := h.DB.First(&lesson, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Урок не найден"})
		return
	}

	if err := c.ShouldBindJSON(&lesson); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := h.DB.Save(&lesson).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка обновления урока"})
		return
	}
	c.JSON(http.StatusOK, lesson)
}

// DeleteLesson удаляет урок (только для админа)
func (h *Handlers) DeleteLesson(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil || id == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Неверный ID урока"})
		return
	}
	
	// Проверяем, существует ли урок
	var lesson models.Lesson
	if err := h.DB.First(&lesson, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Урок не найден"})
		return
	}
	
	if err := h.DB.Delete(&models.Lesson{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка удаления урока"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Урок удален"})
}

// GetTests возвращает список тестов
func (h *Handlers) GetTests(c *gin.Context) {
	var tests []models.Test
	h.DB.Preload("Lesson").Preload("Questions").Find(&tests)
	c.JSON(http.StatusOK, tests)
}

// GetTest возвращает тест по ID
func (h *Handlers) GetTest(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil || id == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Неверный ID теста"})
		return
	}
	
	var test models.Test
	if err := h.DB.Preload("Lesson").Preload("Questions").First(&test, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Тест не найден"})
		return
	}

	c.JSON(http.StatusOK, test)
}

// CreateTestRequest структура запроса создания теста
type CreateTestRequest struct {
	LessonID    uint                      `json:"lesson_id" binding:"required"`
	Title       string                    `json:"title" binding:"required"`
	Description string                    `json:"description"`
	Type        string                    `json:"type"` // single или multiple
	Questions   []CreateTestQuestionRequest `json:"questions" binding:"required,min=1"`
}

// CreateTestQuestionRequest структура запроса создания вопроса
type CreateTestQuestionRequest struct {
	Question     string   `json:"question" binding:"required"`
	Options      []string `json:"options" binding:"required,min=2"`
	CorrectAnswer int     `json:"correct_answer" binding:"required"`
	Order        int      `json:"order"`
}

// CreateTest создает новый тест (только для админа)
func (h *Handlers) CreateTest(c *gin.Context) {
	var req CreateTestRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Проверяем тип теста
	if req.Type == "" {
		req.Type = "single"
	}
	if req.Type != "single" && req.Type != "multiple" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "type должен быть 'single' или 'multiple'"})
		return
	}

	// Создаем тест
	test := models.Test{
		LessonID:    req.LessonID,
		Title:       req.Title,
		Description: req.Description,
		Type:        req.Type,
	}

	if err := h.DB.Create(&test).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Ошибка создания теста"})
		return
	}

	// Создаем вопросы
	for i, qReq := range req.Questions {
		// Валидация правильного ответа
		if qReq.CorrectAnswer < 0 || qReq.CorrectAnswer >= len(qReq.Options) {
			h.DB.Delete(&test)
			c.JSON(http.StatusBadRequest, gin.H{"error": "Некорректный индекс правильного ответа для вопроса"})
			return
		}

		// Сериализуем варианты ответов в JSON
		optionsJSON, err := json.Marshal(qReq.Options)
		if err != nil {
			h.DB.Delete(&test)
			c.JSON(http.StatusBadRequest, gin.H{"error": "Ошибка сериализации вариантов ответов"})
			return
		}

		question := models.TestQuestion{
			TestID:        test.ID,
			Question:      qReq.Question,
			Options:       string(optionsJSON),
			CorrectAnswer: qReq.CorrectAnswer,
			Order:         qReq.Order,
		}

		// Если порядок не указан, используем индекс
		if question.Order == 0 {
			question.Order = i + 1
		}

		if err := h.DB.Create(&question).Error; err != nil {
			h.DB.Delete(&test)
			c.JSON(http.StatusBadRequest, gin.H{"error": "Ошибка создания вопроса"})
			return
		}
	}

	// Загружаем с уроком и вопросами для ответа
	h.DB.Preload("Lesson").Preload("Questions").First(&test, test.ID)
	c.JSON(http.StatusCreated, test)
}

// UpdateTestRequest структура запроса обновления теста
type UpdateTestRequest struct {
	Title       string                    `json:"title"`
	Description string                    `json:"description"`
	Type        string                    `json:"type"`
	Questions   []CreateTestQuestionRequest `json:"questions"`
}

// UpdateTest обновляет тест (только для админа)
func (h *Handlers) UpdateTest(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("id"), 10, 32)
	
	var test models.Test
	if err := h.DB.First(&test, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Тест не найден"})
		return
	}

	var req UpdateTestRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Обновляем основные поля
	if req.Title != "" {
		test.Title = req.Title
	}
	if req.Description != "" {
		test.Description = req.Description
	}
	if req.Type != "" {
		if req.Type != "single" && req.Type != "multiple" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "type должен быть 'single' или 'multiple'"})
			return
		}
		test.Type = req.Type
	}

	h.DB.Save(&test)

	// Если переданы вопросы, обновляем их
	if len(req.Questions) > 0 {
		// Удаляем старые вопросы
		h.DB.Where("test_id = ?", test.ID).Delete(&models.TestQuestion{})

		// Создаем новые вопросы
		for i, qReq := range req.Questions {
			if qReq.CorrectAnswer < 0 || qReq.CorrectAnswer >= len(qReq.Options) {
				c.JSON(http.StatusBadRequest, gin.H{"error": "Некорректный индекс правильного ответа для вопроса"})
				return
			}

			optionsJSON, err := json.Marshal(qReq.Options)
			if err != nil {
				c.JSON(http.StatusBadRequest, gin.H{"error": "Ошибка сериализации вариантов ответов"})
				return
			}

			question := models.TestQuestion{
				TestID:        test.ID,
				Question:      qReq.Question,
				Options:       string(optionsJSON),
				CorrectAnswer: qReq.CorrectAnswer,
				Order:         qReq.Order,
			}

			if question.Order == 0 {
				question.Order = i + 1
			}

			if err := h.DB.Create(&question).Error; err != nil {
				c.JSON(http.StatusBadRequest, gin.H{"error": "Ошибка создания вопроса"})
				return
			}
		}
	}

	// Загружаем с вопросами для ответа
	h.DB.Preload("Lesson").Preload("Questions").First(&test, test.ID)
	c.JSON(http.StatusOK, test)
}

// DeleteTest удаляет тест (только для админа)
func (h *Handlers) DeleteTest(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("id"), 10, 32)
	h.DB.Delete(&models.Test{}, id)
	c.JSON(http.StatusOK, gin.H{"message": "Тест удален"})
}

// CreateTestAttemptRequest структура запроса прохождения теста
type CreateTestAttemptRequest struct {
	Answers string `json:"answers" binding:"required"` // JSON строка с ответами
}

// CreateTestAttempt создает попытку прохождения теста
func (h *Handlers) CreateTestAttempt(c *gin.Context) {
	testID, _ := strconv.ParseUint(c.Param("id"), 10, 32)
	userID, _ := c.Get("user_id")
	
	var req CreateTestAttemptRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Получаем тест с вопросами для проверки правильных ответов
	var test models.Test
	if err := h.DB.Preload("Questions").First(&test, testID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Тест не найден"})
		return
	}

	// Проверяем, можно ли проходить тест повторно
	if !test.AllowRetake {
		var existingAttempt models.TestAttempt
		if err := h.DB.Where("user_id = ? AND test_id = ?", userID, testID).First(&existingAttempt).Error; err == nil {
			// Попытка уже существует и повторное прохождение запрещено
			c.JSON(http.StatusForbidden, gin.H{"error": "Тест можно пройти только один раз. Повторное прохождение запрещено администратором."})
			return
		}
	}

	// Парсим ответы пользователя {question_id: answer_index}
	var userAnswers map[string]interface{}
	if err := json.Unmarshal([]byte(req.Answers), &userAnswers); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Некорректный формат ответов"})
		return
	}

	// Подсчитываем баллы
	score := 0.0
	total := float64(len(test.Questions))
	
	for _, question := range test.Questions {
		questionIDStr := strconv.Itoa(int(question.ID))
		if userAnswer, ok := userAnswers[questionIDStr]; ok {
			// Преобразуем ответ пользователя в число
			var userAnswerInt int
			switch v := userAnswer.(type) {
			case float64:
				userAnswerInt = int(v)
			case int:
				userAnswerInt = v
			default:
				continue
			}
			
			// Проверяем правильность ответа
			if userAnswerInt == question.CorrectAnswer {
				score++
			}
		}
	}
	
	finalScore := 0.0
	if total > 0 {
		finalScore = (score / total) * 100
	}

	attempt := models.TestAttempt{
		UserID:  userID.(uint),
		TestID:  uint(testID),
		Answers: req.Answers,
		Score:   finalScore,
	}

	if err := h.DB.Create(&attempt).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Ошибка создания попытки"})
		return
	}

	c.JSON(http.StatusCreated, attempt)
}

// GetUserTestAttempts возвращает попытки прохождения тестов текущего пользователя
func (h *Handlers) GetUserTestAttempts(c *gin.Context) {
	userID, _ := c.Get("user_id")
	
	var attempts []models.TestAttempt
	h.DB.Where("user_id = ?", userID).Preload("Test").Find(&attempts)
	c.JSON(http.StatusOK, attempts)
}

// GetTestAttempt возвращает попытку по ID
func (h *Handlers) GetTestAttempt(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("id"), 10, 32)
	userID, _ := c.Get("user_id")
	
	var attempt models.TestAttempt
	if err := h.DB.Preload("Test").First(&attempt, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Попытка не найдена"})
		return
	}

	// Проверяем доступ (только владелец или админ)
	role, _ := c.Get("user_role")
	if attempt.UserID != userID.(uint) && role != "admin" {
		c.JSON(http.StatusForbidden, gin.H{"error": "Нет доступа"})
		return
	}

	c.JSON(http.StatusOK, attempt)
}

// GetAllTestAttempts возвращает все попытки (только для админа)
func (h *Handlers) GetAllTestAttempts(c *gin.Context) {
	var attempts []models.TestAttempt
	h.DB.Preload("User").Preload("Test").Find(&attempts)
	c.JSON(http.StatusOK, attempts)
}

// CreateTestGradeRequest структура запроса создания оценки теста
type CreateTestGradeRequest struct {
	UserID    uint    `json:"user_id" binding:"required"`
	TestID    uint    `json:"test_id" binding:"required"`
	AttemptID *uint   `json:"attempt_id"`
	Grade     float64 `json:"grade" binding:"required"`
	Comment   string  `json:"comment"`
}

// CreateTestGrade создает или обновляет оценку теста (только для админа)
func (h *Handlers) CreateTestGrade(c *gin.Context) {
	var req CreateTestGradeRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Проверяем, существует ли уже оценка для этого пользователя и теста
	var existingGrade models.TestGrade
	err := h.DB.Where("user_id = ? AND test_id = ?", req.UserID, req.TestID).First(&existingGrade).Error
	
	if err == nil {
		// Оценка найдена - обновляем её
		existingGrade.Grade = req.Grade
		existingGrade.Comment = req.Comment
		if req.AttemptID != nil {
			existingGrade.AttemptID = *req.AttemptID
		}
		
		if err := h.DB.Save(&existingGrade).Error; err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Ошибка обновления оценки"})
			return
		}
		
		c.JSON(http.StatusOK, existingGrade)
		return
	}

	// Оценка не найдена - создаем новую
	grade := models.TestGrade{
		UserID:  req.UserID,
		TestID:  req.TestID,
		Grade:   req.Grade,
		Comment: req.Comment,
	}
	
	if req.AttemptID != nil {
		grade.AttemptID = *req.AttemptID
	}

	if err := h.DB.Create(&grade).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Ошибка создания оценки"})
		return
	}

	c.JSON(http.StatusCreated, grade)
}

// UpdateTestGrade обновляет оценку теста (только для админа)
func (h *Handlers) UpdateTestGrade(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("id"), 10, 32)
	
	var grade models.TestGrade
	if err := h.DB.First(&grade, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Оценка не найдена"})
		return
	}

	if err := c.ShouldBindJSON(&grade); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	h.DB.Save(&grade)
	c.JSON(http.StatusOK, grade)
}

// DeleteTestGrade удаляет оценку теста (только для админа)
func (h *Handlers) DeleteTestGrade(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("id"), 10, 32)
	h.DB.Delete(&models.TestGrade{}, id)
	c.JSON(http.StatusOK, gin.H{"message": "Оценка удалена"})
}

// GetUserTestGrades возвращает оценки тестов текущего пользователя
func (h *Handlers) GetUserTestGrades(c *gin.Context) {
	userID, _ := c.Get("user_id")
	
	var grades []models.TestGrade
	h.DB.Where("user_id = ?", userID).Preload("Test").Preload("Attempt").Find(&grades)
	c.JSON(http.StatusOK, grades)
}

// GetPractices возвращает список практических заданий
func (h *Handlers) GetPractices(c *gin.Context) {
	var practices []models.Practice
	h.DB.Preload("Lesson").Find(&practices)
	c.JSON(http.StatusOK, practices)
}

// GetPractice возвращает практическое задание по ID
func (h *Handlers) GetPractice(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil || id == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Неверный ID практического задания"})
		return
	}
	
	var practice models.Practice
	if err := h.DB.Preload("Lesson").First(&practice, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Практическое задание не найдено"})
		return
	}

	c.JSON(http.StatusOK, practice)
}

// CreatePractice создает новое практическое задание (только для админа)
func (h *Handlers) CreatePractice(c *gin.Context) {
	var practice models.Practice
	if err := c.ShouldBindJSON(&practice); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := h.DB.Create(&practice).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Ошибка создания практического задания"})
		return
	}

	c.JSON(http.StatusCreated, practice)
}

// UpdatePractice обновляет практическое задание (только для админа)
func (h *Handlers) UpdatePractice(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("id"), 10, 32)
	
	var practice models.Practice
	if err := h.DB.First(&practice, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Практическое задание не найдено"})
		return
	}

	if err := c.ShouldBindJSON(&practice); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	h.DB.Save(&practice)
	c.JSON(http.StatusOK, practice)
}

// DeletePractice удаляет практическое задание (только для админа)
func (h *Handlers) DeletePractice(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("id"), 10, 32)
	h.DB.Delete(&models.Practice{}, id)
	c.JSON(http.StatusOK, gin.H{"message": "Практическое задание удалено"})
}

// SubmitPracticeRequest структура запроса отправки практического задания
type SubmitPracticeRequest struct {
	FileURL string `json:"file_url" binding:"required"`
}

// SubmitPractice отправляет практическое задание
func (h *Handlers) SubmitPractice(c *gin.Context) {
	practiceID, _ := strconv.ParseUint(c.Param("id"), 10, 32)
	userID, _ := c.Get("user_id")
	
	var req SubmitPracticeRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	submit := models.PracticeSubmit{
		UserID:     userID.(uint),
		PracticeID: uint(practiceID),
		FileURL:    req.FileURL,
	}

	if err := h.DB.Create(&submit).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Ошибка отправки задания"})
		return
	}

	c.JSON(http.StatusCreated, submit)
}

// GetUserPracticeSubmits возвращает отправки практических заданий текущего пользователя
func (h *Handlers) GetUserPracticeSubmits(c *gin.Context) {
	userID, _ := c.Get("user_id")
	
	var submits []models.PracticeSubmit
	h.DB.Where("user_id = ?", userID).Preload("Practice").Find(&submits)
	c.JSON(http.StatusOK, submits)
}

// GetPracticeSubmit возвращает отправку по ID
func (h *Handlers) GetPracticeSubmit(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("id"), 10, 32)
	userID, _ := c.Get("user_id")
	
	var submit models.PracticeSubmit
	if err := h.DB.Preload("Practice").First(&submit, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Отправка не найдена"})
		return
	}

	// Проверяем доступ
	role, _ := c.Get("user_role")
	if submit.UserID != userID.(uint) && role != "admin" {
		c.JSON(http.StatusForbidden, gin.H{"error": "Нет доступа"})
		return
	}

	c.JSON(http.StatusOK, submit)
}

// GetAllPracticeSubmits возвращает все отправки (только для админа)
func (h *Handlers) GetAllPracticeSubmits(c *gin.Context) {
	var submits []models.PracticeSubmit
	h.DB.Preload("User").Preload("Practice").Find(&submits)
	c.JSON(http.StatusOK, submits)
}

// CreatePracticeGradeRequest структура запроса создания оценки практического задания
type CreatePracticeGradeRequest struct {
	UserID     uint    `json:"user_id" binding:"required"`
	PracticeID uint    `json:"practice_id" binding:"required"`
	SubmitID   *uint   `json:"submit_id"`
	Grade      float64 `json:"grade" binding:"required"`
	Comment    string  `json:"comment"`
}

// CreatePracticeGrade создает или обновляет оценку практического задания (только для админа)
func (h *Handlers) CreatePracticeGrade(c *gin.Context) {
	var req CreatePracticeGradeRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Проверяем, существует ли уже оценка для этого пользователя и практики
	var existingGrade models.PracticeGrade
	err := h.DB.Where("user_id = ? AND practice_id = ?", req.UserID, req.PracticeID).First(&existingGrade).Error
	
	if err == nil {
		// Оценка найдена - обновляем её
		existingGrade.Grade = req.Grade
		existingGrade.Comment = req.Comment
		if req.SubmitID != nil {
			existingGrade.SubmitID = *req.SubmitID
		}
		
		if err := h.DB.Save(&existingGrade).Error; err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Ошибка обновления оценки"})
			return
		}
		
		c.JSON(http.StatusOK, existingGrade)
		return
	}

	// Оценка не найдена - создаем новую
	grade := models.PracticeGrade{
		UserID:     req.UserID,
		PracticeID: req.PracticeID,
		Grade:      req.Grade,
		Comment:    req.Comment,
	}
	
	if req.SubmitID != nil {
		grade.SubmitID = *req.SubmitID
	}

	if err := h.DB.Create(&grade).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Ошибка создания оценки"})
		return
	}

	c.JSON(http.StatusCreated, grade)
}

// UpdatePracticeGrade обновляет оценку практического задания (только для админа)
func (h *Handlers) UpdatePracticeGrade(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("id"), 10, 32)
	
	var grade models.PracticeGrade
	if err := h.DB.First(&grade, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Оценка не найдена"})
		return
	}

	if err := c.ShouldBindJSON(&grade); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	h.DB.Save(&grade)
	c.JSON(http.StatusOK, grade)
}

// DeletePracticeGrade удаляет оценку практического задания (только для админа)
func (h *Handlers) DeletePracticeGrade(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("id"), 10, 32)
	h.DB.Delete(&models.PracticeGrade{}, id)
	c.JSON(http.StatusOK, gin.H{"message": "Оценка удалена"})
}

// GetUserPracticeGrades возвращает оценки практических заданий текущего пользователя
func (h *Handlers) GetUserPracticeGrades(c *gin.Context) {
	userID, _ := c.Get("user_id")
	
	var grades []models.PracticeGrade
	h.DB.Where("user_id = ?", userID).Preload("Practice").Preload("Submit").Find(&grades)
	c.JSON(http.StatusOK, grades)
}

// GetFacts возвращает список фактов с пагинацией
func (h *Handlers) GetFacts(c *gin.Context) {
	page := c.DefaultQuery("page", "1")
	limit := c.DefaultQuery("limit", "12")
	
	pageInt, _ := strconv.Atoi(page)
	limitInt, _ := strconv.Atoi(limit)
	
	if pageInt < 1 {
		pageInt = 1
	}
	if limitInt < 1 || limitInt > 50 {
		limitInt = 12
	}
	
	offset := (pageInt - 1) * limitInt
	
	var facts []models.Fact
	var total int64
	
	h.DB.Model(&models.Fact{}).Count(&total)
	h.DB.Order("created_at DESC").Limit(limitInt).Offset(offset).Find(&facts)
	
	c.JSON(http.StatusOK, gin.H{
		"facts": facts,
		"pagination": gin.H{
			"page":  pageInt,
			"limit": limitInt,
			"total": total,
			"pages": (int(total) + limitInt - 1) / limitInt,
		},
	})
}

// GetFact возвращает факт по ID
func (h *Handlers) GetFact(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil || id == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Неверный ID факта"})
		return
	}
	
	var fact models.Fact
	if err := h.DB.First(&fact, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Факт не найден"})
		return
	}

	c.JSON(http.StatusOK, fact)
}

// CreateFact создает новый факт (только для админа)
func (h *Handlers) CreateFact(c *gin.Context) {
	var fact models.Fact
	if err := c.ShouldBindJSON(&fact); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := h.DB.Create(&fact).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Ошибка создания факта"})
		return
	}

	c.JSON(http.StatusCreated, fact)
}

// UpdateFact обновляет факт (только для админа)
func (h *Handlers) UpdateFact(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("id"), 10, 32)
	
	var fact models.Fact
	if err := h.DB.First(&fact, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Факт не найден"})
		return
	}

	if err := c.ShouldBindJSON(&fact); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	h.DB.Save(&fact)
	c.JSON(http.StatusOK, fact)
}

// DeleteFact удаляет факт (только для админа)
func (h *Handlers) DeleteFact(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("id"), 10, 32)
	h.DB.Delete(&models.Fact{}, id)
	c.JSON(http.StatusOK, gin.H{"message": "Факт удален"})
}

// GetVideos возвращает список видеоматериалов
func (h *Handlers) GetVideos(c *gin.Context) {
	var videos []models.Video
	h.DB.Preload("Lesson").Find(&videos)
	c.JSON(http.StatusOK, videos)
}

// GetVideo возвращает видеоматериал по ID
func (h *Handlers) GetVideo(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil || id == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Неверный ID видео"})
		return
	}
	
	var video models.Video
	if err := h.DB.Preload("Lesson").First(&video, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Видео не найдено"})
		return
	}

	c.JSON(http.StatusOK, video)
}

// CreateVideo создает новый видеоматериал (только для админа)
func (h *Handlers) CreateVideo(c *gin.Context) {
	var video models.Video
	if err := c.ShouldBindJSON(&video); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := h.DB.Create(&video).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Ошибка создания видео"})
		return
	}

	c.JSON(http.StatusCreated, video)
}

// UpdateVideo обновляет видеоматериал (только для админа)
func (h *Handlers) UpdateVideo(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("id"), 10, 32)
	
	var video models.Video
	if err := h.DB.First(&video, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Видео не найдено"})
		return
	}

	if err := c.ShouldBindJSON(&video); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	h.DB.Save(&video)
	c.JSON(http.StatusOK, video)
}

// DeleteVideo удаляет видеоматериал (только для админа)
func (h *Handlers) DeleteVideo(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("id"), 10, 32)
	h.DB.Delete(&models.Video{}, id)
	c.JSON(http.StatusOK, gin.H{"message": "Видео удалено"})
}

// GetAllUsers возвращает всех пользователей (только для админа)
func (h *Handlers) GetAllUsers(c *gin.Context) {
	var users []models.User
	h.DB.Find(&users)
	c.JSON(http.StatusOK, users)
}

// UpdateUser обновляет пользователя (только для админа)
func (h *Handlers) UpdateUser(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("id"), 10, 32)
	
	var user models.User
	if err := h.DB.First(&user, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Пользователь не найден"})
		return
	}

	var updateData struct {
		Name string `json:"name"`
		Email string `json:"email"`
		Role  string `json:"role"`
	}

	if err := c.ShouldBindJSON(&updateData); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if updateData.Name != "" {
		user.Name = updateData.Name
	}
	if updateData.Email != "" {
		user.Email = updateData.Email
	}
	if updateData.Role != "" {
		user.Role = updateData.Role
	}

	h.DB.Save(&user)
	c.JSON(http.StatusOK, user)
}

// DeleteUser удаляет пользователя (только для админа)
func (h *Handlers) DeleteUser(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("id"), 10, 32)
	h.DB.Delete(&models.User{}, id)
	c.JSON(http.StatusOK, gin.H{"message": "Пользователь удален"})
}

// UploadFile загружает файл на сервер
// @Summary Загрузка файла
// @Description Загружает файл на сервер и возвращает URL
// @Tags upload
// @Accept multipart/form-data
// @Produce json
// @Param file formData file true "Файл для загрузки"
// @Param type formData string true "Тип файла: image, document, video, practice, report"
// @Success 200 {object} map[string]string
// @Failure 400 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /upload/file [post]
// @Security BearerAuth
func (h *Handlers) UploadFile(c *gin.Context) {
	// Получаем файл из формы
	file, err := c.FormFile("file")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Файл не найден"})
		return
	}

	// Получаем тип файла
	fileType := c.PostForm("type")
	if fileType == "" {
		// Определяем тип автоматически
		fileType = pkg.GetFileType(file.Filename)
	}

	// Определяем поддиректорию
	var subdir string
	switch fileType {
	case "image":
		subdir = "images"
	case "document":
		subdir = "documents"
	case "video":
		subdir = "videos"
	case "practice":
		subdir = "practices"
	case "report":
		subdir = "reports"
	default:
		subdir = "other"
	}

	// Загружаем файл
	url, err := pkg.UploadFile(file, h.Config.UploadDir, subdir)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка загрузки файла: " + err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"url":  url,
		"type": fileType,
	})
}

