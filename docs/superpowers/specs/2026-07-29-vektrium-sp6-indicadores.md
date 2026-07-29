# VEKTRIUM SP-6 — Indicadores, salud de proyecto y dashboard de cartera

**Fecha:** 2026-07-29 · **Estado:** Borrador — **el más sujeto a revisión de todos**
**Depende de:** SP-4 · **Madurez:** Baja-media

> **Advertencia de madurez:** este es el spec que más va a cambiar. Un sistema de indicadores
> diseñado antes de tener datos reales mide lo que el diseñador imagina, no lo que el negocio
> necesita. Las definiciones de aquí son un punto de partida honesto, no una especificación cerrada.

---

## 1. Objetivo

Responder en menos de 30 segundos las siete preguntas de la sección 9 del prompt, y hacerlo con
métricas **explicables**: cada número debe poder abrirse y mostrar de dónde sale.

---

## 2. Principio rector: sin falsa precisión

Tres reglas que gobiernan todo el módulo:

**Cada indicador muestra su definición.** Un tooltip con la fórmula exacta, accesible también por
teclado. «Avance 67 %» sin definición es una opinión disfrazada de dato.

**Ningún porcentaje con decimales innecesarios.** Un avance del 66,7 % sugiere una precisión que el
dato no tiene. Se redondea a entero.

**Los indicadores sin datos suficientes no se muestran vacíos: se explican.** «Conversión de
propuesta a proyecto» con tres propuestas cerradas no dice nada; el bloque indica cuántos casos
faltan para que el número sea informativo.

---

## 3. Salud del proyecto

El prompt pide (sección 21) que la salud sea calculada **y explicable**, y que el usuario pueda
corregirla dejando justificación.

### Señales de entrada

| Señal | Peso provisional |
|---|---|
| Desviación de cronograma contra línea base | Alto |
| Tareas vencidas sin cerrar | Alto |
| Bloqueadores abiertos | Alto |
| Días sin actualización del proyecto | Medio |
| Hitos próximos sin avance | Medio |
| Dependencias externas pendientes | Bajo |

### Salida

Verde, ámbar, rojo o gris — **acompañados siempre del motivo**, nunca solo del color. La sección 31
del prompt prohíbe depender exclusivamente del color, y aquí eso se traduce en que cada estado se
acompaña de texto y de un icono distinto.

**El usuario manda sobre el cálculo.** Puede fijar la salud manualmente con una justificación
obligatoria, y la interfaz muestra ambas: la sugerida y la asignada, con quién la cambió y cuándo.
El responsable de un proyecto sabe cosas que ningún algoritmo ve.

**Los pesos son configurables y su calibración es explícitamente provisional.** Se revisan tras dos
meses de uso real.

---

## 4. Indicadores por proyecto

Avance ponderado · avance por fase · tareas completadas sobre totales · tareas vencidas · hitos
cumplidos a tiempo · variación de cronograma en días · días sin actualización · bloqueadores
abiertos · tiempo medio de resolución de bloqueadores · cambios de alcance aprobados · reuniones
realizadas · reuniones sin minuta · cumplimiento de entregables.

---

## 5. Indicadores de cartera

Proyectos activos · por estado · en riesgo · entregas por mes · cumplimiento de hitos · tiempo
medio de lead a propuesta · conversión de propuesta a proyecto · motivos de oportunidades perdidas ·
clientes con más de un proyecto.

**Umbral de visualización:** los indicadores de conversión y tiempos medios permanecen ocultos hasta
acumular al menos 10 casos cerrados. Antes de eso son anécdota, no estadística.

---

## 6. Dashboard completo

Se completan los cuatro bloques que SP-1 dejó fuera: embudo comercial, salud de proyectos, carga de
trabajo y actividad reciente.

**Carga de trabajo:** tareas por responsable y alertas de sobreasignación. Las horas estimadas
contra disponibles quedan tras una *feature flag* desactivada por defecto — exige que alguien
mantenga estimaciones fiables, y si nadie lo hace el indicador miente.

---

## 7. Riesgos

| Riesgo | Mitigación |
|---|---|
| Indicadores que nadie mira | Se recorta a los que se demuestren usados tras dos meses |
| Salud calculada que contradice la realidad percibida | Override manual con justificación, visible junto a la sugerencia |
| Métricas con muestras minúsculas presentadas como análisis | Umbrales mínimos de visualización |
| Cálculos pesados degradan el dashboard | `progress_cached` ya existe; se añade caché por proyecto si hace falta |
| Este spec envejece mal | Revisión obligatoria antes de planificar, con datos reales de SP-1 a SP-4 en la mano |
