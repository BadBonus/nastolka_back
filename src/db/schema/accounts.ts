import type { EAccProviders } from '@/shared/types/account';
import {
  pgTable,
  serial,
  text,
  integer,
  timestamp,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import { users } from './users';

export const accounts = pgTable(
  'accounts',
  {
    id: serial('id').primaryKey(),
    userId: integer('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }), // Если юзер удален, удаляем и доступы
    provider: text('provider')
      .$type<`${EAccProviders}`>()
      .notNull()
      .default('email'),
    providerAccountId: text('provider_account_id').notNull(),
    passwordHash: text('password_hash'), //только для провайдера 'email'
    createdAt: timestamp('created_at').defaultNow(),
  },
  (table) => [
    {
      // Уникальный индекс: один юзер не может иметь два аккаунта одного провайдера
      providerIdx: uniqueIndex('provider_idx').on(
        table.provider,
        table.providerAccountId,
      ),
    },
  ],
);

export const sessions = pgTable('sessions', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  refreshToken: text('refresh_token').notNull().unique(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});
