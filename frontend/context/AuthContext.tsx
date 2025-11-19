'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { User, getCurrentUser, isAuthenticated, logout as logoutService } from '@/services/auth'
import Cookies from 'js-cookie'

/**
 * Контекст авторизации для управления состоянием пользователя
 */

interface AuthContextType {
  user: User | null
  loading: boolean
  isAuth: boolean
  login: (user: User) => Promise<void>
  logout: () => void
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  // Загрузка пользователя при монтировании
  useEffect(() => {
    let isMounted = true
    
    const loadUser = async () => {
      if (isAuthenticated()) {
        try {
          const currentUser = await getCurrentUser()
          if (isMounted) {
            setUser(currentUser)
          }
        } catch (error) {
          // Токен невалиден
          if (isMounted) {
            Cookies.remove('token')
            setUser(null)
          }
        }
      } else {
        // Если токена нет, убеждаемся что пользователь не установлен
        if (isMounted) {
          setUser(null)
        }
      }
      if (isMounted) {
        setLoading(false)
      }
    }
    
    loadUser()
    
    return () => {
      isMounted = false
    }
  }, [])

  const login = async (userData: User) => {
    setUser(userData)
    // После установки пользователя из ответа, обновляем из API для гарантии актуальности
    try {
      const currentUser = await getCurrentUser()
      setUser(currentUser)
    } catch (error) {
      // Если не удалось загрузить, оставляем данные из ответа
      console.error('Ошибка обновления пользователя после входа:', error)
    }
  }

  const logout = () => {
    logoutService()
    setUser(null)
    // Полная очистка состояния при выходе
    if (typeof window !== 'undefined') {
      // Очищаем все возможные кэшированные данные
      localStorage.clear()
      sessionStorage.clear()
    }
  }

  const refreshUser = async () => {
    if (isAuthenticated()) {
      try {
        const currentUser = await getCurrentUser()
        setUser(currentUser)
      } catch (error) {
        // Токен невалиден, очищаем состояние
        Cookies.remove('token')
        setUser(null)
      }
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuth: !!user,
        login,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth должен использоваться внутри AuthProvider')
  }
  return context
}

