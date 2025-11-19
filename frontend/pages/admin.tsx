import { useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

/**
 * Админ панель - главная страница управления
 */
export default function AdminPage() {
  const { user, isAuth } = useAuth()

  if (!isAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <CardContent className="p-6">
            <p className="text-center mb-4">Необходима авторизация</p>
            <Link href="/login">
              <Button className="w-full">Войти</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <CardContent className="p-6">
            <p className="text-center text-destructive mb-4">
              Доступ запрещен. Требуются права администратора.
            </p>
            <Link href="/">
              <Button className="w-full">На главную</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-10">
          <h1 className="text-4xl font-bold mb-2 text-gradient">Админ панель</h1>
          <p className="text-muted-foreground text-lg">Управление учебным порталом</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="card-hover border-2 border-primary/20 hover:border-primary/40">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg gradient-primary flex items-center justify-center mb-3 shadow-glow">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <CardTitle className="text-xl">Уроки</CardTitle>
              <CardDescription>Управление учебными парами</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/admin/lessons">
                <Button className="w-full gradient-primary shadow-glow">Управление уроками</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="card-hover border-2 border-primary/20 hover:border-primary/40">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg gradient-primary flex items-center justify-center mb-3 shadow-glow">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
              </div>
              <CardTitle className="text-xl">Тесты</CardTitle>
              <CardDescription>Создание тестов и выставление оценок</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/admin/tests">
                <Button className="w-full gradient-primary shadow-glow">Управление тестами</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="card-hover border-2 border-primary/20 hover:border-primary/40">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg gradient-primary flex items-center justify-center mb-3 shadow-glow">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <CardTitle className="text-xl">Практики</CardTitle>
              <CardDescription>Управление практическими заданиями и оценками</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/admin/practices">
                <Button className="w-full gradient-primary shadow-glow">Управление практиками</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="card-hover border-2 border-primary/20 hover:border-primary/40">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg gradient-primary flex items-center justify-center mb-3 shadow-glow">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <CardTitle className="text-xl">Факты</CardTitle>
              <CardDescription>Управление фактами и постами</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/admin/facts">
                <Button className="w-full gradient-primary shadow-glow">Управление фактами</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="card-hover border-2 border-primary/20 hover:border-primary/40">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg gradient-primary flex items-center justify-center mb-3 shadow-glow">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
              <CardTitle className="text-xl">Видео</CardTitle>
              <CardDescription>Управление видеоматериалами</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/admin/videos">
                <Button className="w-full gradient-primary shadow-glow">Управление видео</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="card-hover border-2 border-primary/20 hover:border-primary/40">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg gradient-primary flex items-center justify-center mb-3 shadow-glow">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <CardTitle className="text-xl">Пользователи</CardTitle>
              <CardDescription>Управление пользователями</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/admin/users">
                <Button className="w-full gradient-primary shadow-glow">Управление пользователями</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

