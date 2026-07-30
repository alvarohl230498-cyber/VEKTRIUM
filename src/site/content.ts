import 'server-only'

const vercelUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL ?? process.env.VERCEL_URL

export const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? (vercelUrl ? `https://${vercelUrl}` : 'http://localhost:3000')

export const brand = {
  name: 'VEKTRIUM',
  tagline: 'Automatizamos el trabajo. Elevamos las decisiones.',
  description:
    'Automatizacion, datos y productos digitales para operaciones que necesitan menos trabajo manual, mas trazabilidad y mejores decisiones.',
}

export const firstReportOffer = {
  eyebrow: 'Primer reporte sin adelanto',
  headline: 'Consulta y alcance gratuitos para probar nuestra eficiencia.',
  detail:
    'Revisamos tu proceso, definimos el reporte inicial y avanzamos sin adelanto: pagas al final, cuando te presentemos el resultado terminado.',
  note: 'Aplica para un primer reporte de alcance acotado y validado en la consulta inicial.',
  steps: [
    'Nos cuentas el proceso, el reporte que necesitas y donde hoy se pierde tiempo.',
    'Definimos alcance, datos necesarios y entregable sin costo.',
    'Construimos el primer reporte acordado con evidencia visible.',
    'Pagas al finalizar, cuando te lo presentemos terminado.',
  ],
} as const

export const publicNav = [
  { href: '/servicios', label: 'Servicios' },
  { href: '/metodo', label: 'Metodo' },
  { href: '/proyectos', label: 'Proyectos' },
  { href: '/fundadores', label: 'Fundadores' },
  { href: '/paquetes', label: 'Paquetes' },
  { href: '/recursos', label: 'Recursos' },
] as const

export const legalNav = [
  { href: '/privacidad', label: 'Privacidad' },
  { href: '/terminos', label: 'Terminos' },
  { href: '/libro-reclamaciones', label: 'Libro de reclamaciones' },
] as const

export const trustSignals = [
  {
    title: 'Primer reporte sin adelanto',
    copy: 'Consulta y alcance inicial gratuitos; pagas cuando te presentamos el reporte terminado.',
  },
  {
    title: 'Integraciones documentadas',
    copy: 'Las conexiones, responsables y supuestos quedan escritos para operar sin dependencia invisible.',
  },
  {
    title: 'Diseno centrado en usuario',
    copy: 'El flujo se valida con quienes realmente ejecutan el trabajo.',
  },
  {
    title: 'Seguridad y soporte',
    copy: 'Permisos, trazabilidad y continuidad se tratan como requisitos de producto.',
  },
] as const

export const problems = [
  {
    title: 'Trabajo manual repetitivo',
    copy: 'Equipos copiando informacion entre hojas, correos y sistemas sin un flujo confiable.',
  },
  {
    title: 'Reportes dispersos',
    copy: 'Datos que no cuadran porque cada area trabaja con su propia version de la verdad.',
  },
  {
    title: 'Informacion sin trazabilidad',
    copy: 'Decisiones, minutas, responsables y cambios sin registro claro de origen.',
  },
  {
    title: 'Dependencia de una sola persona',
    copy: 'Procesos criticos que se detienen cuando quien los conoce no esta disponible.',
  },
  {
    title: 'Datos lejos de la decision',
    copy: 'Indicadores que llegan tarde, sin contexto o sin una accion siguiente definida.',
  },
] as const

export const services = [
  {
    slug: 'automatizacion-procesos',
    title: 'Automatizacion de procesos',
    summary:
      'Flujos que reducen tareas repetitivas, errores manuales y tiempos muertos entre areas.',
    deliverables: [
      'Mapa del proceso actual y del flujo objetivo.',
      'Automatizaciones con responsables, excepciones y bitacora.',
      'Documentacion para continuidad operativa.',
    ],
  },
  {
    slug: 'data-reporting',
    title: 'Data y reporting',
    summary:
      'Modelos, validaciones y reportes para transformar datos dispersos en lectura ejecutiva.',
    deliverables: [
      'Diccionario de datos y reglas de calidad.',
      'Tableros ejecutivos con lectura accionable.',
      'Rutinas de actualizacion y control.',
    ],
  },
  {
    slug: 'dashboards-ejecutivos',
    title: 'Dashboards ejecutivos',
    summary:
      'Paneles que conectan indicadores, responsables y estado real de la operacion.',
    deliverables: [
      'Indicadores priorizados por decision.',
      'Vistas para direccion, lideres y operacion.',
      'Alertas visuales y seguimiento de brechas.',
    ],
  },
  {
    slug: 'apps-portales-internos',
    title: 'Apps y portales internos',
    summary:
      'Herramientas privadas para operar clientes, proyectos, tareas, documentos y aprobaciones.',
    deliverables: [
      'Flujos de usuario y permisos por rol.',
      'Pantallas operativas para trabajo recurrente.',
      'Auditoria de cambios y estados.',
    ],
  },
  {
    slug: 'ai-responsable',
    title: 'AI enablement responsable',
    summary:
      'Casos de uso con limites claros, trazabilidad y foco en resultados medibles.',
    deliverables: [
      'Evaluacion de oportunidad y riesgo.',
      'Prompts, reglas y control humano.',
      'Pruebas de calidad antes de adopcion.',
    ],
  },
  {
    slug: 'mejora-continua',
    title: 'Mejora continua',
    summary:
      'Seguimiento posterior a la entrega para medir adopcion, ajustar flujos y escalar valor.',
    deliverables: [
      'Revision periodica de indicadores.',
      'Backlog de mejoras priorizado.',
      'Soporte de adopcion y transferencia.',
    ],
  },
] as const

export const methodSteps = [
  {
    letter: 'V',
    title: 'Ver',
    copy: 'Entender el proceso real, sus usuarios, fricciones, datos disponibles y restricciones.',
    output: 'Mapa del proceso y diagnostico inicial.',
  },
  {
    letter: 'E',
    title: 'Establecer',
    copy: 'Definir alcance, linea base, riesgos, indicadores y criterios de exito.',
    output: 'Plan de trabajo y tablero de control.',
  },
  {
    letter: 'K',
    title: 'Construir',
    copy: 'Disenar e implementar una solucion usable, medible y mantenible.',
    output: 'Producto funcional con pruebas y documentacion.',
  },
  {
    letter: 'T',
    title: 'Transformar',
    copy: 'Acompanar adopcion, ajustes, capacitacion y transferencia operativa.',
    output: 'Usuarios entrenados y flujo adoptado.',
  },
  {
    letter: 'O',
    title: 'Operar',
    copy: 'Dejar controles, responsables, bitacoras y soporte de continuidad.',
    output: 'Operacion trazable y lista para sostenerse.',
  },
  {
    letter: 'R',
    title: 'Revisar',
    copy: 'Medir impacto, detectar brechas y proponer mejora continua.',
    output: 'Reporte de resultados y backlog priorizado.',
  },
] as const

export type ProjectKind = 'Caso real' | 'Demo' | 'Prototipo'
export type ProjectFilterKey = 'industria' | 'area' | 'problema' | 'tecnologia' | 'tipo'

export type Project = {
  slug: string
  kind: ProjectKind
  title: string
  summary: string
  industry: string
  area: string
  problem: string
  technology: string
  tags: string[]
  label: string
  context: string
  baseline: string
  users: string
  solution: string
  architecture: string[]
  result: string
  risks: string[]
  stack: string[]
  /**
   * Ruta de imagen bajo /public (ej. "/proyectos/mi-caso.jpg"). Opcional: los
   * demos ilustrativos no llevan imagen real. Para publicar un caso con foto,
   * coloca el archivo en public/proyectos/ y referencia esa ruta aqui.
   */
  image?: string
}

export const projects: Project[] = [
  {
    slug: 'dashboard-rrhh',
    kind: 'Demo',
    title: 'Dashboard ejecutivo de RR.HH.',
    summary:
      'Vista de ausentismo, headcount, rotacion y alertas criticas para direccion y gestion humana.',
    industry: 'Servicios',
    area: 'Recursos Humanos',
    problem: 'Reportes dispersos',
    technology: 'Power BI',
    tags: ['Dato ilustrativo', 'RR.HH.', 'Dashboards', 'Power BI'],
    label: 'Demo con datos ficticios',
    context:
      'Un equipo de gestion humana necesita consolidar indicadores de asistencia, dotacion, rotacion y alertas sin depender de archivos separados.',
    baseline:
      'La linea base del demo asume archivos mensuales aislados, validaciones manuales y poca trazabilidad entre indicador y fuente.',
    users: 'Direccion, jefaturas de gestion humana y analistas de datos internos.',
    solution:
      'Modelo de datos documentado, tablero ejecutivo, vista de alertas y lectura por periodo para revisar la salud operativa.',
    architecture: [
      'Carga controlada de fuentes ficticias.',
      'Modelo semantico con reglas de calidad.',
      'Panel ejecutivo con filtros por periodo, area y tipo de alerta.',
      'Documentacion de indicadores y supuestos.',
    ],
    result:
      'Dato ilustrativo: el demo permite revisar indicadores criticos desde una sola pantalla y rastrear el origen de cada lectura.',
    risks: [
      'Un tablero sin gobierno de datos puede amplificar errores.',
      'Los indicadores deben validarse con quienes toman decisiones antes de automatizarse.',
    ],
    stack: ['Power BI', 'Modelo tabular', 'Excel controlado', 'Documentacion operativa'],
  },
  {
    slug: 'portal-planner',
    kind: 'Prototipo',
    title: 'Portal de proyectos tipo Planner',
    summary:
      'Fases, tareas, minutas, Gantt y entregables conectados a un mismo flujo de trabajo.',
    industry: 'Consultoria',
    area: 'Operaciones',
    problem: 'Informacion sin trazabilidad',
    technology: 'Next.js',
    tags: ['Prototipo', 'Next.js', 'Planner', 'Auditoria'],
    label: 'Prototipo no productivo',
    context:
      'Los proyectos consultivos suelen perder contexto entre reuniones, acuerdos, tareas y entregables.',
    baseline:
      'El prototipo parte de una operacion donde minutas, responsables, fechas y archivos viven en herramientas separadas.',
    users: 'Fundadores, lideres de proyecto y clientes con acceso limitado.',
    solution:
      'Portal privado con permisos por rol, estados de oportunidad, planificacion por fases y registro de decisiones.',
    architecture: [
      'Autenticacion y matriz de permisos.',
      'Modelo de clientes, oportunidades, proyectos, fases y tareas.',
      'Vista de agenda, minutas y pendientes.',
      'Auditoria para cambios sensibles.',
    ],
    result:
      'Prototipo navegable para validar la experiencia antes de conectarlo a datos reales y politicas RLS.',
    risks: [
      'No debe publicarse informacion interna en el sitio comercial.',
      'Los permisos deben probarse antes de usarlo con clientes reales.',
    ],
    stack: ['Next.js', 'TypeScript', 'Drizzle', 'Supabase', 'Vitest'],
  },
  {
    slug: 'reportes-financieros',
    kind: 'Demo',
    title: 'Automatizacion de reportes financieros',
    summary:
      'Cierre mensual con validaciones, responsables y archivos auditables antes de publicar cifras.',
    industry: 'Finanzas',
    area: 'Administracion',
    problem: 'Trabajo manual repetitivo',
    technology: 'Automatizacion',
    tags: ['Dato ilustrativo', 'Finanzas', 'Control', 'Automatizacion'],
    label: 'Demo con datos ficticios',
    context:
      'Un cierre mensual necesita reducir reprocesos, controlar versiones y dejar evidencia de validaciones.',
    baseline:
      'La linea base del demo asume consolidacion manual, archivos duplicados y aprobaciones fuera del flujo.',
    users: 'Administracion, finanzas, gerencia y responsables de aprobacion.',
    solution:
      'Flujo de carga, validacion, observaciones, aprobacion y publicacion de reportes con bitacora.',
    architecture: [
      'Plantillas de entrada con reglas basicas.',
      'Validaciones antes de consolidar.',
      'Estados de revision y aprobacion.',
      'Bitacora de cambios y responsables.',
    ],
    result:
      'Dato ilustrativo: el demo muestra como ordenar el cierre antes de conectar sistemas productivos.',
    risks: [
      'La automatizacion no reemplaza controles contables.',
      'Las reglas deben ser aprobadas por el responsable financiero.',
    ],
    stack: ['Automatizacion', 'Hojas de calculo', 'Power Query', 'Bitacora'],
  },
]

export const projectFilterGroups: Array<{
  key: ProjectFilterKey
  label: string
  values: string[]
}> = [
  {
    key: 'tipo',
    label: 'Tipo',
    values: ['Caso real', 'Demo', 'Prototipo'],
  },
  {
    key: 'industria',
    label: 'Industria',
    values: ['Consultoria', 'Finanzas', 'Servicios'],
  },
  {
    key: 'area',
    label: 'Area',
    values: ['Administracion', 'Operaciones', 'Recursos Humanos'],
  },
  {
    key: 'problema',
    label: 'Problema',
    values: ['Informacion sin trazabilidad', 'Reportes dispersos', 'Trabajo manual repetitivo'],
  },
  {
    key: 'tecnologia',
    label: 'Tecnologia',
    values: ['Automatizacion', 'Next.js', 'Power BI'],
  },
]

export function getProjectBySlug(slug: string) {
  return projects.find((project) => project.slug === slug) ?? null
}

export function projectMatchesFilter(project: Project, key: ProjectFilterKey, value: string) {
  switch (key) {
    case 'tipo':
      return project.kind === value
    case 'industria':
      return project.industry === value
    case 'area':
      return project.area === value
    case 'problema':
      return project.problem === value
    case 'tecnologia':
      return project.technology === value
  }
}

export const founders = [
  {
    name: 'Juan Diego Salazar Campos',
    focus: 'Finanzas, estrategia, evaluacion economica y relacion comercial.',
    role: 'Founder',
    linkedin: 'https://www.linkedin.com/in/juandiego-salazar-finanzas/',
  },
  {
    name: 'Alvaro Rodrigo Hernandez Laos',
    focus: 'Administracion, Recursos Humanos, operaciones, procesos y producto.',
    role: 'Founder',
    linkedin: 'https://www.linkedin.com/in/alvarorodrigohernandezlaos/',
  },
] as const

export const packages = [
  {
    name: 'Start',
    fit: 'Para probar VEKTRIUM con un primer reporte o flujo funcional sin adelanto.',
    includes: [
      'Consulta y alcance inicial gratuitos.',
      'Mapa de proceso y linea base.',
      'Primer reporte, tablero, automatizacion o prototipo.',
      'Pago al final, cuando se presenta el resultado terminado.',
      'Recomendaciones para escalar.',
    ],
  },
  {
    name: 'Scale',
    fit: 'Para convertir un flujo validado en una solucion operativa con adopcion.',
    includes: [
      'Diseno funcional y tecnico.',
      'Implementacion de dashboard, automatizacion o portal.',
      'Pruebas, documentacion y transferencia.',
      'Soporte inicial de adopcion.',
    ],
  },
  {
    name: 'Partner',
    fit: 'Para acompanamiento continuo en operaciones, datos y mejora digital.',
    includes: [
      'Backlog priorizado de mejoras.',
      'Revisiones periodicas de indicadores.',
      'Soporte evolutivo.',
      'Gobierno de cambios y continuidad.',
    ],
  },
] as const

export const resources = [
  {
    title: 'Demos publicas',
    type: 'Vektrium Proof',
    copy: 'Proyectos con datos ficticios y etiquetas claras cuando el resultado es ilustrativo.',
    href: '/proyectos',
  },
  {
    title: 'Plantilla de alcance inicial',
    type: 'Template',
    copy: 'Guia base para levantar proceso, dolor, linea base, usuarios, riesgos y primer reporte.',
    href: '/contacto?recurso=plantilla-diagnostico',
  },
  {
    title: 'Videos y walkthroughs',
    type: 'Recurso',
    copy: 'Espacio preparado para publicar recorridos de demos cuando el contenido este validado.',
    href: '/vek-proof',
  },
  {
    title: 'Acceso privado',
    type: 'Members',
    copy: 'Material no publico disponible solo para miembros, clientes especificos o fundadores.',
    href: '/vek-proof',
  },
] as const

export const proofVisibility = [
  'Publico',
  'Miembros',
  'Cliente especifico',
  'Solo fundadores',
] as const
