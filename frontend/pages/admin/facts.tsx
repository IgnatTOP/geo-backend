import { useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { getFacts, createFact, updateFact, deleteFact } from '@/services/facts'
import type { Fact } from '@/services/facts'
import { normalizeFileUrl } from '@/services/upload'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import FileUpload from '@/components/FileUpload'
import Link from 'next/link'

/**
 * Страница управления фактами (админка)
 */
export default function AdminFactsPage() {
  const { user, isAuth } = useAuth()
  const [facts, setFacts] = useState<Fact[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingFact, setEditingFact] = useState<Fact | null>(null)
  const [formData, setFormData] = useState({ title: '', content: '', image_url: '' })

  useEffect(() => {
    if (!isAuth || user?.role !== 'admin') return
    loadFacts()
  }, [isAuth, user])

  const loadFacts = async () => {
    try {
      const data = await getFacts(1, 100) // Получаем все факты для админки
      setFacts(data.facts) // Извлекаем массив фактов из ответа
    } catch (error) {
      console.error('Ошибка загрузки фактов:', error)
    } finally {
      setLoading(false)
    }
  }

  const validateImageUrl = (url: string): boolean => {
    if (!url.trim()) return true // Изображение необязательно
    try {
      new URL(url)
      return /\.(jpg|jpeg|png|gif|webp|svg)(\?.*)?$/i.test(url) || url.includes('unsplash.com') || url.includes('pexels.com')
    } catch {
      return false
    }
  }

  const handleCreate = async () => {
    if (!formData.title.trim()) {
      alert('Введите заголовок факта')
      return
    }
    if (!formData.content.trim()) {
      alert('Введите содержание факта')
      return
    }
    if (formData.image_url && !validateImageUrl(formData.image_url)) {
      alert('Некорректный URL изображения. Используйте ссылку на изображение (jpg, png, gif, webp) или сервисы типа Unsplash, Pexels')
      return
    }
    try {
      await createFact({
        title: formData.title,
        content: formData.content,
        image_url: formData.image_url || undefined,
      })
      setIsDialogOpen(false)
      setFormData({ title: '', content: '', image_url: '' })
      loadFacts()
    } catch (error) {
      console.error('Ошибка создания факта:', error)
      alert('Ошибка создания факта')
    }
  }

  const handleUpdate = async () => {
    if (!editingFact) return
    const title = formData.title.trim() || editingFact.title
    const content = formData.content.trim() || editingFact.content
    const imageUrl = formData.image_url.trim() || editingFact.image_url || undefined
    
    if (!title) {
      alert('Заголовок не может быть пустым')
      return
    }
    if (!content) {
      alert('Содержание не может быть пустым')
      return
    }
    if (imageUrl && !validateImageUrl(imageUrl)) {
      alert('Некорректный URL изображения')
      return
    }
    try {
      await updateFact(editingFact.id, {
        title,
        content,
        image_url: imageUrl,
      })
      setIsDialogOpen(false)
      setEditingFact(null)
      setFormData({ title: '', content: '', image_url: '' })
      loadFacts()
    } catch (error) {
      console.error('Ошибка обновления факта:', error)
      alert('Ошибка обновления факта')
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Удалить факт?')) return
    try {
      await deleteFact(id)
      loadFacts()
    } catch (error) {
      console.error('Ошибка удаления факта:', error)
      alert('Ошибка удаления факта')
    }
  }

  const openEditDialog = (fact: Fact) => {
    setEditingFact(fact)
    setFormData({
      title: fact.title,
      content: fact.content,
      image_url: fact.image_url || '',
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
          <h1 className="text-3xl font-bold">Управление фактами</h1>
          <div className="flex gap-4">
            <Link href="/admin">
              <Button variant="outline">Назад</Button>
            </Link>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => {
                  setEditingFact(null)
                  setFormData({ title: '', content: '', image_url: '' })
                }}>
                  Создать факт
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto w-full">
                <DialogHeader>
                  <DialogTitle>
                    {editingFact ? 'Редактировать факт' : 'Создать факт'}
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="title">Заголовок</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="content">Содержание</Label>
                    <textarea
                      id="content"
                      className="flex min-h-[150px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      value={formData.content}
                      onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="image_url">Изображение</Label>
                    <div className="space-y-2">
                      <Input
                        id="image_url"
                        type="url"
                        value={formData.image_url}
                        onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                        placeholder="Или введите URL изображения (необязательно)"
                      />
                      {formData.image_url && !validateImageUrl(formData.image_url) && (
                        <p className="text-sm text-destructive mt-1">
                          Некорректный URL изображения
                        </p>
                      )}
                      <FileUpload
                        onUpload={(url) => setFormData({ ...formData, image_url: url })}
                        accept="image/*"
                        type="image"
                        label="Загрузить изображение"
                      />
                      <p className="text-xs text-muted-foreground">
                        Загрузите файл или введите URL изображения
                      </p>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Отмена
                  </Button>
                  <Button onClick={editingFact ? handleUpdate : handleCreate}>
                    {editingFact ? 'Сохранить' : 'Создать'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                <CardDescription>
                  {fact.content.substring(0, 100)}...
                </CardDescription>
              </CardHeader>
              <CardContent className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => openEditDialog(fact)}
                  className="flex-1"
                >
                  Редактировать
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleDelete(fact.id)}
                  className="flex-1"
                >
                  Удалить
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {facts.length === 0 && (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground">Факты пока не добавлены</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

