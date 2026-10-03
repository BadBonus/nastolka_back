# 0001 Базовая архитектура и стек проекта

## Статус

Принято

## Контекст

Проект разрабатывался без фиксации ADR. Требуется зафиксировать исходное состояние архитектуры, используемый стек и ключевые решения на момент создания системы документации.

## Решение

### Основной фреймворк и язык программирования

HTTP API **Nastolka** — серверное приложение на **NestJS 11** (`@nestjs/core`, `@nestjs/common`, `@nestjs/platform-express`) и **TypeScript 5.7** (`strict`, `target: ES2023`, `module: CommonJS`). Точка входа — `src/main.ts`. Менеджер пакетов — **npm@11.18.0**. Сборка — **Nest CLI** (`nest build` → `dist/`, `nest-cli.json`, `sourceRoot: src`). В `devDependencies` есть `@swc/core` / `@swc/cli`; текущая конфигурация CLI не подключает SWC как компилятор.

HTTP-адаптер — Express. Глобально включены `ValidationPipe` (`whitelist`, `forbidNonWhitelisted`, `transform`) и `ClassSerializerInterceptor`. DTO валидируются **class-validator** / **class-transformer**, ответы сериализуются через `@Expose()` / `@Exclude()`. Контракт API документируется **Swagger** (`@nestjs/swagger`, UI на `/api/docs`, JSON на `/api/docs-json`). Снимок схемы выгружается скриптом `openapi:generate` в корневой `openapi.json`. Конфигурация — `@nestjs/config` и `.env`. CORS: `credentials: true`, origin `http://localhost:3000`. Статика загрузок — `/uploads`.

Сопутствующий стек: Passport JWT (`@nestjs/jwt`, `passport-jwt`), cookie (`cookie-parser`), почта (`@nestjs-modules/mailer`, Nodemailer), хеширование паролей **Argon2**, очереди **BullMQ** + Redis (`ioredis`), доменные события `@nestjs/event-emitter`, Telegram-бот **grammy**, обработка изображений **sharp** и **imgproxy**. Тесты — Jest + ts-jest, e2e — Supertest, интеграция БД в тестах — Testcontainers PostgreSQL. Линтинг — ESLint 9 + Prettier.

### Архитектура приложения и структура директорий

Модульный монолит NestJS. Корень сборки — `AppModule`. Доменные возможности оформлены как feature-модули: `*.module.ts`, `*.controller.ts`, `*.service.ts`, `dto/`. Импорты между модулями — алиасы `@/`, `@pGen/*`, `@common/*`, `@shared/*`. Prisma-клиент только из `@pGen/client` и `@pGen/enums`. Сгенерированный код в `src/shared/prisma/generated` не правится вручную.

Подключённые модули: Auth, Prisma, Mail, Profile, Uploads, Org, Event, Dictionary, Geo, Subscription, Notification, Telegram. `SupportModule` (WebSocket `/ws` через `@nestjs/platform-ws`) присутствует в коде и не импортирован в `AppModule`. Глобальный `LoggerMiddleware` вешается на все маршруты.

Потоки вне HTTP: доменные события событий (`@OnEvent`) → записи в `Notification` → постановка задач в очередь Telegram (`BullMQ`). JWT access token + refresh token в cookie; сессии хранятся в PostgreSQL.

Корневые каталоги:

| Путь                                     | Назначение                                                  |
| ---------------------------------------- | ----------------------------------------------------------- |
| `src/`                                   | Исходники приложения                                        |
| `src/auth/`                              | Регистрация, логин, JWT, почта                              |
| `src/profile/`, `src/org/`, `src/event/` | Профиль, организации, игровые события                       |
| `src/dictionary/`, `src/geo/`            | Справочники и геоданные                                     |
| `src/subscription/`, `src/notification/` | Подписки на организаторов и in-app уведомления              |
| `src/telegram/`                          | Бот Grammy, connect-токены, worker очереди                  |
| `src/support/`                           | WebSocket-шлюз поддержки (модуль отключён в `AppModule`)    |
| `src/prisma/`                            | Nest-обёртка Prisma (`PrismaService`, `PrismaModule`)       |
| `src/common/`                            | Guards, pipes, DTO пагинации, uploads, imgproxy, middleware |
| `src/shared/`                            | Сессии, токены, сгенерированный Prisma-клиент, общие типы   |
| `src/utils/`                             | Утилиты                                                     |
| `prisma/schema/`                         | Фрагментированная Prisma-схема                              |
| `prisma/migrations/`, `prisma/seeds/`    | Миграции и сиды                                             |
| `scripts/`                               | OpenAPI extract, пресеты imgproxy                           |
| `test/`                                  | e2e Jest                                                    |
| `uploads/`                               | Локальные файлы загрузок                                    |
| `docs/`                                  | ADR и инфраструктурные инструкции                           |
| `docker-compose.yml`                     | PostgreSQL 15, Redis 7, imgproxy, Adminer                   |

### СУБД, ORM или клиенты работы с данными

СУБД — **PostgreSQL 15** (`docker-compose`, сервис `db`). URL — `DATABASE_URL` в `prisma.config.ts`. ORM — **Prisma 7** (`prisma-client`, output в `src/shared/prisma/generated`). Драйвер — `pg` Pool + **`@prisma/adapter-pg`** (`PrismaPg` в `PrismaService`). JSON-поля типизируются `prisma-json-types-generator`.

Схема разбита по файлам в `prisma/schema/`: пользователи и аккаунты (`EMAIL` / `GOOGLE`), сессии, роли и права, организации, события, география, тикеты поддержки, Telegram-аккаунты, подписки, уведомления. Миграции — `prisma/migrations`. Сиды: права, мок-данные, гео (`seed:geo`).

Redis 7 — брокер **BullMQ** (очередь Telegram-уведомлений), не основное хранилище домена. Файлы — диск `uploads/` + подписи URL через imgproxy. Почта — SMTP. Клиентских драйверов MongoDB / TypeORM / Drizzle в репозитории нет.

### Состояние клиентской части и менеджеры состояний

Репозиторий — backend API. SPA, SSR, Pinia, Vuex и аналогов нет. Клиентское UI-состояние живёт во внешнем фронтенде (`FRONTEND_URL`, CORS на `localhost:3000`).

Серверное состояние:

- аутентификация: JWT access (Passport), refresh в cookie и таблице `Session`;
- уведомления: строки `Notification` в PostgreSQL;
- фоновые задачи: Redis / BullMQ;
- привязка Telegram: `TelegramAccount` и одноразовые connect-токены;
- WebSocket-комнаты поддержки: in-memory сервисы в `src/support/` (модуль не подключён).

Zod в зависимостях есть; контракт HTTP строится на class-validator DTO, не на Zod-схемах контроллеров.

## Рассмотренные альтернативы

Решение зафиксировано по факту существующего кода. Сравнение с альтернативами на этапе создания данного документа не проводилось.

## Последствия

Положительные

- Создана точка отсчета для нумерации последующих архитектурных решений
- Зафиксирован базлайн инфраструктуры

Отрицательные

- Ранее принятые архитектурные компромиссы внесены в документацию без анализа альтернатив
