import { useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { getMyTestGrades } from '@/services/tests'
import { getMyPracticeGrades } from '@/services/practices'
import type { TestGrade } from '@/services/tests'
import type { PracticeGrade } from '@/services/practices'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

/**
 * Страница профиля пользователя с результатами
 */
export default function ProfilePage() {
  const { user, isAuth, logout, loading: authLoading } = useAuth()
  const [testGrades, setTestGrades] = useState<TestGrade[]>([])
  const [practiceGrades, setPracticeGrades] = useState<PracticeGrade[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (authLoading) return
    if (!isAuth) {
      setLoading(false)
      return
    }

    const loadData = async () => {
      try {
        const [testsData, practicesData] = await Promise.all([
          getMyTestGrades(),
          getMyPracticeGrades(),
        ])
        setTestGrades(testsData)
        setPracticeGrades(practicesData)
      } catch (error) {
        console.error('Ошибка загрузки данных:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [isAuth, authLoading])

  if (authLoading || loading) {
    return <div className="min-h-screen flex items-center justify-center">Загрузка...</div>
  }

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

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Загрузка...</div>
  }

  const averageTestGrade =
    testGrades.length > 0
      ? testGrades.reduce((sum, g) => sum + g.grade, 0) / testGrades.length
      : 0

  const averagePracticeGrade =
    practiceGrades.length > 0
      ? practiceGrades.reduce((sum, g) => sum + g.grade, 0) / practiceGrades.length
      : 0

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-10">
          <h1 className="text-4xl font-bold mb-2 text-gradient">Профиль</h1>
          <p className="text-muted-foreground text-lg">Ваши результаты и достижения</p>
        </div>

        {/* Информация о пользователе */}
        <Card className="mb-8 border-2 border-primary/20 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-t-xl">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full gradient-primary flex items-center justify-center text-white font-bold text-xl shadow-glow">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <CardTitle className="text-2xl">{user?.name}</CardTitle>
                <CardDescription className="text-base">{user?.email}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span><strong>Роль:</strong> {user?.role === 'admin' ? 'Администратор' : 'Студент'}</span>
              </div>
            </div>
            <Button variant="destructive" className="w-full shadow-md" onClick={logout}>
              Выйти
            </Button>
          </CardContent>
        </Card>

        {/* Статистика */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card className="border-2 border-primary/20 hover:border-primary/40 transition-all">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg gradient-primary flex items-center justify-center shadow-glow">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                  </svg>
                </div>
                <div>
                  <CardTitle>Тесты</CardTitle>
                  <CardDescription>Статистика прохождения</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-baseline gap-2">
                  <p className="text-3xl font-bold text-gradient">{testGrades.length}</p>
                  <p className="text-sm text-muted-foreground">оценок</p>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-primary/5">
                  <span className="text-sm font-medium">Средний балл:</span>
                  <span className="text-lg font-bold text-primary">{averageTestGrade.toFixed(1)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-primary/20 hover:border-primary/40 transition-all">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg gradient-primary flex items-center justify-center shadow-glow">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </div>
                <div>
                  <CardTitle>Практики</CardTitle>
                  <CardDescription>Практические задания</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-baseline gap-2">
                  <p className="text-3xl font-bold text-gradient">{practiceGrades.length}</p>
                  <p className="text-sm text-muted-foreground">оценок</p>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-primary/5">
                  <span className="text-sm font-medium">Средний балл:</span>
                  <span className="text-lg font-bold text-primary">{averagePracticeGrade.toFixed(1)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-primary/20 hover:border-primary/40 transition-all">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg gradient-primary flex items-center justify-center shadow-glow">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <CardTitle>Общий балл</CardTitle>
                  <CardDescription>Средняя успеваемость</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-baseline gap-2">
                  <p className="text-3xl font-bold text-gradient">
                    {testGrades.length + practiceGrades.length > 0
                      ? ((averageTestGrade + averagePracticeGrade) / 2).toFixed(1)
                      : '0.0'}
                  </p>
                  <p className="text-sm text-muted-foreground">балл</p>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-primary/5">
                  <span className="text-sm font-medium">Всего оценок:</span>
                  <span className="text-lg font-bold text-primary">{testGrades.length + practiceGrades.length}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Оценки */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Оценки по тестам */}
          <Card className="border-2 border-primary/10">
            <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-t-xl">
              <div className="flex items-center gap-3">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
                <CardTitle>Оценки по тестам</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              {testGrades.length > 0 ? (
                <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                  {testGrades.map((grade) => (
                    <div key={grade.id} className="p-4 border-2 border-primary/10 rounded-lg hover:border-primary/30 transition-all">
                      <div className="flex justify-between items-start mb-2">
                        <p className="font-semibold text-lg">{grade.test?.title || 'Тест'}</p>
                        <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-primary/20">
                          <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                          </svg>
                          <span className="font-bold text-primary">{grade.grade}</span>
                        </div>
                      </div>
                      {grade.comment && (
                        <div className="mb-2 p-2 rounded-md bg-muted/50">
                          <p className="text-sm text-foreground/80">{grade.comment}</p>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {new Date(grade.created_at).toLocaleDateString('ru-RU', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <svg className="w-16 h-16 mx-auto mb-3 text-muted-foreground/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                  <p className="text-muted-foreground">Оценок по тестам пока нет</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Оценки по практикам */}
          <Card className="border-2 border-primary/10">
            <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-t-xl">
              <div className="flex items-center gap-3">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                <CardTitle>Оценки по практическим заданиям</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              {practiceGrades.length > 0 ? (
                <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                  {practiceGrades.map((grade) => (
                    <div key={grade.id} className="p-4 border-2 border-primary/10 rounded-lg hover:border-primary/30 transition-all">
                      <div className="flex justify-between items-start mb-2">
                        <p className="font-semibold text-lg">{grade.practice?.title || 'Практика'}</p>
                        <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-primary/20">
                          <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                          </svg>
                          <span className="font-bold text-primary">{grade.grade}</span>
                        </div>
                      </div>
                      {grade.comment && (
                        <div className="mb-2 p-2 rounded-md bg-muted/50">
                          <p className="text-sm text-foreground/80">{grade.comment}</p>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {new Date(grade.created_at).toLocaleDateString('ru-RU', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <svg className="w-16 h-16 mx-auto mb-3 text-muted-foreground/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p className="text-muted-foreground">Оценок по практикам пока нет</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

