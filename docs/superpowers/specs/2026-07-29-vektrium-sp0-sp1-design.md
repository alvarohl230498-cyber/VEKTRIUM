# VEKTRIUM — SP-0 (Fundación) + SP-1 (Vertical demostrable)

**Fecha:** 2026-07-29
**Estado:** Aprobado por el usuario, listo para plan de implementación
**Origen:** `VEKTRIUM_Prompt_Claude_Superpowers_v2.md` (prompt maestro, 44 secciones)
**Zona horaria:** America/Lima · **Idioma de interfaz:** Español

---

## 1. Contexto

VEKTRIUM es una consultora peruana de automatización, datos y productos digitales fundada por
Juan Diego Salazar Campos (finanzas, estrategia, comercial) y Álvaro Rodrigo Hernandez Laos
(administración, RR. HH., operaciones, producto).

El prompt maestro describe dos productos: un sitio público comercial y **VEKTRIUM OS**, un portal
privado de gestión para los fundadores.

### Estado de partida verificado

- Directorio de trabajo **vacío**: sin repositorio, sin código previo. Greenfield.
- Toolchain local: Node **v18.17.0** (insuficiente), pnpm 10.18.3, git 2.41.0, Docker 28.3.2.
  Cliente `psql` no instalado.
- **No existe configuración de Google**: ni dominio en Workspace, ni proyecto en Google Cloud,
  ni credenciales OAuth.
- El negocio **ya opera**: hay entre 10 y 40 clientes y entre 10 y 20 proyectos activos que hoy
  se gestionan fuera de una herramienta propia. Esto no es un demo.
- Presupuesto de infraestructura: mínimo viable, tiers gratuitos mientras sea posible.

---

## 2. Decisión de alcance: descomposición en sub-proyectos

El prompt maestro no cabe en un solo ciclo de especificación. Describe nueve subsistemas
independientes, ~31 tablas y 18 entregables técnicos — del orden de 6 a 12 meses de trabajo.
Intentarlo como un spec único produce o un documento genérico e inaccionable, o veinte pantallas
desconectadas, que es exactamente lo que la sección 39 del prompt prohíbe.

| # | Sub-proyecto | Contenido | Depende de |
|---|---|---|---|
| **SP-0** | Fundación | Repo, stack, esquema base, Google OAuth de identidad, RBAC + RLS, shell de navegación, seeds, CI, backups | — |
| **SP-1** | Vertical demostrable | Login → cliente → oportunidad → reunión → proyecto → fases → tareas → avance | SP-0 |
| SP-2 | CRM completo | 13 estados, motivos de pérdida, ficha de cliente, actividad comercial | SP-1 |
| SP-3 | Google Calendar robusto | Sync incremental con `syncToken`, idempotencia, revocación, booking externo | SP-1 |
| SP-4 | Planificación | Gantt profesional, línea base, dependencias, calendario unificado | SP-1 |
| SP-5 | Minutas y gobierno | Minutas versionadas, requerimientos, change requests, riesgos, entregables | SP-2 |
| SP-6 | Indicadores | Avance ponderado avanzado, salud explicable, cartera | SP-4 |
| SP-7 | Plataforma | Archivos versionados, auditoría avanzada, papelera, notificaciones, búsqueda global | SP-2 |
| SP-8 | Sitio público | Landing, método V.E.K.T.O.R., casos, Vektrium Proof, SEO | SP-0 |

**Este documento especifica únicamente SP-0 y SP-1**, que se tratan como una unidad: la fundación
sin la vertical no demuestra nada, y la vertical sin fundación no existe.

### Resolución de una contradicción del prompt

La sección 39 lista una secuencia de implementación *horizontal* (auth, luego CRM, luego proyectos,
luego Planner…), mientras que la instrucción final exige un recorrido *vertical* demostrable de
punta a punta. Ambas no son compatibles.

**Decisión:** manda la vertical. La secuencia de 15 pasos de la sección 39 se reinterpreta como el
orden de profundización posterior (SP-2 en adelante), no como el orden de construcción inicial.

---

## 3. Restricciones y supuestos

### Restricciones duras

| Restricción | Consecuencia |
|---|---|
| No hay credenciales de Google | Las reuniones se crean contra un proveedor mock, etiquetado en la UI |
| Node 18.17.0 local | **Actualizar a Node 22 LTS** es tarea bloqueante de SP-0 |
| Presupuesto mínimo | Supabase free + Cloudflare. Sin backups gestionados |
| Datos de clientes reales | El backup propio es obligatorio, no opcional |
| Dos fundadores como únicos usuarios iniciales | No se optimiza para concurrencia ni para escala |

### Supuestos declarados

1. Los fundadores usarán el portal a diario, por lo que el proyecto Supabase no entrará en pausa
   por inactividad (el free tier pausa tras 7 días sin uso).
2. El volumen medio (10-40 clientes) justifica un import CSV de clientes y contactos, pero **no**
   un importador general con previsualización y validación compleja.
3. Los datos de contacto son de empresas peruanas y personas de contacto profesional; aplican
   consideraciones de consentimiento pero no un régimen de datos sensibles.
4. Habrá credenciales de Google en algún momento; el diseño no asume *cuándo*.

### Advertencias de licenciamiento y costo

- **El plan Hobby de Vercel es para uso no comercial.** VEKTRIUM es una empresa gestionando datos
  de clientes reales: eso es uso comercial y exigiría Vercel Pro (~USD 20/mes). Por eso el
  despliegue va a **Cloudflare Workers/Pages**, cuyo plan gratuito sí permite uso comercial.
- **Los tiers gratuitos de Postgres no ofrecen recuperación point-in-time.** Mitigación incluida
  en SP-0: `pg_dump` programado hacia almacenamiento propio.

---

## 4. Arquitectura

### Stack

| Capa | Elección | Motivo |
|---|---|---|
| Framework | Next.js 15, App Router | Server Components y Server Actions reducen el código de API a escribir |
| Lenguaje | TypeScript, modo estricto | La matriz de permisos depende de exhaustividad verificada en compilación |
| Estilos | Tailwind CSS con tokens VEKTRIUM en el tema | Los hex del manual quedan como fuente única |
| Componentes | shadcn/ui | Accesibles, se copian al repo y se editan; no es una caja negra |
| ORM | Drizzle | SQL-first, convive bien con RLS, migraciones versionadas |
| Validación | Zod, esquemas compartidos cliente/servidor | Un solo esquema, imposible que se desincronicen |
| Base de datos | Supabase Postgres | Postgres estándar; salida = `pg_dump` |
| Identidad | Supabase Auth (proveedor Google) | Sesiones y refresh gestionados |
| Archivos | Supabase Storage | Políticas por objeto, necesarias desde SP-7 |
| Runtime | Node 22 LTS | Requisito de Next 15 |
| Gestor de paquetes | pnpm | Ya instalado |
| Tests | Vitest + Playwright | Unitarios rápidos, un E2E completo |

### Capas y dependencias

Las dependencias van en un solo sentido. Ninguna capa inferior conoce a una superior.

```
app/            rutas, Server Components, Server Actions, middleware de sesión
  ↓
domain/         lógica pura sin I/O — avance, plantilla de fases, máquinas de
                estado, matriz de permisos, esquemas Zod
  ↓
db/             esquema Drizzle, migraciones, repositorios por agregado
integrations/   CalendarProvider (interfaz) → MockProvider | GoogleProvider
  ↓
Supabase        Postgres + RLS · Auth (solo identidad) · Storage
```

`domain/` no importa nada de `db/` ni de `integrations/`. Esto es lo que permite probar el cálculo
de avance y las reglas de permisos en milisegundos sin levantar Postgres, y lo que reduce una
eventual migración fuera de Supabase a una sola capa.

### Decisión: identidad y autorización de calendario van separadas

| | Identidad | Calendario |
|---|---|---|
| Pregunta que responde | ¿Quién eres? | ¿Me autorizas a agendar? |
| Mecanismo | Supabase Auth con Google | Flujo OAuth propio y explícito |
| Validación | Contra `authorized_users` | Consentimiento independiente del usuario |
| Almacenamiento | Sesión de Supabase | Refresh token **cifrado** en `calendar_connections` |
| Scopes de Calendar | Ninguno | Solo los estrictamente necesarios |

**Consecuencias buscadas:** se puede entrar al portal sin haber conectado Google nunca, y se puede
revocar Google sin perder el acceso. Si estuvieran acoplados, cada expiración de token de Calendar
expulsaría al usuario del portal.

### Decisión: `CalendarProvider` como adaptador

```ts
interface CalendarProvider {
  readonly kind: 'mock' | 'google'
  createEvent(input: CreateEventInput): Promise<Result<CalendarEvent, CalendarError>>
  updateEvent(id: string, input: UpdateEventInput): Promise<Result<CalendarEvent, CalendarError>>
  cancelEvent(id: string): Promise<Result<void, CalendarError>>
}
```

`MockProvider` genera identificadores y URLs de Meet falsas y marca `meetings.is_mock = true`.
La interfaz de usuario muestra una insignia **SIMULADO** en toda reunión y todo enlace con
`is_mock = true`. Cumple la regla 14 del prompt: no se simula una integración sin declararlo.

Cuando existan credenciales, `GoogleProvider` implementa la misma interfaz. Ninguna pantalla cambia.

---

## 5. Modelo de datos

El prompt lista 32 entidades. Este diseño implementa **13**, sustituye **3** por otra solución y
difiere **16** a sub-proyectos posteriores.

### SP-0 — Identidad, acceso y trazabilidad

| Tabla | Columnas relevantes | Notas |
|---|---|---|
| `users` | `id` (↔ `auth.users`), `email`, `full_name`, `role`, `last_seen_at` | Espejo de la tabla de auth con el rol global |
| `authorized_users` | `email` (único), `role`, `invited_by`, `status`, `created_at` | Puerta de entrada. Sin fila aquí, no hay acceso |
| `calendar_connections` | `user_id`, `provider`, `calendar_id`, `refresh_token_encrypted`, `scopes`, `status`, `last_sync_at` | Tokens cifrados en reposo, jamás expuestos al cliente |
| `audit_logs` | `actor_id`, `action`, `entity`, `entity_id`, `before` (jsonb), `after` (jsonb), `reason`, `created_at` | Escrito en la misma transacción que la mutación |

### SP-1 — Comercial

| Tabla | Columnas relevantes | Notas |
|---|---|---|
| `clients` | `legal_name`, `trade_name`, `ruc`, `industry`, `size`, `city`, `country`, `source`, `confidentiality`, `archived_at`, `deleted_at` | RUC opcional. `confidentiality` ∈ {`publico`, `interno`, `confidencial`} |
| `contacts` | `client_id`, `full_name`, `position`, `area`, `email`, `phone`, `preferred_channel`, `consent_at`, `last_interaction_at` | |
| `opportunities` | `client_id`, `title`, `status`, `loss_reason`, `loss_notes`, `recontact_at`, `expected_amount`, `owner_id` | **Nunca se elimina.** Regla 7 del prompt |

**Estados de oportunidad (13, completos):** `nuevo_lead`, `contactado`, `diagnostico_agendado`,
`diagnostico_realizado`, `preparando_propuesta`, `propuesta_enviada`, `en_negociacion`, `ganado`,
`no_aceptado`, `sin_respuesta`, `pospuesto`, `descalificado`, `archivado`.

Al pasar a `no_aceptado`, `loss_reason` es **obligatorio**.

### SP-1 — Ejecución

| Tabla | Columnas relevantes | Notas |
|---|---|---|
| `projects` | `code` (autogenerado, único), `client_id`, `opportunity_id` (nullable), `name`, `status`, `health`, `health_reason`, `owner_id`, `start_date`, `target_date`, `progress_cached`, `archived_at`, `deleted_at` | |
| `project_members` | `project_id`, `user_id`, `role` | Base de todas las políticas RLS |
| `project_phases` | `project_id`, `name`, `order`, `weight`, `planned_start`, `planned_end`, `actual_start`, `actual_end` | Reordenables, duplicables, eliminables |
| `tasks` | `project_id`, `phase_id`, `title`, `description`, `status`, `priority`, `assignee_id`, `start_date`, `due_date`, `estimate_hours`, `weight`, `completion_criteria`, `completed_at` | `weight` por defecto 1 |
| `meetings` | `client_id`, `project_id` (nullable), `type`, `status`, `title`, `starts_at`, `ends_at`, `organizer_id`, `provider`, `provider_event_id`, `meet_url`, `is_mock`, `sync_status`, `sync_error`, `request_id` | |
| `meeting_attendees` | `meeting_id`, `user_id` (nullable), `contact_id` (nullable), `email`, `response` | Internos y externos |

**Estados de tarea (8):** `pendiente`, `lista_para_iniciar`, `en_progreso`, `en_revision`,
`bloqueada`, `esperando_cliente`, `completada`, `cancelada`.

**Restricción de idempotencia:** `UNIQUE (provider, provider_event_id)` en `meetings`, más
`request_id` único por intento de creación. Se crea ahora aunque el proveedor sea el mock, para
que la regla 13 del prompt esté garantizada por la base cuando entre Google.

### Reglas transversales del esquema

- Todos los timestamps son `timestamptz`. `America/Lima` es exclusivamente capa de presentación.
- Toda tabla lleva `created_at`, `updated_at`, `created_by`, `updated_by`.
- Soft delete universal mediante `deleted_at`; los índices y consultas lo excluyen por defecto.
- Índices sobre toda clave foránea y sobre las columnas de filtro frecuente
  (`projects.status`, `tasks.due_date`, `tasks.assignee_id`, `opportunities.status`).
- Restricciones CHECK para que `end_date >= start_date` y para los enums de estado.
- Sin borrado en cascada destructivo: las FK usan `ON DELETE RESTRICT` salvo justificación escrita.

### El avance es derivado, no almacenado

```
avance = Σ(peso de tareas completadas) / Σ(peso de todas las tareas no canceladas)
```

Se calcula con funciones puras en `domain/progress.ts`. La columna `projects.progress_cached`
existe solo para acelerar listados y se refresca en cada mutación de tarea. **La fuente de verdad
es siempre el cálculo.** La interfaz indica si el avance es automático, manual o mixto, según pide
la sección 21 del prompt.

Las tareas canceladas se excluyen del denominador.

### Tablas sustituidas por otra solución (3)

| Tabla del prompt | Sustituida por | Motivo |
|---|---|---|
| `roles` | Enum `users.role` + `project_members.role` | 5 roles fijos, verificados en compilación |
| `permissions` | Matriz tipada en `domain/permissions.ts` | Sin JOIN por verificación; exhaustividad garantizada |
| `oauth_accounts` | Supabase Auth (identidad) + `calendar_connections` (calendario) | Los dos usos están desacoplados por diseño |

### Tablas diferidas a sub-proyectos posteriores (16)

`opportunity_activities`, `milestones`, `task_dependencies`, `task_checklists`, `meeting_minutes`,
`requirements`, `change_requests`, `risks`, `deliverables`, `files`, `comments`, `notifications`,
`calendar_sync_state`, `saved_views`, `project_templates`, `tags`.

---

## 6. Permisos

### Desviación deliberada del prompt

El prompt (sección 32) pide tablas `roles` y `permissions`. **No se implementan como tablas.**

Son cinco roles fijos que cambian con un deploy, no con datos. Como tablas obligarían a un JOIN en
cada verificación y eliminarían la comprobación en tiempo de compilación. La matriz vive en
`domain/permissions.ts` como estructura tipada, se prueba con tests de tabla exhaustivos, y
TypeScript señala cualquier caso sin cubrir al añadir un rol o una acción.

Si en el futuro hicieran falta roles definidos por el usuario, se migra entonces.

### Dos niveles de rol

- `users.role` — rol global: `FOUNDER_ADMIN`, `PROJECT_MANAGER`, `COLLABORATOR`, `CLIENT`, `VIEWER`.
- `project_members.role` — rol dentro de un proyecto concreto.

**El rol efectivo es el más permisivo de los dos.** Esto permite que alguien con rol global `CLIENT`
sea `COLLABORATOR` en el proyecto que le concierne, sin duplicar usuarios.

### Matriz de permisos (alcance SP-1)

| Acción | FOUNDER_ADMIN | PROJECT_MANAGER | COLLABORATOR | CLIENT | VIEWER |
|---|---|---|---|---|---|
| `client.read` | ✅ | ✅ | si es miembro | solo el propio | si es miembro |
| `client.create` / `update` | ✅ | ✅ | ❌ | ❌ | ❌ |
| `contact.read` | ✅ | ✅ | si es miembro | solo el propio | si es miembro |
| `contact.create` / `update` | ✅ | ✅ | ❌ | ❌ | ❌ |
| `opportunity.read` | ✅ | ✅ | ❌ | ❌ | ❌ |
| `opportunity.create` / `update` | ✅ | ✅ | ❌ | ❌ | ❌ |
| `project.read` | ✅ | si es miembro | si es miembro | si es miembro | si es miembro |
| `project.create` | ✅ | ✅ | ❌ | ❌ | ❌ |
| `project.update` | ✅ | si es miembro | ❌ | ❌ | ❌ |
| `project.archive` / `trash` | ✅ | si es miembro | ❌ | ❌ | ❌ |
| `project.purge` | ✅ | ❌ | ❌ | ❌ | ❌ |
| `phase.*` | ✅ | si es miembro | ❌ | ❌ | ❌ |
| `task.read` | ✅ | si es miembro | si es miembro | si es miembro | si es miembro |
| `task.create` / `update` | ✅ | si es miembro | si es asignado | ❌ | ❌ |
| `meeting.read` | ✅ | si es miembro | si es miembro | si es asistente | si es miembro |
| `meeting.create` / `update` | ✅ | ✅ | ❌ | ❌ | ❌ |
| `audit.read` | ✅ | propio proyecto | ❌ | ❌ | ❌ |
| `user.manage` | ✅ | ❌ | ❌ | ❌ | ❌ |

**«Si es miembro»** significa: existe fila en `project_members` para ese usuario en un proyecto
asociado a ese cliente. Ningún rol distinto de `FOUNDER_ADMIN` y `PROJECT_MANAGER` ve datos de
clientes con los que no tiene relación de proyecto.

**Diferencia entre `CLIENT` y `VIEWER`,** que de otro modo se confundirían: ambos son de solo
lectura y ambos están limitados a proyectos donde figuran como miembros. La diferencia está en el
campo visible — `CLIENT` **nunca** ve montos económicos, motivos de pérdida ni notas internas;
`VIEWER` sí los ve, pero no puede modificar nada. Se implementa con proyecciones distintas en la
capa de repositorios, además de en RLS.

### RLS y el riesgo de la clave de servicio

Supabase expone dos claves: `anon` respeta RLS, `service_role` la ignora por completo. Si una
petición de usuario se atiende con `service_role`, la RLS deja de existir sin que nada falle: la
consulta simplemente devuelve datos que no debería.

**Mitigación, tratada como requisito y no como buena práctica:**

1. `service_role` se usa exclusivamente en el cron de backup y en el seed.
2. Vive encapsulada en `db/admin/`, un módulo que no es importable desde `app/`.
3. Una regla de ESLint prohíbe ese import.
4. Un test estructural verifica el grafo de imports y falla si la frontera se rompe.

Las políticas RLS se basan en `auth.uid()` resuelto contra `project_members` y el rol global.

---

## 7. Alcance funcional de SP-1

### Ocho pantallas encadenadas

1. **Login** — Google, validado contra `authorized_users`
2. **Dashboard** — tres bloques
3. **Clientes** — lista, ficha, contactos, import CSV
4. **Oportunidades** — lista con los 13 estados
5. **Agenda** — crear reunión con proveedor mock
6. **Wizard de proyecto** — 3 pasos con guardado automático
7. **Ficha de proyecto** — pestañas Resumen y Planner
8. **Avance** — cálculo ponderado visible

### Navegación

Barra lateral con **cinco** entradas: Inicio, Agenda, Oportunidades, Clientes, Proyectos.

No se muestran entradas deshabilitadas ni marcadas como «próximamente». Un menú lleno de destinos
muertos hace que el producto se perciba abandonado y contradice la sección 31 del prompt sobre no
simular acciones. Cada módulo aparece cuando funciona.

Encabezado: búsqueda (alcance SP-1: proyectos, clientes y tareas por nombre y código), botón
**Crear**, perfil.

### Recortes deliberados respecto del prompt

| Elemento | Prompt pide | SP-1 entrega | Motivo |
|---|---|---|---|
| Wizard de proyecto | 6 pasos | 3 pasos (Identificación, Problema y objetivo, Plan) | Alcance, riesgos y gobierno escriben en tablas que aún no existen |
| Ficha de proyecto | 12 pestañas | 2 (Resumen, Planner) | El resto depende de sub-proyectos posteriores |
| Dashboard | 7 bloques | 3 (cartera, necesita atención, próximas reuniones) | Embudo y carga de trabajo no informan con este volumen |
| Barra lateral | 11 entradas | 5 | Solo lo implementado |
| Planner en móvil | Drag & drop | Lista agrupada con selector de estado | Arrastrar en pantalla pequeña es frustrante y falla |

### Lo que NO se recorta: los 13 estados de oportunidad

Va en contra del instinto de minimizar, y es intencional. Ya existen oportunidades reales en curso.
Con cinco estados, los fundadores seguirían llevando el resto en Excel y el portal nacería
derrotado. Un enum de 13 valores más su interfaz cuesta poco y decide si la migración ocurre.

### Plantilla base de fases VEKTRIUM

Se crea al aplicar la plantilla, con las nueve fases del prompt (sección 15), todas editables,
reordenables, duplicables y eliminables:

Fase 0 Calificación y preparación · Fase 1 Descubrimiento · Fase 2 Diagnóstico y propuesta ·
Fase 3 Validación · Fase 4 Diseño y planificación · Fase 5 Construcción · Fase 6 Presentación final ·
Fase 7 Entrega · Fase 8 Seguimiento postentrega.

Peso por defecto igual para todas; editable por proyecto.

### Import CSV

Alcance estricto: **clientes y contactos únicamente**. Validación con Zod, previsualización de las
primeras filas, reporte de errores por fila, y transacción única (todo o nada). Sin importación de
proyectos, tareas ni reuniones.

### Datos de prueba

Los seeds con datos ficticios están etiquetados como «Dato ilustrativo» y son exclusivos de
desarrollo y tests. **Producción arranca vacía** y se puebla por import CSV y carga manual. No
conviven datos falsos con clientes reales: lo pide la regla 2 del prompt y además contaminaría
cualquier métrica.

### Las cuatro formas de eliminar (sección 24)

| Acción | Implementación | Quién |
|---|---|---|
| Archivar | `archived_at` — sale de vistas operativas, conserva todo | PROJECT_MANAGER miembro |
| Marcar no aceptado | `status` de la oportunidad + `loss_reason` obligatorio | PROJECT_MANAGER |
| Mover a papelera | `deleted_at`, retención **30 días por defecto** (`TRASH_RETENTION_DAYS`), restaurable | PROJECT_MANAGER miembro |
| Eliminar permanentemente | `DELETE` real, exige escribir el nombre del proyecto, muestra qué se pierde | Solo FOUNDER_ADMIN |

La eliminación permanente deja registro en `audit_logs` aunque el proyecto desaparezca.

---

## 8. Errores y estados de interfaz

### Tres clases de error, tres tratamientos

**Validación.** Inline, en el campo, sin toast. El esquema Zod es el mismo objeto importado desde
`domain/` en cliente y servidor: no pueden desincronizarse.

**Permiso.** Con una distinción de seguridad: el acceso por URL directa a un recurso no permitido
devuelve **404, no 403**, porque un 403 confirma la existencia del recurso y permite enumerar
proyectos ajenos probando identificadores. Cuando la acción se inicia desde dentro de la interfaz,
donde la existencia ya es conocida, se indica explícitamente la falta de permiso y con qué rol se
tendría.

**Sistema e integración.** Visibles, con reintento, y registrados. Nunca en silencio.

### `Result<T, E>` en el dominio

`domain/` no lanza excepciones para fallos esperados: devuelve uniones discriminadas que obligan a
manejar el error antes de acceder al valor. Las excepciones quedan para bugs reales y caídas de
infraestructura.

### Sincronización de calendario visible

Cada reunión expone su `sync_status` (`pendiente`, `sincronizada`, `fallida`) en la ficha, con el
error en lenguaje comprensible y acción de reintento. Sin Google conectado, la reunión se guarda en
local y aparece la acción «Crear evento en Google» (sección 10 del prompt).

### Los siete estados obligatorios

Vacío, carga, éxito, error, sin conexión, permisos insuficientes y confirmación destructiva se
construyen como componentes compartidos.

**Regla sin excepción:** ninguna vista de lista se acepta sin su estado vacío redactado a mano.
«No hay datos» no es aceptable — el vacío de Oportunidades explica cómo crear la primera y ofrece
el botón.

### Actualizaciones optimistas en el Planner

Arrastrar una tarjeta actualiza la interfaz al instante; si el servidor rechaza, revierte con
mensaje explicando por qué. Sin esto cada arrastre acarrea latencia perceptible.

Una tarea **no** se marca completada solo por moverla de columna si faltan campos obligatorios o
evidencia requerida (sección 16 del prompt).

### Guardado automático

Indicador persistente con tres estados: Guardando · Guardado · Sin conexión.

### Auditoría transaccional

El registro en `audit_logs` ocurre **en la misma transacción** que la mutación. Si falla la
auditoría, falla la escritura. Hacerlo asíncrono sería más rápido pero produciría una traza *casi
siempre* correcta, que es inútil justo cuando se necesita. La regla 9 del prompt exige trazabilidad
de toda modificación material; esto la hace cierta.

### Sin conexión

Se detecta la pérdida de red y se bloquean las escrituras con un banner claro. **No se construye
cola offline ni sincronización diferida**: mucha complejidad para dos personas con buena conexión, y
las colas offline mal implementadas corrompen datos. Decisión documentada, no omisión.

---

## 9. Estrategia de pruebas

### Unitarios — Vitest sobre `domain/`

Funciones puras, milisegundos, cobertura alta:

- Cálculo de avance ponderado, incluyendo tareas canceladas y proyectos sin tareas
- **Matriz de permisos**: tests de tabla sobre cada combinación de rol global × rol de proyecto × acción
- Transiciones de estado de proyecto, tarea y oportunidad, incluidas las inválidas
- Generación de la plantilla de nueve fases
- Esquemas Zod, casos límite y mensajes en español

### Integración — Postgres real en Docker

Sin mocks de base de datos. Se prueban migraciones, repositorios y, en particular, **las políticas
RLS**: una batería se conecta como usuario A e intenta leer datos de usuario B, y falla si lo
consigue. Es la única verificación honesta de RLS; leer las políticas no basta.

### E2E — Playwright, un recorrido completo

El recorrido de SP-1 de punta a punta: entrar → crear cliente → crear oportunidad → agendar reunión
→ convertir en proyecto → aplicar plantilla de fases → mover una tarea en el Planner → verificar que
el avance cambia.

Uno solo, completo. No veinte E2E frágiles que tardan diez minutos y que nadie revisa al fallar.

### Estructural

Test que verifica el grafo de imports y falla si `db/admin/` (clave `service_role`) resulta
alcanzable desde `app/`.

### CI

Lint · typecheck · unitarios · integración con Postgres en contenedor · build · E2E.

---

## 10. Operación

- **Backup:** `pg_dump` programado a almacenamiento propio. Tarea de SP-0, no opcional.
- **Entornos:** desarrollo local con Supabase CLI, y producción. Sin staging en esta fase — se
  añade cuando haya un tercer colaborador.
- **Secretos:** variables de entorno documentadas en `.env.example` sin valores reales. Ningún
  secreto alcanzable desde el cliente.
- **Logs:** estructurados, sin datos personales ni tokens.
- **Ruta privada:** `/os`, sin enlaces públicos, `noindex`.

---

## 11. Deuda técnica aceptada

Registrada conscientemente, no olvidada:

| Deuda | Motivo | Cuándo se paga |
|---|---|---|
| Sin colas de trabajos | Un cron basta para el volumen de dos fundadores | SP-3, si la sincronización lo exige |
| Sin staging | Coste sin beneficio con dos personas | Al sumar el tercer colaborador |
| Proveedor de calendario mock | No hay credenciales de Google | Cuando exista Workspace + proyecto GCP |
| Sin cola offline | Complejidad desproporcionada y riesgo de corrupción | Probablemente nunca |
| `progress_cached` denormalizado | Evita recalcular en listados | Se revisa si aparece deriva |
| Búsqueda por nombre y código, no full-text | Suficiente en SP-1 | SP-7, búsqueda global |

---

## 12. Desviaciones respecto del prompt maestro

Resumen de todo lo que se aparta del documento original, con su justificación:

| # | Prompt | Este diseño | Motivo |
|---|---|---|---|
| 1 | Tablas `roles` y `permissions` | Enum + matriz tipada en código | 5 roles fijos; verificación en compilación; sin JOIN por permiso |
| 2 | Secuencia horizontal de 15 pasos (§39) | Vertical primero | Contradice la instrucción final del propio prompt; la vertical manda |
| 3 | Wizard de 6 pasos | 3 pasos en SP-1 | Los otros 3 escriben en tablas inexistentes |
| 4 | 32 entidades | 13 implementadas, 3 sustituidas, 16 diferidas | El resto llega con sus sub-proyectos |
| 5 | Colas de trabajos (§33) | Cron | Volumen no lo justifica |
| 6 | Drag & drop en Planner | Lista con selector en móvil | Usabilidad real en pantalla pequeña |

La elección de Cloudflare sobre Vercel **no** es una desviación: la sección 33 del prompt admite
ambos explícitamente. El motivo de la elección está en la sección 3 de este documento.

---

## 13. Definición de terminado para SP-0 + SP-1

Adaptada de la sección 44 del prompt. Una funcionalidad está terminada cuando:

- Cumple sus criterios de aceptación
- Funciona con los permisos correctos, verificado por test de RLS
- Tiene estados de carga, vacío y error, con textos redactados
- Es responsive en escritorio, tablet y móvil
- Valida entradas en cliente y servidor con el mismo esquema
- Tiene pruebas unitarias y, si toca la base, de integración
- Registra auditoría cuando modifica datos materiales
- Está documentada
- No expone secretos ni datos sensibles

### Criterio de aceptación global de SP-1

Un fundador, en una sesión, sin ayuda y sin tocar la base de datos, puede:

**Iniciar sesión → registrar un prospecto → agendar una primera reunión (con Meet simulado y
etiquetado) → convertir la oportunidad en proyecto → aplicar la plantilla de nueve fases →
organizar tareas en el Planner → ver el avance ponderado actualizarse → archivar el proyecto
conservando toda su trazabilidad.**

Y cada una de esas acciones deja registro en `audit_logs`.

---

## 14. Riesgos

| Riesgo | Impacto | Mitigación |
|---|---|---|
| `service_role` filtrada a código de usuario | RLS anulada en silencio | Módulo aislado + regla ESLint + test estructural |
| Free tier de Supabase se queda corto | Bloqueo operativo | Monitoreo de cuota; salto a plan de USD 25 previsto |
| Google nunca se configura | La agenda queda simulada indefinidamente | El mock es funcional y está etiquetado; el portal sirve igual |
| Los fundadores no migran de Excel | El portal se abandona | Los 13 estados completos + import CSV reducen la fricción |
| Pérdida de datos sin PITR | Grave, hay clientes reales | `pg_dump` programado desde SP-0 |
| Complejidad de RLS ralentiza el desarrollo | Retraso | Políticas simples basadas en `project_members`; tests desde el inicio |

---

## 15. Próximo paso

Plan de implementación mediante la skill `superpowers:writing-plans`, cubriendo SP-0 y SP-1 en
tareas verificables con criterios de aceptación por tarea.
