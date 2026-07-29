# VEKTRIUM SP-5 — Minutas, requerimientos y gobierno del cambio

**Fecha:** 2026-07-29 · **Estado:** Borrador — **sujeto a revisión tras SP-1 y SP-2**
**Depende de:** SP-2 · **Madurez:** Media-alta — las reglas son firmes, el editor es una decisión abierta

---

## 1. Objetivo

Cerrar el ciclo entre lo que se habla en una reunión y lo que se ejecuta. Hoy una reunión produce
notas en un cuaderno; después de SP-5 produce una minuta estructurada, tareas, requerimientos y, si
hace falta, una solicitud de cambio trazada.

También completa el wizard de proyecto de 3 pasos a los 6 del prompt, porque aquí aparecen las
tablas que faltaban.

---

## 2. Entidades nuevas

### `meeting_minutes`

`meeting_id`, `status` (`borrador_ia`, `borrador`, `revisada`, `aprobada`), `content` (jsonb
estructurado), `approved_by`, `approved_at`.

### `minute_versions`

`minute_id`, `version`, `content`, `created_by`, `created_at`. Versionado completo, sin borrado.

### `requirements`

`project_id`, `code`, `title`, `description`, `type` (`funcional`, `no_funcional`),
`priority` (MoSCoW), `source_minute_id`, `status`, `version`, `acceptance_criteria`.

### `change_requests`

`project_id`, `requested_by`, `description`, `reason`, `scope_impact`, `date_impact_days`,
`cost_impact`, `risks`, `decision`, `approver_id`, `decided_at`, `evidence_file_id`.

### `risks`

`project_id`, `description`, `probability`, `impact`, `owner_id`, `response`, `review_frequency`,
`status`.

### `deliverables`

`project_id`, `name`, `description`, `owner_id`, `planned_date`, `actual_date`, `status`,
`version`, `acceptance_criteria`, `evidence_file_id`, `approver_id`, `observations`.

---

## 3. Reglas de gobierno

**Ninguna minuta se vuelve oficial sin revisión humana.** La IA puede proponer un borrador, pero
nace en estado `borrador_ia` y la interfaz lo marca visiblemente como tal. Solo una persona lo pasa
a `revisada`. Es requisito literal de la sección 19 del prompt y no es negociable.

**El alcance aprobado no se modifica en silencio.** Cambiar el alcance de un proyecto activo exige
una `change_request` con impacto en alcance, fecha y costo, y un aprobador identificado. La regla 9
del prompt lo pide y aquí se hace estructural: la interfaz no ofrece otra vía.

**Los acuerdos de una minuta se convierten en tareas de un clic**, conservando el vínculo
`source_minute_id`. Una minuta cuyos acuerdos no se convierten en nada es un documento muerto.

**Compartir con el cliente es un enlace con permisos y vencimiento**, no un PDF por correo. El
enlace registra accesos y se puede revocar.

---

## 4. Decisión abierta: el editor

Tres opciones, sin resolver todavía porque depende de cuánta estructura toleren los fundadores:

1. **Formulario por secciones** — cada bloque de la plantilla es un campo. Máxima estructura,
   máxima capacidad de agregación, menor comodidad al escribir.
2. **Editor de texto enriquecido con secciones fijas** — equilibrio. Se puede escribir con fluidez
   pero cada sección sigue siendo un campo identificable.
3. **Markdown libre con extracción posterior** — máxima comodidad, mínima estructura, dificulta
   convertir acuerdos en tareas.

**Recomendación provisional: opción 2.** Se decide con los fundadores tras usar SP-1, no antes.

---

## 5. Completar el wizard de proyecto

Los tres pasos que SP-1 dejó fuera, ahora con tablas donde escribir:

- **Paso 3 — Alcance:** incluye, no incluye, entregables, supuestos, restricciones, dependencias
  externas, criterios de aceptación.
- **Paso 5 — Riesgos y gobierno:** riesgo, probabilidad, impacto, responsable, respuesta,
  frecuencia de seguimiento, aprobadores.
- **Paso 6 — Revisión:** resumen completo, validaciones, crear como borrador o activar.

Y las plantillas de proyecto reutilizables (`project_templates`) que el prompt pide en su sección 14.

---

## 6. Riesgos

| Riesgo | Mitigación |
|---|---|
| Las minutas se perciben como burocracia y nadie las llena | Borrador asistido + conversión de acuerdos en tareas de un clic |
| El proceso de change request frena el trabajo real | Solo obligatorio en proyectos con estado `activo` en adelante |
| Un borrador de IA se aprueba sin leerlo | Estado `borrador_ia` visible + firma explícita de quien revisa |
| Enlaces compartidos filtrados | Vencimiento obligatorio, revocación y registro de accesos |
