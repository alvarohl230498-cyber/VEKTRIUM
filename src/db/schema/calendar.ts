import { pgTable, uuid, text, timestamp, pgEnum, unique } from 'drizzle-orm/pg-core'
import { users } from './users'

export const calendarProviderEnum = pgEnum('calendar_provider', ['mock', 'google'])
export const connectionStatusEnum = pgEnum('connection_status', ['activa', 'expirada', 'revocada'])

export const calendarConnections = pgTable(
  'calendar_connections',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    provider: calendarProviderEnum('provider').notNull(),
    calendarId: text('calendar_id'),
    refreshTokenEncrypted: text('refresh_token_encrypted'),
    scopes: text('scopes').array(),
    status: connectionStatusEnum('status').notNull().default('activa'),
    lastSyncAt: timestamp('last_sync_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [unique('calendar_connections_user_provider_uq').on(t.userId, t.provider)],
)
