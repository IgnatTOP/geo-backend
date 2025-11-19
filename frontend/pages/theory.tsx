import { useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { getLessons } from '@/services/lessons'
import { getReports } from '@/services/reports'
import { getVideos } from '@/services/videos'
import { getFacts } from '@/services/facts'
import type { Lesson } from '@/services/lessons'
import type { Report } from '@/services/reports'
import type { Video } from '@/services/videos'
import type { Fact } from '@/services/facts'
import { normalizeFileUrl } from '@/services/upload'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import SearchBar from '@/components/SearchBar'
import Link from 'next/link'

/**
 * Страница теории: уроки, доклады, видео, факты
 */
export default function TheoryPage() {
  const { isAuth, loading: authLoading } = useAuth()
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [reports, setReports] = useState<Report[]>([])
  const [videos, setVideos] = useState<Video[]>([])
  const [facts, setFacts] = useState<Fact[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterTopic, setFilterTopic] = useState<string>('')

  useEffect(() => {
    if (authLoading) return
    if (!isAuth) {
      setLoading(false)
      return
    }

    const loadData = async () => {
      try {
        const [lessonsData, reportsData, videosData, factsResponse] = await Promise.all([
          getLessons(),
          getReports(),
          getVideos(),
          getFacts(1, 12), // Получаем первые 12 фактов для страницы теории
        ])
        setLessons(lessonsData)
        setReports(reportsData)
        setVideos(videosData)
        setFacts(factsResponse.facts) // Извлекаем массив фактов из ответа
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

  // Фильтрация и поиск
  const filteredLessons = lessons.filter(lesson => {
    const matchesSearch = !searchQuery || 
      lesson.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lesson.content?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesFilter = !filterTopic || lesson.topic.toLowerCase().includes(filterTopic.toLowerCase())
    return matchesSearch && matchesFilter
  })

  // Получаем уникальные темы для фильтра
  const topics = Array.from(new Set(lessons.map(l => l.topic.split(':')[0].trim() || l.topic.split(' ')[0])))

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-10">
          <h1 className="text-4xl font-bold mb-2 text-gradient flex items-center gap-3">
            <svg className="w-10 h-10 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            Теория
          </h1>
          <p className="text-muted-foreground text-lg">Изучайте материалы по урокам</p>
        </div>

        {/* Поиск и фильтры */}
        <div className="mb-8 space-y-4">
          <SearchBar 
            placeholder="Поиск по урокам, темам, содержанию..." 
            onSearch={setSearchQuery}
            className="max-w-2xl"
          />
          {topics.length > 0 && (
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-sm font-semibold text-muted-foreground">Фильтр по теме:</span>
              <Button
                variant={filterTopic === '' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterTopic('')}
                className="text-xs"
              >
                Все
              </Button>
              {topics.slice(0, 10).map(topic => (
                <Button
                  key={topic}
                  variant={filterTopic === topic ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterTopic(topic)}
                  className="text-xs"
                >
                  {topic}
                </Button>
              ))}
            </div>
          )}
        </div>

        {/* Уроки */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-8 flex items-center gap-3">
            <span className="w-1 h-8 rounded-full gradient-primary"></span>
            <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            Уроки {filteredLessons.length !== lessons.length && `(${filteredLessons.length} из ${lessons.length})`}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filteredLessons.map((lesson, index) => {
              const materialsCount = 
                (lesson.tests?.length || 0) +
                (lesson.practices?.length || 0) +
                (lesson.videos?.length || 0) +
                (lesson.reports?.length || 0)
              
              return (
                <Card 
                  key={lesson.id} 
                  className="card-hover border-2 border-primary/10 hover:border-primary/40 group overflow-hidden"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  {/* Обложка урока */}
                  {(() => {
                    try {
                      const images = lesson.images ? JSON.parse(lesson.images) as string[] : []
                      if (images && images.length > 0) {
                        return (
                          <div className="relative h-48 overflow-hidden">
                            <img
                              src={normalizeFileUrl(images[0]) || images[0]}
                              alt={lesson.topic}
                              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
                            <div className="absolute top-2 right-2">
                              <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center text-white font-bold shadow-glow">
                                {lesson.number}
                              </div>
                            </div>
                          </div>
                        )
                      }
                    } catch (e) {
                      // Игнорируем ошибки парсинга
                    }
                    return (
                      <div className="relative h-48 bg-gradient-to-br from-primary/20 via-primary/10 to-primary/5 flex items-center justify-center">
                        <div className="w-16 h-16 rounded-lg gradient-primary flex items-center justify-center text-white font-bold text-2xl shadow-glow">
                          {lesson.number}
                        </div>
                      </div>
                    )
                  })()}
                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      {(!lesson.images || (() => {
                        try {
                          const images = JSON.parse(lesson.images || '[]')
                          return !images || images.length === 0
                        } catch {
                          return true
                        }
                      })()) && (
                        <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center text-white font-bold shadow-glow">
                          {lesson.number}
                        </div>
                      )}
                      {materialsCount > 0 && (
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-primary/10 text-primary">
                          {materialsCount} материалов
                        </span>
                      )}
                    </div>
                    <CardTitle className="text-xl group-hover:text-primary transition-colors">
                      {lesson.topic}
                    </CardTitle>
                    <CardDescription className="mt-2 line-clamp-2">
                      {lesson.content?.substring(0, 120) || 'Описание урока...'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Link href={`/lessons/${lesson.id}`}>
                      <Button className="w-full gradient-primary shadow-glow hover:shadow-glow-hover">
                        Открыть урок
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              )
            })}
          </div>
          {filteredLessons.length === 0 && (
            <Card className="border-2 border-primary/20">
              <CardContent className="p-12 text-center">
                <svg className="w-16 h-16 text-muted-foreground mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-muted-foreground text-lg">Уроки не найдены</p>
                <p className="text-sm text-muted-foreground mt-2">Попробуйте изменить параметры поиска или фильтра</p>
              </CardContent>
            </Card>
          )}
        </section>

        {/* Доклады - группируем по урокам */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-8 flex items-center gap-3">
            <span className="w-1 h-8 rounded-full gradient-primary"></span>
            <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Доклады
          </h2>
          {lessons.map((lesson) => {
            const lessonReports = reports.filter((r) => r.lesson_id === lesson.id)
            if (lessonReports.length === 0) return null
            
            return (
              <div key={lesson.id} className="mb-6">
                <h3 className="text-lg font-semibold mb-3">
                  Урок {lesson.number}: {lesson.topic}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {lessonReports.map((report) => (
                    <Card key={report.id} className="card-hover border-2 border-primary/10 hover:border-primary/40">
                      <CardHeader>
                        <CardTitle className="text-lg">{report.title}</CardTitle>
                        <CardDescription className="flex items-center gap-2 mt-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          {report.user?.name || 'Неизвестный автор'}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        {(() => {
                          const normalizedUrl = normalizeFileUrl(report.file_url) || report.file_url
                          return (
                        <a href={normalizedUrl} target="_blank" rel="noopener noreferrer" download>
                          <Button variant="outline" className="w-full hover:bg-primary/10">
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                            Открыть файл
                          </Button>
                        </a>
                          )
                        })()}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )
          })}
          {reports.filter((r) => !r.lesson_id).length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3">Без урока</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {reports.filter((r) => !r.lesson_id).map((report) => (
                  <Card key={report.id}>
                    <CardHeader>
                      <CardTitle>{report.title}</CardTitle>
                      <CardDescription>
                        {report.user?.name || 'Неизвестный автор'}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {(() => {
                        const normalizedUrl = normalizeFileUrl(report.file_url) || report.file_url
                        return (
                      <a href={normalizedUrl} target="_blank" rel="noopener noreferrer" download>
                        <Button variant="outline" className="w-full">
                          Открыть файл
                        </Button>
                      </a>
                        )
                      })()}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* Видео - группируем по урокам */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-8 flex items-center gap-3">
            <span className="w-1 h-8 rounded-full gradient-primary"></span>
            <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            Видеоматериалы
          </h2>
          {lessons.map((lesson) => {
            const lessonVideos = videos.filter((v) => v.lesson_id === lesson.id)
            if (lessonVideos.length === 0) return null
            
            return (
              <div key={lesson.id} className="mb-6">
                <h3 className="text-lg font-semibold mb-3">
                  Урок {lesson.number}: {lesson.topic}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {lessonVideos.map((video) => (
                    <Card key={video.id} className="card-hover border-2 border-primary/10 hover:border-primary/40 overflow-hidden">
                      <CardHeader>
                        <CardTitle className="text-lg">{video.title}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {video.type === 'youtube' && (
                          <div className="aspect-video rounded-lg overflow-hidden shadow-lg">
                            <iframe
                              src={video.url.replace('watch?v=', 'embed/')}
                              className="w-full h-full"
                              allowFullScreen
                            />
                          </div>
                        )}
                        {video.type !== 'youtube' && (
                          <a href={video.url} target="_blank" rel="noopener noreferrer">
                            <Button variant="outline" className="w-full hover:bg-primary/10">
                              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                              </svg>
                              Открыть видео
                            </Button>
                          </a>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )
          })}
          {videos.filter((v) => !v.lesson_id).length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3">Без урока</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {videos.filter((v) => !v.lesson_id).map((video) => (
                  <Card key={video.id}>
                    <CardHeader>
                      <CardTitle>{video.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {video.type === 'youtube' && (
                        <div className="aspect-video">
                          <iframe
                            src={video.url.replace('watch?v=', 'embed/')}
                            className="w-full h-full rounded-md"
                            allowFullScreen
                          />
                        </div>
                      )}
                      {video.type !== 'youtube' && (
                        <a href={video.url} target="_blank" rel="noopener noreferrer">
                          <Button variant="outline" className="w-full">
                            Открыть видео
                          </Button>
                        </a>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* Факты */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold flex items-center gap-3">
              <span className="w-1 h-8 rounded-full gradient-primary"></span>
              <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              Интересные факты
            </h2>
            <Link href="/facts">
              <Button variant="outline" className="hover:bg-primary/10">
                Все факты →
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {facts.map((fact) => (
              <Card key={fact.id}>
                {fact.image_url && (
                  <img
                    src={normalizeFileUrl(fact.image_url) || fact.image_url}
                    alt={fact.title}
                    className="w-full h-48 object-cover rounded-t-lg"
                  />
                )}
                <CardHeader>
                  <CardTitle>{fact.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground text-wrap">{fact.content}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}

