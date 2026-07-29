# VEKTRIUM SP-2 — CRM completo y trazabilidad comercial

**Fecha:** 2026-07-29 · **Estado:** Borrador aprobado para planificación tras SP-1
**Depende de:** SP-1 · **Madurez:** Alta — es el siguiente en la fila, diseñado con detalle
**Spec base:** `2026-07-29-vektrium-sp0-sp1-design.md`

---

## 1. Objetivo

SP-1 deja oportunidades funcionando con sus 13 estados, pero sin memoria: no queda registro de qué
se hizo, cuándo ni por qué se perdió. SP-2 convierte el módulo comercial en el historial completo
que el prompt exige en su sección 11 — incluidos, y sobre todo, **los clientes que dijeron que no**.

La tesis del prompt es que una oportunidad perdida es un activo, no un residuo. Este sub-proyecto
la implementa.

---

## 2. Entidades nuevas

### `opportunity_activities`

Bitácora de todo lo que ocurre en una oportunidad.

| Columna | Tipo | Notas |
|---|---|---|
| `opportunity_id` | uuid FK | |
| `kind` | enum | `nota`, `llamada`, `correo`, `reunion`, `propuesta_enviada`, `cambio_estado`, `documento` |
| `body` | text | Contenido o resumen |
| `occurred_at` | timestamptz | Cuándo pasó, no cuándo se registró |
| `created_by` | uuid FK | |
| `meeting_id` | uuid FK nullable | Enlace a la reunión que la originó |

**Decisión:** `occurred_at` se separa de `created_at` porque los fundadores registrarán llamadas
horas después de tenerlas. Ordenar la bitácora por fecha de registro produciría una cronología
falsa.

### Columnas añadidas a `opportunities`

| Columna | Notas |
|---|---|
| `loss_competitor` | text nullable — solo cuando el cliente lo menciona |
| `loss_notes` | text — aprendizaje, no excusa |
| `recontact_at` | date nullable — fecha sugerida de recontacto |
| `source_detail` | text — el canal concreto dentro de `clients.source` |
| `first_contact_at` | timestamptz — para medir tiempo de lead a propuesta |
| `proposal_sent_at` | timestamptz | |
| `closed_at` | timestamptz | |

---

## 3. Reglas de negocio

**Los motivos de pérdida son un enum cerrado**, no texto libre, porque el objetivo es agregarlos
después. Valores tomados de la sección 11 del prompt: `presupuesto_insuficiente`,
`competidor`, `prioridad_postergada`, `sin_respuesta`, `solucion_interna`, `no_encajaba`, `otro`.
`otro` obliga a rellenar `loss_notes`.

**Ninguna oportunidad se elimina.** La acción de borrado no existe en la interfaz. Solo se archiva.
Es la regla 7 del prompt y se hace cumplir con una política RLS que deniega `DELETE` a todos los
roles, no solo escondiendo el botón.

**Recontacto como ciudadano de primera clase.** Una oportunidad en `no_aceptado`, `pospuesto` o
`sin_respuesta` con `recontact_at` vencida aparece en el bloque «Necesita atención» del dashboard.
Sin esto, el historial de pérdidas es un cementerio en lugar de una cartera latente.

**La ficha de cliente agrega todo.** Reuniones, oportunidades, proyectos, archivos y actividad en
una sola vista cronológica. Es la pantalla que se abre antes de una reunión.

---

## 4. Pantallas

| Pantalla | Contenido |
|---|---|
| Lista de oportunidades | Tabla y vista Kanban por estado, con filtros por cliente, responsable, origen y rango de fecha |
| Ficha de oportunidad | Datos, bitácora cronológica, documentos, reuniones vinculadas, acciones de estado |
| Ficha de cliente | Identificación, contactos, historial agregado, nivel de confidencialidad |
| Informe de pérdidas | Agregado por motivo, competidor e industria. Sin gráficos hasta tener volumen |

**Decisión sobre el informe de pérdidas:** se muestra como tabla, no como gráfico, hasta superar
las 20 oportunidades cerradas. Un gráfico de tarta con cuatro segmentos es ruido que aparenta
análisis.

---

## 5. Fuera de alcance

Automatizaciones de seguimiento, secuencias de correo, puntuación de leads, previsión de ingresos y
cualquier integración con proveedores de correo. El prompt las sitúa en segunda fase (sección 41) y
ninguna tiene sentido con este volumen.

---

## 6. Riesgos

| Riesgo | Mitigación |
|---|---|
| La bitácora se convierte en un campo de notas que nadie rellena | Registro automático de cambios de estado y reuniones; solo lo manual es opcional |
| El enum de motivos de pérdida resulta insuficiente | `otro` + `loss_notes` obligatorio; se revisa el enum tras 20 cierres |
| Migrar el historial comercial existente desde Excel | Se extiende el import CSV de SP-1 a oportunidades, con los mismos criterios |
