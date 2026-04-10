"use client"

import { useEffect, useRef } from "react"

/**
 * Animated favicon for whatsin.space -Artemis mission scene:
 * Deep space background with twinkling stars, a small Earth,
 * a crescent Moon, and an orange Orion capsule flying the
 * free-return lunar trajectory between them.
 * Runs at controlled framerate. Respects prefers-reduced-motion.
 */
export default function AnimatedFavicon() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    if (prefersReduced) return

    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const S = 64 // render at 64px for crispness, browser scales to favicon
    canvas.width = S
    canvas.height = S

    let t = 0
    let raf: number
    let linkEl: HTMLLinkElement | null = null

    // Stars: fixed random positions + twinkle phase
    const stars = Array.from({ length: 18 }, () => ({
      x: Math.random() * S,
      y: Math.random() * S,
      r: 0.3 + Math.random() * 0.7,
      phase: Math.random() * Math.PI * 2,
      speed: 0.5 + Math.random() * 1.5,
    }))

    const setupLink = () => {
      // Remove all existing favicons to avoid conflicts
      document.querySelectorAll('link[rel="icon"]').forEach((el) => el.remove())
      linkEl = document.createElement("link")
      linkEl.rel = "icon"
      linkEl.type = "image/png"
      document.head.appendChild(linkEl)
    }

    const drawBackground = () => {
      // Deep space gradient
      const grad = ctx.createRadialGradient(S * 0.3, S * 0.3, 0, S / 2, S / 2, S * 0.8)
      grad.addColorStop(0, "#0a0e1a")
      grad.addColorStop(1, "#020408")
      ctx.fillStyle = grad
      ctx.beginPath()
      ctx.roundRect(0, 0, S, S, S * 0.18)
      ctx.fill()
      // Clip to rounded rect for everything else
      ctx.save()
      ctx.beginPath()
      ctx.roundRect(0, 0, S, S, S * 0.18)
      ctx.clip()
    }

    const drawStars = () => {
      for (const star of stars) {
        const alpha = 0.3 + 0.7 * ((Math.sin(t * star.speed + star.phase) + 1) / 2)
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`
        ctx.beginPath()
        ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2)
        ctx.fill()
      }
    }

    const drawEarth = () => {
      const ex = S * 0.18
      const ey = S * 0.72
      const er = S * 0.11

      // Atmosphere glow
      const atmosGrad = ctx.createRadialGradient(ex, ey, er * 0.7, ex, ey, er * 1.6)
      atmosGrad.addColorStop(0, "rgba(65, 140, 255, 0)")
      atmosGrad.addColorStop(0.6, "rgba(65, 140, 255, 0.08)")
      atmosGrad.addColorStop(1, "rgba(65, 140, 255, 0)")
      ctx.fillStyle = atmosGrad
      ctx.beginPath()
      ctx.arc(ex, ey, er * 1.6, 0, Math.PI * 2)
      ctx.fill()

      // Earth body
      const earthGrad = ctx.createRadialGradient(ex - er * 0.3, ey - er * 0.3, 0, ex, ey, er)
      earthGrad.addColorStop(0, "#4a9eff")
      earthGrad.addColorStop(0.5, "#2563eb")
      earthGrad.addColorStop(1, "#1a3a6b")
      ctx.fillStyle = earthGrad
      ctx.beginPath()
      ctx.arc(ex, ey, er, 0, Math.PI * 2)
      ctx.fill()

      // Land hint (small green patch)
      ctx.fillStyle = "rgba(34, 120, 60, 0.5)"
      ctx.beginPath()
      ctx.arc(ex + er * 0.15, ey - er * 0.1, er * 0.35, 0, Math.PI * 2)
      ctx.fill()
    }

    const drawMoon = () => {
      const mx = S * 0.78
      const my = S * 0.25
      const mr = S * 0.095

      // Subtle moonlight glow
      const moonGlow = ctx.createRadialGradient(mx, my, mr * 0.5, mx, my, mr * 2.5)
      moonGlow.addColorStop(0, "rgba(220, 220, 200, 0.1)")
      moonGlow.addColorStop(1, "rgba(220, 220, 200, 0)")
      ctx.fillStyle = moonGlow
      ctx.beginPath()
      ctx.arc(mx, my, mr * 2.5, 0, Math.PI * 2)
      ctx.fill()

      // Moon body (light grey)
      const moonGrad = ctx.createRadialGradient(mx - mr * 0.3, my - mr * 0.3, 0, mx, my, mr)
      moonGrad.addColorStop(0, "#e8e4d8")
      moonGrad.addColorStop(0.7, "#b8b4a8")
      moonGrad.addColorStop(1, "#888478")
      ctx.fillStyle = moonGrad
      ctx.beginPath()
      ctx.arc(mx, my, mr, 0, Math.PI * 2)
      ctx.fill()

      // Crescent shadow (dark side)
      ctx.fillStyle = "rgba(5, 8, 18, 0.75)"
      ctx.beginPath()
      ctx.arc(mx + mr * 0.35, my, mr * 0.9, 0, Math.PI * 2)
      ctx.fill()
    }

    const drawTrajectory = () => {
      // Free-return trajectory path: ellipse from Earth to Moon and back
      const cx = S * 0.48
      const cy = S * 0.48
      const rx = S * 0.38
      const ry = S * 0.30

      // Faint dashed trajectory path
      ctx.strokeStyle = "rgba(249, 115, 22, 0.12)"
      ctx.lineWidth = 0.8
      ctx.setLineDash([2, 3])
      ctx.beginPath()
      ctx.ellipse(cx, cy, rx, ry, -0.5, 0, Math.PI * 2)
      ctx.stroke()
      ctx.setLineDash([])
    }

    const drawOrion = () => {
      // Orion capsule position along the trajectory ellipse
      const cx = S * 0.48
      const cy = S * 0.48
      const rx = S * 0.38
      const ry = S * 0.30
      const rotation = -0.5 // ellipse tilt

      // Speed varies: slower near Moon (apoapsis), faster near Earth (periapsis)
      const orionAngle = t * 0.6
      const ox = cx + Math.cos(orionAngle) * rx * Math.cos(rotation) - Math.sin(orionAngle) * ry * Math.sin(rotation)
      const oy = cy + Math.cos(orionAngle) * rx * Math.sin(rotation) + Math.sin(orionAngle) * ry * Math.cos(rotation)

      // Trail (fading segments behind the capsule)
      const trailSteps = 12
      for (let i = trailSteps; i >= 1; i--) {
        const ta = orionAngle - i * 0.06
        const tx = cx + Math.cos(ta) * rx * Math.cos(rotation) - Math.sin(ta) * ry * Math.sin(rotation)
        const ty = cy + Math.cos(ta) * rx * Math.sin(rotation) + Math.sin(ta) * ry * Math.cos(rotation)
        const alpha = (1 - i / trailSteps) * 0.4
        ctx.fillStyle = `rgba(249, 115, 22, ${alpha})`
        ctx.beginPath()
        ctx.arc(tx, ty, 1.2 * (1 - i / trailSteps), 0, Math.PI * 2)
        ctx.fill()
      }

      // Capsule glow
      ctx.shadowColor = "#f97316"
      ctx.shadowBlur = 6
      ctx.fillStyle = "#f97316"
      ctx.beginPath()
      ctx.arc(ox, oy, 2.2, 0, Math.PI * 2)
      ctx.fill()

      // Bright core
      ctx.fillStyle = "#fbbf24"
      ctx.beginPath()
      ctx.arc(ox, oy, 1, 0, Math.PI * 2)
      ctx.fill()
      ctx.shadowBlur = 0
    }

    const draw = () => {
      ctx.clearRect(0, 0, S, S)
      drawBackground()
      drawStars()
      drawTrajectory()
      drawEarth()
      drawMoon()
      drawOrion()
      ctx.restore() // restore from clip

      if (linkEl) {
        linkEl.href = canvas.toDataURL("image/png")
      }

      t += 0.04
      raf = requestAnimationFrame(draw)
    }

    setupLink()
    draw()

    return () => {
      cancelAnimationFrame(raf)
    }
  }, [])

  return <canvas ref={canvasRef} style={{ display: "none" }} aria-hidden="true" />
}
