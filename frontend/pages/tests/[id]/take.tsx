import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { useAuth } from '@/context/AuthContext'
import { getTest, createTestAttempt, getMyTestAttempts } from '@/services/tests'
import type { Test, TestQuestion } from '@/services/tests'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import Link from 'next/link'

/**
 * Страница прохождения теста
 */
export default function TakeTestPage() {
  const router = useRouter()
  const { id } = router.query
  const { isAuth, loading: authLoading } = useAuth()
  const [test, setTest] = useState<Test | null>(null)
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [hasPreviousAttempt, setHasPreviousAttempt] = useState(false)
  const [previousAttempt, setPreviousAttempt] = useState<any>(null)

  useEffect(() => {
    // Ждем завершения загрузки авторизации и получения id из роутера
    if (authLoading || !id) return

    if (!isAuth) {
      setLoading(false)
      return
    }

    const loadTest = async () => {
      try {
        const data = await getTest(Number(id))
        setTest(data)
        
        // Проверяем наличие предыдущих попыток
        try {
          const attempts = await getMyTestAttempts()
          const testAttempts = attempts.filter(a => a.test_id === Number(id))
          if (testAttempts.length > 0) {
            setHasPreviousAttempt(true)
            setPreviousAttempt(testAttempts[testAttempts.length - 1]) // Берем последнюю попытку
          }
        } catch (error) {
          console.error('Ошибка загрузки попыток:', error)
        }
      } catch (error) {
        console.error('Ошибка загрузки теста:', error)
      } finally {
        setLoading(false)
      }
    }

    loadTest()
  }, [isAuth, id, authLoading])

  const handleAnswerChange = (questionId: number, answerIndex: number) => {
    setAnswers({ ...answers, [questionId.toString()]: answerIndex })
  }

  const handleSubmit = async () => {
    if (!test || !test.questions || test.questions.length === 0) return

    // Проверяем, что все вопросы отвечены
    if (Object.keys(answers).length < test.questions.length) {
      alert('Пожалуйста, ответьте на все вопросы')
      return
    }

    setSubmitting(true)
    try {
      const answersJson = JSON.stringify(answers)
      const attempt = await createTestAttempt(test.id, answersJson)
      setResult(attempt)
      setSubmitted(true)
      setHasPreviousAttempt(true)
      setPreviousAttempt(attempt)
    } catch (error: any) {
      console.error('Ошибка отправки теста:', error)
      const errorMessage = error.response?.data?.error || 'Ошибка отправки теста'
      alert(errorMessage)
    } finally {
      setSubmitting(false)
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

  if (!test) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <CardContent className="p-6">
            <p className="text-center mb-4">Тест не найден</p>
            <Link href="/tests">
              <Button className="w-full">Вернуться к тестам</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Проверяем, можно ли проходить тест
  if (hasPreviousAttempt && !test.allow_retake) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="max-w-2xl w-full border-2 border-primary/20">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-2xl">Тест уже пройден</CardTitle>
            <CardDescription>
              {test.title}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center p-6 rounded-lg bg-muted/50">
              <p className="text-lg font-semibold mb-2">
                Ваш результат: {previousAttempt.score.toFixed(1)}%
              </p>
              <p className="text-sm text-muted-foreground">
                Повторное прохождение этого теста запрещено администратором.
              </p>
            </div>
            <div className="flex gap-4">
              <Link href={`/lessons/${test.lesson_id}`} className="flex-1">
                <Button variant="outline" className="w-full">
                  Вернуться к уроку
                </Button>
              </Link>
              <Link href="/tests" className="flex-1">
                <Button className="w-full">К списку тестов</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (submitted && result) {
    const score = result.score
    const isExcellent = score >= 90
    const isGood = score >= 70
    const bgColor = isExcellent ? 'from-green-500/20 to-emerald-500/20' : isGood ? 'from-blue-500/20 to-cyan-500/20' : 'from-orange-500/20 to-red-500/20'
    
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-2xl w-full border-2 border-primary/20 shadow-2xl">
          <CardHeader className="text-center pb-4">
            <div className={`w-24 h-24 rounded-full mx-auto mb-4 bg-gradient-to-br ${bgColor} flex items-center justify-center shadow-glow`}>
              <svg className="w-12 h-12 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <CardTitle className="text-3xl">Результат теста</CardTitle>
            <CardDescription className="text-lg mt-2">{test.title}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className={`text-center p-8 rounded-2xl bg-gradient-to-br ${bgColor} border-2 border-primary/20`}>
              <p className="text-5xl font-bold text-primary mb-2">
                {result.score.toFixed(1)}%
              </p>
              <p className="text-muted-foreground text-lg">Ваш результат</p>
              {isExcellent && (
                <p className="text-green-600 font-semibold mt-2">Отлично! 🎉</p>
              )}
              {isGood && !isExcellent && (
                <p className="text-blue-600 font-semibold mt-2">Хорошо! 👍</p>
              )}
              {!isGood && (
                <p className="text-orange-600 font-semibold mt-2">Продолжайте учиться! 💪</p>
              )}
            </div>
            <div className="flex gap-4">
              <Link href={`/lessons/${test.lesson_id}`} className="flex-1">
                <Button variant="outline" className="w-full hover:bg-primary/10">
                  Вернуться к уроку
                </Button>
              </Link>
              <Link href="/tests" className="flex-1">
                <Button className="w-full gradient-primary shadow-glow">К списку тестов</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-6">
          <Link href={test.lesson_id ? `/lessons/${test.lesson_id}` : '/tests'}>
            <Button variant="outline" className="hover:bg-primary/10">← Назад</Button>
          </Link>
        </div>

        <Card className="mb-8 border-2 border-primary/20 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-t-xl">
            <CardTitle className="text-2xl">{test.title}</CardTitle>
            {test.lesson && (
              <CardDescription className="text-base mt-2">
                Урок {test.lesson.number}: {test.lesson.topic}
              </CardDescription>
            )}
          </CardHeader>
        </Card>

        <div className="space-y-6">
          {test.questions && test.questions
            .sort((a, b) => a.order - b.order)
            .map((question: TestQuestion, index: number) => {
              const options = JSON.parse(question.options) as string[]
              return (
                <Card key={question.id} className="card-hover border-2 border-primary/10 hover:border-primary/30">
                  <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent">
                    <CardTitle className="text-lg flex items-center gap-3">
                      <span className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center text-white font-bold text-sm shadow-glow">
                        {index + 1}
                      </span>
                      {question.question}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="space-y-3">
                      <Label className="text-base font-semibold">Выберите ответ:</Label>
                      <div className="space-y-2">
                        {options.map((option, optionIndex) => (
                          <label
                            key={optionIndex}
                            className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                              answers[question.id] === optionIndex
                                ? 'border-primary bg-primary/10 shadow-md'
                                : 'border-input hover:border-primary/30 hover:bg-primary/5'
                            }`}
                          >
                            <input
                              type={test.type === 'multiple' ? 'checkbox' : 'radio'}
                              name={`question-${question.id}`}
                              checked={answers[question.id.toString()] === optionIndex}
                              onChange={() => handleAnswerChange(question.id, optionIndex)}
                              className="w-5 h-5 text-primary focus:ring-primary"
                            />
                            <span className="flex-1">{option}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
        </div>

        <div className="mt-10 flex justify-between items-center">
          <p className="text-sm text-muted-foreground">
            Отвечено: {Object.keys(answers).length} из {test.questions?.length || 0}
          </p>
          <Button
            onClick={handleSubmit}
            disabled={submitting || !test.questions || Object.keys(answers).length < test.questions.length}
            size="lg"
            className="gradient-primary shadow-glow px-8 py-6 text-base"
          >
            {submitting ? 'Отправка...' : 'Отправить ответы'}
          </Button>
        </div>
      </div>
    </div>
  )
}

