import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { useAuth } from '@/context/AuthContext'
import { getTests, getMyTestAttempts, getMyTestGrades } from '@/services/tests'
import type { Test, TestAttempt, TestGrade } from '@/services/tests'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import SearchBar from '@/components/SearchBar'
import Link from 'next/link'

/**
 * Страница со списком тестов
 */
export default function TestsPage() {
  const { isAuth, user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [tests, setTests] = useState<Test[]>([])
  const [attempts, setAttempts] = useState<TestAttempt[]>([])
  const [grades, setGrades] = useState<TestGrade[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    if (authLoading) return
    if (!isAuth) {
      setLoading(false)
      return
    }

    const loadData = async () => {
      try {
        const [testsData, attemptsData, gradesData] = await Promise.all([
          getTests(),
          getMyTestAttempts(),
          getMyTestGrades(),
        ])
        setTests(testsData)
        setAttempts(attemptsData)
        setGrades(gradesData)
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

  const getTestAttempt = (testId: number) => {
    return attempts.find((a) => a.test_id === testId)
  }

  const getTestGrade = (testId: number) => {
    return grades.find((g) => g.test_id === testId)
  }

  const filteredTests = tests.filter(test => 
    !searchQuery || 
    test.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    test.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    test.lesson?.topic.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-10">
          <h1 className="text-4xl font-bold mb-2 text-gradient flex items-center gap-3">
            <svg className="w-10 h-10 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
            </svg>
            Тесты
          </h1>
          <p className="text-muted-foreground text-lg">Проверьте свои знания</p>
        </div>

        <div className="mb-6">
          <SearchBar 
            placeholder="Поиск по названию теста, описанию, уроку..." 
            onSearch={setSearchQuery}
            className="max-w-2xl"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredTests.map((test, index) => {
            const attempt = getTestAttempt(test.id)
            const grade = getTestGrade(test.id)

            return (
              <Card 
                key={test.id} 
                className="card-hover border-2 border-primary/10 hover:border-primary/40"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center text-white font-bold shadow-glow">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                      </svg>
                    </div>
                    {attempt && (
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-500/10 text-green-600">
                        {attempt.score.toFixed(0)}%
                      </span>
                    )}
                  </div>
                  <CardTitle className="text-xl">{test.title}</CardTitle>
                  <CardDescription className="mt-2">
                    {test.lesson ? (
                      <span className="flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                        Урок {test.lesson.number}: {test.lesson.topic}
                      </span>
                    ) : (
                      <span>Без урока</span>
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {grade && (
                    <div className="p-3 bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg border border-primary/20">
                      <p className="text-sm font-semibold text-primary">
                        Оценка преподавателя: {grade.grade}
                      </p>
                      {grade.comment && (
                        <p className="text-xs text-muted-foreground mt-1">{grade.comment}</p>
                      )}
                    </div>
                  )}
                  <Button
                    className="w-full gradient-primary shadow-glow"
                    onClick={() => router.push(`/tests/${test.id}/take`)}
                  >
                    {attempt ? 'Посмотреть результат' : 'Пройти тест'}
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {filteredTests.length === 0 && tests.length > 0 && (
          <Card className="border-2 border-primary/20">
            <CardContent className="p-12 text-center">
              <svg className="w-16 h-16 text-muted-foreground mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-muted-foreground text-lg">Тесты не найдены</p>
              <p className="text-sm text-muted-foreground mt-2">Попробуйте изменить параметры поиска</p>
            </CardContent>
          </Card>
        )}

        {tests.length === 0 && (
          <Card className="border-2 border-primary/20">
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground">Тесты пока не добавлены</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

