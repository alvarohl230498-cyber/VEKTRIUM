import { pgTable, uuid, text, timestamp, pgEnum, index } from 'drizzle-orm/pg-core'
import { ROLES } from '@/domain/roles'

// pgEnum exige una tupla no vacia. ROLES es `as const`, asi que se afirma su forma.
export const roleEnum = pgEnum('role', ROLES as unknown as [string, ...string[]])
export const authorizedStatusEnum = pgEnum('authorized_status', ['pendiente', 'activo', 'revocado'])

export const users = pgTable('users', {
  id: uuid('id').primaryKey(),
  email: text('email').notNull().unique(),
  fullName: text('full_name'),
  role: roleEnum('role').notNull().default('VIEWER'),
  lastSeenAt: timestamp('last_seen_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

export const authorizedUsers = pgTable(
  'authorized_users',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    email: text('email').notNull().unique(),
    role: roleEnum('role').notNull(),
    status: authorizedStatusEnum('status').notNull().default('pendiente'),
    invitedBy: uuid('invited_by').references(() => users.id, { onDelete: 'restrict' }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('authorized_users_email_idx').on(t.email)],
)
