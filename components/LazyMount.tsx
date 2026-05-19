"use client"

import { useEffect, useRef, useState, type ReactNode, type CSSProperties } from "react"

type Props = {
  children: ReactNode
  /** Distance ahead of the viewport at which to mount, e.g. "200% 0px". */
  rootMargin?: string
  /** Class for the placeholder wrapper while not yet mounted. */
  className?: string
  style?: CSSProperties
}

// Render children only once the wrapper enters (or nears) the viewport.
// Used to defer heavy WebGL/Three.js components on the homepage so they don't
// run their render loops when the user is reading the hero.
export default function LazyMount({ children, rootMargin = "100% 0px", className, style }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    if (mounted) return
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setMounted(true)
          observer.disconnect()
        }
      },
      { rootMargin },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [mounted, rootMargin])

  return (
    <div ref={ref} className={className} style={style}>
      {mounted ? children : null}
    </div>
  )
}
