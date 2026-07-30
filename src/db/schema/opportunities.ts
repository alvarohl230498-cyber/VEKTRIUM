import { pgTable, uuid, text, timestamp, pgEnum, boolean, numeric, index } from 'drizzle-orm/pg-core'
import { OPPORTUNITY_STATUSES } from '@/domain/state-machines'
import { clients } from './clients'
import { users } from './users'

// pgEnum exige una tupla no vacia. OPPORTUNITY_STATUSES es `as const`, asi que se afirma su forma.
export const opportunityStatusEnum = pgEnum(
  'opportunity_status',
  OPPORTUNITY_STATUSES as unknown as [string, ...string[]],
)

export const opportunities = pgTable(
  'opportunities',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    // Regla 7: nunca se elimina el historial comercial, de ahi el restrict.
    clientId: uuid('client_id')
      .notNull()
      .references(() => clients.id, { onDelete: 'restrict' }),
    title: text('title').notNull(),
    status: opportunityStatusEnum('status').notNull().default('nuevo_lead'),
    lossReason: text('loss_reason'),
    expectedAmount: numeric('expected_amount').notNull(),
    ownerId: uuid('owner_id')
      .notNull()
      .references(() => users.id, { onDelete: 'restrict' }),
    isIllustrative: boolean('is_illustrative').notNull().default(false),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index('opportunities_client_id_idx').on(t.clientId),
    index('opportunities_status_idx').on(t.status),
    index('opportunities_owner_id_idx').on(t.ownerId),
  ],
)
