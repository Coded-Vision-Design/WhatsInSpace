"use client"

import { useEffect, useRef } from "react"

interface StarFieldProps {
  starCount?: number
  className?: string
}

export default function StarField({ starCount = 800, className = "" }: StarFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const parent = canvas.parentElement
    if (!parent) return

    let raf: number
    let stars: { x: number; y: number; size: number; brightness: number; twinkleSpeed: number; twinklePhase: number }[] = []

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio, 2)
      const w = parent.clientWidth
      const h = parent.clientHeight
      canvas.width = w * dpr
      canvas.height = h * dpr
      canvas.style.width = `${w}px`
      canvas.style.height = `${h}px`
      ctx.scale(dpr, dpr)

      // Regenerate stars on resize
      stars = []
      for (let i = 0; i < starCount; i++) {
        const brightness = Math.random()
        stars.push({
          x: Math.random() * w,
          y: Math.random() * h,
          size: brightness < 0.95 ? 0.5 + Math.random() * 1 : 1.5 + Math.random() * 1.5,
          brightness: 0.3 + brightness * 0.7,
          twinkleSpeed: 0.3 + Math.random() * 2,
          twinklePhase: Math.random() * Math.PI * 2,
        })
      }
    }

    resize()
    window.addEventListener("resize", resize)

    const animate = (time: number) => {
      raf = requestAnimationFrame(animate)
      const t = time * 0.001
      const w = parent.clientWidth
      const h = parent.clientHeight

      ctx.clearRect(0, 0, w, h)

      for (const star of stars) {
        const twinkle = 0.6 + 0.4 * Math.sin(t * star.twinkleSpeed + star.twinklePhase)
        const alpha = star.brightness * twinkle

        ctx.beginPath()
        ctx.arc(star.x, star.y, star.size * twinkle, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`
        ctx.fill()

        // Subtle glow on brighter stars
        if (star.size > 1.2) {
          ctx.beginPath()
          ctx.arc(star.x, star.y, star.size * 3, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.08})`
          ctx.fill()
        }
      }
    }

    raf = requestAnimationFrame(animate)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener("resize", resize)
    }
  }, [starCount])

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 pointer-events-none ${className}`}
      aria-hidden="true"
    />
  )
}
