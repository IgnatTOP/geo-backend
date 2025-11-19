import type { AppProps } from 'next/app'
import { AuthProvider } from '@/context/AuthContext'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import '@/styles/globals.css'

/**
 * Главный компонент приложения
 * Оборачивает все страницы в AuthProvider для доступа к контексту авторизации
 * Добавляет общие компоненты Header и Footer на все страницы
 */
export default function App({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1">
          <Component {...pageProps} />
        </main>
        <Footer />
      </div>
    </AuthProvider>
  )
}

