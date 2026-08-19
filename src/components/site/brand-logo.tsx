import Image from 'next/image'
import Link from 'next/link'

export function BrandLogo({
  className = '',
  href = '/',
  priority = false,
}: {
  className?: string
  href?: string
  priority?: boolean
}) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center gap-3 ${className}`}
      aria-label="Inicio VEKTRIUM"
    >
      <Image
        src="/brand/vektrium-mark.png"
        alt=""
        width={44}
        height={44}
        className="h-10 w-10 object-contain sm:h-11 sm:w-11"
        priority={priority}
      />
      <span className="font-display text-xl font-black tracking-normal text-white sm:text-2xl">
        VEKTRIUM
      </span>
    </Link>
  )
}
