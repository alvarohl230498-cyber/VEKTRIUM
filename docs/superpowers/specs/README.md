# Specs de VEKTRIUM

El prompt maestro `VEKTRIUM_Prompt_Claude_Superpowers_v2.md` se descompuso en nueve sub-proyectos.
Cada uno tiene su propio ciclo spec → plan → implementación.

## Estado

| Sub-proyecto | Spec | Plan | Madurez del spec | Depende de |
|---|---|---|---|---|
| **SP-0** Fundación | [spec](2026-07-29-vektrium-sp0-sp1-design.md) | [plan](../plans/2026-07-29-vektrium-sp0-fundacion.md) | Aprobado | — |
| **SP-1** Vertical demostrable | [spec](2026-07-29-vektrium-sp0-sp1-design.md) | pendiente | Aprobado | SP-0 |
| **SP-2** CRM completo | [spec](2026-07-29-vektrium-sp2-crm.md) | pendiente | Alta | SP-1 |
| **SP-3** Google Calendar | [spec](2026-07-29-vektrium-sp3-google-calendar.md) | pendiente | Alta — bloqueado por credenciales | SP-1 |
| **SP-4** Planificación y Gantt | [spec](2026-07-29-vektrium-sp4-planificacion.md) | pendiente | Media — revisar tras SP-1 | SP-1 |
| **SP-5** Minutas y gobierno | [spec](2026-07-29-vektrium-sp5-minutas-gobierno.md) | pendiente | Media-alta | SP-2 |
| **SP-6** Indicadores | [spec](2026-07-29-vektrium-sp6-indicadores.md) | pendiente | **Baja-media — revisar sí o sí** | SP-4 |
| **SP-7** Plataforma | [spec](2026-07-29-vektrium-sp7-plataforma.md) | pendiente | Media-alta | SP-2 |
| **SP-8** Sitio público | [spec](2026-07-29-vektrium-sp8-sitio-publico.md) | pendiente | Alta — independiente | SP-0 |

## Sobre la madurez

Los specs de SP-2 en adelante se escribieron **antes** de construir nada. Eso está bien para fijar
entidades, reglas de negocio y decisiones de arquitectura, pero no para detalles de interacción.

Regla: **antes de escribir el plan de cualquier sub-proyecto, releer su spec y actualizarlo** con lo
aprendido implementando los anteriores. SP-6 es el que más cambiará, porque diseñar indicadores sin
datos reales es adivinar.

## Orden recomendado

SP-0 → SP-1 → SP-2 → SP-7 → SP-4 → SP-5 → SP-6, con SP-3 intercalado en cuanto existan credenciales
de Google y SP-8 en paralelo cuando la prioridad sea comercial.

Este orden difiere del numérico a propósito: SP-7 (archivos, papelera, búsqueda) sube de posición
porque son capacidades que se echan de menos a diario, y SP-6 baja al final porque necesita el
histórico que generan los anteriores.
