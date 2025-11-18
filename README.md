# Backend - Учебный портал по географии

Backend API для учебного портала по географии, реализованный на Go с использованием Gin framework.

## Структура проекта

```
backend/
├── api/              # Роуты и middleware
├── config/           # Конфигурация приложения
├── db/               # Работа с базой данных и миграции
├── docs/             # Swagger документация
├── internal/         # Бизнес-логика (handlers)
├── models/           # Модели данных
├── pkg/              # Утилиты (JWT, password hashing)
└── main.go           # Точка входа
```

## Требования

- Go 1.21 или выше
- PostgreSQL 12 или выше

## Установка и запуск

1. Установите зависимости:
```bash
go mod download
```

2. Создайте файл `.env` на основе `.env.example`:
```bash
cp .env.example .env
```

3. Настройте переменные окружения в `.env`:
```env
PORT=8080
DATABASE_URL=postgres://user:password@localhost:5432/geografi_cheb?sslmode=disable
JWT_SECRET=your-secret-key-change-in-production
ENVIRONMENT=development
```

4. Создайте базу данных PostgreSQL:
```sql
CREATE DATABASE geografi_cheb;
```

5. Запустите приложение:
```bash
go run main.go
```

Приложение будет доступно по адресу `http://localhost:8080`

## Миграции

Миграции выполняются автоматически при запуске приложения через GORM AutoMigrate.

## Swagger документация

После запуска приложения Swagger документация доступна по адресу:
```
http://localhost:8080/swagger/index.html
```

Для генерации документации используйте:
```bash
swag init
```

## API Endpoints

### Авторизация
- `POST /api/v1/auth/register` - Регистрация пользователя
- `POST /api/v1/auth/login` - Вход в систему

### Пользователи
- `GET /api/v1/users/me` - Получить текущего пользователя
- `GET /api/v1/users/:id` - Получить пользователя по ID

### Уроки
- `GET /api/v1/lessons` - Список всех уроков
- `GET /api/v1/lessons/:id` - Получить урок по ID

### Доклады
- `GET /api/v1/reports` - Список докладов
- `GET /api/v1/reports/:id` - Получить доклад
- `POST /api/v1/reports` - Создать доклад
- `PUT /api/v1/reports/:id` - Обновить доклад
- `DELETE /api/v1/reports/:id` - Удалить доклад

### Тесты
- `GET /api/v1/tests` - Список тестов
- `GET /api/v1/tests/:id` - Получить тест
- `POST /api/v1/tests/:id/attempt` - Пройти тест
- `GET /api/v1/tests/attempts` - Мои попытки
- `GET /api/v1/tests/attempts/:id` - Получить попытку

### Практические задания
- `GET /api/v1/practices` - Список практических заданий
- `GET /api/v1/practices/:id` - Получить задание
- `POST /api/v1/practices/:id/submit` - Отправить задание
- `GET /api/v1/practices/submits` - Мои отправки
- `GET /api/v1/practices/submits/:id` - Получить отправку

### Факты
- `GET /api/v1/facts` - Список фактов
- `GET /api/v1/facts/:id` - Получить факт

### Видео
- `GET /api/v1/videos` - Список видеоматериалов
- `GET /api/v1/videos/:id` - Получить видео

### Оценки
- `GET /api/v1/grades/tests` - Мои оценки по тестам
- `GET /api/v1/grades/practices` - Мои оценки по практикам

### Админ панель

Все админские эндпоинты требуют роль `admin`:

- `GET /api/v1/admin/users` - Список всех пользователей
- `PUT /api/v1/admin/users/:id` - Обновить пользователя
- `DELETE /api/v1/admin/users/:id` - Удалить пользователя

- `POST /api/v1/admin/lessons` - Создать урок
- `PUT /api/v1/admin/lessons/:id` - Обновить урок
- `DELETE /api/v1/admin/lessons/:id` - Удалить урок

- `POST /api/v1/admin/tests` - Создать тест
- `PUT /api/v1/admin/tests/:id` - Обновить тест
- `DELETE /api/v1/admin/tests/:id` - Удалить тест
- `GET /api/v1/admin/tests/attempts` - Все попытки тестов
- `POST /api/v1/admin/tests/grades` - Выставить оценку за тест
- `PUT /api/v1/admin/tests/grades/:id` - Обновить оценку
- `DELETE /api/v1/admin/tests/grades/:id` - Удалить оценку

- `POST /api/v1/admin/practices` - Создать практическое задание
- `PUT /api/v1/admin/practices/:id` - Обновить задание
- `DELETE /api/v1/admin/practices/:id` - Удалить задание
- `GET /api/v1/admin/practices/submits` - Все отправки
- `POST /api/v1/admin/practices/grades` - Выставить оценку за практику
- `PUT /api/v1/admin/practices/grades/:id` - Обновить оценку
- `DELETE /api/v1/admin/practices/grades/:id` - Удалить оценку

- `POST /api/v1/admin/facts` - Создать факт
- `PUT /api/v1/admin/facts/:id` - Обновить факт
- `DELETE /api/v1/admin/facts/:id` - Удалить факт

- `POST /api/v1/admin/videos` - Создать видео
- `PUT /api/v1/admin/videos/:id` - Обновить видео
- `DELETE /api/v1/admin/videos/:id` - Удалить видео

## Авторизация

Все защищенные эндпоинты требуют JWT токен в заголовке:
```
Authorization: Bearer {token}
```

Токен получается при входе через `/api/v1/auth/login`.

## Роли

- `student` - Студент (по умолчанию при регистрации)
- `admin` - Администратор (может управлять всем контентом и выставлять оценки)

## Разработка

Для разработки рекомендуется использовать hot-reload инструменты, например:
```bash
go install github.com/cosmtrek/air@latest
air
```

