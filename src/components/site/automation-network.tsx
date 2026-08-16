'use client'

import { useEffect, useRef } from 'react'

type Point = {
  x: number
  y: number
  vx: number
  vy: number
}

export function AutomationNetwork({ density = 24 }: { density?: number }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    const context = canvas.getContext('2d')
    if (!context) return

    let width = 0
    let height = 0
    let frame = 0
    let visible = true
    let points: Point[] = []

    const resize = () => {
      const rect = canvas.getBoundingClientRect()
      const ratio = window.devicePixelRatio || 1
      width = rect.width
      height = rect.height
      canvas.width = Math.max(1, Math.floor(width * ratio))
      canvas.height = Math.max(1, Math.floor(height * ratio))
      context.setTransform(ratio, 0, 0, ratio, 0, 0)
      points = Array.from({ length: density }, (_, index) => ({
        x: (width / density) * index + Math.random() * 60,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.22,
        vy: (Math.random() - 0.5) * 0.22,
      }))
    }

    const render = () => {
      context.clearRect(0, 0, width, height)
      context.fillStyle = 'rgba(25, 211, 197, 0.55)'
      context.strokeStyle = 'rgba(25, 211, 197, 0.12)'
      context.lineWidth = 1

      points.forEach((point) => {
        if (!prefersReducedMotion.matches) {
          point.x += point.vx
          point.y += point.vy
        }

        if (point.x < -20) point.x = width + 20
        if (point.x > width + 20) point.x = -20
        if (point.y < -20) point.y = height + 20
        if (point.y > height + 20) point.y = -20

        context.beginPath()
        context.arc(point.x, point.y, 1.6, 0, Math.PI * 2)
        context.fill()
      })

      for (let index = 0; index < points.length; index += 1) {
        for (let next = index + 1; next < points.length; next += 1) {
          const a = points[index]!
          const b = points[next]!
          const distance = Math.hypot(a.x - b.x, a.y - b.y)
          if (distance < 190) {
            context.globalAlpha = 1 - distance / 190
            context.beginPath()
            context.moveTo(a.x, a.y)
            context.lineTo(b.x, b.y)
            context.stroke()
          }
        }
      }

      context.globalAlpha = 1
      if (visible && !prefersReducedMotion.matches) {
        frame = window.requestAnimationFrame(render)
      }
    }

    const observer = new IntersectionObserver(([entry]) => {
      visible = Boolean(entry?.isIntersecting)
      window.cancelAnimationFrame(frame)
      if (visible) render()
    })

    resize()
    render()
    observer.observe(canvas)
    window.addEventListener('resize', resize)

    return () => {
      observer.disconnect()
      window.removeEventListener('resize', resize)
      window.cancelAnimationFrame(frame)
    }
  }, [density])

  return <canvas ref={canvasRef} aria-hidden="true" className="absolute inset-0 h-full w-full opacity-70" />
}
