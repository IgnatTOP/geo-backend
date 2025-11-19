import api from './api'
import Cookies from 'js-cookie'

/**
 * Сервис для работы с авторизацией
 */

export interface RegisterData {
  name: string
  email: string
  password: string
}

export interface LoginData {
  email: string
  password: string
}

export interface User {
  id: number
  name: string
  email: string
  role: 'student' | 'admin'
  created_at: string
}

export interface AuthResponse {
  token: string
  user: User
}

/**
 * Регистрация нового пользователя
 */
export const register = async (data: RegisterData): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>('/auth/register', data)
  if (response.data.token) {
    Cookies.set('token', response.data.token, { expires: 7 })
  }
  return response.data
}

/**
 * Вход в систему
 */
export const login = async (data: LoginData): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>('/auth/login', data)
  if (response.data.token) {
    Cookies.set('token', response.data.token, { expires: 7 })
  }
  return response.data
}

/**
 * Выход из системы
 */
export const logout = (): void => {
  Cookies.remove('token')
  if (typeof window !== 'undefined') {
    window.location.href = '/login'
  }
}

/**
 * Получить текущего пользователя
 */
export const getCurrentUser = async (): Promise<User> => {
  const response = await api.get<User>('/users/me')
  return response.data
}

/**
 * Проверка, авторизован ли пользователь
 */
export const isAuthenticated = (): boolean => {
  return !!Cookies.get('token')
}

