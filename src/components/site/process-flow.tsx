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
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-[16%] right-[16%] top-12 hidden h-px bg-gradient-to-r from-transparent via-vk-cobalt/35 to-transparent lg:block"
      />

      <div className="relative grid gap-6 lg:grid-cols-3">
        {steps.map((step, index) => {
          const Icon = icons[step.icon ?? 'message']

          const content = (
            <>
              <div className="relative z-10 mx-auto flex h-24 w-24 items-center justify-center rounded-full border border-white bg-vk-lime/20 text-vk-success shadow-[0_22px_70px_rgba(10,22,51,0.14)] ring-[10px] ring-white">
                <Icon aria-hidden="true" size={28} strokeWidth={2.4} />
              </div>
              <p className="mt-6 text-sm font-black text-vk-success">
                {String(index + 1).padStart(2, '0')}
              </p>
              <h3 className="mx-auto mt-3 max-w-xs font-display text-xl font-black leading-tight text-vk-navy">
                {step.title}
              </h3>
              <p className="mx-auto mt-4 max-w-sm text-sm leading-7 text-vk-muted">
                {step.copy}
              </p>
            </>
          )

          if (reduceMotion) {
            return (
              <article
                key={step.title}
                className="relative flex min-h-[300px] flex-col justify-start border border-vk-line bg-white px-7 pb-8 pt-8 text-center shadow-[0_18px_45px_rgba(10,22,51,0.08)]"
              >
                {content}
              </article>
            )
          }

          return (
            <motion.article
              key={step.title}
              className="relative flex min-h-[300px] flex-col justify-start border border-vk-line bg-white px-7 pb-8 pt-8 text-center shadow-[0_18px_45px_rgba(10,22,51,0.08)]"
              initial={{ opacity: 0.98, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.45, delay: index * 0.08 }}
            >
              {content}
            </motion.article>
          )
        })}
      </div>

      <div className="mx-auto mt-10 max-w-2xl border border-vk-line bg-white px-5 py-3 text-center shadow-[0_12px_30px_rgba(10,22,51,0.06)]">
        <p className="text-sm font-bold leading-6 text-vk-navy">{note}</p>
      </div>
    </div>
  )
}
