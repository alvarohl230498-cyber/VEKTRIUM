# VEKTRIUM SP-8 — Sitio público y Vektrium Proof

**Fecha:** 2026-07-29 · **Estado:** Borrador aprobado para planificación
**Depende de:** SP-0 únicamente · **Madurez:** Alta — es independiente del portal

> **Nota de orden:** este sub-proyecto **no depende de SP-1 a SP-7**. Solo necesita la fundación.
> Si en algún momento la prioridad pasa a ser comercial en lugar de operativa, puede adelantarse
> sin tocar el resto de la secuencia.

---

## 1. Objetivo

Convertir visitas calificadas en solicitudes de **Diagnóstico Vektor**. Demostrar capacidad con
proyectos, método y resultados verificables — sin frases vacías, promesas absolutas, testimonios
inventados ni métricas sin sustento.

---

## 2. La restricción que define este sub-proyecto

La regla 1 del prompt prohíbe inventar clientes, testimonios o resultados. La regla 2 obliga a
etiquetar como «Dato ilustrativo» toda cifra ficticia.

Esto tiene una consecuencia incómoda que conviene decir en voz alta: **una consultora recién
formada no tiene casos de éxito publicables**, y la mayoría del trabajo real está bajo
confidencialidad. Diseñar la página de Proyectos como si hubiera diez casos que contar produciría
o una página vacía o una mentira.

**Decisión:** la sección de proyectos se estructura en tres tipos claramente diferenciados con
etiqueta visible en cada tarjeta:

| Tipo | Qué es | Requisito |
|---|---|---|
| **Caso real** | Trabajo entregado a un cliente | Autorización escrita del cliente, o anonimizado |
| **Demo** | Producto funcional construido por VEKTRIUM sobre datos ficticios | Etiqueta «Dato ilustrativo» en toda cifra |
| **Prototipo** | Prueba de concepto, no productivo | Etiquetado como tal |

Un portafolio honesto de demos bien construidas convence más que casos de éxito inverosímiles, y
además no genera un problema legal.

---

## 3. Arquitectura de la página

1. **Hero** — tagline «Automatizamos el trabajo. Elevamos las decisiones.», texto de valor, CTA
   principal «Solicitar diagnóstico», CTA secundario «Ver proyectos», y un mockup **auténtico** de
   un dashboard real construido por ellos.
2. **Franja de confianza** — procesos medibles, integraciones documentadas, diseño centrado en
   usuario, seguridad y soporte.
3. **Problemas reconocibles** — trabajo manual repetitivo, reportes dispersos, información sin
   trazabilidad, procesos dependientes de una sola persona, datos que no llegan a decisión.
4. **Servicios** — automatización de procesos, data y reporting, dashboards ejecutivos, apps y
   portales internos, AI enablement responsable, mejora continua.
5. **Método V.E.K.T.O.R.** — Ver, Establecer, Construir, Transformar, Operar, Revisar.
6. **Proyectos** — filtros por industria, área, problema y tecnología.
7. **Página de caso** — contexto, línea base, usuarios, solución, arquitectura funcional, resultado,
   riesgos y aprendizajes, stack, CTA.
8. **Fundadores** — la complementariedad entre finanzas y operaciones. Sin biografías infladas.
9. **Paquetes** — Start, Scale, Partner. Precios «desde» o cotización. **Sin montos inventados.**
10. **Recursos y Vektrium Proof** — casos públicos, demos, videos, plantillas.
11. **Contacto** — formulario, agenda, WhatsApp empresarial, política de privacidad, términos, libro
    de reclamaciones cuando corresponda.

---

## 4. Vektrium Proof

Zona autenticada con material que no se publica abierto. Reutiliza la autenticación de SP-0 con un
rol adicional de acceso limitado.

**Visibilidad por proyecto:** público · miembros · cliente específico · solo fundadores. El control
vive en el mismo modelo de permisos, no en un sistema paralelo.

Nunca se publican datos personales, empresariales o confidenciales sin autorización explícita
registrada.

---

## 5. Separación estricta del portal

**El sitio público y el portal privado no comparten navegación, ni encabezado, ni pie.** Un visitante
no debe encontrar rastro de `/os`, y un fundador dentro del portal no navega hacia el sitio público
por accidente. Es la regla 6 del prompt.

`/os` lleva `noindex, nofollow` y no aparece en el sitemap.

---

## 6. Rendimiento, accesibilidad y SEO

- Renderizado estático para todo lo que no cambie por sesión. El sitio público no necesita servidor.
- Objetivo Lighthouse: 95+ en rendimiento y accesibilidad.
- **WCAG 2.2 AA como mínimo**, verificado con herramienta automática y revisión por teclado.
- Metadatos por página, datos estructurados de organización, sitemap, Open Graph.
- Imágenes en formatos modernos con dimensiones explícitas.
- **Sin analítica de terceros que recoja contenido sensible.** Eventos del prompt (sección 36):
  `hero_cta`, `project_view`, `resource_download`, `form_submit`, `booking_start`,
  `booking_complete`, `whatsapp_click`.

---

## 7. Contenido

El diseño y el desarrollo pueden ir en paralelo, pero **el contenido es el camino crítico**. Un
sitio impecable con textos de relleno no convierte. Los textos de servicios, método, fundadores y
paquetes los tienen que escribir o validar Juan Diego y Álvaro; se puede proponer borrador, no
inventar posicionamiento.

---

## 8. Riesgos

| Riesgo | Mitigación |
|---|---|
| No hay casos reales publicables | Tipología explícita de caso, demo y prototipo, etiquetada |
| El contenido se retrasa y bloquea el lanzamiento | Se identifica como camino crítico desde el inicio del plan |
| Tentación de inflar resultados | Regla 1 del prompt como criterio de aceptación, no como aspiración |
| El formulario atrae spam | Límite por IP y comprobación de tiempo mínimo, sin CAPTCHA |
| Fuga de confidencialidad en un caso | Autorización escrita registrada antes de publicar |
