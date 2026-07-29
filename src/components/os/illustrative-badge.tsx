/**
 * Insignia obligatoria sobre toda cifra o registro ficticio. Regla de
 * negocio no negociable: ninguna cifra ilustrativa se muestra sin ella.
 */
export function IllustrativeBadge() {
  return (
    <span className="inline-flex items-center rounded-md bg-vk-ice px-2 py-0.5 text-[11px] font-extrabold uppercase tracking-[0.08em] text-vk-cobalt">
      Dato ilustrativo
    </span>
  )
}

export function SimulatedBadge() {
  return (
    <span className="inline-flex items-center rounded-md bg-vk-warning/15 px-2 py-0.5 text-[11px] font-extrabold uppercase tracking-[0.08em] text-vk-warning">
      Simulado
    </span>
  )
}
