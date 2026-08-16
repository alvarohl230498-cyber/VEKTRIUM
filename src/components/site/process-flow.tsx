'use client'

import type { LucideIcon } from 'lucide-react'
import { MessageCircle, Puzzle, Rocket } from 'lucide-react'
import { motion, useReducedMotion } from 'framer-motion'

export type ProcessStep = {
  title: string
  copy: string
  icon?: 'message' | 'puzzle' | 'rocket'
}

const icons: Record<NonNullable<ProcessStep['icon']>, LucideIcon> = {
  message: MessageCircle,
  puzzle: Puzzle,
  rocket: Rocket,
}

export function ProcessFlow({ note, steps }: { note: string; steps: ProcessStep[] }) {
  const reduceMotion = useReducedMotion()

  return (
    <div className="relative mt-12">
      <div className="grid gap-8 lg:grid-cols-3">
        {steps.map((step, index) => {
          const Icon = icons[step.icon ?? 'message']

          const content = (
            <>
              <div className="mx-auto -mt-12 flex h-20 w-20 items-center justify-center rounded-full border border-white bg-vk-lime/20 text-vk-success shadow-vk">
                <Icon aria-hidden="true" size={28} strokeWidth={2.4} />
              </div>
              <p className="mt-5 text-sm font-black text-vk-success">{String(index + 1).padStart(2, '0')}</p>
              <h3 className="mt-3 font-display text-xl font-black text-vk-navy">{step.title}</h3>
              <p className="mt-3 text-sm leading-7 text-vk-muted">{step.copy}</p>
            </>
          )

          if (reduceMotion) {
            return (
              <article
                key={step.title}
                className="relative border border-vk-line bg-white p-6 text-center shadow-[0_18px_45px_rgba(10,22,51,0.08)]"
              >
                {content}
              </article>
            )
          }

          return (
            <motion.article
              key={step.title}
              className="relative border border-vk-line bg-white p-6 text-center shadow-[0_18px_45px_rgba(10,22,51,0.08)]"
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.5, delay: index * 0.08 }}
            >
              {content}
            </motion.article>
          )
        })}
      </div>

      <div className="pointer-events-none absolute left-[31%] top-24 hidden w-[38%] lg:block">
        <svg viewBox="0 0 460 60" className="h-16 w-full overflow-visible">
          {reduceMotion ? (
            <path
              d="M 0 30 C 70 30 80 30 150 30 M 310 30 C 380 30 390 30 460 30"
              fill="none"
              stroke="rgba(10,22,51,0.28)"
              strokeDasharray="8 10"
              strokeLinecap="round"
              strokeWidth="2"
            />
          ) : (
            <motion.path
              d="M 0 30 C 70 30 80 30 150 30 M 310 30 C 380 30 390 30 460 30"
              fill="none"
              stroke="rgba(10,22,51,0.28)"
              strokeDasharray="8 10"
              strokeLinecap="round"
              strokeWidth="2"
              initial={{ pathLength: 0 }}
              whileInView={{ pathLength: 1 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 1.1, ease: 'easeOut' }}
            />
          )}
        </svg>
      </div>

      <div className="mx-auto mt-8 max-w-2xl border border-vk-line bg-white px-5 py-3 text-center shadow-[0_12px_30px_rgba(10,22,51,0.06)]">
        <p className="text-sm font-bold leading-6 text-vk-navy">{note}</p>
      </div>
    </div>
  )
}
