# DevFest Hackathon Frontend

Клиентская часть приложения для автоматизации финансового учета и аналитики с использованием AI (Gemini). Разработано в рамках хакатона DevFest.

## 🚀 Технологический стек

- **Core:** [React 19](https://react.dev/), [TypeScript](https://www.typescriptlang.org/), [Vite](https://vitejs.dev/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/), [Tailwindcss-animate](https://github.com/jamiebuilds/tailwindcss-animate)
- **UI Components:** [Shadcn UI](https://ui.shadcn.com/) (Radix UI primitives)
- **Icons:** [Lucide React](https://lucide.dev/), [React Icons](https://react-icons.github.io/react-icons/)
- **Charts:** [Recharts](https://recharts.org/)
- **Routing:** [React Router DOM](https://reactrouter.com/)
- **Animations:** [Framer Motion](https://www.framer.com/motion/)

## 🛠 Установка и запуск

### Предварительные требования
- Node.js (версия 18+ рекомендуется)
- Yarn или npm

### Шаги для запуска

1. **Клонируйте репозиторий** (если еще не сделали):
   ```bash
   git clone <repository-url>
   cd client
   ```

2. **Установите зависимости:**
   ```bash
   yarn install
   # или
   npm install
   ```

3. **Запустите режим разработки:**
   ```bash
   yarn dev
   # или
   npm run dev
   ```
   Приложение будет доступно по адресу: `http://localhost:5173`

## 📜 Скрипты

- `yarn dev` - Запуск локального сервера разработки.
- `yarn build` - Сборка проекта для продакшена (TypeScript компиляция + Vite build).
- `yarn lint` - Проверка кода линтером (ESLint).
- `yarn preview` - Предпросмотр собранного приложения.

## 📂 Структура проекта

```
client/
├── public/             # Статические файлы
├── src/
│   ├── api/            # API клиенты (Auth, Employees, Reports, Rag, Transactions)
│   ├── assets/         # Изображения и другие ассеты
│   ├── components/     # React компоненты
│   │   ├── features/   # Компоненты, специфичные для бизнес-логики (Charts, Forms, Header)
│   │   └── ui/         # Переиспользуемые UI компоненты (Button, Input, Card и т.д.)
│   ├── context/        # React Context (AuthContext)
│   ├── lib/            # Утилиты (utils.ts)
│   ├── mocks/          # Моковые данные
│   ├── pages/          # Страницы приложения (Home, Employees, Documents, Login)
│   ├── App.tsx         # Корневой компонент с роутингом
│   └── main.tsx        # Точка входа
├── index.html
├── tailwind.config.js  # Конфигурация Tailwind
├── tsconfig.json       # Конфигурация TypeScript
└── vite.config.ts      # Конфигурация Vite
```

## ✨ Основной функционал

1.  **Дашборд (Home):**
    *   Визуализация финансовых показателей (Доходы, Расходы, Налоги, Зарплаты).
    *   Графики динамики выручки и распределения расходов.
    *   AI-чат для аналитики и вопросов по документам (RAG).

2.  **Управление сотрудниками (Employees):**
    *   Список сотрудников с поиском и фильтрацией.
    *   Добавление новых сотрудников.
    *   Интеграция с базой знаний для AI (автоматическое добавление данных о сотрудниках в контекст).

3.  **Документы и Отчеты (Documents):**
    *   Загрузка финансовых документов (Excel, PDF, JSON).
    *   Автоматический анализ содержимого через Google Gemini.
    *   Классификация транзакций (Доход/Расход/Налог/Зарплата).

4.  **Аутентификация:**
    *   Регистрация и Вход.
    *   JWT авторизация.
    *   Разделение данных по пользователям (Multi-tenancy).

5.  **UI/UX:**
    *   Адаптивный дизайн.
    *   Переключение тем (Светлая/Темная).

## 🔧 Конфигурация

API URL по умолчанию настроен на `http://localhost:3000`.
Для изменения адреса бэкенда отредактируйте константу `API_URL` в файлах директории `src/api/`.

