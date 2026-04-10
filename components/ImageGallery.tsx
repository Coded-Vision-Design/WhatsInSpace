"use client"

import Image from "next/image"
import { useState, useRef, useEffect, useCallback, createContext, useContext } from "react"
import { X, ChevronLeft, ChevronRight, Maximize2, Minimize2 } from "lucide-react"

interface GalleryImage {
  src: string
  caption: string
}

interface ImageGalleryProps {
  images: GalleryImage[]
}

const LightboxContext = createContext<{ openLightbox: (index: number) => void }>({
  openLightbox: () => {},
})

function GalleryThumbnail({ image, index }: { image: GalleryImage; index: number }) {
  const { openLightbox } = useContext(LightboxContext)

  return (
    <button
      onClick={() => openLightbox(index)}
      className="relative flex-shrink-0 w-[280px] sm:w-[340px] md:w-[400px] aspect-[3/2] rounded-xl overflow-hidden group cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
    >
      <Image
        src={image.src}
        alt={image.caption}
        fill
        className="object-cover transition-transform duration-500 group-hover:scale-110"
        sizes="(max-width: 640px) 280px, (max-width: 768px) 340px, 400px"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
        <p className="text-white text-sm text-left leading-snug">{image.caption}</p>
        <p className="text-white/40 text-xs mt-1 text-left">NASA / Artemis II</p>
      </div>
    </button>
  )
}

function InfiniteRow({
  images,
  direction,
  speed = 25,
}: {
  images: GalleryImage[]
  direction: "left" | "right"
  speed?: number
}) {
  const rowRef = useRef<HTMLDivElement>(null)
  const isPausedRef = useRef(false)
  const offsetRef = useRef(0)
  const rafRef = useRef<number>(0)
  const lastTimeRef = useRef<number>(0)
  const singleSetWidthRef = useRef(0)

  const duplicated = [...images, ...images, ...images, ...images]

  useEffect(() => {
    const row = rowRef.current
    if (!row) return

    singleSetWidthRef.current = row.scrollWidth / 4

    if (direction === "right") {
      offsetRef.current = -singleSetWidthRef.current
    }

    const animate = (time: number) => {
      if (!lastTimeRef.current) lastTimeRef.current = time
      const delta = time - lastTimeRef.current
      lastTimeRef.current = time

      if (!isPausedRef.current && singleSetWidthRef.current > 0) {
        const px = (speed * delta) / 1000

        if (direction === "left") {
          offsetRef.current -= px
          if (Math.abs(offsetRef.current) >= singleSetWidthRef.current) {
            offsetRef.current += singleSetWidthRef.current
          }
        } else {
          offsetRef.current += px
          if (offsetRef.current >= 0) {
            offsetRef.current -= singleSetWidthRef.current
          }
        }

        row.style.transform = `translateX(${offsetRef.current}px)`
      }

      rafRef.current = requestAnimationFrame(animate)
    }

    rafRef.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(rafRef.current)
  }, [direction, speed])

  return (
    <div
      className="overflow-hidden"
      onMouseEnter={() => { isPausedRef.current = true }}
      onMouseLeave={() => { isPausedRef.current = false }}
      onTouchStart={() => { isPausedRef.current = true }}
      onTouchEnd={() => { isPausedRef.current = false }}
    >
      <div
        ref={rowRef}
        className="flex gap-4 will-change-transform"
        style={{ width: "max-content" }}
      >
        {duplicated.map((img, i) => (
          <GalleryThumbnail
            key={`${direction}-${i}`}
            image={img}
            index={i % images.length}
          />
        ))}
      </div>
    </div>
  )
}

function Lightbox({
  images,
  currentIndex,
  onClose,
  onNext,
  onPrev,
}: {
  images: GalleryImage[]
  currentIndex: number
  onClose: () => void
  onNext: () => void
  onPrev: () => void
}) {
  const img = images[currentIndex]
  const [isFullscreen, setIsFullscreen] = useState(false)
  const touchStartX = useRef(0)
  const touchStartY = useRef(0)
  const containerRef = useRef<HTMLDivElement>(null)

  // Keyboard controls
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") { if (isFullscreen) exitFullscreen(); else onClose() }
      if (e.key === "ArrowRight") onNext()
      if (e.key === "ArrowLeft") onPrev()
      if (e.key === "f" || e.key === "F") toggleFullscreen()
    }
    window.addEventListener("keydown", handleKey)
    return () => window.removeEventListener("keydown", handleKey)
  }, [onClose, onNext, onPrev, isFullscreen])

  // Lock scroll
  useEffect(() => {
    document.body.style.overflow = "hidden"
    return () => { document.body.style.overflow = "" }
  }, [])

  // Fullscreen change listener
  useEffect(() => {
    const onFSChange = () => setIsFullscreen(!!document.fullscreenElement)
    document.addEventListener("fullscreenchange", onFSChange)
    return () => document.removeEventListener("fullscreenchange", onFSChange)
  }, [])

  // Touch swipe handlers
  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
    touchStartY.current = e.touches[0].clientY
  }

  const onTouchEnd = (e: React.TouchEvent) => {
    const dx = e.changedTouches[0].clientX - touchStartX.current
    const dy = e.changedTouches[0].clientY - touchStartY.current
    // Only trigger if horizontal swipe is dominant and exceeds threshold
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) {
      if (dx > 0) onPrev()
      else onNext()
    }
  }

  const toggleFullscreen = () => {
    if (!containerRef.current) return
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {})
    } else {
      exitFullscreen()
    }
  }

  const exitFullscreen = () => {
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {})
  }

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-sm"
      onClick={onClose}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      role="dialog"
      aria-modal="true"
      aria-label={img.caption}
    >
      {/* Top controls */}
      <div className="absolute top-4 right-4 z-10 flex gap-2">
        <button
          onClick={(e) => { e.stopPropagation(); toggleFullscreen() }}
          className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
        >
          {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
        </button>
        <button
          onClick={onClose}
          className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          aria-label="Close lightbox"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Nav buttons */}
      <button
        onClick={(e) => { e.stopPropagation(); onPrev() }}
        className="absolute left-4 z-10 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
        aria-label="Previous image"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>

      <div
        className={`relative ${isFullscreen ? "w-full h-full" : "max-w-[90vw] max-h-[80vh] w-full h-full"} flex items-center justify-center`}
        onClick={(e) => e.stopPropagation()}
      >
        <Image
          src={img.src}
          alt={img.caption}
          fill
          className="object-contain"
          sizes="90vw"
          priority
        />
      </div>

      <button
        onClick={(e) => { e.stopPropagation(); onNext() }}
        className="absolute right-4 z-10 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
        aria-label="Next image"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Caption */}
      <div className="absolute bottom-0 left-0 right-0 text-center p-6 bg-gradient-to-t from-black/80 to-transparent">
        <p className="text-white text-lg">{img.caption}</p>
        <p className="text-white/40 text-sm mt-1">
          {currentIndex + 1} / {images.length} &middot; NASA / Artemis II &middot; Swipe or use arrow keys
        </p>
      </div>
    </div>
  )
}

export default function ImageGallery({ images }: ImageGalleryProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  const mid = Math.ceil(images.length / 2)
  const row1 = images.slice(0, mid)
  const row2 = images.slice(mid)

  const openLightbox = useCallback((index: number) => {
    setLightboxIndex(index)
  }, [])

  const closeLightbox = useCallback(() => setLightboxIndex(null), [])

  const nextImage = useCallback(() => {
    setLightboxIndex((prev) => (prev !== null ? (prev + 1) % images.length : null))
  }, [images.length])

  const prevImage = useCallback(() => {
    setLightboxIndex((prev) => (prev !== null ? (prev - 1 + images.length) % images.length : null))
  }, [images.length])

  return (
    <LightboxContext.Provider value={{ openLightbox }}>
      <section id="gallery" className="relative z-30 bg-black border-t border-white/10 scroll-mt-20">
        <div className="py-32">
          <div className="text-center mb-16 fade-section px-6">
            <p className="text-orange-500 uppercase tracking-[0.3em] text-sm font-medium mb-4">Gallery</p>
            <h2 className="text-4xl md:text-6xl font-bold text-white mb-4">Mission in Photos</h2>
            <p className="text-white/50 text-lg max-w-2xl mx-auto">
              Images from NASA&apos;s Artemis II mission: from launch at Kennedy Space Center
              to the lunar flyby and the journey home.
            </p>
          </div>

          <div className="flex flex-col gap-4">
            <InfiniteRow images={row1} direction="left" speed={25} />
            <InfiniteRow images={row2} direction="right" speed={25} />
          </div>
        </div>
      </section>

      {lightboxIndex !== null && (
        <Lightbox
          images={images}
          currentIndex={lightboxIndex}
          onClose={closeLightbox}
          onNext={nextImage}
          onPrev={prevImage}
        />
      )}
    </LightboxContext.Provider>
  )
}
