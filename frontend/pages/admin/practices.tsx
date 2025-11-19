import { useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { getPractices, createPractice, updatePractice, deletePractice, getAllPracticeSubmits, createPracticeGrade } from '@/services/practices'
import { getLessons } from '@/services/lessons'
import type { Practice, PracticeSubmit } from '@/services/practices'
import type { Lesson } from '@/services/lessons'
import { normalizeFileUrl } from '@/services/upload'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import FileUpload from '@/components/FileUpload'
import Link from 'next/link'

/**
 * Страница управления практическими заданиями (админка)
 */
export default function AdminPracticesPage() {
  const { user, isAuth } = useAuth()
  const [practices, setPractices] = useState<Practice[]>([])
  const [submits, setSubmits] = useState<PracticeSubmit[]>([])
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'practices' | 'submits'>('practices')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isGradeDialogOpen, setIsGradeDialogOpen] = useState(false)
  const [selectedSubmit, setSelectedSubmit] = useState<PracticeSubmit | null>(null)
  const [formData, setFormData] = useState({ lesson_id: '', title: '', file_url: '' })
  const [gradeData, setGradeData] = useState({ user_id: '', practice_id: '', submit_id: '', grade: '', comment: '' })

  useEffect(() => {
    if (!isAuth || user?.role !== 'admin') return
    loadLessons()
    loadData()
  }, [isAuth, user, activeTab])

  const loadLessons = async () => {
    try {
      const data = await getLessons()
      setLessons(data)
    } catch (error) {
      console.error('Ошибка загрузки уроков:', error)
    }
  }

  const loadData = async () => {
    try {
      if (activeTab === 'practices') {
        const data = await getPractices()
        setPractices(data)
      } else {
        const data = await getAllPracticeSubmits()
        setSubmits(data)
      }
    } catch (error) {
      console.error('Ошибка загрузки данных:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async () => {
    if (!formData.lesson_id) {
      alert('Выберите урок')
      return
    }
    try {
      await createPractice({
        lesson_id: parseInt(formData.lesson_id),
        title: formData.title,
        file_url: formData.file_url,
      })
      setIsDialogOpen(false)
      setFormData({ lesson_id: '', title: '', file_url: '' })
      loadData()
    } catch (error) {
      console.error('Ошибка создания практики:', error)
      alert('Ошибка создания практики')
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Удалить практическое задание?')) return
    try {
      await deletePractice(id)
      loadData()
    } catch (error) {
      console.error('Ошибка удаления практики:', error)
      alert('Ошибка удаления практики')
    }
  }

  const handleCreateGrade = async () => {
    try {
      await createPracticeGrade({
        user_id: parseInt(gradeData.user_id),
        practice_id: parseInt(gradeData.practice_id),
        submit_id: gradeData.submit_id ? parseInt(gradeData.submit_id) : undefined,
        grade: parseFloat(gradeData.grade),
        comment: gradeData.comment || undefined,
      })
      setIsGradeDialogOpen(false)
      setGradeData({ user_id: '', practice_id: '', submit_id: '', grade: '', comment: '' })
      setSelectedSubmit(null)
      loadData()
    } catch (error) {
      console.error('Ошибка создания оценки:', error)
      alert('Ошибка создания оценки')
    }
  }

  const openGradeDialog = (submit: PracticeSubmit) => {
    setSelectedSubmit(submit)
    setGradeData({
      user_id: submit.user_id.toString(),
      practice_id: submit.practice_id.toString(),
      submit_id: submit.id.toString(),
      grade: '',
      comment: '',
    })
    setIsGradeDialogOpen(true)
  }

  if (!isAuth || user?.role !== 'admin') {
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

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Загрузка...</div>
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Управление практиками</h1>
          <Link href="/admin">
            <Button variant="outline">Назад</Button>
          </Link>
        </div>

        {/* Вкладки */}
        <div className="flex gap-4 mb-6 border-b">
          <button
            className={`pb-2 px-4 ${activeTab === 'practices' ? 'border-b-2 border-primary' : ''}`}
            onClick={() => setActiveTab('practices')}
          >
            Практики
          </button>
          <button
            className={`pb-2 px-4 ${activeTab === 'submits' ? 'border-b-2 border-primary' : ''}`}
            onClick={() => setActiveTab('submits')}
          >
            Отправки
          </button>
        </div>

        {/* Список практик */}
        {activeTab === 'practices' && (
          <>
            <div className="mb-6">
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => setFormData({ lesson_id: '', title: '', file_url: '' })}>
                    Создать практику
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Создать практическое задание</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="lesson_id">Урок *</Label>
                      <select
                        id="lesson_id"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        value={formData.lesson_id}
                        onChange={(e) => setFormData({ ...formData, lesson_id: e.target.value })}
                        required
                      >
                        <option value="">Выберите урок</option>
                        {lessons.map((lesson) => (
                          <option key={lesson.id} value={lesson.id}>
                            Урок {lesson.number}: {lesson.topic}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <Label htmlFor="title">Название</Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="file_url">Файл задания</Label>
                      <div className="space-y-2">
                        <Input
                          id="file_url"
                          type="url"
                          placeholder="Или введите URL файла"
                          value={formData.file_url}
                          onChange={(e) => setFormData({ ...formData, file_url: e.target.value })}
                        />
                        <FileUpload
                          onUpload={(url) => setFormData({ ...formData, file_url: url })}
                          accept=".pdf,.doc,.docx,.txt"
                          type="practice"
                          label="Загрузить файл задания"
                        />
                        <p className="text-xs text-muted-foreground">
                          Загрузите файл или введите URL
                        </p>
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Отмена
                    </Button>
                    <Button onClick={handleCreate}>Создать</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {practices.length === 0 ? (
                <Card className="col-span-full">
                  <CardContent className="p-6 text-center">
                    <p className="text-muted-foreground">Практические задания пока не добавлены</p>
                  </CardContent>
                </Card>
              ) : (
                practices.map((practice) => {
                  const lesson = lessons.find(l => l.id === practice.lesson_id)
                  return (
                    <Card key={practice.id} className="border-2 border-primary/10 hover:border-primary/30 transition-all">
                      <CardHeader>
                        <CardTitle>{practice.title}</CardTitle>
                        <CardDescription className="space-y-1">
                          {lesson && (
                            <div className="flex items-center gap-2 text-primary">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                              </svg>
                              <span>Урок {lesson.number}: {lesson.topic}</span>
                            </div>
                          )}
                          {practice.file_url && (
                            <div className="flex items-center gap-2">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                              </svg>
                              <span className="text-sm">Файл задания прикреплен</span>
                            </div>
                          )}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="flex gap-2">
                        {practice.file_url && (() => {
                          const normalizedUrl = normalizeFileUrl(practice.file_url) || practice.file_url
                          return (
                            <a href={normalizedUrl} target="_blank" rel="noopener noreferrer" download className="flex-1">
                              <Button variant="outline" className="w-full hover:bg-primary/10" size="sm">
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                                Просмотр
                              </Button>
                            </a>
                          )
                        })()}
                        <Button
                          variant="destructive"
                          onClick={() => handleDelete(practice.id)}
                          className="flex-1"
                          size="sm"
                        >
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          Удалить
                        </Button>
                      </CardContent>
                    </Card>
                  )
                })
              )}
            </div>
          </>
        )}

        {/* Список отправок */}
        {activeTab === 'submits' && (
          <div className="space-y-4">
            {submits.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center">
                  <p className="text-muted-foreground">Отправок пока нет</p>
                </CardContent>
              </Card>
            ) : (
              submits.map((submit) => (
                <Card key={submit.id} className="border-2 border-primary/10 hover:border-primary/30 transition-all">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>{submit.practice?.title || 'Практика'}</span>
                      <span className="text-sm font-normal text-muted-foreground">
                        ID: {submit.id}
                      </span>
                    </CardTitle>
                    <CardDescription className="space-y-2">
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <span className="font-medium">{submit.user?.name || `Пользователь #${submit.user_id}`}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span>Отправлено: {new Date(submit.created_at).toLocaleDateString('ru-RU', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}</span>
                      </div>
                      {submit.practice?.lesson && (
                        <div className="flex items-center gap-2 text-primary">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                          </svg>
                          <span>Урок {submit.practice.lesson.number}: {submit.practice.lesson.topic}</span>
                        </div>
                      )}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex gap-2 flex-wrap">
                    {(() => {
                      const normalizedUrl = normalizeFileUrl(submit.file_url) || submit.file_url
                      return (
                        <a href={normalizedUrl} target="_blank" rel="noopener noreferrer" download className="flex-1">
                          <Button variant="outline" className="w-full hover:bg-primary/10">
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            Открыть файл
                          </Button>
                        </a>
                      )
                    })()}
                    <Button onClick={() => openGradeDialog(submit)} className="flex-1 gradient-primary shadow-glow">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                      </svg>
                      Выставить оценку
                    </Button>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}

        {/* Диалог выставления оценки */}
        <Dialog open={isGradeDialogOpen} onOpenChange={setIsGradeDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Выставить оценку</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="grade">Оценка</Label>
                <Input
                  id="grade"
                  type="number"
                  step="0.1"
                  value={gradeData.grade}
                  onChange={(e) => setGradeData({ ...gradeData, grade: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="comment">Комментарий</Label>
                <textarea
                  id="comment"
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={gradeData.comment}
                  onChange={(e) => setGradeData({ ...gradeData, comment: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsGradeDialogOpen(false)}>
                Отмена
              </Button>
              <Button onClick={handleCreateGrade}>Выставить</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}

