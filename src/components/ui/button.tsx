import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

export const buttonVariants = cva(
  'inline-flex min-h-11 items-center justify-center gap-2 rounded-md text-sm font-black transition focus-visible:outline-none focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary:
          'bg-vk-lime px-5 py-3 text-vk-navy shadow-[0_18px_42px_rgba(183,243,74,0.22)] hover:-translate-y-0.5 hover:bg-vk-aqua focus-visible:ring-vk-lime',
        secondary:
          'border border-vk-line bg-white px-5 py-3 text-vk-navy hover:-translate-y-0.5 hover:border-vk-cobalt hover:text-vk-cobalt focus-visible:ring-vk-cobalt',
        dark:
          'border border-white/20 bg-white/8 px-5 py-3 text-white hover:-translate-y-0.5 hover:border-vk-aqua hover:text-vk-aqua focus-visible:ring-vk-aqua',
        ghost: 'px-3 py-2 text-inherit hover:text-vk-lime focus-visible:ring-vk-aqua',
      },
    },
    defaultVariants: {
      variant: 'primary',
    },
  },
)

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }

export function Button({ asChild, className, variant, ...props }: ButtonProps) {
  const Comp = asChild ? Slot : 'button'

  return <Comp className={cn(buttonVariants({ variant }), className)} {...props} />
}
