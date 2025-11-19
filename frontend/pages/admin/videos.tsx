import { useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { getVideos, createVideo, updateVideo, deleteVideo } from '@/services/videos'
import { getLessons } from '@/services/lessons'
import type { Video } from '@/services/videos'
import type { Lesson } from '@/services/lessons'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import FileUpload from '@/components/FileUpload'
import Link from 'next/link'

/**
 * Страница управления видеоматериалами (админка)
 */
export default function AdminVideosPage() {
  const { user, isAuth } = useAuth()
  const [videos, setVideos] = useState<Video[]>([])
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingVideo, setEditingVideo] = useState<Video | null>(null)
  const [formData, setFormData] = useState({ lesson_id: '', title: '', url: '', type: 'youtube' })

  useEffect(() => {
    if (!isAuth || user?.role !== 'admin') return
    loadLessons()
    loadVideos()
  }, [isAuth, user])

  const loadLessons = async () => {
    try {
      const data = await getLessons()
      setLessons(data)
    } catch (error) {
      console.error('Ошибка загрузки уроков:', error)
    }
  }

  const loadVideos = async () => {
    try {
      const data = await getVideos()
      setVideos(data)
    } catch (error) {
      console.error('Ошибка загрузки видео:', error)
    } finally {
      setLoading(false)
    }
  }

  const validateYouTubeUrl = (url: string): boolean => {
    const patterns = [
      /^https?:\/\/(www\.)?(youtube\.com|youtu\.be)\/.+/,
      /^https?:\/\/youtu\.be\/.+/
    ]
    return patterns.some(pattern => pattern.test(url))
  }

  const validateUrl = (url: string, type: string): boolean => {
    if (!url.trim()) return false
    if (type === 'youtube') {
      return validateYouTubeUrl(url)
    }
    if (type === 'vimeo') {
      return /^https?:\/\/(www\.)?vimeo\.com\/.+/.test(url)
    }
    // Для прямых ссылок проверяем базовый формат URL
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  const handleCreate = async () => {
    if (!formData.title.trim()) {
      alert('Введите название видео')
      return
    }
    if (!validateUrl(formData.url, formData.type)) {
      alert(`Некорректный URL для типа "${formData.type}". Для YouTube используйте формат: https://www.youtube.com/watch?v=... или https://youtu.be/...`)
      return
    }
    try {
      await createVideo({
        lesson_id: formData.lesson_id ? parseInt(formData.lesson_id) : undefined,
        title: formData.title,
        url: formData.url,
        type: formData.type,
      })
      setIsDialogOpen(false)
      setFormData({ lesson_id: '', title: '', url: '', type: 'youtube' })
      loadVideos()
    } catch (error) {
      console.error('Ошибка создания видео:', error)
      alert('Ошибка создания видео')
    }
  }

  const handleUpdate = async () => {
    if (!editingVideo) return
    const title = formData.title.trim() || editingVideo.title
    const url = formData.url.trim() || editingVideo.url
    const type = formData.type || editingVideo.type
    
    if (!title.trim()) {
      alert('Введите название видео')
      return
    }
    if (!validateUrl(url, type)) {
      alert(`Некорректный URL для типа "${type}"`)
      return
    }
    try {
      await updateVideo(editingVideo.id, {
        lesson_id: formData.lesson_id ? parseInt(formData.lesson_id) : editingVideo.lesson_id,
        title,
        url,
        type,
      })
      setIsDialogOpen(false)
      setEditingVideo(null)
      setFormData({ lesson_id: '', title: '', url: '', type: 'youtube' })
      loadVideos()
    } catch (error) {
      console.error('Ошибка обновления видео:', error)
      alert('Ошибка обновления видео')
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Удалить видео?')) return
    try {
      await deleteVideo(id)
      loadVideos()
    } catch (error) {
      console.error('Ошибка удаления видео:', error)
      alert('Ошибка удаления видео')
    }
  }

  const openEditDialog = (video: Video) => {
    setEditingVideo(video)
    setFormData({
      lesson_id: video.lesson_id?.toString() || '',
      title: video.title,
      url: video.url,
      type: video.type,
    })
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
          <h1 className="text-3xl font-bold">Управление видео</h1>
          <div className="flex gap-4">
            <Link href="/admin">
              <Button variant="outline">Назад</Button>
            </Link>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => {
                  setEditingVideo(null)
                  setFormData({ lesson_id: '', title: '', url: '', type: 'youtube' })
                }}>
                  Создать видео
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editingVideo ? 'Редактировать видео' : 'Создать видео'}
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="lesson_id">Урок</Label>
                    <select
                      id="lesson_id"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      value={formData.lesson_id}
                      onChange={(e) => setFormData({ ...formData, lesson_id: e.target.value })}
                    >
                      <option value="">Без урока</option>
                      {lessons.map((lesson) => (
                        <option key={lesson.id} value={lesson.id}>
                          Урок {lesson.number}: {lesson.topic}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="title">Название *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="Название видео"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="url">URL *</Label>
                    <div className="space-y-2">
                      <Input
                        id="url"
                        type="url"
                        value={formData.url}
                        onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                        placeholder={
                          formData.type === 'youtube' 
                            ? 'Или введите URL YouTube'
                            : formData.type === 'vimeo'
                            ? 'Или введите URL Vimeo'
                            : 'Или введите URL видеофайла'
                        }
                      />
                      {formData.type === 'direct' && (
                        <FileUpload
                          onUpload={(url) => setFormData({ ...formData, url, type: 'direct' })}
                          accept="video/*"
                          type="video"
                          label="Загрузить видеофайл"
                        />
                      )}
                      {formData.url && !validateUrl(formData.url, formData.type) && (
                        <p className="text-sm text-destructive mt-1">
                          Некорректный URL для выбранного типа
                        </p>
                      )}
                      {formData.type === 'youtube' && (
                        <p className="text-xs text-muted-foreground">
                          Пример: https://www.youtube.com/watch?v=dQw4w9WgXcQ
                        </p>
                      )}
                      {formData.type === 'direct' && (
                        <p className="text-xs text-muted-foreground">
                          Загрузите файл или введите URL видеофайла
                        </p>
                      )}
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="type">Тип</Label>
                    <select
                      id="type"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    >
                      <option value="youtube">YouTube</option>
                      <option value="vimeo">Vimeo</option>
                      <option value="direct">Прямая ссылка</option>
                    </select>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Отмена
                  </Button>
                  <Button onClick={editingVideo ? handleUpdate : handleCreate}>
                    {editingVideo ? 'Сохранить' : 'Создать'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {videos.map((video) => (
            <Card key={video.id}>
              <CardHeader>
                <CardTitle>{video.title}</CardTitle>
                <CardDescription>
                  Тип: {video.type} {video.lesson_id && `| Урок ID: ${video.lesson_id}`}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => openEditDialog(video)}
                  className="flex-1"
                >
                  Редактировать
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleDelete(video.id)}
                  className="flex-1"
                >
                  Удалить
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {videos.length === 0 && (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground">Видео пока не добавлены</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

