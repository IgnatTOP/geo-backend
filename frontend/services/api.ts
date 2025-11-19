import axios from 'axios'
import Cookies from 'js-cookie'

// Базовый URL API
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://ignattop-geo-backend-fb1b.twc1.net/api/v1'

// Создаем экземпляр axios с базовой конфигурацией
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Интерцептор для добавления токена к каждому запросу
api.interceptors.request.use(
  (config: any) => {
    const token = Cookies.get('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error: any) => {
    return Promise.reject(error)
  }
)

// Интерцептор для обработки ошибок
api.interceptors.response.use(
  (response: any) => response,
  (error: any) => {
    // Обрабатываем различные типы ошибок
    if (error.response?.status === 401) {
      // Токен невалиден или истек
      Cookies.remove('token')
      // Не делаем редирект здесь, чтобы избежать бесконечных циклов
      // Редирект должен обрабатываться на уровне компонентов
    } else if (error.response?.status === 403) {
      // Недостаточно прав доступа
      console.error('Недостаточно прав для выполнения операции')
    } else if (error.response?.status === 404) {
      // Ресурс не найден
      console.error('Запрошенный ресурс не найден')
    } else if (error.response?.status >= 500) {
      // Ошибка сервера
      console.error('Ошибка сервера. Попробуйте позже')
    } else if (error.code === 'ECONNABORTED' || error.message === 'Network Error') {
      // Проблемы с сетью
      console.error('Ошибка сети. Проверьте подключение к интернету')
    }
    return Promise.reject(error)
  }
)

export default api

