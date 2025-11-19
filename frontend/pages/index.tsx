import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { getFacts } from '@/services/facts'
import type { Fact } from '@/services/facts'
import { normalizeImageUrl } from '@/services/upload'
import Link from 'next/link'

/**
 * Главная страница с навигацией и приветствием
 */
export default function Home() {
  const { user, isAuth, loading } = useAuth()
  const router = useRouter()
  const [facts, setFacts] = useState<Fact[]>([])

  useEffect(() => {
    // Загружаем последние факты
    const loadFacts = async () => {
      try {
        const data = await getFacts(1, 3) // Получаем первые 3 факта
        setFacts(data.facts) // Извлекаем массив фактов из ответа
      } catch (error) {
        console.error('Ошибка загрузки фактов:', error)
      }
    }
    loadFacts()
  }, [])

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Загрузка...</div>
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Основной контент */}
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-5xl font-bold mb-6 bg-gradient-to-r from-primary via-primary/80 to-primary bg-clip-text text-transparent">
            Добро пожаловать!
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Современный учебный портал для изучения географии с интерактивными материалами, тестами и практическими заданиями
          </p>
        </div>

        {/* Быстрая навигация */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <Card className="card-hover border-2 border-primary/20 hover:border-primary/40">
            <CardHeader className="pb-4">
              <div className="w-12 h-12 rounded-lg gradient-primary flex items-center justify-center mb-3 shadow-glow">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <CardTitle className="text-2xl">Теория</CardTitle>
              <CardDescription className="text-base">Уроки, доклады, видео и факты</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/theory">
                <Button className="w-full gradient-primary shadow-glow">Перейти к теории</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="card-hover border-2 border-primary/20 hover:border-primary/40">
            <CardHeader className="pb-4">
              <div className="w-12 h-12 rounded-lg gradient-primary flex items-center justify-center mb-3 shadow-glow">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
              </div>
              <CardTitle className="text-2xl">Тесты</CardTitle>
              <CardDescription className="text-base">Проверьте свои знания</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/tests">
                <Button className="w-full gradient-primary shadow-glow">Перейти к тестам</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="card-hover border-2 border-primary/20 hover:border-primary/40">
            <CardHeader className="pb-4">
              <div className="w-12 h-12 rounded-lg gradient-primary flex items-center justify-center mb-3 shadow-glow">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <CardTitle className="text-2xl">Практики</CardTitle>
              <CardDescription className="text-base">Практические задания</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/practices">
                <Button className="w-full gradient-primary shadow-glow">Перейти к практикам</Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Последние факты */}
        {facts.length > 0 && (
          <div className="animate-fade-in">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-3xl font-bold text-gradient">Интересные факты</h3>
              <Link href="/facts">
                <Button variant="outline" className="hover:bg-primary/10">
                  Все факты →
                </Button>
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {facts.map((fact, index) => (
                <Link key={fact.id} href={`/facts/${fact.id}`}>
                  <Card 
                    className="card-hover overflow-hidden border-2 border-primary/10 hover:border-primary/30 cursor-pointer"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                  {fact.image_url && (
                    <div className="relative overflow-hidden">
                      <img
                        src={normalizeImageUrl(fact.image_url) || fact.image_url}
                        alt={fact.title}
                        className="w-full h-48 object-cover transition-transform duration-300 hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                    </div>
                  )}
                  <CardHeader>
                    <CardTitle className="text-xl">{fact.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed text-wrap">{fact.content}</p>
                  </CardContent>
                </Card>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

