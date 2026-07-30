import {
  pgTable,
  uuid,
  text,
  timestamp,
  date,
  pgEnum,
  boolean,
  numeric,
  integer,
  index,
  unique,
  type AnyPgColumn,
} from 'drizzle-orm/pg-core'
import { TASK_STATUSES } from '@/domain/progress'
import { clients } from './clients'
import { opportunities } from './opportunities'
import { roleEnum, users } from './users'

export const projectStatusEnum = pgEnum('project_status', ['activo', 'archivado'])
export const projectHealthEnum = pgEnum('project_health', ['sano', 'en_riesgo', 'critico'])
// pgEnum exige una tupla no vacia. TASK_STATUSES es `as const`, asi que se afirma su forma.
export const taskStatusEnum = pgEnum('task_status', TASK_STATUSES as unknown as [string, ...string[]])

export const projects = pgTable(
  'projects',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    code: text('code').notNull().unique(),
    clientId: uuid('client_id')
      .notNull()
      .references(() => clients.id, { onDelete: 'restrict' }),
    opportunityId: uuid('opportunity_id').references(() => opportunities.id, {
      onDelete: 'restrict',
    }),
    name: text('name').notNull(),
    status: projectStatusEnum('status').notNull().default('activo'),
    health: projectHealthEnum('health').notNull().default('sano'),
    healthReason: text('health_reason'),
    ownerId: uuid('owner_id')
      .notNull()
      .references(() => users.id, { onDelete: 'restrict' }),
    startDate: date('start_date').notNull(),
    targetDate: date('target_date').notNull(),
    // Cache derivado, ver domain/progress.ts. La fuente de verdad es el calculo, no esta columna.
    progressCached: numeric('progress_cached').notNull().default('0'),
    /**
     * Fase "actual" del tablero de proyectos (/os/proyectos, vista Tablero):
     * la fija a mano el equipo, sin relacion con el avance calculado de las
     * tareas (esa es una senal distinta, ver "Avance por fase"). Nullable
     * solo por seguridad referencial (ON DELETE SET NULL); en la practica
     * todo proyecto la tiene desde que se crea (ver convertOpportunityToProject).
     */
    currentPhaseId: uuid('current_phase_id').references((): AnyPgColumn => projectPhases.id, { onDelete: 'set null' }),
    isIllustrative: boolean('is_illustrative').notNull().default(false),
    archivedAt: timestamp('archived_at', { withTimezone: true }),
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index('projects_client_id_idx').on(t.clientId),
    index('projects_opportunity_id_idx').on(t.opportunityId),
    index('projects_owner_id_idx').on(t.ownerId),
    index('projects_status_idx').on(t.status),
    index('projects_current_phase_id_idx').on(t.currentPhaseId),
  ],
)

// Base de todas las politicas RLS: pertenencia a un proyecto.
export const projectMembers = pgTable(
  'project_members',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    projectId: uuid('project_id')
      .notNull()
      .references(() => projects.id, { onDelete: 'cascade' }),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    role: roleEnum('role').notNull(),
  },
  (t) => [
    unique('project_members_project_id_user_id_uq').on(t.projectId, t.userId),
    index('project_members_user_id_idx').on(t.userId),
  ],
)

export const projectPhases = pgTable(
  'project_phases',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    projectId: uuid('project_id')
      .notNull()
      .references(() => projects.id, { onDelete: 'cascade' }),
    order: integer('order').notNull(),
    name: text('name').notNull(),
    description: text('description').notNull(),
    weight: integer('weight').notNull().default(1),
    plannedStart: date('planned_start'),
    plannedEnd: date('planned_end'),
    isIllustrative: boolean('is_illustrative').notNull().default(false),
  },
  (t) => [index('project_phases_project_id_idx').on(t.projectId)],
)

export const tasks = pgTable(
  'tasks',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    projectId: uuid('project_id')
      .notNull()
      .references(() => projects.id, { onDelete: 'cascade' }),
    phaseId: uuid('phase_id')
      .notNull()
      .references(() => projectPhases.id, { onDelete: 'cascade' }),
    title: text('title').notNull(),
    status: taskStatusEnum('status').notNull().default('pendiente'),
    weight: integer('weight').notNull().default(1),
    assigneeId: uuid('assignee_id').references(() => users.id, { onDelete: 'set null' }),
    dueDate: date('due_date'),
    completedAt: timestamp('completed_at', { withTimezone: true }),
    isIllustrative: boolean('is_illustrative').notNull().default(false),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index('tasks_project_id_idx').on(t.projectId),
    index('tasks_phase_id_idx').on(t.phaseId),
    index('tasks_assignee_id_idx').on(t.assigneeId),
    index('tasks_due_date_idx').on(t.dueDate),
    index('tasks_status_idx').on(t.status),
  ],
)
