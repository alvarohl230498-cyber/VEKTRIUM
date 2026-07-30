'use client'

import type { MonthCell } from '@/lib/agenda'
import { LIMA_WEEKDAY_SHORT, formatLimaMonthYear } from '@/lib/agenda'

export function MonthGrid({
  grid,
  monthCursor,
  selectedDay,
  onPrevMonth,
  onNextMonth,
  onSelectDay,
}: {
  grid: MonthCell[][]
  monthCursor: Date
  selectedDay: string | null
  onPrevMonth: () => void
  onNextMonth: () => void
  onSelectDay: (dateKey: string | null) => void
}) {
  return (
    <div className="border border-vk-line bg-white p-4">
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={onPrevMonth}
          aria-label="Mes anterior"
          className="rounded-md border border-vk-line px-3 py-1.5 text-sm font-extrabold text-vk-navy transition hover:border-vk-cobalt hover:text-vk-cobalt"
        >
          ←
        </button>
        <p className="font-display text-lg font-extrabold text-vk-navy">{formatLimaMonthYear(monthCursor)}</p>
        <button
          type="button"
          onClick={onNextMonth}
          aria-label="Mes siguiente"
          className="rounded-md border border-vk-line px-3 py-1.5 text-sm font-extrabold text-vk-navy transition hover:border-vk-cobalt hover:text-vk-cobalt"
        >
          →
        </button>
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[560px] border-collapse text-sm">
          <thead>
            <tr>
              {LIMA_WEEKDAY_SHORT.map((day) => (
                <th key={day} scope="col" className="border-b border-vk-line pb-2 text-xs font-extrabold uppercase tracking-[0.08em] text-vk-muted">
                  {day}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {grid.map((week, weekIndex) => (
              <tr key={week[0]?.dateKey ?? weekIndex}>
                {week.map((cell) => {
                  const isSelected = selectedDay === cell.dateKey
                  return (
                    <td key={cell.dateKey} className="border border-vk-line p-1 align-top">
                      <button
                        type="button"
                        onClick={() => onSelectDay(isSelected ? null : cell.dateKey)}
                        aria-pressed={isSelected}
                        aria-label={`${cell.date.getDate()}, ${cell.meetings.length} reuniones`}
                        className={`flex h-16 w-full flex-col items-start gap-1 rounded-md p-1.5 text-left transition ${
                          isSelected
                            ? 'bg-vk-cobalt text-white'
                            : cell.inCurrentMonth
                              ? 'text-vk-ink hover:bg-vk-ice'
                              : 'text-vk-muted/60 hover:bg-vk-ice'
                        }`}
                      >
                        <span className={`text-xs font-extrabold ${cell.isToday && !isSelected ? 'text-vk-cobalt' : ''}`}>
                          {cell.date.getDate()}
                          {cell.isToday ? ' · hoy' : ''}
                        </span>
                        {cell.meetings.length > 0 ? (
                          <span
                            className={`inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-extrabold ${
                              isSelected ? 'bg-white/20 text-white' : 'bg-vk-ice text-vk-cobalt'
                            }`}
                          >
                            {cell.meetings.length} {cell.meetings.length === 1 ? 'reunión' : 'reuniones'}
                          </span>
                        ) : null}
                      </button>
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
