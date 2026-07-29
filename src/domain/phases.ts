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
  {
    order: 0,
    name: 'Calificación y preparación',
    description: 'Registrar necesidad inicial, investigar contexto del cliente y definir participantes.',
    weight: 1,
  },
  {
    order: 1,
    name: 'Descubrimiento',
    description:
      'Primera reunión: entender el proceso actual, volúmenes, personas, sistemas y restricciones.',
    weight: 1,
  },
  {
    order: 2,
    name: 'Diagnóstico y propuesta',
    description: 'Mapear el proceso, identificar causa raíz, estimar esfuerzo y elaborar la propuesta.',
    weight: 1,
  },
  {
    order: 3,
    name: 'Validación',
    description: 'Segunda reunión: confirmar alcance, criterios de aceptación y obtener aprobación.',
    weight: 1,
  },
  {
    order: 4,
    name: 'Diseño y planificación',
    description: 'User stories, flujos, wireframes, modelo de datos, integraciones y plan de pruebas.',
    weight: 1,
  },
  {
    order: 5,
    name: 'Construcción',
    description: 'Desarrollo por iteraciones, demos parciales, pruebas y documentación.',
    weight: 1,
  },
  {
    order: 6,
    name: 'Presentación final',
    description: 'Demo, validación de cumplimiento del alcance y conformidad preliminar.',
    weight: 1,
  },
  {
    order: 7,
    name: 'Entrega',
    description: 'Entregar solución y documentación, capacitar usuarios y definir soporte.',
    weight: 1,
  },
  {
    order: 8,
    name: 'Seguimiento postentrega',
    description: 'Medir adopción, comparar línea base contra resultado y proponer mejora continua.',
    weight: 1,
  },
]

/** Devuelve copias independientes para que editar un proyecto no altere la plantilla. */
export function buildPhasesForProject(projectId: string): ProjectPhaseDraft[] {
  return VEKTRIUM_PHASES.map((phase) => ({ ...phase, projectId }))
}
