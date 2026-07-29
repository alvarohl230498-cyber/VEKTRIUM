# VEKTRIUM SP-0 (Fundación) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Dejar en pie la fundación de VEKTRIUM OS — repositorio, lógica de dominio probada, esquema de base de datos con RLS verificada, autenticación con Google y shell de navegación — de modo que SP-1 pueda construir la vertical sobre código existente y no sobre suposiciones.

**Architecture:** Cuatro capas con dependencias en un solo sentido: `app/` → `domain/` → `db/` + `integrations/` → Supabase. `domain/` es lógica pura sin I/O y concentra el grueso de las pruebas. La autorización se verifica dos veces: en la matriz tipada de `domain/permissions.ts` y en las políticas RLS de Postgres, con una batería de tests que intenta activamente saltárselas.

**Tech Stack:** Next.js 15 (App Router) · TypeScript estricto · Tailwind CSS · Drizzle ORM · Zod · Supabase (Postgres, Auth, Storage) · Vitest · Playwright · pnpm · Node 22 LTS · Docker (Postgres para tests de integración)

**Spec de referencia:** `docs/superpowers/specs/2026-07-29-vektrium-sp0-sp1-design.md`

---

## Prerrequisitos manuales (bloquean la Tarea 1)

Estos dos pasos los hace una persona, no un agente:

1. **Actualizar Node a 22 LTS.** El entorno tiene v18.17.0, por debajo del mínimo de Next 15.
   Verificar con `node --version` → debe imprimir `v22.x.x`.
2. **Crear el proyecto en Supabase** (plan gratuito) y anotar: `Project URL`, `anon key`,
   `service_role key` y la cadena de conexión de Postgres.

---

## Estructura de archivos

Mapa de responsabilidades. Cada archivo hace una cosa.

```
src/
  domain/                       lógica pura — sin imports de db/, integrations/ ni next/
    roles.ts                    enums de rol y acción, orden de scopes
    permissions.ts              matriz de permisos y función can()
    progress.ts                 cálculo de avance ponderado
    phases.ts                   plantilla de 9 fases VEKTRIUM
    state-machines.ts           transiciones válidas de proyecto, tarea y oportunidad
    result.ts                   tipo Result<T, E>
  db/
    schema/
      users.ts                  users, authorized_users
      calendar.ts               calendar_connections
      audit.ts                  audit_logs
      index.ts                  reexporta el esquema completo
    client.ts                   cliente Drizzle con la clave anon (respeta RLS)
    admin/
      client.ts                 cliente con service_role — PROHIBIDO importar desde app/
  lib/
    supabase/
      server.ts                 cliente Supabase para Server Components y Actions
      middleware.ts             refresco de sesión
  app/
    layout.tsx                  layout raíz, fuentes, tema
    page.tsx                    redirección a /os
    login/page.tsx              pantalla de acceso
    auth/callback/route.ts      intercambio de código OAuth
    os/
      layout.tsx                shell: barra lateral + encabezado
      page.tsx                  inicio (placeholder de SP-1)
  components/
    shell/sidebar.tsx
    shell/header.tsx
tests/
  unit/                         Vitest sobre domain/
  integration/                  Vitest contra Postgres en Docker
    helpers/db.ts               conexión y utilidades de transacción
    rls/                        batería de intentos de violación de RLS
  structure/imports.test.ts     verifica que db/admin no sea alcanzable desde app/
supabase/migrations/            SQL versionado
scripts/backup.sh               pg_dump programado
docker-compose.test.yml         Postgres efímero para integración
```

---

## Task 1: Bootstrap del repositorio

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.ts`, `.env.example`
- Create: `src/app/layout.tsx`, `src/app/page.tsx`

- [ ] **Step 1: Verificar la versión de Node**

Run: `node --version`
Expected: `v22.x.x`. Si imprime v18 o v20, **detenerse** — el prerrequisito no está cumplido.

- [ ] **Step 2: Crear el proyecto Next.js**

```bash
pnpm dlx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-pnpm
```

Responder `No` si pregunta por sobrescribir archivos existentes distintos de los generados
(`.gitignore` y `docs/` ya existen y deben conservarse).

**Correcciones verificadas durante la ejecución (2026-07-29):**

- **`--no-turbopack` no existe** en el CLI actual de `create-next-app`. Comprobado con `--help`:
  el único conmutador de bundler es `--rspack`. Para evitar Turbopack se añade `--webpack` a los
  scripts `dev` y `build` de `package.json`.
- **Turbopack falla en este equipo** con `El sistema no puede encontrar la ruta especificada`
  (OS error 3) al lanzar sus procesos agrupados, por la ruta del proyecto con espacios. De ahí que
  `--webpack` no sea preferencia sino necesidad.
- **`@latest` resuelve a Next.js 16.2.12 con React 19.2.4**, no a Next 15. Se acepta: es la versión
  vigente y compila. **La Tarea 12 debe verificarse contra las APIs de Next 16** antes de darse por
  buena, no asumir las de 15.
- **El nombre del directorio rompe las reglas de npm** (espacios y mayúsculas). `create-next-app`
  se ejecuta en un subdirectorio temporal y los archivos se mueven arriba. Tras moverlos hay que
  borrar `node_modules` y reinstalar: las junctions de pnpm en Windows guardan rutas absolutas.
- **`pnpm build` corre bajo Node 18 en silencio** salvo que `scripts/use-node.sh` exporte también
  el directorio real de fnm a la variable nativa `Path` de Windows. pnpm lanza los scripts vía
  `cmd.exe`, que no resuelve ejecutables a través del symlink «multishell» de fnm.

- [ ] **Step 3: Endurecer la configuración de TypeScript**

Reemplazar el bloque `compilerOptions` de `tsconfig.json` añadiendo estas claves:

```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,
    "noFallthroughCasesInSwitch": true,
    "exactOptionalPropertyTypes": true
  }
}
```

`noUncheckedIndexedAccess` es el que evita que un acceso a la matriz de permisos con una clave
inexistente devuelva `undefined` silenciosamente.

- [ ] **Step 4: Crear `.env.example` sin valores reales**

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Postgres directo (migraciones y tests)
DATABASE_URL=
TEST_DATABASE_URL=postgresql://postgres:postgres@localhost:54322/vektrium_test

# Cifrado de refresh tokens de calendario (32 bytes en base64)
CALENDAR_TOKEN_ENCRYPTION_KEY=

# Politica de papelera
TRASH_RETENTION_DAYS=30
```

- [ ] **Step 5: Verificar que compila**

Run: `pnpm build`
Expected: `Compiled successfully`, sin errores de tipos.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "chore: bootstrap Next.js 15 con TypeScript estricto"
```

---

## Task 2: Tokens de marca VEKTRIUM

**Files:**
- Modify: `src/app/globals.css`
- Modify: `src/app/layout.tsx`

- [ ] **Step 1: Declarar los tokens como variables CSS**

Añadir al principio de `src/app/globals.css`, después de la directiva de Tailwind:

```css
@theme {
  --color-vk-navy: #0A1633;
  --color-vk-navy-2: #111F42;
  --color-vk-cobalt: #3B6EF5;
  --color-vk-aqua: #19D3C5;
  --color-vk-lime: #B7F34A;
  --color-vk-ice: #F2F6FC;
  --color-vk-ink: #172033;
  --color-vk-muted: #667085;
  --color-vk-line: #D7DFEC;
  --color-vk-danger: #D92D20;
  --color-vk-warning: #F79009;
  --color-vk-success: #039855;
  --color-vk-info: #1570EF;

  --radius-vk-sm: 12px;
  --radius-vk-md: 20px;
  --radius-vk-lg: 32px;

  --shadow-vk: 0 18px 45px rgba(10, 22, 51, 0.12);

  --font-display: var(--font-manrope), sans-serif;
  --font-body: var(--font-inter), sans-serif;
}
```

- [ ] **Step 2: Cargar Manrope e Inter**

Reemplazar `src/app/layout.tsx`:

```tsx
import type { Metadata } from 'next'
import { Manrope, Inter } from 'next/font/google'
import './globals.css'

const manrope = Manrope({ subsets: ['latin'], variable: '--font-manrope', display: 'swap' })
const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' })

export const metadata: Metadata = {
  title: 'VEKTRIUM',
  description: 'Automatización, Datos y Productos Digitales',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${manrope.variable} ${inter.variable}`}>
      <body className="bg-vk-ice text-vk-ink font-body antialiased">{children}</body>
    </html>
  )
}
```

- [ ] **Step 3: Verificar que compila y las fuentes resuelven**

Run: `pnpm build`
Expected: `Compiled successfully`. Un fallo de red al descargar fuentes se manifiesta aquí.

- [ ] **Step 4: Commit**

```bash
git add src/app/globals.css src/app/layout.tsx
git commit -m "feat: tokens de marca VEKTRIUM y tipografia Manrope + Inter"
```

---

## Task 3: Infraestructura de pruebas

**Files:**
- Create: `vitest.config.ts`, `tests/unit/smoke.test.ts`
- Modify: `package.json`

- [ ] **Step 1: Instalar Vitest**

```bash
pnpm add -D vitest @vitest/coverage-v8 tsx
```

- [ ] **Step 2: Escribir el test que falla**

Create `tests/unit/smoke.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { ROLES } from '@/domain/roles'

describe('infraestructura de pruebas', () => {
  it('resuelve el alias @/ hacia src/', () => {
    expect(ROLES).toBeDefined()
  })
})
```

- [ ] **Step 3: Ejecutar el test y verificar que falla**

Run: `pnpm vitest run tests/unit/smoke.test.ts`
Expected: FAIL — `Failed to resolve import "@/domain/roles"`.

- [ ] **Step 4: Crear la configuración y el módulo mínimo**

Create `vitest.config.ts`:

```ts
import { defineConfig } from 'vitest/config'
import { fileURLToPath } from 'node:url'

export default defineConfig({
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    exclude: ['tests/e2e/**'],
  },
})
```

Create `src/domain/roles.ts`:

```ts
export const ROLES = [
  'FOUNDER_ADMIN',
  'PROJECT_MANAGER',
  'COLLABORATOR',
  'CLIENT',
  'VIEWER',
] as const

export type Role = (typeof ROLES)[number]
```

- [ ] **Step 5: Ejecutar el test y verificar que pasa**

Run: `pnpm vitest run tests/unit/smoke.test.ts`
Expected: PASS, 1 test.

- [ ] **Step 6: Añadir los scripts de npm**

Añadir a `package.json` en `scripts`:

```json
{
  "test": "vitest run tests/unit tests/structure",
  "test:watch": "vitest",
  "test:integration": "vitest run tests/integration",
  "typecheck": "tsc --noEmit"
}
```

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "test: configurar Vitest con alias de rutas"
```

---

## Task 4: Matriz de permisos

Es el corazón de la seguridad de la aplicación. Se construye por TDD y con tests de tabla
exhaustivos, porque un hueco aquí es una fuga de datos.

**Files:**
- Create: `src/domain/permissions.ts`
- Modify: `src/domain/roles.ts`
- Test: `tests/unit/permissions.test.ts`

- [ ] **Step 1: Escribir el test que falla**

Create `tests/unit/permissions.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { can, ACTIONS } from '@/domain/permissions'
import { ROLES } from '@/domain/roles'

describe('can()', () => {
  it('FOUNDER_ADMIN puede todo sin restriccion de alcance', () => {
    for (const action of ACTIONS) {
      expect(can({ globalRole: 'FOUNDER_ADMIN', action })).toBe('all')
    }
  })

  it('solo FOUNDER_ADMIN puede eliminar permanentemente', () => {
    for (const role of ROLES) {
      const scope = can({ globalRole: role, action: 'project.purge' })
      if (role === 'FOUNDER_ADMIN') expect(scope).toBe('all')
      else expect(scope).toBe('none')
    }
  })

  it('solo FOUNDER_ADMIN puede gestionar usuarios', () => {
    for (const role of ROLES) {
      const scope = can({ globalRole: role, action: 'user.manage' })
      if (role === 'FOUNDER_ADMIN') expect(scope).toBe('all')
      else expect(scope).toBe('none')
    }
  })

  it('COLLABORATOR solo lee clientes de proyectos donde es miembro', () => {
    expect(can({ globalRole: 'COLLABORATOR', action: 'client.read' })).toBe('member')
  })

  it('VIEWER no accede a oportunidades', () => {
    expect(can({ globalRole: 'VIEWER', action: 'opportunity.read' })).toBe('none')
  })

  it('CLIENT no accede a oportunidades', () => {
    expect(can({ globalRole: 'CLIENT', action: 'opportunity.read' })).toBe('none')
  })

  it('el rol de proyecto eleva al global cuando es mas permisivo', () => {
    expect(
      can({ globalRole: 'VIEWER', projectRole: 'PROJECT_MANAGER', action: 'project.update' }),
    ).toBe('member')
  })

  it('el rol de proyecto nunca degrada al global', () => {
    expect(
      can({ globalRole: 'FOUNDER_ADMIN', projectRole: 'VIEWER', action: 'project.purge' }),
    ).toBe('all')
  })

  it('ninguna combinacion de roles concede purge salvo FOUNDER_ADMIN global', () => {
    for (const globalRole of ROLES) {
      for (const projectRole of ROLES) {
        const scope = can({ globalRole, projectRole, action: 'project.purge' })
        if (globalRole === 'FOUNDER_ADMIN') expect(scope).toBe('all')
        else expect(scope).toBe('none')
      }
    }
  })

  it('cada combinacion de rol y accion devuelve un scope definido', () => {
    for (const role of ROLES) {
      for (const action of ACTIONS) {
        expect(can({ globalRole: role, action })).toBeDefined()
      }
    }
  })
})
```

- [ ] **Step 2: Ejecutar el test y verificar que falla**

Run: `pnpm vitest run tests/unit/permissions.test.ts`
Expected: FAIL — `Failed to resolve import "@/domain/permissions"`.

- [ ] **Step 3: Añadir el orden de scopes a `roles.ts`**

Añadir al final de `src/domain/roles.ts`:

```ts
/** De menos a mas permisivo. El indice define la comparacion. */
export const SCOPES = ['none', 'own', 'assignee', 'member', 'all'] as const

export type Scope = (typeof SCOPES)[number]

export function mostPermissive(a: Scope, b: Scope): Scope {
  return SCOPES.indexOf(a) >= SCOPES.indexOf(b) ? a : b
}
```

- [ ] **Step 4: Implementar la matriz**

Create `src/domain/permissions.ts`:

```ts
import { type Role, type Scope, mostPermissive } from './roles'

export const ACTIONS = [
  'client.read', 'client.create', 'client.update',
  'contact.read', 'contact.create', 'contact.update',
  'opportunity.read', 'opportunity.create', 'opportunity.update',
  'project.read', 'project.create', 'project.update',
  'project.archive', 'project.trash', 'project.purge',
  'phase.read', 'phase.create', 'phase.update', 'phase.delete',
  'task.read', 'task.create', 'task.update',
  'meeting.read', 'meeting.create', 'meeting.update',
  'audit.read',
  'user.manage',
] as const

export type Action = (typeof ACTIONS)[number]

/** Fila del rol con menos privilegios. Las demas la extienden. */
const NONE: Record<Action, Scope> = Object.fromEntries(
  ACTIONS.map((a) => [a, 'none' as Scope]),
) as Record<Action, Scope>

const VIEWER: Record<Action, Scope> = {
  ...NONE,
  'client.read': 'member',
  'contact.read': 'member',
  'project.read': 'member',
  'phase.read': 'member',
  'task.read': 'member',
  'meeting.read': 'member',
}

const CLIENT: Record<Action, Scope> = {
  ...NONE,
  'client.read': 'own',
  'contact.read': 'own',
  'project.read': 'member',
  'phase.read': 'member',
  'task.read': 'member',
  'meeting.read': 'member',
}

const COLLABORATOR: Record<Action, Scope> = {
  ...VIEWER,
  'task.create': 'assignee',
  'task.update': 'assignee',
}

const PROJECT_MANAGER: Record<Action, Scope> = {
  ...COLLABORATOR,
  'client.read': 'all',
  'client.create': 'all',
  'client.update': 'all',
  'contact.read': 'all',
  'contact.create': 'all',
  'contact.update': 'all',
  'opportunity.read': 'all',
  'opportunity.create': 'all',
  'opportunity.update': 'all',
  'project.create': 'all',
  'project.update': 'member',
  'project.archive': 'member',
  'project.trash': 'member',
  'phase.create': 'member',
  'phase.update': 'member',
  'phase.delete': 'member',
  'task.create': 'member',
  'task.update': 'member',
  'meeting.create': 'all',
  'meeting.update': 'all',
  'audit.read': 'member',
}

const FOUNDER_ADMIN: Record<Action, Scope> = Object.fromEntries(
  ACTIONS.map((a) => [a, 'all' as Scope]),
) as Record<Action, Scope>

const MATRIX: Record<Role, Record<Action, Scope>> = {
  FOUNDER_ADMIN,
  PROJECT_MANAGER,
  COLLABORATOR,
  CLIENT,
  VIEWER,
}

export interface CanInput {
  globalRole: Role
  projectRole?: Role
  action: Action
}

/**
 * Devuelve el alcance con el que el usuario puede ejecutar la accion.
 * El rol de proyecto solo puede elevar, nunca degradar.
 */
export function can({ globalRole, projectRole, action }: CanInput): Scope {
  const global = MATRIX[globalRole][action]
  if (!projectRole) return global
  return mostPermissive(global, MATRIX[projectRole][action])
}
```

- [ ] **Step 5: Ejecutar el test y verificar que pasa**

Run: `pnpm vitest run tests/unit/permissions.test.ts`
Expected: PASS, 10 tests.

- [ ] **Step 6: Commit**

```bash
git add src/domain/roles.ts src/domain/permissions.ts tests/unit/permissions.test.ts
git commit -m "feat: matriz de permisos tipada con tests exhaustivos"
```

---

## Task 5: Cálculo de avance ponderado

**Files:**
- Create: `src/domain/progress.ts`
- Test: `tests/unit/progress.test.ts`

- [ ] **Step 1: Escribir el test que falla**

Create `tests/unit/progress.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { calculateProgress, type ProgressTask } from '@/domain/progress'

const t = (weight: number, status: ProgressTask['status']): ProgressTask => ({ weight, status })

describe('calculateProgress()', () => {
  it('devuelve 0 si no hay tareas', () => {
    expect(calculateProgress([])).toBe(0)
  })

  it('devuelve 0 si ninguna tarea esta completada', () => {
    expect(calculateProgress([t(1, 'pendiente'), t(3, 'en_progreso')])).toBe(0)
  })

  it('devuelve 1 si todas estan completadas', () => {
    expect(calculateProgress([t(1, 'completada'), t(5, 'completada')])).toBe(1)
  })

  it('pondera por peso, no por conteo', () => {
    // 9 de 10 puntos completados, pero solo 1 de 2 tareas
    expect(calculateProgress([t(9, 'completada'), t(1, 'pendiente')])).toBe(0.9)
  })

  it('excluye las tareas canceladas del denominador', () => {
    // 1 completada de peso 1, 1 cancelada de peso 99 -> 100%
    expect(calculateProgress([t(1, 'completada'), t(99, 'cancelada')])).toBe(1)
  })

  it('devuelve 0 si todas las tareas estan canceladas', () => {
    expect(calculateProgress([t(5, 'cancelada'), t(5, 'cancelada')])).toBe(0)
  })

  it('ignora pesos no positivos tratandolos como 1', () => {
    expect(calculateProgress([t(0, 'completada'), t(0, 'pendiente')])).toBe(0.5)
  })

  it('no acumula error de coma flotante en tercios', () => {
    const tasks = [t(1, 'completada'), t(1, 'pendiente'), t(1, 'pendiente')]
    expect(calculateProgress(tasks)).toBeCloseTo(1 / 3, 10)
  })
})
```

- [ ] **Step 2: Ejecutar el test y verificar que falla**

Run: `pnpm vitest run tests/unit/progress.test.ts`
Expected: FAIL — `Failed to resolve import "@/domain/progress"`.

- [ ] **Step 3: Implementar**

Create `src/domain/progress.ts`:

```ts
export const TASK_STATUSES = [
  'pendiente',
  'lista_para_iniciar',
  'en_progreso',
  'en_revision',
  'bloqueada',
  'esperando_cliente',
  'completada',
  'cancelada',
] as const

export type TaskStatus = (typeof TASK_STATUSES)[number]

export interface ProgressTask {
  weight: number
  status: TaskStatus
}

/** Un peso no positivo carece de sentido de negocio; se normaliza a 1. */
function effectiveWeight(weight: number): number {
  return weight > 0 ? weight : 1
}

/**
 * Avance = suma de pesos completados / suma de pesos no cancelados.
 * Devuelve un valor entre 0 y 1. Las canceladas no cuentan en ningun lado.
 */
export function calculateProgress(tasks: readonly ProgressTask[]): number {
  const active = tasks.filter((t) => t.status !== 'cancelada')
  if (active.length === 0) return 0

  const total = active.reduce((sum, t) => sum + effectiveWeight(t.weight), 0)
  const done = active
    .filter((t) => t.status === 'completada')
    .reduce((sum, t) => sum + effectiveWeight(t.weight), 0)

  return done / total
}
```

- [ ] **Step 4: Ejecutar el test y verificar que pasa**

Run: `pnpm vitest run tests/unit/progress.test.ts`
Expected: PASS, 8 tests.

- [ ] **Step 5: Commit**

```bash
git add src/domain/progress.ts tests/unit/progress.test.ts
git commit -m "feat: calculo de avance ponderado"
```

---

## Task 6: Plantilla de fases VEKTRIUM

**Files:**
- Create: `src/domain/phases.ts`
- Test: `tests/unit/phases.test.ts`

- [ ] **Step 1: Escribir el test que falla**

Create `tests/unit/phases.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { VEKTRIUM_PHASES, buildPhasesForProject } from '@/domain/phases'

describe('plantilla de fases VEKTRIUM', () => {
  it('tiene exactamente 9 fases', () => {
    expect(VEKTRIUM_PHASES).toHaveLength(9)
  })

  it('esta ordenada de 0 a 8 sin huecos', () => {
    expect(VEKTRIUM_PHASES.map((p) => p.order)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8])
  })

  it('empieza en calificacion y termina en seguimiento postentrega', () => {
    expect(VEKTRIUM_PHASES[0]?.name).toBe('Calificación y preparación')
    expect(VEKTRIUM_PHASES[8]?.name).toBe('Seguimiento postentrega')
  })

  it('asigna peso 1 por defecto a todas las fases', () => {
    expect(VEKTRIUM_PHASES.every((p) => p.weight === 1)).toBe(true)
  })

  it('buildPhasesForProject asocia todas las fases al proyecto dado', () => {
    const phases = buildPhasesForProject('proj-123')
    expect(phases).toHaveLength(9)
    expect(phases.every((p) => p.projectId === 'proj-123')).toBe(true)
  })

  it('buildPhasesForProject devuelve copias, no la plantilla compartida', () => {
    const a = buildPhasesForProject('proj-a')
    const b = buildPhasesForProject('proj-b')
    expect(a[0]).not.toBe(b[0])
    expect(a[0]?.projectId).toBe('proj-a')
  })
})
```

- [ ] **Step 2: Ejecutar el test y verificar que falla**

Run: `pnpm vitest run tests/unit/phases.test.ts`
Expected: FAIL — `Failed to resolve import "@/domain/phases"`.

- [ ] **Step 3: Implementar**

Create `src/domain/phases.ts`:

```ts
export interface PhaseTemplate {
  order: number
  name: string
  description: string
  weight: number
}

export interface ProjectPhaseDraft extends PhaseTemplate {
  projectId: string
}

export const VEKTRIUM_PHASES: readonly PhaseTemplate[] = [
  { order: 0, name: 'Calificación y preparación', description: 'Registrar necesidad inicial, investigar contexto del cliente y definir participantes.', weight: 1 },
  { order: 1, name: 'Descubrimiento', description: 'Primera reunión: entender el proceso actual, volúmenes, personas, sistemas y restricciones.', weight: 1 },
  { order: 2, name: 'Diagnóstico y propuesta', description: 'Mapear el proceso, identificar causa raíz, estimar esfuerzo y elaborar la propuesta.', weight: 1 },
  { order: 3, name: 'Validación', description: 'Segunda reunión: confirmar alcance, criterios de aceptación y obtener aprobación.', weight: 1 },
  { order: 4, name: 'Diseño y planificación', description: 'User stories, flujos, wireframes, modelo de datos, integraciones y plan de pruebas.', weight: 1 },
  { order: 5, name: 'Construcción', description: 'Desarrollo por iteraciones, demos parciales, pruebas y documentación.', weight: 1 },
  { order: 6, name: 'Presentación final', description: 'Demo, validación de cumplimiento del alcance y conformidad preliminar.', weight: 1 },
  { order: 7, name: 'Entrega', description: 'Entregar solución y documentación, capacitar usuarios y definir soporte.', weight: 1 },
  { order: 8, name: 'Seguimiento postentrega', description: 'Medir adopción, comparar línea base contra resultado y proponer mejora continua.', weight: 1 },
]

/** Devuelve copias independientes para que editar un proyecto no altere la plantilla. */
export function buildPhasesForProject(projectId: string): ProjectPhaseDraft[] {
  return VEKTRIUM_PHASES.map((phase) => ({ ...phase, projectId }))
}
```

- [ ] **Step 4: Ejecutar el test y verificar que pasa**

Run: `pnpm vitest run tests/unit/phases.test.ts`
Expected: PASS, 6 tests.

- [ ] **Step 5: Commit**

```bash
git add src/domain/phases.ts tests/unit/phases.test.ts
git commit -m "feat: plantilla de 9 fases VEKTRIUM"
```

---

## Task 7: Máquinas de estado

**Files:**
- Create: `src/domain/result.ts`, `src/domain/state-machines.ts`
- Test: `tests/unit/state-machines.test.ts`

- [ ] **Step 1: Escribir el test que falla**

Create `tests/unit/state-machines.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { transitionOpportunity, transitionTask } from '@/domain/state-machines'

describe('transitionOpportunity()', () => {
  it('permite avanzar de nuevo_lead a contactado', () => {
    const r = transitionOpportunity('nuevo_lead', 'contactado', {})
    expect(r.ok).toBe(true)
  })

  it('rechaza un salto invalido', () => {
    const r = transitionOpportunity('nuevo_lead', 'ganado', {})
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.error.code).toBe('TRANSICION_INVALIDA')
  })

  it('exige motivo de perdida al marcar no_aceptado', () => {
    const r = transitionOpportunity('propuesta_enviada', 'no_aceptado', {})
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.error.code).toBe('MOTIVO_REQUERIDO')
  })

  it('acepta no_aceptado con motivo', () => {
    const r = transitionOpportunity('propuesta_enviada', 'no_aceptado', {
      lossReason: 'presupuesto_insuficiente',
    })
    expect(r.ok).toBe(true)
  })

  it('no permite salir de un estado terminal archivado', () => {
    const r = transitionOpportunity('archivado', 'contactado', {})
    expect(r.ok).toBe(false)
  })
})

describe('transitionTask()', () => {
  it('permite pasar de en_progreso a completada con criterio cumplido', () => {
    const r = transitionTask('en_progreso', 'completada', { completionCriteriaMet: true })
    expect(r.ok).toBe(true)
  })

  it('rechaza completar si el criterio de completitud no se cumple', () => {
    const r = transitionTask('en_progreso', 'completada', { completionCriteriaMet: false })
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.error.code).toBe('CRITERIO_NO_CUMPLIDO')
  })

  it('permite cancelar desde cualquier estado no terminal', () => {
    expect(transitionTask('bloqueada', 'cancelada', {}).ok).toBe(true)
    expect(transitionTask('pendiente', 'cancelada', {}).ok).toBe(true)
  })

  it('no permite reabrir una tarea cancelada', () => {
    expect(transitionTask('cancelada', 'en_progreso', {}).ok).toBe(false)
  })
})
```

- [ ] **Step 2: Ejecutar el test y verificar que falla**

Run: `pnpm vitest run tests/unit/state-machines.test.ts`
Expected: FAIL — `Failed to resolve import "@/domain/state-machines"`.

- [ ] **Step 3: Crear el tipo `Result`**

Create `src/domain/result.ts`:

```ts
export type Result<T, E> = { ok: true; value: T } | { ok: false; error: E }

export const ok = <T>(value: T): Result<T, never> => ({ ok: true, value })
export const err = <E>(error: E): Result<never, E> => ({ ok: false, error })

export interface DomainError {
  code: string
  message: string
}
```

- [ ] **Step 4: Implementar las máquinas de estado**

Create `src/domain/state-machines.ts`:

```ts
import { ok, err, type Result, type DomainError } from './result'
import type { TaskStatus } from './progress'

export const OPPORTUNITY_STATUSES = [
  'nuevo_lead', 'contactado', 'diagnostico_agendado', 'diagnostico_realizado',
  'preparando_propuesta', 'propuesta_enviada', 'en_negociacion', 'ganado',
  'no_aceptado', 'sin_respuesta', 'pospuesto', 'descalificado', 'archivado',
] as const

export type OpportunityStatus = (typeof OPPORTUNITY_STATUSES)[number]

/** Estados desde los que se puede salir hacia una via muerta o el archivo. */
const ABANDON: readonly OpportunityStatus[] = [
  'no_aceptado', 'sin_respuesta', 'pospuesto', 'descalificado', 'archivado',
]

const OPPORTUNITY_TRANSITIONS: Record<OpportunityStatus, readonly OpportunityStatus[]> = {
  nuevo_lead: ['contactado', ...ABANDON],
  contactado: ['diagnostico_agendado', ...ABANDON],
  diagnostico_agendado: ['diagnostico_realizado', ...ABANDON],
  diagnostico_realizado: ['preparando_propuesta', ...ABANDON],
  preparando_propuesta: ['propuesta_enviada', ...ABANDON],
  propuesta_enviada: ['en_negociacion', 'ganado', ...ABANDON],
  en_negociacion: ['ganado', ...ABANDON],
  ganado: ['archivado'],
  no_aceptado: ['archivado'],
  sin_respuesta: ['contactado', 'archivado'],
  pospuesto: ['contactado', 'archivado'],
  descalificado: ['archivado'],
  archivado: [],
}

export interface OpportunityContext {
  lossReason?: string
}

export function transitionOpportunity(
  from: OpportunityStatus,
  to: OpportunityStatus,
  ctx: OpportunityContext,
): Result<OpportunityStatus, DomainError> {
  if (!OPPORTUNITY_TRANSITIONS[from].includes(to)) {
    return err({
      code: 'TRANSICION_INVALIDA',
      message: `No se puede pasar de "${from}" a "${to}".`,
    })
  }
  if (to === 'no_aceptado' && !ctx.lossReason) {
    return err({
      code: 'MOTIVO_REQUERIDO',
      message: 'Marcar una oportunidad como no aceptada exige registrar el motivo de pérdida.',
    })
  }
  return ok(to)
}

const TASK_TRANSITIONS: Record<TaskStatus, readonly TaskStatus[]> = {
  pendiente: ['lista_para_iniciar', 'en_progreso', 'bloqueada', 'cancelada'],
  lista_para_iniciar: ['en_progreso', 'bloqueada', 'cancelada'],
  en_progreso: ['en_revision', 'bloqueada', 'esperando_cliente', 'completada', 'cancelada'],
  en_revision: ['en_progreso', 'completada', 'bloqueada', 'cancelada'],
  bloqueada: ['pendiente', 'en_progreso', 'cancelada'],
  esperando_cliente: ['en_progreso', 'bloqueada', 'cancelada'],
  completada: ['en_progreso'],
  cancelada: [],
}

export interface TaskContext {
  completionCriteriaMet?: boolean
}

export function transitionTask(
  from: TaskStatus,
  to: TaskStatus,
  ctx: TaskContext,
): Result<TaskStatus, DomainError> {
  if (!TASK_TRANSITIONS[from].includes(to)) {
    return err({
      code: 'TRANSICION_INVALIDA',
      message: `No se puede pasar de "${from}" a "${to}".`,
    })
  }
  if (to === 'completada' && ctx.completionCriteriaMet !== true) {
    return err({
      code: 'CRITERIO_NO_CUMPLIDO',
      message: 'La tarea no cumple su criterio de completitud.',
    })
  }
  return ok(to)
}
```

- [ ] **Step 5: Ejecutar el test y verificar que pasa**

Run: `pnpm vitest run tests/unit/state-machines.test.ts`
Expected: PASS, 9 tests.

- [ ] **Step 6: Commit**

```bash
git add src/domain/result.ts src/domain/state-machines.ts tests/unit/state-machines.test.ts
git commit -m "feat: maquinas de estado de oportunidad y tarea"
```

---

## Task 8: Esquema de base de datos SP-0

**Files:**
- Create: `src/db/schema/users.ts`, `src/db/schema/calendar.ts`, `src/db/schema/audit.ts`, `src/db/schema/index.ts`
- Create: `drizzle.config.ts`

- [ ] **Step 1: Instalar Drizzle**

```bash
pnpm add drizzle-orm postgres
pnpm add -D drizzle-kit
```

- [ ] **Step 2: Definir el esquema de identidad**

Create `src/db/schema/users.ts`:

```ts
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
```

- [ ] **Step 3: Definir calendario y auditoría**

Create `src/db/schema/calendar.ts`:

```ts
import { pgTable, uuid, text, timestamp, pgEnum, unique } from 'drizzle-orm/pg-core'
import { users } from './users'

export const calendarProviderEnum = pgEnum('calendar_provider', ['mock', 'google'])
export const connectionStatusEnum = pgEnum('connection_status', ['activa', 'expirada', 'revocada'])

export const calendarConnections = pgTable(
  'calendar_connections',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
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
```

Create `src/db/schema/audit.ts`:

```ts
import { pgTable, uuid, text, timestamp, jsonb, index } from 'drizzle-orm/pg-core'
import { users } from './users'

export const auditLogs = pgTable(
  'audit_logs',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    actorId: uuid('actor_id').references(() => users.id, { onDelete: 'set null' }),
    action: text('action').notNull(),
    entity: text('entity').notNull(),
    entityId: text('entity_id').notNull(),
    before: jsonb('before'),
    after: jsonb('after'),
    reason: text('reason'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index('audit_logs_entity_idx').on(t.entity, t.entityId),
    index('audit_logs_created_at_idx').on(t.createdAt),
  ],
)
```

Create `src/db/schema/index.ts`:

```ts
export * from './users'
export * from './calendar'
export * from './audit'
```

- [ ] **Step 4: Configurar Drizzle Kit**

Create `drizzle.config.ts`:

```ts
import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  schema: './src/db/schema/index.ts',
  out: './supabase/migrations',
  dialect: 'postgresql',
  dbCredentials: { url: process.env.DATABASE_URL! },
})
```

- [ ] **Step 5: Generar la migración**

Run: `pnpm drizzle-kit generate`
Expected: se crea un archivo `.sql` en `supabase/migrations/` con los `CREATE TYPE` y `CREATE TABLE`.

- [ ] **Step 6: Verificar tipos**

Run: `pnpm typecheck`
Expected: sin errores.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: esquema Drizzle de identidad, calendario y auditoria"
```

---

## Task 9: Postgres de pruebas y helpers de integración

**Files:**
- Create: `docker-compose.test.yml`, `tests/integration/helpers/db.ts`
- Create: `supabase/migrations/0000_auth_shim.sql`
- Test: `tests/integration/schema.test.ts`

- [ ] **Step 1: Definir el contenedor de pruebas**

Create `docker-compose.test.yml`:

```yaml
services:
  postgres-test:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: vektrium_test
    ports:
      - '54322:5432'
    healthcheck:
      test: ['CMD-SHELL', 'pg_isready -U postgres']
      interval: 2s
      timeout: 3s
      retries: 15
```

- [ ] **Step 2: Emular `auth.uid()` de Supabase en local**

Postgres a secas no trae el esquema `auth` de Supabase. Sin él, las políticas RLS no se pueden
probar en local. Este shim lo reproduce con la misma semántica.

Create `supabase/migrations/0000_auth_shim.sql`:

```sql
-- Solo para el Postgres local de pruebas. Supabase ya provee auth.uid() en produccion.
create schema if not exists auth;

create or replace function auth.uid() returns uuid
language sql stable
as $$
  select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid;
$$;

do $$
begin
  if not exists (select 1 from pg_roles where rolname = 'anon') then
    create role anon nologin;
  end if;
  if not exists (select 1 from pg_roles where rolname = 'authenticated') then
    create role authenticated nologin;
  end if;
end
$$;

grant usage on schema public to anon, authenticated;
grant usage on schema auth to anon, authenticated;
```

- [ ] **Step 3: Escribir el helper de conexión**

Create `tests/integration/helpers/db.ts`:

```ts
import postgres from 'postgres'
import { drizzle } from 'drizzle-orm/postgres-js'
import * as schema from '@/db/schema'

const url = process.env.TEST_DATABASE_URL ?? 'postgresql://postgres:postgres@localhost:54322/vektrium_test'

export const sql = postgres(url, { max: 5 })
export const testDb = drizzle(sql, { schema })

/** Ejecuta fn con la identidad de userId y el rol authenticated, y revierte todo al terminar. */
export async function asUser<T>(userId: string, fn: (tx: postgres.TransactionSql) => Promise<T>): Promise<T> {
  let result!: T
  try {
    await sql.begin(async (tx) => {
      await tx.unsafe(`set local role authenticated`)
      await tx.unsafe(`set local request.jwt.claim.sub = '${userId}'`)
      result = await fn(tx)
      throw new Error('__ROLLBACK__')
    })
  } catch (e) {
    if (!(e instanceof Error) || e.message !== '__ROLLBACK__') throw e
  }
  return result
}

export async function closeDb(): Promise<void> {
  await sql.end()
}
```

- [ ] **Step 4: Escribir el test que falla**

Create `tests/integration/schema.test.ts`:

```ts
import { describe, it, expect, afterAll } from 'vitest'
import { sql, closeDb } from './helpers/db'

afterAll(closeDb)

describe('esquema migrado', () => {
  it('tiene las cuatro tablas de SP-0', async () => {
    const rows = await sql<{ table_name: string }[]>`
      select table_name from information_schema.tables
      where table_schema = 'public' order by table_name
    `
    const names = rows.map((r) => r.table_name)
    expect(names).toContain('users')
    expect(names).toContain('authorized_users')
    expect(names).toContain('calendar_connections')
    expect(names).toContain('audit_logs')
  })

  it('expone auth.uid()', async () => {
    const [row] = await sql<{ uid: string | null }[]>`select auth.uid() as uid`
    expect(row).toBeDefined()
  })
})
```

- [ ] **Step 5: Levantar la base y ejecutar el test para verificar que falla**

```bash
docker compose -f docker-compose.test.yml up -d
```

Run: `pnpm test:integration`
Expected: FAIL — las tablas no existen todavía porque no se han aplicado las migraciones.

- [ ] **Step 6: Aplicar las migraciones**

```bash
psql "postgresql://postgres:postgres@localhost:54322/vektrium_test" -f supabase/migrations/0000_auth_shim.sql
TEST_DATABASE_URL="postgresql://postgres:postgres@localhost:54322/vektrium_test" DATABASE_URL="postgresql://postgres:postgres@localhost:54322/vektrium_test" pnpm drizzle-kit migrate
```

Si `psql` no está instalado, ejecutar el shim dentro del contenedor:

```bash
docker compose -f docker-compose.test.yml exec -T postgres-test psql -U postgres -d vektrium_test < supabase/migrations/0000_auth_shim.sql
```

- [ ] **Step 7: Ejecutar el test y verificar que pasa**

Run: `pnpm test:integration`
Expected: PASS, 2 tests.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "test: Postgres en Docker con shim de auth.uid para pruebas de RLS"
```

---

## Task 10: Políticas RLS y batería de intentos de violación

Esta es la tarea más importante del plan en términos de seguridad. Se escribe primero el ataque y
luego la defensa.

**Files:**
- Create: `supabase/migrations/0002_rls_sp0.sql`
- Test: `tests/integration/rls/users.test.ts`

- [ ] **Step 1: Escribir el test que falla**

Create `tests/integration/rls/users.test.ts`:

```ts
import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { sql, asUser, closeDb } from '../helpers/db'

const ALICE = '11111111-1111-1111-1111-111111111111'
const BOB = '22222222-2222-2222-2222-222222222222'
const ADMIN = '33333333-3333-3333-3333-333333333333'

beforeAll(async () => {
  await sql`delete from users where id in (${ALICE}, ${BOB}, ${ADMIN})`
  await sql`
    insert into users (id, email, full_name, role) values
      (${ALICE}, 'alice@vektrium.test', 'Alice', 'COLLABORATOR'),
      (${BOB},   'bob@vektrium.test',   'Bob',   'COLLABORATOR'),
      (${ADMIN}, 'admin@vektrium.test', 'Admin', 'FOUNDER_ADMIN')
  `
})

afterAll(async () => {
  await sql`delete from users where id in (${ALICE}, ${BOB}, ${ADMIN})`
  await closeDb()
})

describe('RLS sobre users', () => {
  it('un usuario ve su propia fila', async () => {
    const rows = await asUser(ALICE, (tx) => tx`select id from users where id = ${ALICE}`)
    expect(rows).toHaveLength(1)
  })

  it('un usuario NO ve la fila de otro usuario', async () => {
    const rows = await asUser(ALICE, (tx) => tx`select id from users where id = ${BOB}`)
    expect(rows).toHaveLength(0)
  })

  it('un usuario no puede modificar su propio rol', async () => {
    await expect(
      asUser(ALICE, (tx) => tx`update users set role = 'FOUNDER_ADMIN' where id = ${ALICE}`),
    ).rejects.toThrow()
  })

  it('FOUNDER_ADMIN ve todas las filas', async () => {
    const rows = await asUser(ADMIN, (tx) => tx`select id from users`)
    expect(rows.length).toBeGreaterThanOrEqual(3)
  })

  it('una sesion sin identidad no ve nada', async () => {
    const rows = await sql.begin(async (tx) => {
      await tx.unsafe(`set local role anon`)
      return tx`select id from users`
    })
    expect(rows).toHaveLength(0)
  })
})

describe('RLS sobre audit_logs', () => {
  it('un COLLABORATOR no puede leer la auditoria', async () => {
    const rows = await asUser(ALICE, (tx) => tx`select id from audit_logs`)
    expect(rows).toHaveLength(0)
  })

  it('nadie puede borrar registros de auditoria', async () => {
    await expect(
      asUser(ADMIN, (tx) => tx`delete from audit_logs`),
    ).rejects.toThrow()
  })
})

describe('RLS sobre calendar_connections', () => {
  it('un usuario no ve las conexiones de calendario de otro', async () => {
    const rows = await asUser(ALICE, (tx) => tx`select id from calendar_connections where user_id = ${BOB}`)
    expect(rows).toHaveLength(0)
  })
})
```

- [ ] **Step 2: Ejecutar el test y verificar que falla**

Run: `pnpm test:integration`
Expected: FAIL — sin RLS activada, Alice ve la fila de Bob y los tests de aislamiento fallan.

- [ ] **Step 3: Escribir las políticas**

Create `supabase/migrations/0002_rls_sp0.sql`:

```sql
alter table users enable row level security;
alter table authorized_users enable row level security;
alter table calendar_connections enable row level security;
alter table audit_logs enable row level security;

-- Helper: rol global del usuario autenticado.
create or replace function public.current_role_name() returns text
language sql stable security definer set search_path = public
as $$
  select role::text from users where id = auth.uid();
$$;

create or replace function public.is_founder_admin() returns boolean
language sql stable security definer set search_path = public
as $$
  select coalesce(public.current_role_name() = 'FOUNDER_ADMIN', false);
$$;

-- users: cada quien ve lo suyo; el admin ve todo.
create policy users_select on users for select to authenticated
  using (id = auth.uid() or public.is_founder_admin());

-- Nadie modifica su propio rol. Solo el admin actualiza filas de users.
create policy users_update_admin on users for update to authenticated
  using (public.is_founder_admin()) with check (public.is_founder_admin());

-- authorized_users: solo el admin.
create policy authorized_users_all on authorized_users for all to authenticated
  using (public.is_founder_admin()) with check (public.is_founder_admin());

-- calendar_connections: estrictamente del propietario.
create policy calendar_connections_own on calendar_connections for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- audit_logs: solo lectura para el admin; insercion desde cualquier sesion autenticada;
-- update y delete no tienen politica, por lo que quedan prohibidos para todos.
create policy audit_logs_select_admin on audit_logs for select to authenticated
  using (public.is_founder_admin());

create policy audit_logs_insert on audit_logs for insert to authenticated
  with check (actor_id = auth.uid());

grant select, insert, update on users to authenticated;
grant select, insert, update, delete on authorized_users to authenticated;
grant select, insert, update, delete on calendar_connections to authenticated;
grant select, insert on audit_logs to authenticated;
```

- [ ] **Step 4: Aplicar la migración**

```bash
docker compose -f docker-compose.test.yml exec -T postgres-test psql -U postgres -d vektrium_test < supabase/migrations/0002_rls_sp0.sql
```

- [ ] **Step 5: Ejecutar el test y verificar que pasa**

Run: `pnpm test:integration`
Expected: PASS. Los 8 tests de RLS en verde, incluidos los que intentan violar el aislamiento.

- [ ] **Step 6: Commit**

```bash
git add supabase/migrations/0002_rls_sp0.sql tests/integration/rls/users.test.ts
git commit -m "feat: politicas RLS de SP-0 con bateria de intentos de violacion"
```

---

## Task 11: Aislamiento de la clave `service_role`

**Files:**
- Create: `src/db/client.ts`, `src/db/admin/client.ts`
- Test: `tests/structure/imports.test.ts`
- Modify: `eslint.config.mjs`

- [ ] **Step 1: Escribir el test que falla**

Create `tests/structure/imports.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const full = join(dir, entry)
    return statSync(full).isDirectory() ? walk(full) : [full]
  })
}

describe('frontera de la clave de servicio', () => {
  it('ningun archivo bajo src/app importa src/db/admin', () => {
    const offenders = walk('src/app')
      .filter((f) => /\.tsx?$/.test(f))
      .filter((f) => /from\s+['"](@\/db\/admin|.*\/db\/admin)/.test(readFileSync(f, 'utf8')))

    expect(offenders).toEqual([])
  })

  it('SUPABASE_SERVICE_ROLE_KEY solo se lee dentro de src/db/admin', () => {
    const offenders = walk('src')
      .filter((f) => /\.tsx?$/.test(f))
      .filter((f) => !f.replace(/\\/g, '/').includes('src/db/admin/'))
      .filter((f) => readFileSync(f, 'utf8').includes('SUPABASE_SERVICE_ROLE_KEY'))

    expect(offenders).toEqual([])
  })
})
```

- [ ] **Step 2: Ejecutar el test y verificar que falla**

Run: `pnpm vitest run tests/structure/imports.test.ts`
Expected: PASS con 2 tests — y eso es correcto en este punto. El test aún no puede fallar porque
`src/db/admin` no existe, así que no hay nada que importar mal. **La verificación real de que este
test funciona es el Step 6**, donde se introduce una violación deliberada y se comprueba que la
detecta. Un test estructural que nunca se ha visto fallar no vale nada.

- [ ] **Step 3: Crear los dos clientes**

Create `src/db/client.ts`:

```ts
import postgres from 'postgres'
import { drizzle } from 'drizzle-orm/postgres-js'
import * as schema from './schema'

const url = process.env.DATABASE_URL
if (!url) throw new Error('Falta DATABASE_URL')

const sql = postgres(url, { max: 10 })

/** Cliente que respeta RLS. Es el unico que debe usarse desde app/. */
export const db = drizzle(sql, { schema })
```

Create `src/db/admin/client.ts`:

```ts
import 'server-only'
import postgres from 'postgres'
import { drizzle } from 'drizzle-orm/postgres-js'
import * as schema from '../schema'

/**
 * PELIGRO: este cliente ignora RLS por completo.
 *
 * Usos permitidos: cron de backup y seeds. Nada mas.
 * Importarlo desde src/app rompe el test estructural tests/structure/imports.test.ts.
 */
const key = process.env.SUPABASE_SERVICE_ROLE_KEY
const url = process.env.DATABASE_URL
if (!key || !url) throw new Error('Faltan SUPABASE_SERVICE_ROLE_KEY o DATABASE_URL')

const sql = postgres(url, { max: 2 })

export const adminDb = drizzle(sql, { schema })
```

```bash
pnpm add server-only
```

- [ ] **Step 4: Añadir la regla de ESLint**

Añadir al array de configuración en `eslint.config.mjs`:

```js
{
  files: ['src/app/**/*.{ts,tsx}'],
  rules: {
    'no-restricted-imports': ['error', {
      patterns: [{
        group: ['@/db/admin', '@/db/admin/*', '**/db/admin', '**/db/admin/*'],
        message: 'src/db/admin usa la clave service_role y omite RLS. Usa @/db/client.',
      }],
    }],
  },
}
```

- [ ] **Step 5: Ejecutar los tests y el lint para verificar que pasan**

Run: `pnpm vitest run tests/structure/imports.test.ts && pnpm lint`
Expected: PASS, 2 tests. Lint sin errores.

- [ ] **Step 6: Verificar que la regla detecta una violación real**

Añadir temporalmente a `src/app/page.tsx` la línea `import { adminDb } from '@/db/admin/client'`.

Run: `pnpm lint`
Expected: ERROR con el mensaje "src/db/admin usa la clave service_role y omite RLS".

Run: `pnpm vitest run tests/structure/imports.test.ts`
Expected: FAIL en el primer test, listando `src/app/page.tsx`.

**Eliminar la línea antes de continuar** y volver a ejecutar ambos comandos para confirmar que
vuelven a pasar.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: aislar la clave service_role con regla de lint y test estructural"
```

---

## Task 12: Autenticación con Google

**Files:**
- Create: `src/lib/supabase/server.ts`, `src/lib/supabase/middleware.ts`, `src/middleware.ts`
- Create: `src/app/login/page.tsx`, `src/app/auth/callback/route.ts`
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Instalar el cliente de Supabase**

```bash
pnpm add @supabase/supabase-js @supabase/ssr
```

- [ ] **Step 2: Crear el cliente de servidor**

Create `src/lib/supabase/server.ts`:

```ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (toSet) => {
          try {
            toSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
          } catch {
            // Invocado desde un Server Component: el middleware ya refresca la sesion.
          }
        },
      },
    },
  )
}
```

- [ ] **Step 3: Crear el middleware de sesión**

Create `src/lib/supabase/middleware.ts`:

```ts
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (toSet) => {
          toSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request })
          toSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options))
        },
      },
    },
  )

  const { data: { user } } = await supabase.auth.getUser()

  if (!user && request.nextUrl.pathname.startsWith('/os')) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  return response
}
```

Create `src/middleware.ts`:

```ts
import type { NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  return updateSession(request)
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
```

- [ ] **Step 4: Crear la pantalla de acceso**

Create `src/app/login/page.tsx`:

```tsx
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export const metadata = { title: 'Acceder · VEKTRIUM', robots: { index: false, follow: false } }

export default function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  async function signIn() {
    'use server'
    const supabase = await createClient()
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback` },
    })
    if (error) redirect('/login?error=oauth')
    if (data.url) redirect(data.url)
  }

  return (
    <main className="grid min-h-screen place-items-center bg-vk-navy p-6">
      <div className="w-full max-w-sm rounded-[20px] bg-white p-8 shadow-[0_18px_45px_rgba(10,22,51,.12)]">
        <p className="font-display text-lg font-extrabold tracking-[0.14em] text-vk-navy">VEKTRIUM</p>
        <h1 className="mt-6 font-display text-2xl font-bold text-vk-ink">Acceso al portal</h1>
        <p className="mt-2 text-sm text-vk-muted">
          Solo para cuentas autorizadas. Si crees que deberías tener acceso, habla con un fundador.
        </p>

        <form action={signIn} className="mt-8">
          <button
            type="submit"
            className="w-full rounded-[12px] bg-vk-cobalt px-4 py-3 font-semibold text-white transition hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-vk-cobalt"
          >
            Continuar con Google
          </button>
        </form>

        <ErrorNotice searchParams={searchParams} />
      </div>
    </main>
  )
}

async function ErrorNotice({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams
  if (!error) return null

  const message =
    error === 'no_autorizado'
      ? 'Tu cuenta no está en la lista de accesos autorizados.'
      : 'No se pudo completar el acceso. Vuelve a intentarlo.'

  return (
    <p role="alert" className="mt-6 rounded-[12px] bg-red-50 px-4 py-3 text-sm text-vk-danger">
      {message}
    </p>
  )
}
```

- [ ] **Step 5: Crear el callback que valida contra `authorized_users`**

Create `src/app/auth/callback/route.ts`:

```ts
import { NextResponse, type NextRequest } from 'next/server'
import { eq } from 'drizzle-orm'
import { createClient } from '@/lib/supabase/server'
import { db } from '@/db/client'
import { authorizedUsers, users } from '@/db/schema'

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code')
  const origin = request.nextUrl.origin

  if (!code) return NextResponse.redirect(`${origin}/login?error=oauth`)

  const supabase = await createClient()
  const { data, error } = await supabase.auth.exchangeCodeForSession(code)

  if (error || !data.user?.email) {
    return NextResponse.redirect(`${origin}/login?error=oauth`)
  }

  const email = data.user.email.toLowerCase()

  const [authorized] = await db
    .select()
    .from(authorizedUsers)
    .where(eq(authorizedUsers.email, email))
    .limit(1)

  if (!authorized || authorized.status !== 'activo') {
    await supabase.auth.signOut()
    return NextResponse.redirect(`${origin}/login?error=no_autorizado`)
  }

  await db
    .insert(users)
    .values({
      id: data.user.id,
      email,
      fullName: (data.user.user_metadata['full_name'] as string | undefined) ?? null,
      role: authorized.role,
      lastSeenAt: new Date(),
    })
    .onConflictDoUpdate({
      target: users.id,
      set: { lastSeenAt: new Date(), role: authorized.role, updatedAt: new Date() },
    })

  return NextResponse.redirect(`${origin}/os`)
}
```

- [ ] **Step 6: Redirigir la raíz**

Replace `src/app/page.tsx`:

```tsx
import { redirect } from 'next/navigation'

export default function Home() {
  redirect('/os')
}
```

- [ ] **Step 7: Añadir la variable de sitio a `.env.example`**

Añadir la línea:

```bash
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

- [ ] **Step 8: Verificar que compila**

Run: `pnpm typecheck && pnpm build`
Expected: sin errores.

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "feat: acceso con Google validado contra authorized_users"
```

---

## Task 13: Shell de navegación

**Files:**
- Create: `src/components/shell/sidebar.tsx`, `src/components/shell/header.tsx`
- Create: `src/app/os/layout.tsx`, `src/app/os/page.tsx`

- [ ] **Step 1: Crear la barra lateral**

Create `src/components/shell/sidebar.tsx`:

```tsx
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

/** Solo entradas implementadas. Nada gris ni "proximamente". */
const NAV = [
  { href: '/os', label: 'Inicio' },
  { href: '/os/agenda', label: 'Agenda' },
  { href: '/os/oportunidades', label: 'Oportunidades' },
  { href: '/os/clientes', label: 'Clientes' },
  { href: '/os/proyectos', label: 'Proyectos' },
] as const

export function Sidebar() {
  const pathname = usePathname()

  return (
    <nav aria-label="Navegación principal" className="flex w-[220px] shrink-0 flex-col bg-vk-navy p-4">
      <p className="mb-6 px-2 font-display text-base font-extrabold tracking-[0.14em] text-white">
        VEKTRIUM
      </p>
      <ul className="flex flex-col gap-1">
        {NAV.map((item) => {
          const active = pathname === item.href
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={`block rounded-[12px] px-3 py-2 text-sm transition ${
                  active ? 'bg-vk-cobalt font-semibold text-white' : 'text-[#B2C4E5] hover:bg-vk-navy-2'
                }`}
              >
                {item.label}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
```

- [ ] **Step 2: Crear el encabezado**

Create `src/components/shell/header.tsx`:

```tsx
export function Header({ userName }: { userName: string }) {
  return (
    <header className="flex items-center gap-3 border-b border-vk-line bg-white px-4 py-3">
      <div className="flex-1">
        <label htmlFor="global-search" className="sr-only">
          Buscar
        </label>
        <input
          id="global-search"
          type="search"
          placeholder="Buscar proyecto, cliente, tarea…"
          className="w-full rounded-[12px] border border-vk-line bg-vk-ice px-3 py-2 text-sm outline-none placeholder:text-vk-muted focus-visible:border-vk-cobalt"
        />
      </div>
      <span className="text-sm text-vk-muted">{userName}</span>
    </header>
  )
}
```

- [ ] **Step 3: Componer el layout del portal**

Create `src/app/os/layout.tsx`:

```tsx
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Sidebar } from '@/components/shell/sidebar'
import { Header } from '@/components/shell/header'

export const metadata = { robots: { index: false, follow: false } }

export default async function OsLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const name = (user.user_metadata['full_name'] as string | undefined) ?? user.email ?? 'Usuario'

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Header userName={name} />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  )
}
```

Create `src/app/os/page.tsx`:

```tsx
export default function OsHome() {
  return (
    <div>
      <h1 className="font-display text-2xl font-extrabold text-vk-navy">Inicio</h1>
      <p className="mt-2 text-sm text-vk-muted">
        El tablero operativo llega con SP-1. La fundación ya está en pie: acceso, permisos y
        auditoría funcionando.
      </p>
    </div>
  )
}
```

- [ ] **Step 4: Verificar que compila**

Run: `pnpm typecheck && pnpm build`
Expected: sin errores.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: shell de navegacion del portal privado"
```

---

## Task 14: Seed de acceso inicial

Sin esto nadie puede entrar: `authorized_users` está vacía y el callback rechaza a todo el mundo.

**Files:**
- Create: `scripts/seed-founders.ts`
- Modify: `package.json`

- [ ] **Step 1: Escribir el script**

Create `scripts/seed-founders.ts`:

```ts
import 'dotenv/config'
import { adminDb } from '../src/db/admin/client'
import { authorizedUsers } from '../src/db/schema'

/** Los correos se leen del entorno: no se hardcodean en el codigo fuente. */
const emails = (process.env.FOUNDER_EMAILS ?? '')
  .split(',')
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean)

async function main() {
  if (emails.length === 0) {
    console.error('Define FOUNDER_EMAILS con los correos separados por coma.')
    process.exit(1)
  }

  for (const email of emails) {
    await adminDb
      .insert(authorizedUsers)
      .values({ email, role: 'FOUNDER_ADMIN', status: 'activo' })
      .onConflictDoUpdate({
        target: authorizedUsers.email,
        set: { role: 'FOUNDER_ADMIN', status: 'activo' },
      })
    console.log(`Autorizado: ${email}`)
  }

  process.exit(0)
}

void main()
```

```bash
pnpm add -D dotenv
```

- [ ] **Step 2: Añadir la variable a `.env.example`**

```bash
FOUNDER_EMAILS=
```

- [ ] **Step 3: Añadir el script a `package.json`**

```json
{
  "seed:founders": "tsx scripts/seed-founders.ts"
}
```

- [ ] **Step 4: Verificar que el script rechaza el entorno vacío**

Run: `FOUNDER_EMAILS="" pnpm seed:founders`
Expected: imprime "Define FOUNDER_EMAILS…" y termina con código 1.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: seed de fundadores autorizados desde variables de entorno"
```

---

## Task 15: Backup programado

**Files:**
- Create: `scripts/backup.sh`

- [ ] **Step 1: Escribir el script**

Create `scripts/backup.sh`:

```bash
#!/usr/bin/env bash
# Respaldo de la base de VEKTRIUM. El tier gratuito de Supabase no ofrece
# recuperacion point-in-time, asi que este script no es opcional.
set -euo pipefail

: "${DATABASE_URL:?Falta DATABASE_URL}"
DEST="${BACKUP_DIR:-./backups}"
RETENTION_DAYS="${BACKUP_RETENTION_DAYS:-30}"

mkdir -p "$DEST"
STAMP="$(date +%Y%m%d-%H%M%S)"
FILE="$DEST/vektrium-$STAMP.dump"

pg_dump --format=custom --no-owner --no-privileges --file="$FILE" "$DATABASE_URL"

# Un dump valido nunca pesa menos de 1 KB. Si pesa menos, algo fallo en silencio.
SIZE=$(wc -c < "$FILE")
if [ "$SIZE" -lt 1024 ]; then
  echo "ERROR: el respaldo pesa $SIZE bytes. Se aborta y se conserva para inspeccion." >&2
  exit 1
fi

find "$DEST" -name 'vektrium-*.dump' -mtime "+$RETENTION_DAYS" -delete

echo "Respaldo correcto: $FILE ($SIZE bytes)"
```

- [ ] **Step 2: Darle permisos de ejecución**

```bash
chmod +x scripts/backup.sh
git update-index --chmod=+x scripts/backup.sh
```

- [ ] **Step 3: Verificarlo contra la base de pruebas**

Run: `DATABASE_URL="postgresql://postgres:postgres@localhost:54322/vektrium_test" BACKUP_DIR=./backups ./scripts/backup.sh`
Expected: `Respaldo correcto: ./backups/vektrium-<timestamp>.dump (<n> bytes)` con n > 1024.

Si `pg_dump` no está instalado en el host, ejecutarlo dentro del contenedor:

```bash
docker compose -f docker-compose.test.yml exec -T postgres-test \
  pg_dump --format=custom --no-owner -U postgres vektrium_test > backups/prueba.dump
```

- [ ] **Step 4: Verificar que `backups/` está ignorado**

Run: `git status --porcelain backups/`
Expected: sin salida — `.gitignore` ya excluye `backups/`.

- [ ] **Step 5: Commit**

```bash
git add scripts/backup.sh
git commit -m "feat: script de respaldo con verificacion de tamano y retencion"
```

---

## Task 16: Integración continua

**Files:**
- Create: `.github/workflows/ci.yml`

- [ ] **Step 1: Escribir el workflow**

Create `.github/workflows/ci.yml`:

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:

jobs:
  verify:
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:16-alpine
        env:
          POSTGRES_USER: postgres
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: vektrium_test
        ports: ['54322:5432']
        options: >-
          --health-cmd "pg_isready -U postgres"
          --health-interval 2s
          --health-timeout 3s
          --health-retries 15

    env:
      TEST_DATABASE_URL: postgresql://postgres:postgres@localhost:54322/vektrium_test
      DATABASE_URL: postgresql://postgres:postgres@localhost:54322/vektrium_test

    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v4
        with:
          version: 10

      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: pnpm

      - run: pnpm install --frozen-lockfile

      - name: Aplicar shim de auth y migraciones
        run: |
          psql "$DATABASE_URL" -f supabase/migrations/0000_auth_shim.sql
          pnpm drizzle-kit migrate
          psql "$DATABASE_URL" -f supabase/migrations/0002_rls_sp0.sql

      - run: pnpm lint
      - run: pnpm typecheck
      - run: pnpm test
      - run: pnpm test:integration
      - run: pnpm build
        env:
          NEXT_PUBLIC_SUPABASE_URL: https://placeholder.supabase.co
          NEXT_PUBLIC_SUPABASE_ANON_KEY: placeholder
          NEXT_PUBLIC_SITE_URL: http://localhost:3000
```

- [ ] **Step 2: Verificar localmente la misma secuencia**

Run: `pnpm lint && pnpm typecheck && pnpm test && pnpm test:integration && pnpm build`
Expected: los cinco comandos en verde.

- [ ] **Step 3: Commit**

```bash
git add .github/workflows/ci.yml
git commit -m "ci: lint, tipos, unitarios, integracion con Postgres y build"
```

---

## Criterio de terminado de SP-0

SP-0 está completo cuando **todo** lo siguiente es cierto y está verificado por comando, no por
inspección visual:

- [ ] `pnpm lint` sin errores
- [ ] `pnpm typecheck` sin errores
- [ ] `pnpm test` en verde — 35 tests unitarios y estructurales
- [ ] `pnpm test:integration` en verde — incluidos los 8 tests que intentan violar RLS
- [ ] `pnpm build` compila
- [ ] Un correo presente en `authorized_users` con estado `activo` entra a `/os` y ve el shell
- [ ] Un correo ausente de `authorized_users` es rechazado con el mensaje de no autorizado
- [ ] `./scripts/backup.sh` produce un dump mayor de 1 KB
- [ ] Añadir `import { adminDb } from '@/db/admin/client'` en cualquier archivo de `src/app` hace
      fallar el lint **y** el test estructural

---

## Fuera del alcance de SP-0

Se construye en SP-1, contra el código que este plan deja en pie:

Clientes y contactos · import CSV · oportunidades · wizard de proyecto · plantilla de fases
aplicada · Planner Kanban · agenda con `CalendarProvider` mock · dashboard con sus tres bloques ·
escritura efectiva en `audit_logs` desde las mutaciones · E2E de Playwright del recorrido completo.
