import { useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import api from '@/services/api'
import type { User } from '@/services/auth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import SearchBar from '@/components/SearchBar'
import Link from 'next/link'

/**
 * Страница управления пользователями (админка)
 */
export default function AdminUsersPage() {
  const { user, isAuth } = useAuth()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [formData, setFormData] = useState({ name: '', email: '', role: 'student' })
  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('all')

  useEffect(() => {
    if (!isAuth || user?.role !== 'admin') return
    loadUsers()
  }, [isAuth, user])

  const loadUsers = async () => {
    try {
      const response = await api.get<User[]>('/admin/users')
      setUsers(response.data)
    } catch (error) {
      console.error('Ошибка загрузки пользователей:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdate = async () => {
    if (!editingUser) return
    try {
      await api.put(`/admin/users/${editingUser.id}`, {
        name: formData.name || editingUser.name,
        email: formData.email || editingUser.email,
        role: formData.role || editingUser.role,
      })
      setIsDialogOpen(false)
      setEditingUser(null)
      setFormData({ name: '', email: '', role: 'student' })
      loadUsers()
    } catch (error) {
      console.error('Ошибка обновления пользователя:', error)
      alert('Ошибка обновления пользователя')
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Удалить пользователя?')) return
    try {
      await api.delete(`/admin/users/${id}`)
      loadUsers()
    } catch (error) {
      console.error('Ошибка удаления пользователя:', error)
      alert('Ошибка удаления пользователя')
    }
  }

  const openEditDialog = (userData: User) => {
    setEditingUser(userData)
    setFormData({
      name: userData.name,
      email: userData.email,
      role: userData.role,
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

  const filteredUsers = users.filter(userData => {
    const matchesSearch = !searchQuery || 
      userData.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      userData.email.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesRole = roleFilter === 'all' || userData.role === roleFilter
    return matchesSearch && matchesRole
  })

  const studentsCount = users.filter(u => u.role === 'student').length
  const adminsCount = users.filter(u => u.role === 'admin').length

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold mb-2 text-gradient">Управление пользователями</h1>
              <p className="text-muted-foreground text-lg">Управление аккаунтами и правами доступа</p>
            </div>
            <Link href="/admin">
              <Button variant="outline" className="hover:bg-primary/10">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Назад
              </Button>
            </Link>
          </div>

          {/* Статистика */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <Card className="border-2 border-primary/10">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg gradient-primary flex items-center justify-center shadow-glow">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                  <div>
                    <CardTitle className="text-2xl">{users.length}</CardTitle>
                    <CardDescription>Всего пользователей</CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>

            <Card className="border-2 border-primary/10">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-blue-500/20 flex items-center justify-center">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
                    </svg>
                  </div>
                  <div>
                    <CardTitle className="text-2xl">{studentsCount}</CardTitle>
                    <CardDescription>Студентов</CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>

            <Card className="border-2 border-primary/10">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-green-500/20 flex items-center justify-center">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <div>
                    <CardTitle className="text-2xl">{adminsCount}</CardTitle>
                    <CardDescription>Администраторов</CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>
          </div>

          {/* Поиск и фильтры */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <SearchBar 
                placeholder="Поиск по имени или email..." 
                onSearch={setSearchQuery}
              />
            </div>
            <select
              className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm min-w-[150px]"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <option value="all">Все роли</option>
              <option value="student">Студенты</option>
              <option value="admin">Администраторы</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredUsers.length === 0 ? (
            <Card className="col-span-full border-2 border-primary/20">
              <CardContent className="p-12 text-center">
                <svg className="w-16 h-16 text-muted-foreground mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <p className="text-muted-foreground text-lg">Пользователи не найдены</p>
                <p className="text-sm text-muted-foreground mt-2">Попробуйте изменить параметры поиска</p>
              </CardContent>
            </Card>
          ) : (
            filteredUsers.map((userData) => (
              <Card key={userData.id} className="border-2 border-primary/10 hover:border-primary/30 transition-all">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full gradient-primary flex items-center justify-center text-white font-bold text-xl shadow-glow">
                        {userData.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <CardTitle className="text-xl">{userData.name}</CardTitle>
                        <CardDescription className="space-y-1 mt-2">
                          <div className="flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            <span className="text-sm">{userData.email}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                              userData.role === 'admin' 
                                ? 'bg-green-500/20 text-green-600' 
                                : 'bg-blue-500/20 text-blue-600'
                            }`}>
                              {userData.role === 'admin' ? '👑 Администратор' : '📚 Студент'}
                            </span>
                          </div>
                        </CardDescription>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => openEditDialog(userData)}
                    className="flex-1 hover:bg-primary/10"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Редактировать
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => handleDelete(userData.id)}
                    className="flex-1"
                    disabled={userData.id === user?.id}
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Удалить
                  </Button>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Диалог редактирования */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Редактировать пользователя</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Имя</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="role">Роль</Label>
                <select
                  id="role"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                >
                  <option value="student">Студент</option>
                  <option value="admin">Администратор</option>
                </select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Отмена
              </Button>
              <Button onClick={handleUpdate}>Сохранить</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}

