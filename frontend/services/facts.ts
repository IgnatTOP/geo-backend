import api from './api'

/**
 * Сервис для работы с фактами
 */

export interface Fact {
  id: number
  title: string
  content: string
  image_url?: string
  created_at: string
  updated_at: string
}

export interface FactsResponse {
  facts: Fact[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

/**
 * Получить список всех фактов с пагинацией
 */
export const getFacts = async (page: number = 1, limit: number = 12): Promise<FactsResponse> => {
  const response = await api.get<FactsResponse>(`/facts?page=${page}&limit=${limit}`)
  return response.data
}

/**
 * Получить факт по ID
 */
export const getFact = async (id: number): Promise<Fact> => {
  const response = await api.get<Fact>(`/facts/${id}`)
  return response.data
}

// Админские функции

/**
 * Создать факт (только для админа)
 */
export const createFact = async (fact: Partial<Fact>): Promise<Fact> => {
  const response = await api.post<Fact>('/admin/facts', fact)
  return response.data
}

/**
 * Обновить факт (только для админа)
 */
export const updateFact = async (id: number, fact: Partial<Fact>): Promise<Fact> => {
  const response = await api.put<Fact>(`/admin/facts/${id}`, fact)
  return response.data
}

/**
 * Удалить факт (только для админа)
 */
export const deleteFact = async (id: number): Promise<void> => {
  await api.delete(`/admin/facts/${id}`)
}

