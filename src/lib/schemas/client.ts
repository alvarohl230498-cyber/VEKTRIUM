import { z } from 'zod'

const CLIENT_SIZES = ['micro', 'pequena', 'mediana', 'grande'] as const
const CLIENT_CONFIDENTIALITY = ['publico', 'interno', 'confidencial'] as const

/** Esquema compartido entre el formulario "Nuevo cliente" y su Server Action. */
export const newClientSchema = z.object({
  legalName: z
    .string()
    .trim()
    .min(3, 'La razón social debe tener al menos 3 caracteres.')
    .max(160, 'La razón social no puede superar 160 caracteres.'),
  tradeName: z
    .string()
    .trim()
    .min(2, 'El nombre comercial debe tener al menos 2 caracteres.')
    .max(120, 'El nombre comercial no puede superar 120 caracteres.'),
  ruc: z
    .string()
    .trim()
    .regex(/^\d{11}$/, 'El RUC debe tener 11 dígitos.')
    .optional()
    .or(z.literal('')),
  industry: z.string().trim().min(2, 'Indica el rubro del cliente.').max(80),
  size: z.enum(CLIENT_SIZES, 'Selecciona un tamaño válido.'),
  city: z.string().trim().min(2, 'Indica la ciudad.').max(80),
  country: z.string().trim().min(2, 'Indica el país.').max(80),
  confidentiality: z.enum(CLIENT_CONFIDENTIALITY, 'Selecciona un nivel de confidencialidad válido.'),
})

export type NewClientFormValues = z.infer<typeof newClientSchema>
