import api from './api'

/**
 * Сервис для работы с уроками
 */

export interface Lesson {
  id: number
  number: number
  topic: string
  content?: string
  images?: string // JSON массив URL фотографий
  documents?: string // JSON массив URL документов
  video_files?: string // JSON массив URL видеофайлов
  created_at: string
  updated_at: string
  reports?: any[]
  practices?: any[]
  videos?: any[]
  tests?: any[]
}

/**
 * Получить список всех уроков
 */
export const getLessons = async (): Promise<Lesson[]> => {
  const response = await api.get<Lesson[]>('/lessons')
  return response.data
}

/**
 * Получить урок по ID
 */
export const getLesson = async (id: number): Promise<Lesson> => {
  const response = await api.get<Lesson>(`/lessons/${id}`)
  return response.data
}

/**
 * Создать урок (только для админа)
 */
export const createLesson = async (lesson: Partial<Lesson>): Promise<Lesson> => {
  const response = await api.post<Lesson>('/admin/lessons', lesson)
  return response.data
}

/**
 * Обновить урок (только для админа)
 */
export const updateLesson = async (id: number, lesson: Partial<Lesson>): Promise<Lesson> => {
  const response = await api.put<Lesson>(`/admin/lessons/${id}`, lesson)
  return response.data
}

/**
 * Удалить урок (только для админа)
 */
export const deleteLesson = async (id: number): Promise<void> => {
  await api.delete(`/admin/lessons/${id}`)
}

