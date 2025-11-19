import api from './api'

/**
 * Сервис для работы с видеоматериалами
 */

export interface Video {
  id: number
  lesson_id?: number
  title: string
  url: string
  type: string // youtube, vimeo, direct
  created_at: string
  updated_at: string
  lesson?: any
}

/**
 * Получить список всех видеоматериалов
 */
export const getVideos = async (): Promise<Video[]> => {
  const response = await api.get<Video[]>('/videos')
  return response.data
}

/**
 * Получить видеоматериал по ID
 */
export const getVideo = async (id: number): Promise<Video> => {
  const response = await api.get<Video>(`/videos/${id}`)
  return response.data
}

// Админские функции

/**
 * Создать видеоматериал (только для админа)
 */
export const createVideo = async (video: Partial<Video>): Promise<Video> => {
  const response = await api.post<Video>('/admin/videos', video)
  return response.data
}

/**
 * Обновить видеоматериал (только для админа)
 */
export const updateVideo = async (id: number, video: Partial<Video>): Promise<Video> => {
  const response = await api.put<Video>(`/admin/videos/${id}`, video)
  return response.data
}

/**
 * Удалить видеоматериал (только для админа)
 */
export const deleteVideo = async (id: number): Promise<void> => {
  await api.delete(`/admin/videos/${id}`)
}

