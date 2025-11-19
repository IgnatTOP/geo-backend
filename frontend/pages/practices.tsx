import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { useAuth } from '@/context/AuthContext'
import { getPractices, getMyPracticeSubmits, getMyPracticeGrades } from '@/services/practices'
import type { Practice, PracticeSubmit, PracticeGrade } from '@/services/practices'
import { normalizeFileUrl } from '@/services/upload'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import SearchBar from '@/components/SearchBar'
import Link from 'next/link'

/**
 * Страница со списком практических заданий
 */
export default function PracticesPage() {
  const { isAuth, loading: authLoading } = useAuth()
  const router = useRouter()
  const [practices, setPractices] = useState<Practice[]>([])
  const [submits, setSubmits] = useState<PracticeSubmit[]>([])
  const [grades, setGrades] = useState<PracticeGrade[]>([])
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
        const [practicesData, submitsData, gradesData] = await Promise.all([
          getPractices(),
          getMyPracticeSubmits(),
          getMyPracticeGrades(),
        ])
        setPractices(practicesData)
        setSubmits(submitsData)
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

  const getPracticeSubmit = (practiceId: number) => {
    return submits.find((s) => s.practice_id === practiceId)
  }

  const getPracticeGrade = (practiceId: number) => {
    return grades.find((g) => g.practice_id === practiceId)
  }

  const filteredPractices = practices.filter(practice => 
    !searchQuery || 
    practice.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    practice.lesson?.topic.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-10">
          <h1 className="text-4xl font-bold mb-2 text-gradient flex items-center gap-3">
            <svg className="w-10 h-10 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Практические задания
          </h1>
          <p className="text-muted-foreground text-lg">Выполняйте практические работы</p>
        </div>

        <div className="mb-6">
          <SearchBar 
            placeholder="Поиск по названию задания, уроку..." 
            onSearch={setSearchQuery}
            className="max-w-2xl"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredPractices.map((practice, index) => {
            const submit = getPracticeSubmit(practice.id)
            const grade = getPracticeGrade(practice.id)

            return (
              <Card 
                key={practice.id} 
                className="card-hover border-2 border-primary/10 hover:border-primary/40"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center text-white font-bold shadow-glow">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </div>
                    {submit && (
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-500/10 text-blue-600">
                        Отправлено
                      </span>
                    )}
                  </div>
                  <CardTitle className="text-xl">{practice.title}</CardTitle>
                  <CardDescription className="mt-2">
                    {practice.lesson ? (
                      <span className="flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                        Урок {practice.lesson.number}: {practice.lesson.topic}
                      </span>
                    ) : (
                      <span>Без урока</span>
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {submit && (
                    <div className="p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                      <p className="text-sm text-blue-600">Отправлено: {new Date(submit.created_at).toLocaleDateString()}</p>
                    </div>
                  )}
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
                  <div className="flex flex-col gap-2">
                    {practice.file_url && (() => {
                      const normalizedUrl = normalizeFileUrl(practice.file_url) || practice.file_url
                      return (
                        <a href={normalizedUrl} target="_blank" rel="noopener noreferrer" download className="w-full">
                          <Button variant="outline" className="w-full hover:bg-primary/10">
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            Скачать задание
                          </Button>
                        </a>
                      )
                    })()}
                    {!submit ? (
                      <Button
                        className="w-full gradient-primary shadow-glow"
                        onClick={() => router.push(`/practices/${practice.id}`)}
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        Отправить работу
                      </Button>
                    ) : (
                      <Button
                        className="w-full gradient-primary shadow-glow"
                        onClick={() => router.push(`/practices/${practice.id}`)}
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        Просмотреть
                      </Button>
                    )}
                    {practice.lesson_id && (
                      <Link href={`/lessons/${practice.lesson_id}`} className="w-full">
                        <Button variant="outline" className="w-full hover:bg-primary/10">
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                          </svg>
                          К уроку
                        </Button>
                      </Link>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {filteredPractices.length === 0 && practices.length > 0 && (
          <Card className="border-2 border-primary/20">
            <CardContent className="p-12 text-center">
              <svg className="w-16 h-16 text-muted-foreground mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-muted-foreground text-lg">Практические задания не найдены</p>
              <p className="text-sm text-muted-foreground mt-2">Попробуйте изменить параметры поиска</p>
            </CardContent>
          </Card>
        )}

        {practices.length === 0 && (
          <Card className="border-2 border-primary/20">
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground">Практические задания пока не добавлены</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

