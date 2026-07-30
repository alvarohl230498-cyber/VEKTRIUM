import { z } from 'zod'

/**
 * Login por correo y contraseña. Un solo esquema para el formulario cliente
 * (src/app/login/page.tsx) y el Server Action (src/app/login/actions.ts):
 * no pueden desincronizarse porque son el mismo objeto.
 */
export const passwordSignInSchema = z.object({
  email: z.string().trim().toLowerCase().email('Ingresa un correo valido.'),
  password: z.string().min(1, 'Ingresa tu contraseña.'),
})

/**
 * Fijar o cambiar la contraseña propia desde /os/perfil. 8 caracteres es un
 * minimo razonable para dos fundadores en un intranet privado — no es un
 * producto expuesto a millones de cuentas que justifique reglas mas
 * estrictas de complejidad, que solo empujarian a patrones predecibles.
 */
export const setPasswordSchema = z
  .object({
    password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres.'),
    confirmPassword: z.string(),
  })
  .check((ctx) => {
    if (ctx.value.password !== ctx.value.confirmPassword) {
      ctx.issues.push({
        code: 'custom',
        message: 'Las contraseñas no coinciden.',
        path: ['confirmPassword'],
        input: ctx.value,
      })
    }
  })
