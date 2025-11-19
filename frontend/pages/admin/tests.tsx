import { useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { getTests, createTest, updateTest, deleteTest, getAllTestAttempts, createTestGrade, updateTestGrade, deleteTestGrade } from '@/services/tests'
import { getLessons } from '@/services/lessons'
import type { Test, TestAttempt, TestGrade } from '@/services/tests'
import type { Lesson } from '@/services/lessons'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import Link from 'next/link'

/**
 * Страница управления тестами и оценками (админка)
 */
export default function AdminTestsPage() {
  const { user, isAuth } = useAuth()
  const [tests, setTests] = useState<Test[]>([])
  const [attempts, setAttempts] = useState<TestAttempt[]>([])
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'tests' | 'attempts' | 'grades'>('tests')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isGradeDialogOpen, setIsGradeDialogOpen] = useState(false)
  const [editingTest, setEditingTest] = useState<Test | null>(null)
  const [selectedAttempt, setSelectedAttempt] = useState<TestAttempt | null>(null)
  const [formData, setFormData] = useState({ 
    lesson_id: '', 
    title: '', 
    description: '',
    type: 'single' as 'single' | 'multiple',
    questions: [] as Array<{ question: string; options: string[]; correct_answer: number; order: number }>
  })
  const [gradeData, setGradeData] = useState({ user_id: '', test_id: '', attempt_id: '', grade: '', comment: '' })

  useEffect(() => {
    if (!isAuth || user?.role !== 'admin') return
    loadLessons()
    loadData()
  }, [isAuth, user, activeTab])

  const loadLessons = async () => {
    try {
      const data = await getLessons()
      setLessons(data)
    } catch (error) {
      console.error('Ошибка загрузки уроков:', error)
    }
  }

  const loadData = async () => {
    try {
      if (activeTab === 'tests') {
        const data = await getTests()
        setTests(data)
      } else if (activeTab === 'attempts') {
        const data = await getAllTestAttempts()
        setAttempts(data)
      }
    } catch (error) {
      console.error('Ошибка загрузки данных:', error)
    } finally {
      setLoading(false)
    }
  }

  const addQuestion = () => {
    setFormData({
      ...formData,
      questions: [...formData.questions, { question: '', options: ['', ''], correct_answer: 0, order: formData.questions.length + 1 }]
    })
  }

  const removeQuestion = (index: number) => {
    setFormData({
      ...formData,
      questions: formData.questions.filter((_, i) => i !== index).map((q, i) => ({ ...q, order: i + 1 }))
    })
  }

  const updateQuestion = (index: number, field: string, value: any) => {
    const newQuestions = [...formData.questions]
    if (field === 'options') {
      newQuestions[index].options = value
    } else if (field === 'addOption') {
      newQuestions[index].options = [...newQuestions[index].options, '']
    } else if (field === 'removeOption') {
      newQuestions[index].options = newQuestions[index].options.filter((_, i) => i !== value)
      if (newQuestions[index].correct_answer >= newQuestions[index].options.length) {
        newQuestions[index].correct_answer = 0
      }
    } else {
      (newQuestions[index] as any)[field] = value
    }
    setFormData({ ...formData, questions: newQuestions })
  }

  const handleCreateTest = async () => {
    if (!formData.lesson_id) {
      alert('Выберите урок')
      return
    }
    if (!formData.title) {
      alert('Введите название теста')
      return
    }
    if (formData.questions.length === 0) {
      alert('Добавьте хотя бы один вопрос')
      return
    }
    // Валидация вопросов
    for (let i = 0; i < formData.questions.length; i++) {
      const q = formData.questions[i]
      if (!q.question) {
        alert(`Вопрос ${i + 1}: введите текст вопроса`)
        return
      }
      if (q.options.length < 2) {
        alert(`Вопрос ${i + 1}: добавьте хотя бы 2 варианта ответа`)
        return
      }
      if (q.options.some(opt => !opt.trim())) {
        alert(`Вопрос ${i + 1}: все варианты ответов должны быть заполнены`)
        return
      }
      if (q.correct_answer < 0 || q.correct_answer >= q.options.length) {
        alert(`Вопрос ${i + 1}: выберите правильный ответ`)
        return
      }
    }
    try {
      await createTest({
        lesson_id: parseInt(formData.lesson_id),
        title: formData.title,
        description: formData.description,
        type: formData.type,
        questions: formData.questions,
      } as any)
      setIsDialogOpen(false)
      setFormData({ lesson_id: '', title: '', description: '', type: 'single', questions: [] })
      loadData()
    } catch (error) {
      console.error('Ошибка создания теста:', error)
      alert('Ошибка создания теста')
    }
  }

  const handleDeleteTest = async (id: number) => {
    if (!confirm('Удалить тест?')) return
    try {
      await deleteTest(id)
      loadData()
    } catch (error) {
      console.error('Ошибка удаления теста:', error)
      alert('Ошибка удаления теста')
    }
  }

  const handleCreateGrade = async () => {
    try {
      await createTestGrade({
        user_id: parseInt(gradeData.user_id),
        test_id: parseInt(gradeData.test_id),
        attempt_id: gradeData.attempt_id ? parseInt(gradeData.attempt_id) : undefined,
        grade: parseFloat(gradeData.grade),
        comment: gradeData.comment || undefined,
      })
      setIsGradeDialogOpen(false)
      setGradeData({ user_id: '', test_id: '', attempt_id: '', grade: '', comment: '' })
      setSelectedAttempt(null)
    } catch (error) {
      console.error('Ошибка создания оценки:', error)
      alert('Ошибка создания оценки')
    }
  }

  const openGradeDialog = (attempt: TestAttempt) => {
    setSelectedAttempt(attempt)
    setGradeData({
      user_id: attempt.user_id.toString(),
      test_id: attempt.test_id.toString(),
      attempt_id: attempt.id.toString(),
      grade: '',
      comment: '',
    })
    setIsGradeDialogOpen(true)
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
          <h1 className="text-3xl font-bold">Управление тестами</h1>
          <Link href="/admin">
            <Button variant="outline">Назад</Button>
          </Link>
        </div>

        {/* Вкладки */}
        <div className="flex gap-4 mb-6 border-b">
          <button
            className={`pb-2 px-4 ${activeTab === 'tests' ? 'border-b-2 border-primary' : ''}`}
            onClick={() => setActiveTab('tests')}
          >
            Тесты
          </button>
          <button
            className={`pb-2 px-4 ${activeTab === 'attempts' ? 'border-b-2 border-primary' : ''}`}
            onClick={() => setActiveTab('attempts')}
          >
            Попытки
          </button>
        </div>

        {/* Список тестов */}
        {activeTab === 'tests' && (
          <>
            <div className="mb-6">
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => {
                  setEditingTest(null)
                  setFormData({ lesson_id: '', title: '', description: '', type: 'single', questions: [] })
                }}>
                  Создать тест
                </Button>
              </DialogTrigger>
                <DialogContent className="max-w-[95vw] sm:max-w-4xl max-h-[90vh] overflow-y-auto w-full">
                  <DialogHeader>
                    <DialogTitle>Создать тест</DialogTitle>
                    <DialogDescription>
                      Создайте тест с вопросами и вариантами ответов
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="lesson_id">Урок *</Label>
                      <select
                        id="lesson_id"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        value={formData.lesson_id}
                        onChange={(e) => setFormData({ ...formData, lesson_id: e.target.value })}
                        required
                      >
                        <option value="">Выберите урок</option>
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
                        placeholder="Название теста"
                      />
                    </div>
                    <div>
                      <Label htmlFor="description">Описание</Label>
                      <textarea
                        id="description"
                        className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Описание теста (необязательно)"
                      />
                    </div>
                    <div>
                      <Label htmlFor="type">Тип теста</Label>
                      <select
                        id="type"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        value={formData.type}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value as 'single' | 'multiple' })}
                      >
                        <option value="single">Один правильный ответ</option>
                        <option value="multiple">Несколько правильных ответов</option>
                      </select>
                    </div>
                    
                    <div className="border-t pt-4">
                      <div className="flex justify-between items-center mb-4">
                        <Label className="text-lg font-semibold">Вопросы</Label>
                        <Button type="button" onClick={addQuestion} variant="outline" size="sm">
                          + Добавить вопрос
                        </Button>
                      </div>
                      
                      <div className="space-y-6">
                        {formData.questions.map((question, qIndex) => (
                          <div key={qIndex} className="border-2 border-primary/20 rounded-lg p-4 space-y-4">
                            <div className="flex justify-between items-start">
                              <h4 className="font-semibold">Вопрос {qIndex + 1}</h4>
                              <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                onClick={() => removeQuestion(qIndex)}
                              >
                                Удалить
                              </Button>
                            </div>
                            
                            <div>
                              <Label>Текст вопроса *</Label>
                              <Input
                                value={question.question}
                                onChange={(e) => updateQuestion(qIndex, 'question', e.target.value)}
                                placeholder="Введите вопрос"
                              />
                            </div>
                            
                            <div>
                              <div className="flex justify-between items-center mb-2">
                                <Label>Варианты ответов *</Label>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => updateQuestion(qIndex, 'addOption', null)}
                                >
                                  + Вариант
                                </Button>
                              </div>
                              <div className="space-y-2">
                                {question.options.map((option, oIndex) => (
                                  <div key={oIndex} className="flex gap-2 items-center">
                                    <input
                                      type={formData.type === 'multiple' ? 'checkbox' : 'radio'}
                                      name={`correct-${qIndex}`}
                                      checked={question.correct_answer === oIndex}
                                      onChange={() => updateQuestion(qIndex, 'correct_answer', oIndex)}
                                      className="w-5 h-5"
                                    />
                                    <Input
                                      value={option}
                                      onChange={(e) => {
                                        const newOptions = [...question.options]
                                        newOptions[oIndex] = e.target.value
                                        updateQuestion(qIndex, 'options', newOptions)
                                      }}
                                      placeholder={`Вариант ${oIndex + 1}`}
                                      className="flex-1"
                                    />
                                    {question.options.length > 2 && (
                                      <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => updateQuestion(qIndex, 'removeOption', oIndex)}
                                      >
                                        ×
                                      </Button>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        ))}
                        
                        {formData.questions.length === 0 && (
                          <p className="text-muted-foreground text-center py-8">
                            Нажмите "Добавить вопрос" чтобы создать первый вопрос
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Отмена
                    </Button>
                    <Button onClick={handleCreateTest}>Создать</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tests.map((test) => (
                <Card key={test.id}>
                  <CardHeader>
                    <CardTitle>{test.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Button
                      variant="destructive"
                      onClick={() => handleDeleteTest(test.id)}
                      className="w-full"
                    >
                      Удалить
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}

        {/* Список попыток */}
        {activeTab === 'attempts' && (
          <div className="space-y-4">
            {attempts.map((attempt) => (
              <Card key={attempt.id}>
                <CardHeader>
                  <CardTitle>
                    Тест: {attempt.test?.title || 'Неизвестный тест'}
                  </CardTitle>
                  <CardDescription>
                    Пользователь ID: {attempt.user_id} | Балл: {attempt.score.toFixed(1)}%
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button onClick={() => openGradeDialog(attempt)}>
                    Выставить оценку
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Диалог выставления оценки */}
        <Dialog open={isGradeDialogOpen} onOpenChange={setIsGradeDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Выставить оценку</DialogTitle>
              <DialogDescription>
                Оцените попытку прохождения теста
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="grade">Оценка</Label>
                <Input
                  id="grade"
                  type="number"
                  step="0.1"
                  value={gradeData.grade}
                  onChange={(e) => setGradeData({ ...gradeData, grade: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="comment">Комментарий</Label>
                <textarea
                  id="comment"
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={gradeData.comment}
                  onChange={(e) => setGradeData({ ...gradeData, comment: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsGradeDialogOpen(false)}>
                Отмена
              </Button>
              <Button onClick={handleCreateGrade}>Выставить</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}

