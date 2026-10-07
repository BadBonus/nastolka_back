# Формирование OpenAPI

Контракт HTTP API документируется OpenAPI 3.0 через `@nestjs/swagger`. Источник схемы — декораторы и DTO в runtime-приложении, не отдельный YAML/JSON, написанный вручную.

Снимок схемы хранится в корне репозитория: `openapi.json`. Файл коммитится. Потребители (фронтенд, генераторы клиентов, CI) читают файл из репозитория. Живой HTTP-эндпоинт словарей для этой цепочки не используется.

## Сборка документа в приложении

Точка входа — `src/main.ts`.

1. `DocumentBuilder` задаёт заголовок, описание, версию и схемы аутентификации (Bearer и при необходимости cookie).
2. `SwaggerModule.createDocument` обходит контроллеры и DTO. В `extraModels` передаются общие модели (пагинация, базовый query, реестр enum и т.п.), которые должны попасть в `components.schemas`, даже если ни один эндпоинт на них не ссылается напрямую.
3. `SwaggerModule.setup('api/docs', …)` поднимает UI на `/api/docs`. JSON-документ доступен на `/api/docs-json`.

Порт процесса — `process.env.PORT`. Скрипт выгрузки обращается к `http://localhost:<PORT>/api/docs-json`; значение `PORT` в npm-скрипте и в окружении должно совпадать.

## Аннотации и плагин компилятора

Схема в коде:

- контроллеры: `@ApiTags`, `@ApiOperation`, `@ApiOkResponse` / `@ApiResponse`, `@ApiBearerAuth`;
- DTO: `@ApiProperty` / `@ApiPropertyOptional`;
- ответы: классы с `@Expose()` / `@Exclude()`, сериализация `ClassSerializerInterceptor`.

Плагин `@nestjs/swagger` подключён в `nest-cli.json`:

- `classValidatorShim: true` — ограничения `class-validator` отражаются в схеме;
- `introspectComments: true` — JSDoc подмешивается в описания;
- суффиксы DTO: `.dto.ts`, `.response.ts`, `.types.ts`, `.entity.ts`.

Прикладные enum регистрируются отдельным DTO через `@ApiProperty({ enum, enumName })`. Класс входит в `extraModels`, поэтому имена схем стабильно присутствуют в `openapi.json`.

## Выгрузка `openapi.json`

Команда:

```bash
npm run openapi:generate
```

Цепочка в `package.json`:

```text
start-server-and-test start http://localhost:<PORT>/api/docs-json extract
```

Порядок:

1. `npm start` (`nest start`) поднимает полное приложение.
2. `start-server-and-test` опрашивает `GET http://localhost:<PORT>/api/docs-json` до успешного ответа.
3. Скрипт `npm run extract` скачивает JSON и пишет `./openapi.json` с отступом 2 пробела.
4. Процесс сервера завершается.

Генерация требует успешного bootstrap Nest (конфиг, БД и прочие зависимости корневого модуля). Статической сборки документа без HTTP-сервера нет.

## Зависимости

| Пакет | Роль в `package.json` | Назначение |
| --- | --- | --- |
| `@nestjs/swagger` | `dependencies` | `DocumentBuilder`, `SwaggerModule`, декораторы, CLI-плагин |
| `swagger-ui-dist` | `dependencies` | Статика Swagger UI для `/api/docs` |
| `class-validator` | `dependencies` | Валидация DTO; shim плагина в схему |
| `class-transformer` | `dependencies` | Трансформация DTO и сериализация ответов |
| `start-server-and-test` | `devDependencies` | Старт сервера, ожидание URL, запуск `extract`, останов |

Выгрузка использует встроенный `fetch` Node.js. Отдельный HTTP-клиент для `extract` не ставится.
