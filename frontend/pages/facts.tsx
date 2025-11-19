import { useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { getFacts } from '@/services/facts'
import type { Fact } from '@/services/facts'
import { normalizeImageUrl } from '@/services/upload'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import SearchBar from '@/components/SearchBar'
import Link from 'next/link'

/**
 * Страница с лентой фактов (новостной блог)
 */
export default function FactsPage() {
  const { isAuth, loading: authLoading } = useAuth()
  const [facts, setFacts] = useState<Fact[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    pages: 1
  })
  const [searchQuery, setSearchQuery] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (authLoading) return
    if (!isAuth) {
      setLoading(false)
      return
    }

    const loadFacts = async () => {
      setLoading(true)
      setError('')
      try {
        const data = await getFacts(page, 12)
        setFacts(data.facts || [])
        setPagination(data.pagination || { page: 1, limit: 12, total: 0, pages: 1 })
      } catch (error: any) {
        console.error('Ошибка загрузки фактов:', error)
        setError(error.response?.data?.error || 'Не удалось загрузить факты')
        setFacts([])
      } finally {
        setLoading(false)
      }
    }

    loadFacts()
  }, [isAuth, page, authLoading])

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


  const filteredFacts = facts.filter(fact => 
    !searchQuery || 
    fact.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    fact.content.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-10">
          <h1 className="text-4xl font-bold mb-2 text-gradient flex items-center gap-3">
            <svg className="w-10 h-10 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            Интересные факты
          </h1>
          <p className="text-muted-foreground text-lg">Узнайте что-то новое о географии</p>
        </div>

        <div className="mb-6">
          <SearchBar 
            placeholder="Поиск по заголовку, содержанию..." 
            onSearch={setSearchQuery}
            className="max-w-2xl"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredFacts.map((fact, index) => (
            <Link key={fact.id} href={`/facts/${fact.id}`}>
              <Card 
                className="card-hover overflow-hidden border-2 border-primary/10 hover:border-primary/40 cursor-pointer"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
              {fact.image_url && (
                <div className="relative overflow-hidden">
                  <img
                    src={normalizeImageUrl(fact.image_url) || fact.image_url}
                    alt={fact.title}
                    className="w-full h-64 object-cover transition-transform duration-300 hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                </div>
              )}
              <CardHeader>
                <CardTitle className="text-xl">{fact.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground whitespace-pre-line leading-relaxed line-clamp-4 text-wrap">
                  {fact.content}
                </p>
                <div className="mt-4 pt-4 border-t border-primary/10 flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">
                    {new Date(fact.created_at).toLocaleDateString('ru-RU', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                </div>
              </CardContent>
            </Card>
            </Link>
          ))}
        </div>

        {filteredFacts.length === 0 && facts.length > 0 && (
          <Card className="border-2 border-primary/20 mb-6">
            <CardContent className="p-12 text-center">
              <svg className="w-16 h-16 text-muted-foreground mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-muted-foreground text-lg">Факты не найдены</p>
              <p className="text-sm text-muted-foreground mt-2">Попробуйте изменить параметры поиска</p>
            </CardContent>
          </Card>
        )}

        {/* Пагинация */}
        {pagination.pages > 1 && (
          <div className="mt-10 flex justify-center items-center gap-4">
            <Button
              variant="outline"
              onClick={() => setPage(page - 1)}
              disabled={page === 1 || loading}
              className="hover:bg-primary/10"
            >
              ← Назад
            </Button>
            <div className="flex items-center gap-2">
              {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                let pageNum
                if (pagination.pages <= 5) {
                  pageNum = i + 1
                } else if (page <= 3) {
                  pageNum = i + 1
                } else if (page >= pagination.pages - 2) {
                  pageNum = pagination.pages - 4 + i
                } else {
                  pageNum = page - 2 + i
                }
                return (
                  <Button
                    key={pageNum}
                    variant={page === pageNum ? "default" : "outline"}
                    onClick={() => setPage(pageNum)}
                    disabled={loading}
                    className={page === pageNum ? "gradient-primary shadow-glow" : "hover:bg-primary/10"}
                  >
                    {pageNum}
                  </Button>
                )
              })}
            </div>
            <Button
              variant="outline"
              onClick={() => setPage(page + 1)}
              disabled={page === pagination.pages || loading}
              className="hover:bg-primary/10"
            >
              Вперед →
            </Button>
          </div>
        )}

        {error && (
          <Card className="border-2 border-destructive/20 bg-destructive/5">
            <CardContent className="p-12 text-center">
              <div className="w-16 h-16 rounded-full bg-destructive/10 mx-auto mb-4 flex items-center justify-center">
                <svg className="w-8 h-8 text-destructive" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-destructive text-lg font-medium">{error}</p>
              <Button onClick={() => setPage(page)} className="mt-4">
                Попробовать снова
              </Button>
            </CardContent>
          </Card>
        )}

        {!error && facts.length === 0 && (
          <Card className="border-2 border-primary/20">
            <CardContent className="p-12 text-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 mx-auto mb-4 flex items-center justify-center">
                <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <p className="text-muted-foreground text-lg">Факты пока не добавлены</p>
              <p className="text-sm text-muted-foreground mt-2">Администратор скоро добавит интересные факты о географии</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

