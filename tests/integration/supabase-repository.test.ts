import { describe, it, expect, beforeAll, afterAll } from 'vitest'
// Orden de imports deliberado: helpers/db carga .env (incluida DATABASE_URL_APP)
// como efecto de modulo ANTES de que se evalue src/db/client.ts (importado
// transitivamente por supabase/store), que lee esa variable en su propio
// top-level. Invertir el orden rompe la conexion.
import { adminSql, closeDb } from './helpers/db'
import { createSupabaseRepository } from '@/data/supabase/store'

/**
 * Contraparte funcional de tests/integration/rls/rls.test.ts: aquella prueba
 * que las politicas RLS no tienen huecos; esta prueba que la implementacion
 * real de VektriumRepository (src/data/supabase/store.ts) reproduce la
 * logica de negocio de src/data/memory/store.ts contra el esquema real —
 * transiciones de estado, generacion de codigo de proyecto, creacion de las
 * 9 fases al convertir, persistencia de asistentes de reunion.
 *
 * Actua como un unico usuario FOUNDER_ADMIN (alcance 'all' en casi todas las
 * politicas) para que el foco quede en la logica de negocio, no en RLS —
 * eso ya lo cubre la otra bateria.
 */

const OWNER = '00000000-0000-4000-8000-000000000101'

let clientId = ''
let opportunityId = ''
let projectId = ''
let taskId = ''
let meetingId = ''

const repo = createSupabaseRepository(OWNER)

beforeAll(async () => {
  await adminSql`
    insert into users (id, email, full_name, role) values
      (${OWNER}, 'owner-supabase-repo-test@vektrium.test', 'Owner Supabase Repo Test', 'FOUNDER_ADMIN')
    on conflict (id) do nothing
  `
})

afterAll(async () => {
  if (meetingId) await adminSql`delete from meeting_attendees where meeting_id = ${meetingId}`
  if (meetingId) await adminSql`delete from meetings where id = ${meetingId}`
  if (taskId) await adminSql`delete from tasks where id = ${taskId}`
  if (projectId) await adminSql`delete from project_phases where project_id = ${projectId}`
  if (projectId) await adminSql`delete from projects where id = ${projectId}`
  if (opportunityId) await adminSql`delete from opportunities where id = ${opportunityId}`
  if (clientId) await adminSql`delete from clients where id = ${clientId}`
  await adminSql`delete from users where id = ${OWNER}`
  await closeDb()
})

describe('Supabase repository — clientes', () => {
  it('createClient inserta y devuelve el cliente creado', async () => {
    const client = await repo.createClient({
      legalName: 'Repo Test S.A.C.',
      tradeName: 'Repo Test',
      ruc: '20601234599',
      industry: 'Tecnologia',
      size: 'pequena',
      city: 'Lima',
      country: 'Peru',
      confidentiality: 'interno',
    })
    clientId = client.id

    expect(client.legalName).toBe('Repo Test S.A.C.')
    expect(client.isIllustrative).toBeUndefined()
    expect(typeof client.createdAt).toBe('string')

    const fetched = await repo.getClientById(client.id)
    expect(fetched?.id).toBe(client.id)
  })
})

describe('Supabase repository — oportunidades y conversion a proyecto', () => {
  it('createOpportunity crea con status nuevo_lead y expectedAmount numerico', async () => {
    const opportunity = await repo.createOpportunity({
      clientId,
      title: 'Oportunidad de prueba del repositorio',
      expectedAmount: 1234.5,
      ownerId: OWNER,
    })
    opportunityId = opportunity.id

    expect(opportunity.status).toBe('nuevo_lead')
    expect(opportunity.expectedAmount).toBe(1234.5)
    expect(typeof opportunity.expectedAmount).toBe('number')
  })

  it('updateOpportunityStatus rechaza una transicion invalida', async () => {
    // nuevo_lead -> ganado no es una transicion valida (ver domain/state-machines.ts).
    const result = await repo.updateOpportunityStatus(opportunityId, 'ganado', {})
    expect(result).not.toBeNull()
    expect(result?.ok).toBe(false)
    if (result && !result.ok) {
      expect(result.error.code).toBe('TRANSICION_INVALIDA')
    }
  })

  it('updateOpportunityStatus devuelve null si la oportunidad no existe', async () => {
    const result = await repo.updateOpportunityStatus(
      '00000000-0000-4000-9000-000000000000',
      'contactado',
      {},
    )
    expect(result).toBeNull()
  })

  it(
    'camina la oportunidad hasta un estado desde el que "ganado" es valido',
    async () => {
      // Cinco transiciones secuenciales, cada una su propia transaccion de
      // red contra Supabase: el timeout por defecto de Vitest (5s) no alcanza.
      for (const to of ['contactado', 'diagnostico_agendado', 'diagnostico_realizado', 'preparando_propuesta', 'propuesta_enviada'] as const) {
        const result = await repo.updateOpportunityStatus(opportunityId, to, {})
        expect(result?.ok).toBe(true)
      }
      const opportunity = await repo.getOpportunityById(opportunityId)
      expect(opportunity?.status).toBe('propuesta_enviada')
    },
    15000,
  )

  it('convertOpportunityToProject crea el proyecto con sus 9 fases y marca la oportunidad como ganado', async () => {
    const result = await repo.convertOpportunityToProject(opportunityId, {
      name: 'Proyecto de prueba del repositorio',
      ownerId: OWNER,
      startDate: '2026-08-01',
      targetDate: '2026-12-01',
    })

    expect(result).not.toBeNull()
    if (!result || !result.ok) throw new Error('La conversion debio tener exito')

    projectId = result.value.id
    expect(result.value.code).toMatch(/^VK-\d{4}$/)
    expect(result.value.phases).toHaveLength(9)
    expect(result.value.phases.every((p) => p.tasks.length === 0)).toBe(true)
    expect([...result.value.phases].sort((a, b) => a.order - b.order).map((p) => p.order)).toEqual([
      0, 1, 2, 3, 4, 5, 6, 7, 8,
    ])

    const opportunity = await repo.getOpportunityById(opportunityId)
    expect(opportunity?.status).toBe('ganado')

    const withPhases = await repo.getProjectWithPhases(projectId)
    expect(withPhases?.phases).toHaveLength(9)
  })
})

describe('Supabase repository — tareas', () => {
  it('mueve una tarea a traves de transiciones validas e invalidas', async () => {
    const withPhases = await repo.getProjectWithPhases(projectId)
    const firstPhase = withPhases?.phases[0]
    if (!firstPhase) throw new Error('El proyecto de prueba deberia tener fases')

    const [taskRow] = await adminSql`
      insert into tasks (project_id, phase_id, title, assignee_id)
      values (${projectId}, ${firstPhase.id}, 'Tarea de prueba del repositorio', ${OWNER})
      returning id
    `
    if (!taskRow) throw new Error('No se pudo crear la tarea de prueba')
    taskId = taskRow.id

    const started = await repo.moveTask(taskId, 'en_progreso')
    expect(started?.status).toBe('en_progreso')

    // en_progreso -> lista_para_iniciar no es una transicion valida.
    const invalid = await repo.moveTask(taskId, 'lista_para_iniciar')
    expect(invalid).toBeNull()

    const completed = await repo.moveTask(taskId, 'completada')
    expect(completed?.status).toBe('completada')
    expect(completed?.completedAt).not.toBeNull()
  })

  it('moveTask devuelve null si la tarea no existe', async () => {
    const result = await repo.moveTask('00000000-0000-4000-9000-000000000000', 'en_progreso')
    expect(result).toBeNull()
  })
})

describe('Supabase repository — reuniones', () => {
  it('createMeeting persiste la reunion y sus asistentes', async () => {
    const startsAt = new Date().toISOString()
    const endsAt = new Date(Date.now() + 60 * 60 * 1000).toISOString()

    const meeting = await repo.createMeeting({
      clientId,
      projectId,
      type: 'reunion_interna',
      title: 'Reunion de prueba del repositorio',
      agenda: 'Verificar que la implementacion Supabase persiste asistentes correctamente.',
      startsAt,
      endsAt,
      organizerId: OWNER,
      isMock: true,
      meetUrl: null,
      providerEventId: null,
      requestId: `repo-test-${Date.now()}`,
      syncStatus: 'sincronizada',
      syncError: null,
      hasMinutes: false,
      notes: null,
      attendees: [
        { userId: OWNER, contactId: null, email: 'owner-supabase-repo-test@vektrium.test', fullName: 'Owner Supabase Repo Test', response: 'aceptado' },
      ],
    })
    meetingId = meeting.id

    expect(meeting.attendees).toHaveLength(1)
    expect(meeting.attendees[0]?.userId).toBe(OWNER)

    const meetings = await repo.listMeetings()
    const persisted = meetings.find((m) => m.id === meetingId)
    expect(persisted?.attendees).toHaveLength(1)
  })

  it('updateMeetingStatus actualiza solo los campos presentes en el patch', async () => {
    const updated = await repo.updateMeetingStatus(meetingId, {
      syncStatus: 'fallida',
      syncError: 'Error simulado de prueba',
    })
    expect(updated?.syncStatus).toBe('fallida')
    expect(updated?.syncError).toBe('Error simulado de prueba')
    // meetUrl no vino en el patch: debe conservar su valor anterior (null).
    expect(updated?.meetUrl).toBeNull()
  })

  it('updateMeetingStatus devuelve null si la reunion no existe', async () => {
    const result = await repo.updateMeetingStatus('00000000-0000-4000-9000-000000000000', {
      syncStatus: 'sincronizada',
    })
    expect(result).toBeNull()
  })
})
