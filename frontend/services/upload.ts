import api from './api'

export interface UploadResponse {
  url: string
  type: string
}

// Базовый URL API
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

// Базовый URL бекенда без /api/v1 для статических файлов
const getBackendBaseUrl = (): string => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'
  return apiUrl.replace('/api/v1', '')
}

/**
 * Загружает файл на сервер
 * @param file - Файл для загрузки
 * @param type - Тип файла: image, document, video, practice, report
 * @returns URL загруженного файла
 */
export async function uploadFile(file: File, type: string = 'other'): Promise<UploadResponse> {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('type', type)

  const response = await api.post<UploadResponse>('/upload/file', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })

  // Если URL относительный, добавляем базовый URL без /api/v1
  let url = response.data.url
  if (url.startsWith('/')) {
    const baseUrl = getBackendBaseUrl()
    url = `${baseUrl}${url}`
  }

  return {
    ...response.data,
    url,
  }
}

/**
 * Нормализует URL файла (добавляет базовый URL если нужно)
 * Работает для изображений, документов, видео и других файлов
 */
export function normalizeFileUrl(url: string | undefined | null): string | undefined {
  if (!url) return undefined
  
  // Если URL уже полный (начинается с http:// или https://), возвращаем как есть
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url
  }
  
  // Если URL относительный, добавляем базовый URL бекенда
  if (url.startsWith('/')) {
    const baseUrl = getBackendBaseUrl()
    return `${baseUrl}${url}`
  }
  
  return url
}

/**
 * Нормализует URL изображения (добавляет базовый URL если нужно)
 * @deprecated Используйте normalizeFileUrl вместо этого
 */
export function normalizeImageUrl(url: string | undefined | null): string | undefined {
  return normalizeFileUrl(url)
}

/**
 * Определяет тип файла по расширению
 */
export function getFileType(filename: string): string {
  const ext = filename.toLowerCase().split('.').pop()
  switch (ext) {
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'gif':
    case 'webp':
    case 'svg':
      return 'image'
    case 'pdf':
    case 'doc':
    case 'docx':
    case 'txt':
    case 'rtf':
      return 'document'
    case 'mp4':
    case 'webm':
    case 'avi':
    case 'mov':
    case 'mkv':
      return 'video'
    default:
      return 'other'
  }
}

