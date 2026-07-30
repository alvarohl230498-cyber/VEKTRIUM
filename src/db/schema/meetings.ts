import { pgTable, uuid, text, timestamp, pgEnum, boolean, index, unique } from 'drizzle-orm/pg-core'
import { MEETING_TYPES } from '@/data/types'
import { clients, contacts } from './clients'
import { projects } from './projects'
import { users } from './users'

// pgEnum exige una tupla no vacia. MEETING_TYPES es `as const`, asi que se afirma su forma.
export const meetingTypeEnum = pgEnum('meeting_type', MEETING_TYPES as unknown as [string, ...string[]])
export const meetingSyncStatusEnum = pgEnum('meeting_sync_status', [
  'pendiente',
  'sincronizada',
  'fallida',
])
export const attendeeResponseEnum = pgEnum('attendee_response', [
  'pendiente',
  'aceptado',
  'declinado',
])

export const meetings = pgTable(
  'meetings',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    clientId: uuid('client_id')
      .notNull()
      .references(() => clients.id, { onDelete: 'restrict' }),
    projectId: uuid('project_id').references(() => projects.id, { onDelete: 'set null' }),
    type: meetingTypeEnum('type').notNull(),
    title: text('title').notNull(),
    agenda: text('agenda').notNull(),
    startsAt: timestamp('starts_at', { withTimezone: true }).notNull(),
    endsAt: timestamp('ends_at', { withTimezone: true }).notNull(),
    organizerId: uuid('organizer_id')
      .notNull()
      .references(() => users.id, { onDelete: 'restrict' }),
    isMock: boolean('is_mock').notNull().default(true),
    meetUrl: text('meet_url'),
    providerEventId: text('provider_event_id'),
    // Clave de idempotencia: garantiza que un reintento de creacion no duplique la reunion.
    requestId: text('request_id').notNull(),
    syncStatus: meetingSyncStatusEnum('sync_status').notNull().default('pendiente'),
    syncError: text('sync_error'),
    hasMinutes: boolean('has_minutes').notNull().default(false),
    isIllustrative: boolean('is_illustrative').notNull().default(false),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    unique('meetings_request_id_uq').on(t.requestId),
    index('meetings_client_id_idx').on(t.clientId),
    index('meetings_project_id_idx').on(t.projectId),
    index('meetings_organizer_id_idx').on(t.organizerId),
    index('meetings_starts_at_idx').on(t.startsAt),
  ],
)

export const meetingAttendees = pgTable(
  'meeting_attendees',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    meetingId: uuid('meeting_id')
      .notNull()
      .references(() => meetings.id, { onDelete: 'cascade' }),
    userId: uuid('user_id').references(() => users.id, { onDelete: 'set null' }),
    contactId: uuid('contact_id').references(() => contacts.id, { onDelete: 'set null' }),
    email: text('email').notNull(),
    fullName: text('full_name').notNull(),
    response: attendeeResponseEnum('response').notNull().default('pendiente'),
  },
  (t) => [
    index('meeting_attendees_meeting_id_idx').on(t.meetingId),
    index('meeting_attendees_user_id_idx').on(t.userId),
    index('meeting_attendees_contact_id_idx').on(t.contactId),
  ],
)
