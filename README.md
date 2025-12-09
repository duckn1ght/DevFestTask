<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  # DevFest Hackathon Backend

Серверная часть приложения для автоматизации финансового учета и аналитики. Обеспечивает API для обработки документов, управления транзакциями, сотрудниками и взаимодействия с AI (Google Gemini).

## 🚀 Технологический стек

- **Framework:** [NestJS](https://nestjs.com/) (Node.js)
- **Database:** [PostgreSQL](https://www.postgresql.org/)
- **ORM:** [TypeORM](https://typeorm.io/)
- **AI & LLM:** [Google Gemini 2.5 Flash](https://deepmind.google/technologies/gemini/) (via `@google/genai`)
- **Caching:** [Redis](https://redis.io/)
- **Containerization:** [Docker](https://www.docker.com/) & Docker Compose
- **Documentation:** [Swagger](https://swagger.io/) (OpenAPI)

## 🏗 Архитектура

Проект построен по модульной архитектуре NestJS. Основные модули:

### 1. Core Modules
- **Auth:** Регистрация, вход, JWT-стратегии, Guards для защиты роутов.
- **Database:** Конфигурация подключения к PostgreSQL и Redis.
- **User:** Управление пользователями и профилями.

### 2. Feature Modules
- **Gemini (AI):**
  - Интеграция с Google Gemini API.
  - Анализ загруженных документов (Excel, PDF, JSON, Images).
  - Определение контекста документа (Revenue, Tax, Salary, Expense).
  - Извлечение структурированных данных о транзакциях.
- **RAG (Retrieval-Augmented Generation):**
  - Векторизация текста (Embeddings).
  - Сохранение чанков документов в базу данных.
  - Семантический поиск для ответов на вопросы пользователя по его документам.
- **Reports:** Агрегация финансовых данных, создание отчетов.
- **Transactions:** CRUD операции для транзакций.
- **Employees:** Управление базой сотрудников.

### 3. Multi-tenancy (Безопасность)
Реализована строгая изоляция данных. Все сущности (`Report`, `Transaction`, `Employee`, `Chunk`) привязаны к `User`. Доступ к данным возможен только при наличии валидного JWT токена соответствующего владельца.

## 🛠 Установка и запуск

### Предварительные требования
- Node.js (v18+)
- Docker & Docker Compose
- PostgreSQL (если запускаете без Docker)
- Redis (если запускаете без Docker)

### Настройка окружения

1. Создайте файл `.env` в корне папки `server` (используйте `example.env` как шаблон):
   ```env
   PORT=3000
   
   # Database
   POSTGRES_HOST=localhost
   POSTGRES_PORT=5432
   POSTGRES_USER=postgres
   POSTGRES_PASSWORD=postgres
   POSTGRES_DB=devfest_db
   
   # Redis
   REDIS_HOST=localhost
   REDIS_PORT=6379
   
   # Auth
   JWT_SECRET=your_super_secret_key
   
   # AI
   GEMINI_API_KEY=your_google_gemini_api_key
   ```

### Запуск через Docker (Рекомендуется)

Для быстрого развертывания базы данных и Redis:

```bash
# Запуск инфраструктуры (Postgres + Redis)
docker-compose -f dev-docker-compose.yaml up -d
```

### Локальный запуск сервера

1. **Установите зависимости:**
   ```bash
   yarn install
   ```

2. **Запустите сервер в режиме разработки:**
   ```bash
   yarn start:dev
   ```
   Сервер запустится на `http://localhost:3000`.

3. **Документация API:**
   После запуска Swagger доступен по адресу: `http://localhost:3000/api`

## 🧪 Тестирование

```bash
# Unit тесты
yarn test

# E2E тесты
yarn test:e2e
```

## 📝 Основные сценарии использования

1. **Загрузка документа:**
   - Пользователь загружает Excel/PDF через `POST /gemini/read-doc`.
   - Сервер определяет тип документа (Выручка/Налоги/Зарплата).
   - Gemini извлекает транзакции.
   - Транзакции сохраняются в БД и индексируются в RAG.

2. **Аналитика:**
   - `GET /reports/summary/aggregate` возвращает сводку по доходам/расходам.

3. **AI Ассистент:**
   - Пользователь задает вопрос ("Сколько налогов я заплатил в марте?").
   - `POST /rag/query` ищет релевантные чанки в базе знаний пользователя.
   - Gemini генерирует ответ на основе найденного контекста.


## Описание
Шаблон использует следующие инструменты:
* Swagger и Rapidoc для Документации
* TypeORM с PostgreSQL
* Redis для кэширование

## Структура проекта
* `src` - содержит весь исходный код
    
  * `const` - содержит константные значения
  * `database` - содержит все настройки связанные с базами данных
  * `features` - содержит директории модулей основной логики
* `test` - содержит файлы тестирования
* `uploads` - содержит статичные файлы, доступные по ссылке 

## Установка библиотек

```bash
yarn install
```

## Компиляция и запуск
### Запуск при разработке
```bash
yarn run start
```
### Запуск при разработке с watch режимом 
```bash
yarn run start:dev
```
### Запуск на проде
```bash
yarn run start:prod
```

## Запуск тестов

```bash
# unit tests
$ yarn run test

# e2e tests
$ yarn run test:e2e

# test coverage
$ yarn run test:cov
```

## Список установленных библиотек

```bash
@nestjs/typeorm typeorm @nestjs/config @nestjs/throttler @nestjs/cache-manager cache-manager cache-manager-redis-store pg @nestjs/swagger @nestjs/serve-static @nestjs/passport passport-jwt
```