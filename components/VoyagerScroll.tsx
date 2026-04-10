"use client"

import { useEffect, useRef, useState } from "react"

const TOTAL_FRAMES = 859 // all frames for smooth playback
const FRAME_PATH = "/voyager-frames/frame_"

export default function VoyagerScroll() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [currentFrame, setCurrentFrame] = useState(0)
  const imagesRef = useRef<HTMLImageElement[]>([])
  const loadedCount = useRef(0)

  // Preload all frames
  useEffect(() => {
    const images: HTMLImageElement[] = []
    for (let i = 0; i < TOTAL_FRAMES; i++) {
      const img = new Image()
      img.src = `${FRAME_PATH}${String(i).padStart(4, "0")}.jpg`
      img.onload = () => {
        loadedCount.current++
        // Draw first frame once loaded
        if (i === 0 && canvasRef.current) {
          const ctx = canvasRef.current.getContext("2d")
          if (ctx) {
            canvasRef.current.width = img.naturalWidth
            canvasRef.current.height = img.naturalHeight
            ctx.drawImage(img, 0, 0)
          }
        }
      }
      images.push(img)
    }
    imagesRef.current = images
  }, [])

  // Scroll-linked frame selection
  useEffect(() => {
    const onScroll = () => {
      if (!sectionRef.current) return
      const rect = sectionRef.current.getBoundingClientRect()
      const sectionHeight = sectionRef.current.offsetHeight - window.innerHeight
      const scrolled = -rect.top
      const progress = Math.max(0, Math.min(1, scrolled / sectionHeight))
      const frameIndex = Math.min(TOTAL_FRAMES - 1, Math.floor(progress * TOTAL_FRAMES))
      setCurrentFrame(frameIndex)
    }

    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  // Draw current frame to canvas
  useEffect(() => {
    const canvas = canvasRef.current
    const img = imagesRef.current[currentFrame]
    if (!canvas || !img || !img.complete) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    canvas.width = img.naturalWidth
    canvas.height = img.naturalHeight
    ctx.drawImage(img, 0, 0)
  }, [currentFrame])

  return (
    <section ref={sectionRef} className="relative bg-black" style={{ height: "500vh" }}>
      {/* Sticky canvas */}
      <div className="sticky top-0 h-dvh w-full overflow-hidden flex items-center justify-center">
        <canvas
          ref={canvasRef}
          className="w-full h-full object-cover"
          style={{ objectFit: "cover" }}
        />

        {/* Text overlays that fade based on scroll progress */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="max-w-4xl mx-auto px-6 text-center">
            {/* Title - visible at start */}
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

            {/* Mid section stats */}
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

            {/* End quote */}
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

        {/* Scroll indicator at bottom */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/30 text-xs uppercase tracking-wider">
          {currentFrame < TOTAL_FRAMES - 30 ? "Scroll to explore" : ""}
        </div>
      </div>
    </section>
  )
}
