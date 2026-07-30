import { pgTable, uuid, text, timestamp, pgEnum, boolean, index } from 'drizzle-orm/pg-core'

export const clientSizeEnum = pgEnum('client_size', ['micro', 'pequena', 'mediana', 'grande'])
export const clientConfidentialityEnum = pgEnum('client_confidentiality', [
  'publico',
  'interno',
  'confidencial',
])

export const clients = pgTable('clients', {
  id: uuid('id').primaryKey().defaultRandom(),
  legalName: text('legal_name').notNull(),
  tradeName: text('trade_name'),
  ruc: text('ruc'),
  industry: text('industry').notNull(),
  size: clientSizeEnum('size').notNull(),
  city: text('city').notNull(),
  country: text('country').notNull().default('Peru'),
  confidentiality: clientConfidentialityEnum('confidentiality').notNull().default('interno'),
  isIllustrative: boolean('is_illustrative').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
})

export const contacts = pgTable(
  'contacts',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    clientId: uuid('client_id')
      .notNull()
      .references(() => clients.id, { onDelete: 'cascade' }),
    fullName: text('full_name').notNull(),
    position: text('position').notNull(),
    email: text('email').notNull(),
    phone: text('phone'),
    isPrimary: boolean('is_primary').notNull().default(false),
    isIllustrative: boolean('is_illustrative').notNull().default(false),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('contacts_client_id_idx').on(t.clientId)],
)
