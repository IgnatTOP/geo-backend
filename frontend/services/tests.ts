import api from './api'
import type { Lesson } from './lessons'

/**
 * Сервис для работы с тестами
 */

export interface TestQuestion {
  id: number
  test_id: number
  question: string
  options: string // JSON массив вариантов ответов
  correct_answer: number // Индекс правильного ответа
  order: number
}

export interface Test {
  id: number
  lesson_id: number
  title: string
  description?: string
  type: 'single' | 'multiple' // Тип теста
  allow_retake?: boolean // Разрешить повторное прохождение
  created_at: string
  updated_at: string
  lesson?: Lesson
  questions?: TestQuestion[]
}

export interface TestAttempt {
  id: number
  user_id: number
  test_id: number
  answers: string // JSON строка
  score: number
  created_at: string
  test?: Test
}

export interface TestGrade {
  id: number
  user_id: number
  test_id: number
  attempt_id?: number
  grade: number
  comment?: string
  created_at: string
  test?: Test
  attempt?: TestAttempt
}

/**
 * Получить список всех тестов
 */
export const getTests = async (): Promise<Test[]> => {
  const response = await api.get<Test[]>('/tests')
  return response.data
}

/**
 * Получить тест по ID
 */
export const getTest = async (id: number): Promise<Test> => {
  const response = await api.get<Test>(`/tests/${id}`)
  return response.data
}

/**
 * Создать попытку прохождения теста
 */
export const createTestAttempt = async (testId: number, answers: string): Promise<TestAttempt> => {
  const response = await api.post<TestAttempt>(`/tests/${testId}/attempt`, { answers })
  return response.data
}

/**
 * Получить мои попытки прохождения тестов
 */
export const getMyTestAttempts = async (): Promise<TestAttempt[]> => {
  const response = await api.get<TestAttempt[]>('/tests/attempts')
  return response.data
}

/**
 * Получить попытку по ID
 */
export const getTestAttempt = async (id: number): Promise<TestAttempt> => {
  const response = await api.get<TestAttempt>(`/tests/attempts/${id}`)
  return response.data
}

/**
 * Получить мои оценки по тестам
 */
export const getMyTestGrades = async (): Promise<TestGrade[]> => {
  const response = await api.get<TestGrade[]>('/grades/tests')
  return response.data
}

// Админские функции

/**
 * Создать тест (только для админа)
 */
export const createTest = async (test: Partial<Test>): Promise<Test> => {
  const response = await api.post<Test>('/admin/tests', test)
  return response.data
}

/**
 * Обновить тест (только для админа)
 */
export const updateTest = async (id: number, test: Partial<Test>): Promise<Test> => {
  const response = await api.put<Test>(`/admin/tests/${id}`, test)
  return response.data
}

/**
 * Удалить тест (только для админа)
 */
export const deleteTest = async (id: number): Promise<void> => {
  await api.delete(`/admin/tests/${id}`)
}

/**
 * Получить все попытки тестов (только для админа)
 */
export const getAllTestAttempts = async (): Promise<TestAttempt[]> => {
  const response = await api.get<TestAttempt[]>('/admin/tests/attempts')
  return response.data
}

/**
 * Создать оценку за тест (только для админа)
 */
export const createTestGrade = async (grade: {
  user_id: number
  test_id: number
  attempt_id?: number
  grade: number
  comment?: string
}): Promise<TestGrade> => {
  const response = await api.post<TestGrade>('/admin/tests/grades', grade)
  return response.data
}

/**
 * Обновить оценку за тест (только для админа)
 */
export const updateTestGrade = async (id: number, grade: Partial<TestGrade>): Promise<TestGrade> => {
  const response = await api.put<TestGrade>(`/admin/tests/grades/${id}`, grade)
  return response.data
}

/**
 * Удалить оценку за тест (только для админа)
 */
export const deleteTestGrade = async (id: number): Promise<void> => {
  await api.delete(`/admin/tests/grades/${id}`)
}

