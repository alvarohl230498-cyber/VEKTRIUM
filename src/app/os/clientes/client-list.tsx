'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { IllustrativeBadge } from '@/components/os/illustrative-badge'
import type { ClientRow } from '@/lib/clients'
import { uniqueIndustries } from '@/lib/clients'
import { formatLima } from '@/lib/dashboard'

export function ClientList({ rows }: { rows: ClientRow[] }) {
  const [search, setSearch] = useState('')
  const [industry, setIndustry] = useState('todas')

  const industries = useMemo(() => uniqueIndustries(rows.map((r) => r.client)), [rows])

  const filtered = rows.filter((row) => {
    const matchesIndustry = industry === 'todas' || row.client.industry === industry
    const term = search.trim().toLowerCase()
    const matchesSearch =
      term.length === 0 ||
      (row.client.tradeName ?? '').toLowerCase().includes(term) ||
      row.client.legalName.toLowerCase().includes(term) ||
      row.client.city.toLowerCase().includes(term)
    return matchesIndustry && matchesSearch
  })

  if (rows.length === 0) {
    return (
      <div className="border border-vk-line bg-white p-8 text-center">
        <p className="font-display text-xl font-extrabold text-vk-navy">Todavía no hay clientes</p>
        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-vk-muted">
          Usa el formulario &quot;Nuevo cliente&quot; de arriba para registrar el primero.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-3">
        <div className="min-w-0 flex-1">
          <label htmlFor="client-search" className="sr-only">
            Buscar clientes
          </label>
          <input
            id="client-search"
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre o ciudad..."
            className="w-full max-w-sm rounded-md border border-vk-line px-3 py-2 text-sm text-vk-ink"
          />
        </div>
        <div>
          <label htmlFor="client-industry" className="sr-only">
            Filtrar por rubro
          </label>
          <select
            id="client-industry"
            value={industry}
            onChange={(e) => setIndustry(e.target.value)}
            className="rounded-md border border-vk-line px-3 py-2 text-sm text-vk-ink"
          >
            <option value="todas">Todos los rubros</option>
            {industries.map((i) => (
              <option key={i} value={i}>
                {i}
              </option>
            ))}
          </select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="border border-vk-line bg-white p-6 text-center text-sm text-vk-muted">
          Ningún cliente coincide con &quot;{search}&quot;{industry !== 'todas' ? ` en ${industry}` : ''}.
        </div>
      ) : (
        <div className="overflow-x-auto border border-vk-line bg-white">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-vk-line text-xs font-extrabold uppercase tracking-[0.08em] text-vk-muted">
                <th scope="col" className="px-4 py-3">Cliente</th>
                <th scope="col" className="px-4 py-3">Rubro</th>
                <th scope="col" className="px-4 py-3">Ciudad</th>
                <th scope="col" className="px-4 py-3">Oport. abiertas</th>
                <th scope="col" className="px-4 py-3">Proy. activos</th>
                <th scope="col" className="px-4 py-3">Última interacción</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((row) => (
                <tr key={row.client.id} className="border-b border-vk-line last:border-b-0 hover:bg-vk-ice">
                  <td className="px-4 py-3">
                    <Link href={`/os/clientes/${row.client.id}`} className="font-extrabold text-vk-cobalt hover:text-vk-navy">
                      {row.client.tradeName ?? row.client.legalName}
                    </Link>
                    <div className="mt-1 flex items-center gap-2">
                      <span className="text-xs text-vk-muted">{row.client.legalName}</span>
                      {row.client.isIllustrative ? <IllustrativeBadge /> : null}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-vk-ink">{row.client.industry}</td>
                  <td className="px-4 py-3 text-vk-ink">{row.client.city}</td>
                  <td className="px-4 py-3 text-vk-ink">{row.openOpportunities}</td>
                  <td className="px-4 py-3 text-vk-ink">{row.activeProjects}</td>
                  <td className="px-4 py-3 text-vk-ink">
                    {row.lastInteractionAt ? formatLima(new Date(row.lastInteractionAt)) : 'Sin actividad'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
