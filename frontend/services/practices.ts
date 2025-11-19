import api from './api'

/**
 * Сервис для работы с практическими заданиями
 */

export interface Practice {
  id: number
  lesson_id: number
  title: string
  file_url?: string
  created_at: string
  updated_at: string
  lesson?: any
}

export interface PracticeSubmit {
  id: number
  user_id: number
  practice_id: number
  file_url: string
  created_at: string
  practice?: Practice
  user?: {
    id: number
    name: string
    email: string
    role: string
  }
}

export interface PracticeGrade {
  id: number
  user_id: number
  practice_id: number
  submit_id?: number
  grade: number
  comment?: string
  created_at: string
  practice?: Practice
  submit?: PracticeSubmit
}

/**
 * Получить список всех практических заданий
 */
export const getPractices = async (): Promise<Practice[]> => {
  const response = await api.get<Practice[]>('/practices')
  return response.data
}

/**
 * Получить практическое задание по ID
 */
export const getPractice = async (id: number): Promise<Practice> => {
  const response = await api.get<Practice>(`/practices/${id}`)
  return response.data
}

/**
 * Отправить практическое задание
 */
export const submitPractice = async (practiceId: number, fileUrl: string): Promise<PracticeSubmit> => {
  const response = await api.post<PracticeSubmit>(`/practices/${practiceId}/submit`, { file_url: fileUrl })
  return response.data
}

/**
 * Получить мои отправки практических заданий
 */
export const getMyPracticeSubmits = async (): Promise<PracticeSubmit[]> => {
  const response = await api.get<PracticeSubmit[]>('/practices/submits')
  return response.data
}

/**
 * Получить отправку по ID
 */
export const getPracticeSubmit = async (id: number): Promise<PracticeSubmit> => {
  const response = await api.get<PracticeSubmit>(`/practices/submits/${id}`)
  return response.data
}

/**
 * Получить мои оценки по практическим заданиям
 */
export const getMyPracticeGrades = async (): Promise<PracticeGrade[]> => {
  const response = await api.get<PracticeGrade[]>('/grades/practices')
  return response.data
}

// Админские функции

/**
 * Создать практическое задание (только для админа)
 */
export const createPractice = async (practice: Partial<Practice>): Promise<Practice> => {
  const response = await api.post<Practice>('/admin/practices', practice)
  return response.data
}

/**
 * Обновить практическое задание (только для админа)
 */
export const updatePractice = async (id: number, practice: Partial<Practice>): Promise<Practice> => {
  const response = await api.put<Practice>(`/admin/practices/${id}`, practice)
  return response.data
}

/**
 * Удалить практическое задание (только для админа)
 */
export const deletePractice = async (id: number): Promise<void> => {
  await api.delete(`/admin/practices/${id}`)
}

/**
 * Получить все отправки практических заданий (только для админа)
 */
export const getAllPracticeSubmits = async (): Promise<PracticeSubmit[]> => {
  const response = await api.get<PracticeSubmit[]>('/admin/practices/submits')
  return response.data
}

/**
 * Создать оценку за практическое задание (только для админа)
 */
export const createPracticeGrade = async (grade: {
  user_id: number
  practice_id: number
  submit_id?: number
  grade: number
  comment?: string
}): Promise<PracticeGrade> => {
  const response = await api.post<PracticeGrade>('/admin/practices/grades', grade)
  return response.data
}

/**
 * Обновить оценку за практическое задание (только для админа)
 */
export const updatePracticeGrade = async (id: number, grade: Partial<PracticeGrade>): Promise<PracticeGrade> => {
  const response = await api.put<PracticeGrade>(`/admin/practices/grades/${id}`, grade)
  return response.data
}

/**
 * Удалить оценку за практическое задание (только для админа)
 */
export const deletePracticeGrade = async (id: number): Promise<void> => {
  await api.delete(`/admin/practices/grades/${id}`)
}

