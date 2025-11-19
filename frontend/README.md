# Frontend - Учебный портал по географии

Frontend приложение для учебного портала по географии, реализованное на Next.js с TypeScript, Tailwind CSS и Shadcn/UI.

## Структура проекта

```
frontend/
├── components/       # React компоненты
│   └── ui/          # UI Kit компоненты (Shadcn/UI)
├── context/         # React контексты (Auth, состояние)
├── pages/           # Страницы Next.js
├── services/        # Сервисы для работы с API
├── styles/          # Глобальные стили и переменные
├── lib/             # Утилиты
└── public/          # Статические файлы
```

## Требования

- Node.js 18 или выше
- npm или yarn

## Установка и запуск

1. Установите зависимости:
```bash
npm install
# или
yarn install
```

2. Создайте файл `.env.local` на основе `.env.example`:
```bash
cp .env.example .env.local
```

3. Настройте переменные окружения в `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1
```

4. Запустите dev сервер:
```bash
npm run dev
# или
yarn dev
```

Приложение будет доступно по адресу `http://localhost:3000`

## Сборка для production

```bash
npm run build
npm start
```

## Основные страницы

- `/` - Главная страница с навигацией и приветствием
- `/login` - Страница входа
- `/register` - Страница регистрации
- `/theory` - Теория (уроки, доклады, видео, факты)
- `/tests` - Тесты
- `/practices` - Практические задания
- `/profile` - Профиль пользователя
- `/admin` - Админ панель (только для администраторов)
- `/facts` - Лента фактов

## Компоненты

### UI Kit (Shadcn/UI)

Все компоненты находятся в `components/ui/`:
- `Button` - Кнопка с различными вариантами
- `Card` - Карточка для контента
- `Input` - Поле ввода
- `Label` - Метка для полей
- `Dialog` - Модальное окно

### Кастомные компоненты

Создавайте компоненты в `components/` для переиспользования:
- `LessonCard` - Карточка урока
- `TestCard` - Карточка теста
- `FactCard` - Карточка факта
- и т.д.

## Стили

### Переменные

Все переменные для цветов, размеров и шрифтов находятся в `styles/vars.css`:
- Цвета: `--primary`, `--secondary`, `--background`, и т.д.
- Размеры: `--spacing-*`, `--font-size-*`
- Радиус: `--radius`

### Использование

Используйте переменные через Tailwind классы:
```tsx
<div className="bg-primary text-primary-foreground p-4">
  Контент
</div>
```

## API сервисы

Все сервисы для работы с API находятся в `services/`:
- `auth.ts` - Авторизация
- `lessons.ts` - Уроки
- `tests.ts` - Тесты
- `practices.ts` - Практические задания
- `reports.ts` - Доклады
- `facts.ts` - Факты
- `videos.ts` - Видео

## Контексты

- `AuthContext` - Управление состоянием авторизации пользователя

Использование:
```tsx
import { useAuth } from '@/context/AuthContext'

const { user, isAuth, logout } = useAuth()
```

## Разработка

### Добавление нового компонента

1. Создайте файл в `components/` или `components/ui/`
2. Используйте переменные из `styles/vars.css`
3. Экспортируйте компонент
4. Импортируйте где нужно

### Добавление новой страницы

1. Создайте файл в `pages/`
2. Используйте существующие компоненты и сервисы
3. Добавьте навигацию если нужно

### Кастомизация стилей

Все стили настраиваются через:
- `tailwind.config.ts` - Конфигурация Tailwind
- `styles/vars.css` - CSS переменные

## Линтинг

```bash
npm run lint
```

