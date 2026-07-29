# VEKTRIUM SP-4 — Gantt, dependencias y calendario unificado

**Fecha:** 2026-07-29 · **Estado:** Borrador — **sujeto a revisión tras SP-1**
**Depende de:** SP-1 · **Madurez:** Media — las entidades son firmes, la interfaz es una apuesta

> **Advertencia de madurez:** este documento se escribió antes de construir el Planner de SP-1.
> Cuando exista, sabremos cómo se comportan de verdad las tareas y las fases, y algunas decisiones
> de aquí cambiarán. Las entidades y las reglas de negocio deberían sobrevivir; los detalles de
> interacción, no necesariamente.

---

## 1. Objetivo

Convertir el Planner de SP-1 en planificación de verdad: dependencias entre tareas, línea base
contra la que medir desviación, y una vista Gantt usable — no decorativa, en palabras del propio
prompt.

---

## 2. Entidades nuevas

### `milestones`

`project_id`, `name`, `due_date`, `completed_at`, `phase_id` nullable, `is_critical`.

Un hito es un punto sin duración. No es una tarea de cero días: se modela aparte porque su
semántica de cumplimiento es distinta (se cumple o se incumple, no avanza al 60 %).

### `task_dependencies`

`predecessor_id`, `successor_id`, `type`, `lag_days`.

**Decisión:** se implementa únicamente `finish_to_start`, pero la columna `type` existe desde el
principio con el enum completo (`FS`, `SS`, `FF`, `SF`). Añadir un valor a un enum es una migración
trivial; añadir la columna después obliga a reescribir consultas.

### `schedule_baselines`

`project_id`, `captured_at`, `captured_by`, `snapshot` (jsonb), `label`.

La línea base se guarda como snapshot JSON completo de fases, tareas e hitos con sus fechas. No se
normaliza en tablas paralelas: es un documento inmutable que solo se lee para comparar. Normalizarlo
sería complejidad sin beneficio.

---

## 3. Reglas de planificación

**Ciclos de dependencia prohibidos.** Antes de guardar una dependencia se ejecuta detección de
ciclos sobre el grafo. Si la crea, se rechaza con el camino concreto del ciclo en el mensaje, no
con un «dependencia inválida».

**Reprogramación en cascada, siempre con confirmación.** Mover una tarea con sucesoras muestra
cuántas se desplazarán y cuántos días antes de aplicar. Nunca en silencio. Es requisito explícito
de la sección 17 del prompt.

**`end_date >= start_date`** se hace cumplir con CHECK en la base, no solo en el formulario.

**Ruta crítica: no se implementa en SP-4.** El modelo la soporta (`is_critical` en hitos, grafo de
dependencias completo), pero calcularla bien exige duraciones fiables, y en SP-4 aún no habrá
histórico para saber si las estimaciones valen algo. Se etiqueta como fase posterior y **no se
simula un resultado**, según pide la sección 17 del prompt.

---

## 4. Vista Gantt

Escalas diaria, semanal, mensual y trimestral. Barras para fases y tareas, marcadores para hitos,
línea de «hoy», arrastre para mover fechas, redimensionado para cambiar duración, colapsar y
expandir fases, y exportación a PDF legible.

**Decisión de implementación:** Gantt propio sobre SVG, no una librería comercial. Las opciones
maduras del mercado son de pago o traen un modelo de datos que no encaja con el nuestro. Lo que
necesitamos es un subconjunto acotado y bien definido, y la exportación a PDF es trivial desde SVG.

**En móvil no hay Gantt.** Se ofrece un timeline vertical simplificado, coherente con lo que la
sección 30 del prompt admite. Comprimir un Gantt en 375 px produce algo ilegible que nadie usa.

---

## 5. Calendario unificado

Una vista con reuniones, vencimientos de tareas, inicios y fines de fase, hitos, presentaciones y
entregas. Filtros por tipo de evento, proyecto, cliente y responsable. Crear desde una celda,
arrastrar para reprogramar.

**Regla de privacidad:** las tareas **no** se sincronizan a Google Calendar salvo que el usuario lo
active explícitamente por proyecto. Volcar la carga de trabajo interna al calendario personal es
invasivo y el prompt lo prohíbe por defecto en su sección 18.

---

## 6. Riesgos

| Riesgo | Mitigación |
|---|---|
| El Gantt propio se come el presupuesto de tiempo | Alcance cerrado por escrito; si se desborda, se recorta a solo lectura y se replantea |
| Reprogramación en cascada corrompe fechas | Confirmación previa + transacción única + registro en auditoría |
| Grafos de dependencia grandes degradan el rendimiento | Detección de ciclos en memoria sobre el grafo del proyecto, no de toda la base |
| El diseño de interfaz aquí descrito no encaja con lo aprendido en SP-1 | Revisión obligatoria de este spec antes de planificar SP-4 |
