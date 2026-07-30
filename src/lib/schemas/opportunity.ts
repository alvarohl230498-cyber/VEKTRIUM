import { z } from 'zod'
import { OPPORTUNITY_STATUSES } from '@/domain/state-machines'

/**
 * Validacion de forma para el cambio de estado de una oportunidad. La regla
 * de negocio real (que transiciones existen, y que "no_aceptado" exige
 * motivo) vive en `domain/state-machines.ts` (`transitionOpportunity`) y es
 * la que manda: este esquema solo evita enviar campos vacios o mal
 * formados antes de llegar ahi.
 */
export const opportunityTransitionSchema = z
  .object({
    opportunityId: z.string().min(1),
    to: z.enum(OPPORTUNITY_STATUSES, 'Selecciona un estado válido.'),
    lossReason: z.string(),
  })
  .check((ctx) => {
    if (ctx.value.to !== 'no_aceptado') return
    if (ctx.value.lossReason.trim().length < 5) {
      ctx.issues.push({
        code: 'custom',
        message: 'Registra el motivo de pérdida (mínimo 5 caracteres) para marcar la oportunidad como no aceptada.',
        path: ['lossReason'],
        input: ctx.value,
      })
    }
  })

export type OpportunityTransitionValues = z.infer<typeof opportunityTransitionSchema>

export const convertOpportunitySchema = z
  .object({
    opportunityId: z.string().min(1),
    name: z.string().trim().min(3, 'El nombre del proyecto debe tener al menos 3 caracteres.').max(140),
    ownerId: z.string().min(1, 'Selecciona un responsable del proyecto.'),
    startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Selecciona una fecha de inicio válida.'),
    targetDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Selecciona una fecha objetivo válida.'),
  })
  .check((ctx) => {
    if (!ctx.value.startDate || !ctx.value.targetDate) return
    if (new Date(ctx.value.targetDate).getTime() < new Date(ctx.value.startDate).getTime()) {
      ctx.issues.push({
        code: 'custom',
        message: 'La fecha objetivo no puede ser anterior a la fecha de inicio.',
        path: ['targetDate'],
        input: ctx.value,
      })
    }
  })

export type ConvertOpportunityValues = z.infer<typeof convertOpportunitySchema>

export const newOpportunitySchema = z.object({
  clientId: z.string().min(1, 'Selecciona un cliente.'),
  title: z.string().trim().min(3, 'El título debe tener al menos 3 caracteres.').max(140),
  expectedAmount: z
    .string()
    .min(1, 'Indica el monto esperado.')
    .refine((v) => Number.isFinite(Number(v)) && Number(v) >= 0, 'El monto debe ser un número mayor o igual a 0.'),
  ownerId: z.string().min(1, 'Selecciona un responsable.'),
})

export type NewOpportunityValues = z.infer<typeof newOpportunitySchema>
