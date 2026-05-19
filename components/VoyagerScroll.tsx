"use client"

import { useEffect, useRef, useState } from "react"

const TOTAL_FRAMES = 859
const FRAME_PATH = "/voyager-frames/frame_"
// Window of frames to keep loaded around the current scroll position.
// Trades memory/network for scroll smoothness. 60 ≈ 2.4MB at ~40KB/frame.
const WINDOW_AHEAD = 60
const WINDOW_BEHIND = 20
// Concurrent fetches - browsers will queue beyond this anyway, but capping
// keeps the decoder from being slammed.
const MAX_CONCURRENT_LOADS = 6

function frameUrl(i: number) {
  return `${FRAME_PATH}${String(i).padStart(4, "0")}.jpg`
}

export default function VoyagerScroll() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [currentFrame, setCurrentFrame] = useState(0)
  const [active, setActive] = useState(false)
  const imagesRef = useRef<(HTMLImageElement | null)[]>([])
  const inFlightRef = useRef<Set<number>>(new Set())
  const rafRef = useRef<number>(0)
  const pendingFrameRef = useRef(0)

  // Activate (start loading frames) only when the section is near the viewport.
  // Saves the user 34MB of downloads if they never scroll this far.
  useEffect(() => {
    const el = sectionRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setActive(true)
          observer.disconnect()
        }
      },
      { rootMargin: "200% 0px" }, // start when within ~2 viewports
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  // Initialise the image array once activated, and ensure the windowed loader
  // is primed around the current frame.
  useEffect(() => {
    if (!active) return
    if (imagesRef.current.length === 0) {
      imagesRef.current = new Array(TOTAL_FRAMES).fill(null)
    }
    loadWindow(currentFrame)
  }, [active])

  function loadFrame(i: number, onLoad?: (img: HTMLImageElement) => void) {
    if (i < 0 || i >= TOTAL_FRAMES) return
    if (imagesRef.current[i]) return
    if (inFlightRef.current.has(i)) return
    if (inFlightRef.current.size >= MAX_CONCURRENT_LOADS) return
    inFlightRef.current.add(i)
    const img = new Image()
    img.src = frameUrl(i)
    img.onload = () => {
      imagesRef.current[i] = img
      inFlightRef.current.delete(i)
      onLoad?.(img)
      // Keep filling the queue
      loadWindow(pendingFrameRef.current)
    }
    img.onerror = () => {
      inFlightRef.current.delete(i)
    }
  }

  function loadWindow(centre: number) {
    pendingFrameRef.current = centre
    const start = Math.max(0, centre - WINDOW_BEHIND)
    const end = Math.min(TOTAL_FRAMES - 1, centre + WINDOW_AHEAD)
    // Prioritise current frame first, then expand outwards
    if (!imagesRef.current[centre]) {
      loadFrame(centre, (img) => {
        if (canvasRef.current && centre === pendingFrameRef.current) {
          drawImageToCanvas(canvasRef.current, img)
        }
      })
    }
    for (let off = 1; off <= Math.max(WINDOW_AHEAD, WINDOW_BEHIND); off++) {
      if (centre + off <= end) loadFrame(centre + off)
      if (centre - off >= start) loadFrame(centre - off)
      if (inFlightRef.current.size >= MAX_CONCURRENT_LOADS) break
    }
  }

  // rAF-throttled scroll handler. Reading scroll position is cheap; the
  // expensive part is React re-renders, so we batch via setState only when the
  // frame index actually changes.
  useEffect(() => {
    const onScroll = () => {
      if (!sectionRef.current) return
      if (rafRef.current) return
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = 0
        const el = sectionRef.current
        if (!el) return
        const rect = el.getBoundingClientRect()
        const sectionHeight = el.offsetHeight - window.innerHeight
        const scrolled = -rect.top
        const progress = Math.max(0, Math.min(1, scrolled / sectionHeight))
        const frameIndex = Math.min(TOTAL_FRAMES - 1, Math.floor(progress * TOTAL_FRAMES))
        setCurrentFrame((prev) => (prev === frameIndex ? prev : frameIndex))
      })
    }

    window.addEventListener("scroll", onScroll, { passive: true })
    onScroll()
    return () => {
      window.removeEventListener("scroll", onScroll)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [])

  // Draw the current frame and slide the load window forward.
  useEffect(() => {
    if (!active) return
    const canvas = canvasRef.current
    const img = imagesRef.current[currentFrame]
    if (canvas && img && img.complete) {
      drawImageToCanvas(canvas, img)
    }
    loadWindow(currentFrame)
  }, [currentFrame, active])

  return (
    <section ref={sectionRef} className="relative bg-black" style={{ height: "500vh" }}>
      <div className="sticky top-0 h-dvh w-full overflow-hidden flex items-center justify-center">
        <canvas
          ref={canvasRef}
          className="w-full h-full object-cover"
          style={{ objectFit: "cover" }}
        />

        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <div
              className="transition-opacity duration-500"
              style={{ opacity: currentFrame < 120 ? 1 : Math.max(0, 1 - (currentFrame - 120) / 60) }}
            >
              <p className="text-orange-500 uppercase tracking-[0.3em] text-sm font-medium mb-4">Beyond Our World</p>
              <h2 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-4 drop-shadow-2xl">Voyager</h2>
              <p className="text-white/60 text-lg max-w-xl mx-auto drop-shadow-lg">
                The farthest human-made objects from Earth, still transmitting after 47 years.
              </p>
            </div>

            <div
              className="absolute inset-0 flex items-center justify-center transition-opacity duration-500"
              style={{ opacity: currentFrame > 240 && currentFrame < 500 ? Math.min(1, (currentFrame - 240) / 60) * Math.min(1, (500 - currentFrame) / 60) : 0 }}
            >
              <div className="grid grid-cols-2 gap-8 max-w-lg">
                <div className="text-center">
                  <p className="text-3xl md:text-5xl font-bold text-white font-mono drop-shadow-2xl">24.8B</p>
                  <p className="text-white/50 text-sm mt-1">km from Earth (Voyager 1)</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl md:text-5xl font-bold text-white font-mono drop-shadow-2xl">47</p>
                  <p className="text-white/50 text-sm mt-1">years of operation</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl md:text-5xl font-bold text-white font-mono drop-shadow-2xl">61,000</p>
                  <p className="text-white/50 text-sm mt-1">km/h speed</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl md:text-5xl font-bold text-white font-mono drop-shadow-2xl">22h</p>
                  <p className="text-white/50 text-sm mt-1">light travel time to Earth</p>
                </div>
              </div>
            </div>

            <div
              className="absolute inset-0 flex items-center justify-center transition-opacity duration-500"
              style={{ opacity: currentFrame > 700 ? Math.min(1, (currentFrame - 700) / 60) : 0 }}
            >
              <div>
                <p className="text-2xl md:text-4xl font-bold text-white italic drop-shadow-2xl max-w-2xl mx-auto leading-relaxed">
                  &ldquo;Look again at that dot. That&rsquo;s here. That&rsquo;s home. That&rsquo;s us.&rdquo;
                </p>
                <p className="text-orange-400 mt-4 text-lg">Carl Sagan, 1994</p>
                <p className="text-white/30 text-sm mt-2">Reflecting on the Pale Blue Dot image taken by Voyager 1</p>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/30 text-xs uppercase tracking-wider">
          {currentFrame < TOTAL_FRAMES - 30 ? "Scroll to explore" : ""}
        </div>
      </div>
    </section>
  )
}

function drawImageToCanvas(canvas: HTMLCanvasElement, img: HTMLImageElement) {
  const ctx = canvas.getContext("2d")
  if (!ctx) return
  if (canvas.width !== img.naturalWidth) canvas.width = img.naturalWidth
  if (canvas.height !== img.naturalHeight) canvas.height = img.naturalHeight
  ctx.drawImage(img, 0, 0)
}
