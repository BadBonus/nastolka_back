// import {
//   pgTable,
//   serial,
//   text,
//   timestamp,
//   varchar,
//   jsonb,
// } from 'drizzle-orm/pg-core';
// import type { TSubscription } from './users.types';
// import type { TTimezone } from '@/shared/types/utils';
// import type { TDataAvaCalendar } from '@/shared/types/gameShedule';
// import type { TSoclinksObject, TGameHistory } from '@/shared/types/global';

// export const users = pgTable('users', {
//   id: serial('id').primaryKey(),
//   fullName: text('full_name'),
//   nickname: text('nickname').notNull(),
//   email: text('email').notNull().unique(),
//   description: text('description'),
//   birthdate: timestamp('birthdate', { mode: 'date' }),
//   slug: varchar('slug', { length: 256 }).notNull().unique(),
//   avatar: text('avatar_url'),
//   gamemaster: jsonb('gamemaster').default(null),
//   sub: jsonb('sub')
//     .$type<TSubscription>()
//     .default({ events: [], gamemasters: [] }),
//   timezone: varchar('timezone', { length: 100 })
//     .$type<TTimezone>()
//     .default('UTC'),
//   gameSchedule: jsonb('gameSchedule').$type<TDataAvaCalendar>(),
//   soclinks: jsonb('soclinks').$type<TSoclinksObject>(),
//   gameHistory: jsonb('gameHistory').$type<TGameHistory>().notNull().default([]),
// });

// // Тип для чтения пользователя (то, что возвращает SELECT)
// export type TUser = typeof users.$inferSelect;
