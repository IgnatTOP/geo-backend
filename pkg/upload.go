package pkg

import (
	"fmt"
	"io"
	"mime/multipart"
	"os"
	"path/filepath"
	"strings"
	"time"
)

// UploadFile загружает файл и возвращает URL для доступа к нему
func UploadFile(file *multipart.FileHeader, uploadDir string, subdir string) (string, error) {
	// Проверяем размер файла (максимум 100MB)
	const maxFileSize = 100 * 1024 * 1024
	if file.Size > maxFileSize {
		return "", fmt.Errorf("размер файла превышает максимальный лимит в 100MB")
	}

	// Открываем файл
	src, err := file.Open()
	if err != nil {
		return "", err
	}
	defer src.Close()

	// Определяем расширение файла
	ext := filepath.Ext(file.Filename)
	if ext == "" {
		ext = ".bin"
	}

	// Генерируем уникальное имя файла (убираем расширение из оригинального имени)
	timestamp := time.Now().Unix()
	originalName := strings.TrimSuffix(file.Filename, ext)
	filename := fmt.Sprintf("%d_%s%s", timestamp, sanitizeFilename(originalName), ext)
	
	// Создаем путь для сохранения
	dir := filepath.Join(uploadDir, subdir)
	if err := os.MkdirAll(dir, 0755); err != nil {
		return "", err
	}
	
	dstPath := filepath.Join(dir, filename)

	// Создаем файл назначения
	dst, err := os.Create(dstPath)
	if err != nil {
		return "", err
	}
	defer dst.Close()

	// Копируем содержимое
	if _, err = io.Copy(dst, src); err != nil {
		return "", err
	}

	// Возвращаем URL для доступа к файлу
	url := fmt.Sprintf("/uploads/%s/%s", subdir, filename)
	return url, nil
}

// sanitizeFilename очищает имя файла от недопустимых символов
func sanitizeFilename(filename string) string {
	// Убираем расширение
	name := strings.TrimSuffix(filename, filepath.Ext(filename))
	// Заменяем недопустимые символы
	name = strings.ReplaceAll(name, " ", "_")
	name = strings.ReplaceAll(name, "/", "_")
	name = strings.ReplaceAll(name, "\\", "_")
	name = strings.ReplaceAll(name, "..", "_")
	// Ограничиваем длину
	if len(name) > 50 {
		name = name[:50]
	}
	return name
}

// GetFileType определяет тип файла по расширению
func GetFileType(filename string) string {
	ext := strings.ToLower(filepath.Ext(filename))
	switch ext {
	case ".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg":
		return "image"
	case ".pdf", ".doc", ".docx", ".txt", ".rtf":
		return "document"
	case ".mp4", ".webm", ".avi", ".mov", ".mkv":
		return "video"
	default:
		return "other"
	}
}

