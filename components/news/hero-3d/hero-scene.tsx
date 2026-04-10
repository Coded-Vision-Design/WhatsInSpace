"use client"

import { Suspense, useState, useEffect, useRef } from "react"
import { Canvas, useThree, useFrame } from "@react-three/fiber"
import {
  AdaptiveDpr,
  Preload,
  ScrollControls,
  useProgress,
  useScroll,
} from "@react-three/drei"

import { EarthGlobe } from "./earth-globe"
import { ISSModel } from "./iss-model"
import { CloudLayer } from "./cloud-layer"
import { StarsBackground } from "./stars-background"
import { ScrollCamera } from "./scroll-camera"

function SceneSetup() {
  const { gl, scene } = useThree()
  useEffect(() => {
    scene.background = null
    gl.setClearColor(0x000000, 1)
  }, [gl, scene])
  return null
}

/**
 * Bridges drei scroll state to DOM overlays via data attributes.
 */
function ScrollBridge() {
  const scroll = useScroll()

  useFrame(() => {
    if (!scroll) return
    const root = document.querySelector("[data-news-hero-root]")
    if (root) {
      (root as HTMLElement).dataset.scrollProgress = String(scroll.offset)
    }
  })

  return null
}

function SceneContent() {
  return (
    <>
      <ScrollCamera />
      <ScrollBridge />

      <ambientLight intensity={0.15} />
      <directionalLight position={[5, 2, 5]} intensity={1.8} color="#ffffff" />
      <pointLight position={[-6, -2, -4]} intensity={0.4} color="#f97316" />

      <group position={[-1.6, -0.4, 0]}>
        <EarthGlobe />
        <ISSModel />
      </group>

      <CloudLayer />
    </>
  )
}

function LoadingOverlay() {
  const { progress } = useProgress()
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    if (progress >= 100) {
      const timer = setTimeout(() => setVisible(false), 800)
      return () => clearTimeout(timer)
    }
  }, [progress])

  if (!visible) return null

  return (
    <div
      className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black transition-opacity duration-700"
      style={{ opacity: progress >= 100 ? 0 : 1 }}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-500/10 mb-4">
        <svg className="h-6 w-6 text-orange-400 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      </div>
      <div className="w-48 h-1 rounded-full bg-white/10 overflow-hidden">
        <div className="h-full rounded-full bg-orange-400 transition-all duration-300" style={{ width: `${progress}%` }} />
      </div>
      <p className="mt-3 text-xs text-gray-500">Loading... {Math.round(progress)}%</p>
    </div>
  )
}

/**
 * Hero text overlay that fades out as the user scrolls.
 */
function HeroTextOverlay() {
  const overlayRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let raf: number

    function tick() {
      if (overlayRef.current) {
        const root = overlayRef.current.closest("[data-news-hero-root]") as HTMLElement | null
        const p = parseFloat(root?.dataset.scrollProgress || "0")
        const opacity = Math.max(0, 1 - p / 0.15)
        overlayRef.current.style.opacity = String(opacity)
        overlayRef.current.style.pointerEvents = opacity < 0.01 ? "none" : ""
      }
      raf = requestAnimationFrame(tick)
    }

    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])

  return (
    <div ref={overlayRef} className="absolute inset-0 z-20 pointer-events-none" style={{ willChange: "opacity" }}>
      <div className="h-full flex items-end justify-center pb-[10vh] px-4 lg:items-center lg:justify-end lg:pb-0 lg:pr-[4vw]">
        <div className="text-center lg:text-left lg:max-w-lg xl:max-w-xl">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-orange-500/20 bg-orange-950/60 backdrop-blur-sm px-4 py-1.5 text-sm text-orange-400">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-orange-400" />
            </span>
            Live space news
          </div>

          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl xl:text-6xl text-white drop-shadow-lg">
            Space News{" "}
            <span className="text-orange-400" style={{ textShadow: "0 0 30px rgba(249,115,22,0.5)" }}>from across the cosmos.</span>
            <br />
            <span className="text-gray-400">
              Stay informed,{" "}
              <span className="text-orange-400" style={{ textShadow: "0 0 30px rgba(249,115,22,0.5)" }}>stay curious.</span>
            </span>
          </h1>

          <p className="mt-4 text-base text-gray-400 leading-relaxed sm:text-lg">
            The latest launches, discoveries, and missions from NASA, ESA,
            SpaceX and more, all in one place.
          </p>

          <div className="mt-7 flex flex-col sm:flex-row items-center lg:items-start gap-3 pointer-events-auto">
            <a href="#news-feed" className="inline-flex items-center gap-2 rounded-lg bg-orange-500 px-7 py-3 text-sm font-semibold text-gray-900 hover:bg-orange-400 transition-colors shadow-lg shadow-orange-500/25">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
              </svg>
              Read Latest News
            </a>
            <a href="/solar-system" className="inline-flex items-center gap-2 rounded-lg border border-gray-600 bg-gray-900/50 backdrop-blur-sm px-7 py-3 text-sm font-semibold text-gray-200 hover:bg-gray-800/60 transition-colors">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
              </svg>
              Explore Solar System
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

function ScrollIndicator() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let raf: number
    function tick() {
      if (ref.current) {
        const root = ref.current.closest("[data-news-hero-root]") as HTMLElement | null
        const p = parseFloat(root?.dataset.scrollProgress || "0")
        ref.current.style.opacity = String(Math.max(0, 1 - p / 0.05))
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])

  return (
    <div ref={ref} className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 animate-bounce pointer-events-none">
      <div className="flex flex-col items-center gap-0.5">
        <span className="text-[10px] text-gray-600 uppercase tracking-widest">Scroll</span>
        <svg className="h-4 w-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </div>
    </div>
  )
}

export function HeroScene() {
  return (
    <div className="relative h-screen bg-black" data-news-hero-root data-scroll-progress="0">
      <div className="h-screen w-full overflow-hidden bg-black">
        <LoadingOverlay />
        <HeroTextOverlay />
        <ScrollIndicator />

        <Canvas
          className="!absolute inset-0"
          dpr={[1, 1.5]}
          camera={{ position: [0, -0.6, 4.8], fov: 45, near: 0.1, far: 500 }}
          style={{ background: "#000000" }}
        >
          <SceneSetup />
          <StarsBackground />
          <Suspense fallback={null}>
            <ScrollControls pages={1.2} damping={0.15} distance={1}>
              <SceneContent />
            </ScrollControls>
            <Preload all />
          </Suspense>
          <AdaptiveDpr pixelated />
        </Canvas>
      </div>
    </div>
  )
}
