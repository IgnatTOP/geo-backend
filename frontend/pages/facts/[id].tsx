import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { useAuth } from '@/context/AuthContext'
import { getFact } from '@/services/facts'
import type { Fact } from '@/services/facts'
import { normalizeImageUrl } from '@/services/upload'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Share2, ArrowLeft } from 'lucide-react'

/**
 * Страница детального просмотра интересного факта
 */
export default function FactDetailPage() {
  const router = useRouter()
  const { id } = router.query
  const { isAuth, loading: authLoading } = useAuth()
  const [fact, setFact] = useState<Fact | null>(null)
  const [loading, setLoading] = useState(true)
  const [relatedFacts, setRelatedFacts] = useState<Fact[]>([])

  useEffect(() => {
    // Ждем завершения загрузки авторизации и получения id из роутера
    if (authLoading || !id) return

    if (!isAuth) {
      setLoading(false)
      return
    }

    const loadFact = async () => {
      try {
        const data = await getFact(Number(id))
        setFact(data)
        // Загружаем связанные факты (можно улучшить, добавив API для связанных)
      } catch (error) {
        console.error('Ошибка загрузки факта:', error)
      } finally {
        setLoading(false)
      }
    }

    loadFact()
  }, [isAuth, id, authLoading])

  const handleShare = async () => {
    if (navigator.share && fact) {
      try {
        await navigator.share({
          title: fact.title,
          text: fact.content.substring(0, 200) + '...',
          url: window.location.href,
        })
      } catch (error) {
        // Пользователь отменил или произошла ошибка
        console.log('Ошибка шаринга:', error)
      }
    } else {
      // Fallback: копируем URL в буфер обмена
      try {
        await navigator.clipboard.writeText(window.location.href)
        alert('Ссылка скопирована в буфер обмена!')
      } catch (error) {
        console.error('Ошибка копирования:', error)
      }
    }
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

  if (authLoading || loading) {
    return <div className="min-h-screen flex items-center justify-center">Загрузка...</div>
  }

  if (!fact) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <CardContent className="p-6">
            <p className="text-center mb-4">Факт не найден</p>
            <Link href="/facts">
              <Button className="w-full">Вернуться к фактам</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Кнопки навигации */}
        <div className="mb-6 flex items-center justify-between">
          <Link href="/facts">
            <Button variant="outline" className="hover:bg-primary/10">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Назад к фактам
            </Button>
          </Link>
          <Button variant="outline" onClick={handleShare} className="hover:bg-primary/10">
            <Share2 className="w-4 h-4 mr-2" />
            Поделиться
          </Button>
        </div>

        {/* Основной контент факта */}
        <Card className="border-2 border-primary/10 shadow-lg">
          {fact.image_url && (
            <div className="relative overflow-hidden">
              <img
                src={normalizeImageUrl(fact.image_url) || fact.image_url}
                alt={fact.title}
                className="w-full h-96 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
            </div>
          )}
          <CardHeader>
            <CardTitle className="text-3xl mb-2">{fact.title}</CardTitle>
            <CardDescription>
              {new Date(fact.created_at).toLocaleDateString('ru-RU', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="prose max-w-none">
              <div className="text-lg text-foreground/90 leading-relaxed whitespace-pre-line text-wrap text-scrollable">
                {fact.content}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Связанные материалы */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4">Связанные материалы</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link href="/theory">
              <Card className="card-hover border-2 border-primary/10 hover:border-primary/40 cursor-pointer">
                <CardHeader>
                  <CardTitle>Теоретические материалы</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Изучите уроки и теоретические материалы
                  </p>
                </CardContent>
              </Card>
            </Link>
            <Link href="/facts">
              <Card className="card-hover border-2 border-primary/10 hover:border-primary/40 cursor-pointer">
                <CardHeader>
                  <CardTitle>Другие факты</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Откройте для себя больше интересных фактов
                  </p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

