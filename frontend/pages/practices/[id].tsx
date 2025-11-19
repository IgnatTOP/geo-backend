import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { useAuth } from '@/context/AuthContext'
import { getPractice, submitPractice, getMyPracticeSubmits } from '@/services/practices'
import type { Practice, PracticeSubmit } from '@/services/practices'
import { normalizeFileUrl } from '@/services/upload'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import FileUpload from '@/components/FileUpload'
import Link from 'next/link'

/**
 * Страница отправки практического задания
 */
export default function PracticeDetailPage() {
  const router = useRouter()
  const { id } = router.query
  const { isAuth, loading: authLoading } = useAuth()
  const [practice, setPractice] = useState<Practice | null>(null)
  const [submits, setSubmits] = useState<PracticeSubmit[]>([])
  const [fileUrl, setFileUrl] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    // Ждем завершения загрузки авторизации и получения id из роутера
    if (authLoading || !id) return

    if (!isAuth) {
      setLoading(false)
      return
    }

    const loadData = async () => {
      try {
        const [practiceData, submitsData] = await Promise.all([
          getPractice(Number(id)),
          getMyPracticeSubmits(),
        ])
        setPractice(practiceData)
        setSubmits(submitsData)
      } catch (error) {
        console.error('Ошибка загрузки данных:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [isAuth, id, authLoading])

  const handleSubmit = async () => {
    if (!practice || !fileUrl) {
      alert('Введите URL файла')
      return
    }

    setSubmitting(true)
    try {
      await submitPractice(practice.id, fileUrl)
      alert('Задание успешно отправлено!')
      if (practice.lesson_id) {
        router.push(`/lessons/${practice.lesson_id}`)
      } else {
        router.push('/practices')
      }
    } catch (error) {
      console.error('Ошибка отправки задания:', error)
      alert('Ошибка отправки задания')
    } finally {
      setSubmitting(false)
    }
  }

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

  if (!practice) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <CardContent className="p-6">
            <p className="text-center mb-4">Практическое задание не найдено</p>
            <Link href="/practices">
              <Button className="w-full">Вернуться к практикам</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  const mySubmit = submits.find((s) => s.practice_id === practice.id)

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="mb-6">
          <Link href={practice.lesson_id ? `/lessons/${practice.lesson_id}` : '/practices'}>
            <Button variant="outline" className="hover:bg-primary/10">← Назад</Button>
          </Link>
        </div>

        <Card className="mb-8 border-2 border-primary/20 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-t-xl">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-2xl mb-2">{practice.title}</CardTitle>
                {practice.lesson && (
                  <CardDescription className="text-base flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    Урок {practice.lesson.number}: {practice.lesson.topic}
                  </CardDescription>
                )}
              </div>
              <div className="w-12 h-12 rounded-lg gradient-primary flex items-center justify-center shadow-glow">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            {practice.file_url && (() => {
              const normalizedUrl = normalizeFileUrl(practice.file_url) || practice.file_url
              return (
              <div className="mb-4">
                <a href={normalizedUrl} target="_blank" rel="noopener noreferrer" download>
                  <Button variant="outline" className="w-full hover:bg-primary/10">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Скачать задание
                  </Button>
                </a>
              </div>
              )
            })()}
          </CardContent>
        </Card>

        {mySubmit ? (
          <Card className="border-2 border-green-500/20 bg-gradient-to-br from-green-500/5 to-transparent">
            <CardHeader className="bg-gradient-to-r from-green-500/10 to-green-500/5 rounded-t-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <CardTitle className="text-xl">Ваша отправка</CardTitle>
                  <CardDescription>
                    Отправлено: {new Date(mySubmit.created_at).toLocaleDateString('ru-RU', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              {(() => {
                const normalizedUrl = normalizeFileUrl(mySubmit.file_url) || mySubmit.file_url
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
        ) : (
          <Card className="border-2 border-primary/20 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-t-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center shadow-glow">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <div>
                  <CardTitle className="text-xl">Отправить задание</CardTitle>
                  <CardDescription>
                    Загрузите файл на внешний сервис и вставьте ссылку
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <div className="space-y-2">
                <Label htmlFor="file_url" className="text-base font-semibold">Файл задания</Label>
                <Input
                  id="file_url"
                  type="url"
                  placeholder="Или введите URL файла"
                  value={fileUrl}
                  onChange={(e) => setFileUrl(e.target.value)}
                  className="border-2 focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
                <FileUpload
                  onUpload={(url) => setFileUrl(url)}
                  accept=".pdf,.doc,.docx,.txt,.zip,.rar"
                  type="practice"
                  label="Загрузить файл задания"
                />
                <p className="text-xs text-muted-foreground">
                  Загрузите файл или введите URL
                </p>
              </div>
              <Button
                onClick={handleSubmit}
                disabled={submitting || !fileUrl}
                className="w-full gradient-primary shadow-glow"
                size="lg"
              >
                {submitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Отправка...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                    Отправить задание
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

