import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { adminSql, asUser, asAnonymous, closeDb } from '../helpers/db'

/**
 * Bateria de intentos de violacion de RLS contra el proyecto Supabase real.
 * El arreglo (fixtures) se hace con el rol admin (bypassa RLS); cada
 * afirmacion se hace con asUser(), que conecta como vektrium_app — el mismo
 * camino que usa la app en produccion — y revierte siempre al terminar.
 *
 * Si una politica tiene un hueco, alguno de estos tests lo demuestra
 * consiguiendo leer o escribir algo que no deberia. Ese es el punto.
 */

const ADMIN = '00000000-0000-4000-8000-000000000001'
const ALICE = '00000000-0000-4000-8000-000000000002' // COLLABORATOR, miembro de projectA
const BOB = '00000000-0000-4000-8000-000000000003' // COLLABORATOR, miembro de projectB
const PM = '00000000-0000-4000-8000-000000000004' // PROJECT_MANAGER, sin membresia

const CLIENT_A = '00000000-0000-4000-9000-00000000000a'
const CLIENT_B = '00000000-0000-4000-9000-00000000000b'
const PROJECT_A = '00000000-0000-4000-9000-00000000001a'
const PROJECT_B = '00000000-0000-4000-9000-00000000001b'
const PHASE_A = '00000000-0000-4000-9000-00000000002a'
const TASK_ALICE = '00000000-0000-4000-9000-00000000003a'
const TASK_UNASSIGNED = '00000000-0000-4000-9000-00000000003b'
const OPPORTUNITY_A = '00000000-0000-4000-9000-00000000004a'
const MEETING_A = '00000000-0000-4000-9000-00000000005a'

beforeAll(async () => {
  await adminSql`
    insert into users (id, email, full_name, role) values
      (${ADMIN}, 'admin-rls-test@vektrium.test', 'Admin RLS Test', 'FOUNDER_ADMIN'),
      (${ALICE}, 'alice-rls-test@vektrium.test', 'Alice RLS Test', 'COLLABORATOR'),
      (${BOB}, 'bob-rls-test@vektrium.test', 'Bob RLS Test', 'COLLABORATOR'),
      (${PM}, 'pm-rls-test@vektrium.test', 'PM RLS Test', 'PROJECT_MANAGER')
    on conflict (id) do nothing
  `

  await adminSql`
    insert into clients (id, legal_name, industry, size, city, is_illustrative) values
      (${CLIENT_A}, 'Cliente RLS Test A', 'Servicios', 'pequena', 'Lima', true),
      (${CLIENT_B}, 'Cliente RLS Test B', 'Servicios', 'pequena', 'Lima', true)
    on conflict (id) do nothing
  `

  await adminSql`
    insert into projects (id, code, client_id, name, owner_id, start_date, target_date, is_illustrative) values
      (${PROJECT_A}, 'RLS-TEST-A', ${CLIENT_A}, 'Proyecto RLS Test A', ${ADMIN}, now(), now(), true),
      (${PROJECT_B}, 'RLS-TEST-B', ${CLIENT_B}, 'Proyecto RLS Test B', ${ADMIN}, now(), now(), true)
    on conflict (id) do nothing
  `

  await adminSql`
    insert into project_members (project_id, user_id, role) values
      (${PROJECT_A}, ${ALICE}, 'COLLABORATOR'),
      (${PROJECT_B}, ${BOB}, 'COLLABORATOR')
    on conflict (project_id, user_id) do nothing
  `

  await adminSql`
    insert into project_phases (id, project_id, "order", name, description, is_illustrative) values
      (${PHASE_A}, ${PROJECT_A}, 0, 'Fase RLS Test', 'Fase de prueba', true)
    on conflict (id) do nothing
  `

  await adminSql`
    insert into tasks (id, project_id, phase_id, title, assignee_id, is_illustrative) values
      (${TASK_ALICE}, ${PROJECT_A}, ${PHASE_A}, 'Tarea de Alice', ${ALICE}, true),
      (${TASK_UNASSIGNED}, ${PROJECT_A}, ${PHASE_A}, 'Tarea sin asignar', null, true)
    on conflict (id) do nothing
  `

  await adminSql`
    insert into opportunities (id, client_id, title, expected_amount, owner_id, is_illustrative) values
      (${OPPORTUNITY_A}, ${CLIENT_A}, 'Oportunidad RLS Test', 1000, ${ADMIN}, true)
    on conflict (id) do nothing
  `

  await adminSql`
    insert into meetings (id, client_id, project_id, type, title, agenda, starts_at, ends_at, organizer_id, request_id, is_illustrative) values
      (${MEETING_A}, ${CLIENT_A}, ${PROJECT_A}, 'reunion_interna', 'Reunion RLS Test', 'Agenda de prueba', now(), now() + interval '1 hour', ${ADMIN}, 'rls-test-request-1', true)
    on conflict (id) do nothing
  `
})

afterAll(async () => {
  // Orden inverso a las dependencias.
  await adminSql`delete from meetings where id = ${MEETING_A}`
  await adminSql`delete from opportunities where id = ${OPPORTUNITY_A}`
  await adminSql`delete from tasks where project_id in (${PROJECT_A}, ${PROJECT_B})`
  await adminSql`delete from project_phases where project_id in (${PROJECT_A}, ${PROJECT_B})`
  await adminSql`delete from project_members where project_id in (${PROJECT_A}, ${PROJECT_B})`
  await adminSql`delete from projects where id in (${PROJECT_A}, ${PROJECT_B})`
  await adminSql`delete from clients where id in (${CLIENT_A}, ${CLIENT_B})`
  await adminSql`delete from users where id in (${ADMIN}, ${ALICE}, ${BOB}, ${PM})`
  await closeDb()
})

describe('RLS — proyectos y aislamiento por membresia', () => {
  it('Alice ve su propio proyecto', async () => {
    const rows = await asUser(ALICE, (tx) => tx`select id from projects where id = ${PROJECT_A}`)
    expect(rows).toHaveLength(1)
  })

  it('Alice NO ve el proyecto de Bob', async () => {
    const rows = await asUser(ALICE, (tx) => tx`select id from projects where id = ${PROJECT_B}`)
    expect(rows).toHaveLength(0)
  })

  it('Bob NO ve el proyecto de Alice', async () => {
    const rows = await asUser(BOB, (tx) => tx`select id from projects where id = ${PROJECT_A}`)
    expect(rows).toHaveLength(0)
  })

  it('FOUNDER_ADMIN ve ambos proyectos', async () => {
    const rows = await asUser(ADMIN, (tx) =>
      tx`select id from projects where id in (${PROJECT_A}, ${PROJECT_B})`,
    )
    expect(rows).toHaveLength(2)
  })

  it('una sesion sin identidad no ve ningun proyecto', async () => {
    const rows = await asAnonymous((tx) => tx`select id from projects`)
    expect(rows).toHaveLength(0)
  })
})

describe('RLS — clientes acotados por membresia de proyecto', () => {
  it('Alice ve el cliente de su proyecto', async () => {
    const rows = await asUser(ALICE, (tx) => tx`select id from clients where id = ${CLIENT_A}`)
    expect(rows).toHaveLength(1)
  })

  it('Alice NO ve el cliente del proyecto de Bob', async () => {
    const rows = await asUser(ALICE, (tx) => tx`select id from clients where id = ${CLIENT_B}`)
    expect(rows).toHaveLength(0)
  })

  it('PROJECT_MANAGER ve todos los clientes aunque no sea miembro de ningun proyecto', async () => {
    const rows = await asUser(PM, (tx) =>
      tx`select id from clients where id in (${CLIENT_A}, ${CLIENT_B})`,
    )
    expect(rows).toHaveLength(2)
  })
})

describe('RLS — fases visibles para todo miembro del proyecto', () => {
  it('Alice, COLLABORATOR, lee las fases de su proyecto', async () => {
    const rows = await asUser(ALICE, (tx) => tx`select id from project_phases where id = ${PHASE_A}`)
    expect(rows).toHaveLength(1)
  })

  it('Alice NO puede crear una fase (no es PM ni admin)', async () => {
    await expect(
      asUser(ALICE, (tx) =>
        tx`insert into project_phases (project_id, "order", name, description)
           values (${PROJECT_A}, 9, 'Fase intrusa', 'no deberia crearse')`,
      ),
    ).rejects.toThrow()
  })
})

describe('RLS — tareas: lectura por membresia, escritura por asignacion', () => {
  it('Alice puede actualizar la tarea que tiene asignada', async () => {
    const rows = await asUser(ALICE, (tx) =>
      tx`update tasks set title = 'Tarea de Alice (editada)' where id = ${TASK_ALICE} returning id`,
    )
    expect(rows).toHaveLength(1)
  })

  it('Alice NO puede actualizar una tarea sin asignar en su propio proyecto', async () => {
    const rows = await asUser(ALICE, (tx) =>
      tx`update tasks set title = 'intruso' where id = ${TASK_UNASSIGNED} returning id`,
    )
    // RLS filtra silenciosamente: el UPDATE afecta 0 filas, no lanza error.
    expect(rows).toHaveLength(0)
  })

  it('Bob no ve ninguna tarea del proyecto de Alice', async () => {
    const rows = await asUser(BOB, (tx) =>
      tx`select id from tasks where id in (${TASK_ALICE}, ${TASK_UNASSIGNED})`,
    )
    expect(rows).toHaveLength(0)
  })
})

describe('RLS — oportunidades: solo admin y PM, nunca se eliminan', () => {
  it('Alice, COLLABORATOR, no ve ninguna oportunidad', async () => {
    const rows = await asUser(ALICE, (tx) => tx`select id from opportunities where id = ${OPPORTUNITY_A}`)
    expect(rows).toHaveLength(0)
  })

  it('PM ve la oportunidad', async () => {
    const rows = await asUser(PM, (tx) => tx`select id from opportunities where id = ${OPPORTUNITY_A}`)
    expect(rows).toHaveLength(1)
  })

  it('ni siquiera FOUNDER_ADMIN puede eliminar una oportunidad via RLS', async () => {
    // No existe politica de DELETE en la tabla. Postgres no lanza error en
    // este caso: el DELETE se ejecuta pero afecta cero filas, igual que un
    // SELECT filtrado. El resultado practico es identico a un rechazo: la
    // oportunidad no desaparece. Se verifica ambas cosas.
    const deleted = await asUser(ADMIN, (tx) =>
      tx`delete from opportunities where id = ${OPPORTUNITY_A} returning id`,
    )
    expect(deleted).toHaveLength(0)

    const stillThere = await adminSql`select id from opportunities where id = ${OPPORTUNITY_A}`
    expect(stillThere).toHaveLength(1)
  })
})

describe('RLS — reuniones: miembros, asistentes y organizador', () => {
  it('Alice ve la reunion de su proyecto', async () => {
    const rows = await asUser(ALICE, (tx) => tx`select id from meetings where id = ${MEETING_A}`)
    expect(rows).toHaveLength(1)
  })

  it('Bob no ve la reunion del proyecto de Alice', async () => {
    const rows = await asUser(BOB, (tx) => tx`select id from meetings where id = ${MEETING_A}`)
    expect(rows).toHaveLength(0)
  })
})

describe('RLS — usuarios y autorizacion', () => {
  it('Alice ve su propia fila de usuario', async () => {
    const rows = await asUser(ALICE, (tx) => tx`select id from users where id = ${ALICE}`)
    expect(rows).toHaveLength(1)
  })

  it('Alice NO ve la fila de Bob', async () => {
    const rows = await asUser(ALICE, (tx) => tx`select id from users where id = ${BOB}`)
    expect(rows).toHaveLength(0)
  })

  it('Alice no puede otorgarse a si misma el rol FOUNDER_ADMIN', async () => {
    const rows = await asUser(ALICE, (tx) =>
      tx`update users set role = 'FOUNDER_ADMIN' where id = ${ALICE} returning id`,
    )
    expect(rows).toHaveLength(0)
  })

  it('Alice no puede escribir en authorized_users', async () => {
    await expect(
      asUser(ALICE, (tx) =>
        tx`insert into authorized_users (email, role, status) values ('intruso@test.com', 'FOUNDER_ADMIN', 'activo')`,
      ),
    ).rejects.toThrow()
  })
})
