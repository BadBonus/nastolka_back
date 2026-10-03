# 0002 Подписки, уведомления, Redis и Telegram

## Статус

Принято

## Контекст

Нужна подписка пользователя на организатора (`Org`), in-app лента и доставка анонсов в Telegram. HTTP-запрос публикации ивента не должен ждать рассылку. Telegram ограничивает исходящие сообщения (~30/с). Черновик ивента (`PREPARE`) не должен уведомлять подписчиков.

Существующие Prisma-relations `User` / `Org` / `Event` не расширялись. Поле `User.sub` (JSON) не используется как источник подписок.

На хосте разработки порт 6379 занят чужим Redis с паролем.

## Решение

### Домен и схема

- `organizerId` в подписке — `Org.id`, не `User.id`. Фильтр ивентов `subscribedOnly` — `orgId IN (...)`.
- Модели без FK на существующие сущности: `UserSubscription`, `Notification` в `prisma/schema/subscription-notification.prisma`; `TelegramAccount`, `EventTelegramMessage` в `prisma/schema/telegram.prisma`. Telegram вынесен отдельно: канал будет использоваться не только для анонсов (сессии, управляющие команды).
- In-app запись (`notification.createMany`) только на переход `PREPARE → ACTIVE` (`PATCH /events/:id/publish`, событие `event.created`). `POST /events` уведомления не шлёт. `event.updated` / `event.cancelled` — только очередь Telegram (`editMessageText`).
- Публикация — отдельный эндпоинт, поле `status` в `UpdateEventDto` не открывается.

### Доставка

Поток: `EventService` → `EventEmitter2` (`event.created` / `event.updated` / `event.cancelled`) → `NotificationListener` → Postgres (in-app) и BullMQ `telegram-notifications` → worker Grammy.

- Очередь: **BullMQ** на **Redis 7**. Limiter 30 сообщений / 1000 мс. Retries с backoff; Telegram 403 → `TelegramAccount.isActive = false`, повтор не выполняется.
- Бот: **Grammy**, свой `TelegramModule`, long polling. Connect: `POST /telegram/connect-link` пишет токен в Redis TTL 5 минут; `/start <token>` сохраняет `telegramChatId`.
- Redis в docker-compose: `requirepass` из `REDIS_PASSWORD`, проброс хоста **6380→6379**. Клиент: `REDIS_HOST`, `REDIS_PORT`, `REDIS_PASSWORD`, опционально `REDIS_USERNAME`. Общий хелпер `getRedisConnectionOptions` типизирован как `ConnectionOptions` BullMQ (не `RedisOptions` ioredis).

### HTTP и каталог

- Subscription: `POST`/`DELETE /subscriptions/organizers/:organizerId`, `GET .../my`, `GET .../:organizerId/subscribers`.
- Notification: список, unread-count, mark read.
- Каталог оргов и публичный профиль (`GET /org`, `GET /org/:slug`): вычисляемое `isSubscribed` в DTO при optional JWT. Колонка в `Org` не добавляется — признак зависит от текущего пользователя.

## Рассмотренные альтернативы

- **Telegraf / nestjs-telegraf** — готовые Nest-декораторы. Отклонён: модуль бота всё равно кастомный (очередь, connect-токен); Grammy даёт более строгие типы.
- **RabbitMQ / Kafka** — избыточны для одной очереди с rate limit и retries.
- **Очередь и TTL только в PostgreSQL** — нет готового лимитера, блокировок job и автоистечения ключей.
- **In-memory Map в процессе Nest** — теряется при рестарте, не шарится между инстансами.
- **Уведомление при `POST /events`** — ложные анонсы черновиков.
- **`isSubscribed` / `isSubedOnHim` в `Org`** — не свойство организатора.
- **Список id подписок в `GET /auth/me`** — смешивает сессию и часто меняющееся отношение; для каталога достаточен флаг в ответе списка, полный список — `GET /subscriptions/organizers/my`.
- **Redis на 6379 без пароля** — конфликт с уже занятым инстансом; выбран порт 6380 и `requirepass`.

## Последствия

Положительные

- Публикация ивента не блокируется рассылкой
- In-app и Telegram развязаны: лента живёт без бота и без Redis на пути чтения
- Схема Telegram готова к расширению бота без смешивания с подписками
- Каталог оргов самодостаточен для маркировки подписки

Отрицательные

- Для enqueue и connect-токена обязателен доступный Redis; без него publish падает после записи in-app либо на постановке job
- Нет Prisma-integrity между подпиской и `Org`/`User` (модели без relation)
- Long polling бота в том же процессе API; webhook не внедрён
- `GET /auth/me` не содержит подписок: фронт каталога обязан слать JWT на `GET /org`
