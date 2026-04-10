"use client"

import { useState, useEffect, useRef, useCallback, CSSProperties } from "react"

/**
 * Staggered reveal: children fade in one by one with configurable delay.
 * Returns a ref to attach to the parent container and a function to get
 * per-item style/className based on index.
 */
export function useStaggerReveal(
  itemCount: number,
  options: { threshold?: number; staggerMs?: number; once?: boolean } = {}
) {
  const { threshold = 0.15, staggerMs = 60, once = true } = options
  const containerRef = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)
  const hasTriggered = useRef(false)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && (!once || !hasTriggered.current)) {
          hasTriggered.current = true
          setIsVisible(true)
        }
        if (!entry.isIntersecting && !once) {
          setIsVisible(false)
        }
      },
      { threshold }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [threshold, once])

  const getItemStyle = useCallback(
    (index: number): CSSProperties => ({
      opacity: isVisible ? 1 : 0,
      transform: isVisible ? "translateY(0)" : "translateY(24px)",
      transition: `opacity 0.5s cubic-bezier(0.16, 1, 0.3, 1) ${index * staggerMs}ms, transform 0.5s cubic-bezier(0.16, 1, 0.3, 1) ${index * staggerMs}ms`,
    }),
    [isVisible, staggerMs]
  )

  return { containerRef, getItemStyle, isVisible }
}

/**
 * Magnetic hover: element subtly follows the cursor when hovered.
 * Strength controls how far the element moves (px).
 */
export function useMagneticHover(strength = 8) {
  const ref = useRef<HTMLDivElement>(null)
  const [style, setStyle] = useState<CSSProperties>({
    transform: "translate3d(0, 0, 0)",
    transition: "transform 0.3s cubic-bezier(0.33, 1, 0.68, 1)",
  })

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const handleMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect()
      const cx = rect.left + rect.width / 2
      const cy = rect.top + rect.height / 2
      const dx = ((e.clientX - cx) / (rect.width / 2)) * strength
      const dy = ((e.clientY - cy) / (rect.height / 2)) * strength
      setStyle({
        transform: `translate3d(${dx}px, ${dy}px, 0)`,
        transition: "transform 0.15s cubic-bezier(0.33, 1, 0.68, 1)",
      })
    }

    const handleLeave = () => {
      setStyle({
        transform: "translate3d(0, 0, 0)",
        transition: "transform 0.4s cubic-bezier(0.33, 1, 0.68, 1)",
      })
    }

    el.addEventListener("mousemove", handleMove)
    el.addEventListener("mouseleave", handleLeave)
    return () => {
      el.removeEventListener("mousemove", handleMove)
      el.removeEventListener("mouseleave", handleLeave)
    }
  }, [strength])

  return { ref, style }
}

/**
 * Spring scale: press-down effect on click (0.97 scale), spring back on release.
 */
export function useSpringPress() {
  const [pressed, setPressed] = useState(false)
  const style: CSSProperties = {
    transform: pressed ? "scale(0.97)" : "scale(1)",
    transition: pressed
      ? "transform 0.1s cubic-bezier(0.2, 0, 0.7, 1)"
      : "transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
  }
  const handlers = {
    onMouseDown: () => setPressed(true),
    onMouseUp: () => setPressed(false),
    onMouseLeave: () => setPressed(false),
  }
  return { style, handlers }
}

/**
 * Scroll-driven parallax: returns a Y offset that changes with scroll position.
 * Speed < 1 = slower than scroll, > 1 = faster. Negative = opposite direction.
 */
export function useScrollParallax(speed = 0.3) {
  const ref = useRef<HTMLDivElement>(null)
  const [offset, setOffset] = useState(0)

  useEffect(() => {
    let raf: number
    const update = () => {
      const el = ref.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      const viewH = window.innerHeight
      const progress = (viewH - rect.top) / (viewH + rect.height)
      setOffset((progress - 0.5) * speed * 100)
    }
    const onScroll = () => {
      raf = requestAnimationFrame(update)
    }
    window.addEventListener("scroll", onScroll, { passive: true })
    update()
    return () => {
      window.removeEventListener("scroll", onScroll)
      cancelAnimationFrame(raf)
    }
  }, [speed])

  return { ref, style: { transform: `translateY(${offset}px)`, willChange: "transform" as const } }
}

/**
 * Text reveal: characters or words animate in one by one.
 * Returns an array of style objects for each segment.
 */
export function useTextReveal(
  text: string,
  options: { byWord?: boolean; staggerMs?: number; inView?: boolean } = {}
) {
  const { byWord = false, staggerMs = 30, inView = true } = options
  const segments = byWord ? text.split(" ") : text.split("")

  const getSegmentStyle = useCallback(
    (index: number): CSSProperties => ({
      display: "inline-block",
      opacity: inView ? 1 : 0,
      transform: inView ? "translateY(0) rotateX(0)" : "translateY(12px) rotateX(-40deg)",
      transition: `opacity 0.4s cubic-bezier(0.16, 1, 0.3, 1) ${index * staggerMs}ms, transform 0.4s cubic-bezier(0.16, 1, 0.3, 1) ${index * staggerMs}ms`,
      whiteSpace: byWord ? "pre" : undefined,
    }),
    [inView, staggerMs, byWord]
  )

  return { segments, getSegmentStyle }
}

/**
 * Glow on hover: returns dynamic box-shadow style for glowing card effect.
 */
export function useGlowHover(color = "249, 115, 22", intensity = 0.15) {
  const [isHovered, setIsHovered] = useState(false)

  const style: CSSProperties = {
    boxShadow: isHovered
      ? `0 0 30px rgba(${color}, ${intensity}), 0 0 60px rgba(${color}, ${intensity * 0.5}), inset 0 0 30px rgba(${color}, ${intensity * 0.15})`
      : "0 0 0 rgba(0,0,0,0)",
    transition: "box-shadow 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
  }

  const handlers = {
    onMouseEnter: () => setIsHovered(true),
    onMouseLeave: () => setIsHovered(false),
  }

  return { style, handlers, isHovered }
}

/**
 * Number ticker: animates from 0 to target with optional format.
 */
export function useNumberTicker(
  target: number,
  options: { duration?: number; inView?: boolean; format?: (n: number) => string } = {}
) {
  const { duration = 2000, inView = true, format } = options
  const [value, setValue] = useState(0)
  const hasAnimated = useRef(false)

  useEffect(() => {
    if (!inView || hasAnimated.current) return
    hasAnimated.current = true
    const start = performance.now()
    const step = (now: number) => {
      const elapsed = now - start
      const progress = Math.min(elapsed / duration, 1)
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      setValue(eased * target)
      if (progress < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [inView, target, duration])

  const display = format ? format(value) : Math.floor(value).toLocaleString()

  return { value, display }
}
