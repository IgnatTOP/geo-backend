import api from './api'

/**
 * Сервис для работы с докладами
 */

export interface Report {
  id: number
  user_id: number
  lesson_id?: number
  title: string
  file_url: string
  created_at: string
  updated_at: string
  user?: any
  lesson?: any
}

/**
 * Получить список всех докладов
 */
export const getReports = async (): Promise<Report[]> => {
  const response = await api.get<Report[]>('/reports')
  return response.data
}

/**
 * Получить доклад по ID
 */
export const getReport = async (id: number): Promise<Report> => {
  const response = await api.get<Report>(`/reports/${id}`)
  return response.data
}

/**
 * Создать доклад
 */
export const createReport = async (report: Partial<Report>): Promise<Report> => {
  const response = await api.post<Report>('/reports', report)
  return response.data
}

/**
 * Обновить доклад
 */
export const updateReport = async (id: number, report: Partial<Report>): Promise<Report> => {
  const response = await api.put<Report>(`/reports/${id}`, report)
  return response.data
}

/**
 * Удалить доклад
 */
export const deleteReport = async (id: number): Promise<void> => {
  await api.delete(`/reports/${id}`)
}

