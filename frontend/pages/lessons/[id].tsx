import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { useAuth } from '@/context/AuthContext'
import { getLesson } from '@/services/lessons'
import type { Lesson } from '@/services/lessons'
import { normalizeFileUrl } from '@/services/upload'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import DocumentViewer from '@/components/DocumentViewer'
import Link from 'next/link'

/**
 * Страница детального просмотра урока со всеми материалами
 */
export default function LessonDetailPage() {
  const router = useRouter()
  const { id } = router.query
  const { isAuth, loading: authLoading } = useAuth()
  const [lesson, setLesson] = useState<Lesson | null>(null)
  const [loading, setLoading] = useState(true)
  const [viewingDocument, setViewingDocument] = useState<{ url: string; title: string } | null>(null)

  useEffect(() => {
    // Ждем завершения загрузки авторизации и получения id из роутера
    if (authLoading || !id) return

    if (!isAuth) {
      setLoading(false)
      return
    }

    const loadLesson = async () => {
      try {
        const data = await getLesson(Number(id))
        setLesson(data)
      } catch (error) {
        console.error('Ошибка загрузки урока:', error)
      } finally {
        setLoading(false)
      }
    }

    loadLesson()
  }, [isAuth, id, authLoading])

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


  if (!lesson) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <CardContent className="p-6">
            <p className="text-center mb-4">Урок не найден</p>
            <Link href="/theory">
              <Button className="w-full">Вернуться к урокам</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Заголовок урока */}
        <div className="mb-12 animate-fade-in">
          <div className="flex items-center gap-4 mb-6">
            <Link href="/theory">
              <Button variant="outline" className="hover:bg-primary/10">
                ← Назад к урокам
              </Button>
            </Link>
          </div>
          <div className="bg-card rounded-2xl p-8 shadow-lg border-2 border-primary/10">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 rounded-xl gradient-primary flex items-center justify-center text-white font-bold text-2xl shadow-glow">
                {lesson.number}
              </div>
              <div>
                <h1 className="text-4xl font-bold mb-2 text-gradient">
                  {lesson.topic}
                </h1>
                <p className="text-muted-foreground">Урок {lesson.number}</p>
              </div>
            </div>
            {lesson.content && (
              <div className="prose max-w-none mt-6">
                <div className="text-lg text-foreground/90 leading-relaxed whitespace-pre-line text-wrap text-scrollable">
                  {lesson.content}
                </div>
              </div>
            )}

            {/* Фотографии */}
            {lesson.images && (() => {
              try {
                const images = JSON.parse(lesson.images) as string[]
                if (images && images.length > 0) {
                  return (
                    <div className="mt-6">
                      <h3 className="text-xl font-semibold mb-4">Фотографии</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {images.map((imageUrl, index) => {
                          const normalizedUrl = normalizeFileUrl(imageUrl) || imageUrl
                          return (
                          <div key={index} className="rounded-lg overflow-hidden border-2 border-primary/10 hover:border-primary/30 transition-all">
                            <img
                              src={normalizedUrl}
                              alt={`Фото ${index + 1}`}
                              className="w-full h-64 object-cover cursor-pointer hover:scale-105 transition-transform"
                              onClick={() => window.open(normalizedUrl, '_blank')}
                            />
                          </div>
                          )
                        })}
                      </div>
                    </div>
                  )
                }
              } catch (e) {
                return null
              }
              return null
            })()}

            {/* Документы */}
            {lesson.documents && (() => {
              try {
                const documents = JSON.parse(lesson.documents) as string[]
                if (documents && documents.length > 0) {
                  return (
                    <div className="mt-6">
                      <h3 className="text-xl font-semibold mb-4">Документы</h3>
                      <div className="space-y-2">
                        {documents.map((docUrl, index) => {
                          const normalizedUrl = normalizeFileUrl(docUrl) || docUrl
                          const fileName = docUrl.split('/').pop() || `Документ ${index + 1}`
                          return (
                          <div
                            key={index}
                            onClick={() => setViewingDocument({ url: normalizedUrl, title: fileName })}
                            className="flex items-center gap-3 p-4 rounded-lg border-2 border-primary/10 hover:border-primary/30 hover:bg-primary/5 transition-all cursor-pointer"
                          >
                            <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                            </svg>
                            <span className="flex-1 text-wrap">{fileName}</span>
                            <svg className="w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </div>
                          )
                        })}
                      </div>
                    </div>
                  )
                }
              } catch (e) {
                return null
              }
              return null
            })()}

            {/* Видеофайлы */}
            {lesson.video_files && (() => {
              try {
                const videoFiles = JSON.parse(lesson.video_files) as string[]
                if (videoFiles && videoFiles.length > 0) {
                  return (
                    <div className="mt-6">
                      <h3 className="text-xl font-semibold mb-4">Видеофайлы</h3>
                      <div className="space-y-4">
                        {videoFiles.map((videoUrl, index) => {
                          const normalizedUrl = normalizeFileUrl(videoUrl) || videoUrl
                          return (
                          <div key={index} className="rounded-lg overflow-hidden border-2 border-primary/10">
                            <video
                              src={normalizedUrl}
                              controls
                              className="w-full"
                              preload="metadata"
                            >
                              Ваш браузер не поддерживает видео.
                            </video>
                          </div>
                          )
                        })}
                      </div>
                    </div>
                  )
                }
              } catch (e) {
                return null
              }
              return null
            })()}
          </div>
        </div>

        {/* Тесты */}
        {lesson.tests && lesson.tests.length > 0 && (
          <section className="mb-10">
            <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
              <span className="w-1 h-8 rounded-full gradient-primary"></span>
              Тесты
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {lesson.tests.map((test: any) => (
                <Card key={test.id} className="card-hover border-2 border-primary/10 hover:border-primary/40">
                  <CardHeader>
                    <CardTitle className="text-xl">{test.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Link href={`/tests/${test.id}/take`}>
                      <Button className="w-full gradient-primary shadow-glow">
                        Пройти тест
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Практические задания */}
        {lesson.practices && lesson.practices.length > 0 && (
          <section className="mb-10">
            <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
              <span className="w-1 h-8 rounded-full gradient-primary"></span>
              Практические задания
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {lesson.practices.map((practice: any) => (
                <Card key={practice.id} className="card-hover border-2 border-primary/10 hover:border-primary/40">
                  <CardHeader>
                    <CardTitle className="text-xl">{practice.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="flex gap-2">
                    {practice.file_url && (() => {
                      const normalizedUrl = normalizeFileUrl(practice.file_url) || practice.file_url
                      return (
                      <a href={normalizedUrl} target="_blank" rel="noopener noreferrer" download>
                        <Button variant="outline" className="flex-1 hover:bg-primary/10">
                          Скачать
                        </Button>
                      </a>
                      )
                    })()}
                    <Button
                      className="flex-1 gradient-primary shadow-glow"
                      onClick={() => router.push(`/practices/${practice.id}`)}
                    >
                      Открыть
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Видеоматериалы */}
        {lesson.videos && lesson.videos.length > 0 && (
          <section className="mb-10">
            <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
              <span className="w-1 h-8 rounded-full gradient-primary"></span>
              Видеоматериалы
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {lesson.videos.map((video: any) => (
                <Card key={video.id} className="card-hover border-2 border-primary/10 hover:border-primary/40 overflow-hidden">
                  <CardHeader>
                    <CardTitle className="text-xl">{video.title}</CardTitle>
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
                          Открыть видео
                        </Button>
                      </a>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Доклады */}
        {lesson.reports && lesson.reports.length > 0 && (
          <section className="mb-10">
            <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
              <span className="w-1 h-8 rounded-full gradient-primary"></span>
              Доклады
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {lesson.reports.map((report: any) => (
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
                        Открыть файл
                      </Button>
                    </a>
                      )
                    })()}
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Если нет материалов */}
        {(!lesson.tests || lesson.tests.length === 0) &&
          (!lesson.practices || lesson.practices.length === 0) &&
          (!lesson.videos || lesson.videos.length === 0) &&
          (!lesson.reports || lesson.reports.length === 0) && (
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-muted-foreground">
                  К этому уроку пока не добавлены материалы
                </p>
              </CardContent>
            </Card>
          )}
      </div>
      
      {/* Просмотрщик документов */}
      {viewingDocument && (
        <DocumentViewer
          url={viewingDocument.url}
          title={viewingDocument.title}
          onClose={() => setViewingDocument(null)}
        />
      )}
    </div>
  )
}

