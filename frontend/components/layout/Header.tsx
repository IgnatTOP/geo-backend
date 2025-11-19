import { useRouter } from 'next/router'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { useEffect, useState } from 'react'

/**
 * Компонент шапки сайта с навигацией
 */
export default function Header() {
  const { user, isAuth } = useAuth()
  const router = useRouter()
  const [isDark, setIsDark] = useState(false)

  // Загрузка темы из localStorage при монтировании
  useEffect(() => {
    const theme = localStorage.getItem('theme')
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    const shouldBeDark = theme === 'dark' || (!theme && prefersDark)
    
    setIsDark(shouldBeDark)
    if (shouldBeDark) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [])

  // Переключение темы
  const toggleTheme = () => {
    const newTheme = !isDark
    setIsDark(newTheme)
    
    if (newTheme) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }

  return (
    <header className="border-b bg-card/95 backdrop-blur-md sticky top-0 z-50 shadow-md">
      <div className="container mx-auto px-2 sm:px-4">
        <div className="flex justify-between items-center h-14 sm:h-16">
          {/* Логотип и название */}
          <Link href="/" className="flex items-center gap-2 sm:gap-3 hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg gradient-primary flex items-center justify-center shadow-glow flex-shrink-0">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="text-base sm:text-xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent hidden sm:block">
              Учебный портал по географии
            </h1>
          </Link>

          {/* Навигация */}
          <nav className="flex items-center gap-0.5 sm:gap-1 md:gap-2 overflow-x-auto scrollbar-hide flex-shrink-0">
            {isAuth ? (
              <>
                <Link href="/theory" className="flex-shrink-0">
                  <Button 
                    variant={router.pathname === '/theory' ? 'default' : 'ghost'} 
                    className="hover:bg-primary/10"
                    size="sm"
                  >
                    <svg className="w-4 h-4 sm:mr-1 md:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    <span className="hidden md:inline">Теория</span>
                  </Button>
                </Link>
                <Link href="/tests" className="flex-shrink-0">
                  <Button 
                    variant={router.pathname === '/tests' ? 'default' : 'ghost'} 
                    className="hover:bg-primary/10"
                    size="sm"
                  >
                    <svg className="w-4 h-4 sm:mr-1 md:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                    </svg>
                    <span className="hidden md:inline">Тесты</span>
                  </Button>
                </Link>
                <Link href="/practices" className="flex-shrink-0">
                  <Button 
                    variant={router.pathname === '/practices' ? 'default' : 'ghost'} 
                    className="hover:bg-primary/10"
                    size="sm"
                  >
                    <svg className="w-4 h-4 sm:mr-1 md:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    <span className="hidden md:inline">Практики</span>
                  </Button>
                </Link>
                <Link href="/facts" className="flex-shrink-0">
                  <Button 
                    variant={router.pathname === '/facts' ? 'default' : 'ghost'} 
                    className="hover:bg-primary/10"
                    size="sm"
                  >
                    <svg className="w-4 h-4 sm:mr-1 md:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                    <span className="hidden md:inline">Факты</span>
                  </Button>
                </Link>
                <Link href="/profile" className="flex-shrink-0">
                  <Button 
                    variant={router.pathname === '/profile' ? 'default' : 'ghost'} 
                    className="hover:bg-primary/10"
                    size="sm"
                  >
                    <svg className="w-4 h-4 sm:mr-1 md:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span className="hidden md:inline">Профиль</span>
                  </Button>
                </Link>
                {user?.role === 'admin' && (
                  <Link href="/admin" className="flex-shrink-0">
                    <Button 
                      variant={router.pathname.startsWith('/admin') ? 'default' : 'outline'} 
                      className="border-primary/50 hover:bg-primary/10"
                      size="sm"
                    >
                      <svg className="w-4 h-4 sm:mr-1 md:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span className="hidden md:inline">Админка</span>
                    </Button>
                  </Link>
                )}
              </>
            ) : (
              <>
                <Link href="/login" className="flex-shrink-0">
                  <Button variant="ghost" size="sm">
                    <svg className="w-4 h-4 sm:mr-1 md:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                    </svg>
                    <span className="hidden md:inline">Вход</span>
                  </Button>
                </Link>
                <Link href="/register" className="flex-shrink-0">
                  <Button className="gradient-primary shadow-glow" size="sm">
                    <svg className="w-4 h-4 sm:mr-1 md:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                    </svg>
                    <span className="hidden md:inline">Регистрация</span>
                  </Button>
                </Link>
              </>
            )}
            
            {/* Переключатель темы */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
              className="ml-2 hover:bg-primary/10"
              aria-label="Переключить тему"
            >
              {isDark ? (
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </Button>
          </nav>
        </div>
      </div>
    </header>
  )
}

