import { useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { getLessons, createLesson, updateLesson, deleteLesson } from '@/services/lessons'
import type { Lesson } from '@/services/lessons'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import FileUpload, { FileList } from '@/components/FileUpload'
import Link from 'next/link'

/**
 * Страница управления уроками (админка)
 */
export default function AdminLessonsPage() {
  const { user, isAuth } = useAuth()
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null)
  const [formData, setFormData] = useState({ 
    number: '', 
    topic: '', 
    content: '',
    images: [] as string[],
    documents: [] as string[],
    video_files: [] as string[]
  })
  const [newImageUrl, setNewImageUrl] = useState('')
  const [newDocumentUrl, setNewDocumentUrl] = useState('')
  const [newVideoUrl, setNewVideoUrl] = useState('')

  useEffect(() => {
    if (!isAuth || user?.role !== 'admin') return
    loadLessons()
  }, [isAuth, user])

  const loadLessons = async () => {
    try {
      const data = await getLessons()
      setLessons(data)
    } catch (error) {
      console.error('Ошибка загрузки уроков:', error)
    } finally {
      setLoading(false)
    }
  }

  const addImage = () => {
    if (newImageUrl.trim()) {
      setFormData({ ...formData, images: [...formData.images, newImageUrl.trim()] })
      setNewImageUrl('')
    }
  }

  const removeImage = (index: number) => {
    setFormData({ ...formData, images: formData.images.filter((_, i) => i !== index) })
  }

  const addDocument = () => {
    if (newDocumentUrl.trim()) {
      setFormData({ ...formData, documents: [...formData.documents, newDocumentUrl.trim()] })
      setNewDocumentUrl('')
    }
  }

  const removeDocument = (index: number) => {
    setFormData({ ...formData, documents: formData.documents.filter((_, i) => i !== index) })
  }

  const addVideo = () => {
    if (newVideoUrl.trim()) {
      setFormData({ ...formData, video_files: [...formData.video_files, newVideoUrl.trim()] })
      setNewVideoUrl('')
    }
  }

  const removeVideo = (index: number) => {
    setFormData({ ...formData, video_files: formData.video_files.filter((_, i) => i !== index) })
  }

  const handleCreate = async () => {
    if (!formData.number.trim()) {
      alert('Введите номер урока')
      return
    }
    const number = parseInt(formData.number)
    if (isNaN(number) || number < 1) {
      alert('Номер урока должен быть положительным числом')
      return
    }
    if (!formData.topic.trim()) {
      alert('Введите тему урока')
      return
    }
    try {
      await createLesson({
        number: number,
        topic: formData.topic,
        content: formData.content,
        images: formData.images.length > 0 ? JSON.stringify(formData.images) : undefined,
        documents: formData.documents.length > 0 ? JSON.stringify(formData.documents) : undefined,
        video_files: formData.video_files.length > 0 ? JSON.stringify(formData.video_files) : undefined,
      })
      setIsDialogOpen(false)
      setFormData({ number: '', topic: '', content: '', images: [], documents: [], video_files: [] })
      loadLessons()
    } catch (error) {
      console.error('Ошибка создания урока:', error)
      alert('Ошибка создания урока')
    }
  }

  const handleUpdate = async () => {
    if (!editingLesson) return
    try {
      await updateLesson(editingLesson.id, {
        number: parseInt(formData.number) || editingLesson.number,
        topic: formData.topic || editingLesson.topic,
        content: formData.content || editingLesson.content,
        images: formData.images.length > 0 ? JSON.stringify(formData.images) : (editingLesson.images || undefined),
        documents: formData.documents.length > 0 ? JSON.stringify(formData.documents) : (editingLesson.documents || undefined),
        video_files: formData.video_files.length > 0 ? JSON.stringify(formData.video_files) : (editingLesson.video_files || undefined),
      })
      setIsDialogOpen(false)
      setEditingLesson(null)
      setFormData({ number: '', topic: '', content: '', images: [], documents: [], video_files: [] })
      loadLessons()
    } catch (error) {
      console.error('Ошибка обновления урока:', error)
      alert('Ошибка обновления урока')
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Удалить урок?')) return
    // Оптимистичное обновление: удаляем из списка сразу
    const previousLessons = lessons
    setLessons(lessons.filter(lesson => lesson.id !== id))
    try {
      await deleteLesson(id)
      // Перезагружаем список для синхронизации с сервером
      loadLessons()
    } catch (error) {
      console.error('Ошибка удаления урока:', error)
      // Восстанавливаем список при ошибке
      setLessons(previousLessons)
      alert('Ошибка удаления урока')
    }
  }

  const openEditDialog = (lesson: Lesson) => {
    setEditingLesson(lesson)
    try {
      const images = lesson.images ? JSON.parse(lesson.images) as string[] : []
      const documents = lesson.documents ? JSON.parse(lesson.documents) as string[] : []
      const videoFiles = lesson.video_files ? JSON.parse(lesson.video_files) as string[] : []
      setFormData({
        number: lesson.number.toString(),
        topic: lesson.topic,
        content: lesson.content || '',
        images,
        documents,
        video_files: videoFiles,
      })
    } catch (e) {
      setFormData({
        number: lesson.number.toString(),
        topic: lesson.topic,
        content: lesson.content || '',
        images: [],
        documents: [],
        video_files: [],
      })
    }
    setIsDialogOpen(true)
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
          <h1 className="text-3xl font-bold">Управление уроками</h1>
          <div className="flex gap-4">
            <Link href="/admin">
              <Button variant="outline">Назад</Button>
            </Link>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => {
                  setEditingLesson(null)
                  setFormData({ number: '', topic: '', content: '', images: [], documents: [], video_files: [] })
                  setNewImageUrl('')
                  setNewDocumentUrl('')
                  setNewVideoUrl('')
                }}>
                  Создать урок
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-[95vw] sm:max-w-3xl max-h-[90vh] overflow-y-auto w-full">
                <DialogHeader>
                  <DialogTitle>
                    {editingLesson ? 'Редактировать урок' : 'Создать урок'}
                  </DialogTitle>
                  <DialogDescription>
                    Заполните данные урока и добавьте медиа-файлы
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="number">Номер урока *</Label>
                    <Input
                      id="number"
                      type="number"
                      value={formData.number}
                      onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                      required
                      className="w-full max-w-full"
                    />
                  </div>
                  <div>
                    <Label htmlFor="topic">Тема *</Label>
                    <Input
                      id="topic"
                      value={formData.topic}
                      onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                      required
                      className="w-full max-w-full"
                    />
                  </div>
                  <div>
                    <Label htmlFor="content">Содержание</Label>
                    <textarea
                      id="content"
                      className="flex min-h-[100px] w-full max-w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-wrap resize-y"
                      value={formData.content}
                      onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                      placeholder="Описание урока..."
                    />
                  </div>

                  {/* Фотографии */}
                  <div className="border-t pt-4">
                    <Label className="text-base font-semibold mb-2 block">Фотографии</Label>
                    <div className="space-y-2">
                      <FileList files={formData.images} onRemove={removeImage} />
                      <div className="flex gap-2 flex-wrap">
                        <Input
                          type="url"
                          placeholder="Или введите URL изображения"
                          value={newImageUrl}
                          onChange={(e) => setNewImageUrl(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addImage())}
                          className="flex-1 min-w-0"
                        />
                        <Button type="button" onClick={addImage} variant="outline" size="sm">
                          Добавить URL
                        </Button>
                      </div>
                      <FileUpload
                        onUpload={(url) => setFormData({ ...formData, images: [...formData.images, url] })}
                        accept="image/*"
                        type="image"
                        label="Загрузить изображение"
                      />
                      <p className="text-xs text-muted-foreground">
                        Загрузите файл или введите URL изображения
                      </p>
                    </div>
                  </div>

                  {/* Документы */}
                  <div className="border-t pt-4">
                    <Label className="text-base font-semibold mb-2 block">Документы</Label>
                    <div className="space-y-2">
                      <FileList files={formData.documents} onRemove={removeDocument} />
                      <div className="flex gap-2 flex-wrap">
                        <Input
                          type="url"
                          placeholder="Или введите URL документа"
                          value={newDocumentUrl}
                          onChange={(e) => setNewDocumentUrl(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addDocument())}
                          className="flex-1 min-w-0"
                        />
                        <Button type="button" onClick={addDocument} variant="outline" size="sm">
                          Добавить URL
                        </Button>
                      </div>
                      <FileUpload
                        onUpload={(url) => setFormData({ ...formData, documents: [...formData.documents, url] })}
                        accept=".pdf,.doc,.docx,.txt,.rtf"
                        type="document"
                        label="Загрузить документ"
                      />
                    </div>
                  </div>

                  {/* Видеофайлы */}
                  <div className="border-t pt-4">
                    <Label className="text-base font-semibold mb-2 block">Видеофайлы</Label>
                    <div className="space-y-2">
                      <FileList files={formData.video_files} onRemove={removeVideo} />
                      <div className="flex gap-2 flex-wrap">
                        <Input
                          type="url"
                          placeholder="Или введите URL видеофайла"
                          value={newVideoUrl}
                          onChange={(e) => setNewVideoUrl(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addVideo())}
                          className="flex-1 min-w-0"
                        />
                        <Button type="button" onClick={addVideo} variant="outline" size="sm">
                          Добавить URL
                        </Button>
                      </div>
                      <FileUpload
                        onUpload={(url) => setFormData({ ...formData, video_files: [...formData.video_files, url] })}
                        accept="video/*"
                        type="video"
                        label="Загрузить видео"
                      />
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Отмена
                  </Button>
                  <Button onClick={editingLesson ? handleUpdate : handleCreate}>
                    {editingLesson ? 'Сохранить' : 'Создать'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {lessons.map((lesson) => (
            <Card key={lesson.id}>
              <CardHeader>
                <CardTitle>Урок {lesson.number}: {lesson.topic}</CardTitle>
                <CardDescription className="text-wrap">
                  {lesson.content ? (lesson.content.length > 100 ? lesson.content.substring(0, 100) + '...' : lesson.content) : 'Нет описания'}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => openEditDialog(lesson)}
                  className="flex-1"
                >
                  Редактировать
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleDelete(lesson.id)}
                  className="flex-1"
                >
                  Удалить
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {lessons.length === 0 && (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground">Уроки пока не добавлены</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

