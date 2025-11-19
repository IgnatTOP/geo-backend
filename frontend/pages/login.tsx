import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { useAuth } from '@/context/AuthContext'
import { login } from '@/services/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

/**
 * Страница входа в систему
 */
export default function LoginPage() {
  const router = useRouter()
  const { login: setUser, isAuth, loading: authLoading } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Редирект, если уже авторизован
  useEffect(() => {
    if (!authLoading && isAuth) {
      router.push('/profile')
    }
  }, [isAuth, authLoading, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Валидация на клиенте
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setError('Введите корректный email адрес')
      return
    }

    if (password.length < 1) {
      setError('Введите пароль')
      return
    }

    setLoading(true)

    try {
      const response = await login({ email, password })
      await setUser(response.user)
      router.push('/profile')
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Неверный email или пароль'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  if (authLoading) {
    return <div className="min-h-screen flex items-center justify-center">Загрузка...</div>
  }

  if (isAuth) {
    return null // Редирект в процессе
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md border-2 border-primary/20 shadow-2xl">
        <CardHeader className="text-center pb-6">
          <div className="w-16 h-16 rounded-full gradient-primary mx-auto mb-4 flex items-center justify-center shadow-glow">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <CardTitle className="text-3xl">Вход в систему</CardTitle>
          <CardDescription className="text-base mt-2">Введите свои учетные данные</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="example@mail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Пароль</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full gradient-primary shadow-glow" disabled={loading}>
              {loading ? 'Вход...' : 'Войти'}
            </Button>
            <div className="text-center text-sm text-muted-foreground">
              Нет аккаунта?{' '}
              <Link href="/register" className="text-primary hover:underline">
                Зарегистрироваться
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

