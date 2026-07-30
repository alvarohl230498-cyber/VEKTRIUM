import { describe, it, expect } from 'vitest'
import { toDateOnly, toDateOnlyOrNull, toIso, toIsoOrNull, toNumber } from '@/data/supabase/mappers'

/**
 * postgres.js/Drizzle devuelven las columnas `numeric` como string (nunca
 * como number de JS, para no perder precision). Opportunity.expectedAmount
 * y Project.progressCached son `number` en src/data/types.ts: sin esta
 * conversion explicita, el portal recibiria strings donde espera numeros y
 * fallaria en silencio en cualquier operacion aritmetica (sumas, formato de
 * moneda, calculo de avance).
 */
describe('supabase mappers — conversion de numeric', () => {
  it('convierte un numeric con decimales de string a number', () => {
    expect(toNumber('1234.50')).toBe(1234.5)
    expect(typeof toNumber('1234.50')).toBe('number')
  })

  it('convierte un numeric entero de string a number', () => {
    expect(toNumber('0')).toBe(0)
    expect(toNumber('9999')).toBe(9999)
  })

  it('deja pasar un number sin cambios', () => {
    expect(toNumber(42)).toBe(42)
  })
})

describe('supabase mappers — fechas', () => {
  it('serializa un Date de timestamp a ISO', () => {
    const date = new Date('2026-07-29T15:00:00.000Z')
    expect(toIso(date)).toBe('2026-07-29T15:00:00.000Z')
  })

  it('toIsoOrNull respeta null', () => {
    expect(toIsoOrNull(null)).toBeNull()
    expect(toIsoOrNull(new Date('2026-07-29T15:00:00.000Z'))).toBe('2026-07-29T15:00:00.000Z')
  })

  it('serializa una columna date (sin zona horaria) a YYYY-MM-DD', () => {
    const date = new Date('2026-08-01T00:00:00.000Z')
    expect(toDateOnly(date)).toBe('2026-08-01')
  })

  it('toDateOnlyOrNull respeta null', () => {
    expect(toDateOnlyOrNull(null)).toBeNull()
  })
})
