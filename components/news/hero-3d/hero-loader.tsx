"use client"

import dynamic from "next/dynamic"
import { Component, type ReactNode } from "react"

class HeroErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: ReactNode }) {
    super(props)
    this.state = { hasError: false }
  }
  static getDerivedStateFromError() {
    return { hasError: true }
  }
  componentDidCatch(error: Error) {
    console.warn("[NewsHeroScene] 3D failed, falling back to static:", error.message)
  }
  render() {
    if (this.state.hasError) return <StaticFallback />
    return this.props.children
  }
}

function StaticFallback() {
  return (
    <div className="relative h-screen flex flex-col items-center justify-center bg-black overflow-hidden">
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(249,115,22,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(249,115,22,0.3) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-orange-500/5 blur-[120px]" />
      <div className="relative z-10 text-center px-4 mt-16">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-orange-500/20 bg-orange-950/60 px-4 py-1.5 text-sm text-orange-400">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute h-full w-full rounded-full bg-orange-400 opacity-75" />
            <span className="relative h-2 w-2 rounded-full bg-orange-400" />
          </span>
          Live space news
        </div>
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl text-white">
          Space News{" "}
          <span className="text-orange-400">from across the cosmos.</span>
          <br />
          <span className="text-gray-400">
            Stay informed, <span className="text-orange-400">stay curious.</span>
          </span>
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg text-gray-400">
          The latest launches, discoveries, and missions from NASA, ESA,
          SpaceX and more, all in one place.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <a href="#news-feed" className="inline-flex items-center gap-2 rounded-lg bg-orange-500 px-8 py-3 text-base font-semibold text-gray-900 hover:bg-orange-400 transition-colors shadow-lg shadow-orange-500/25">
            Read Latest News
          </a>
          <a href="/solar-system" className="inline-flex items-center gap-2 rounded-lg border border-gray-600 px-8 py-3 text-base font-semibold text-gray-200 hover:bg-gray-800/60 transition-colors">
            Explore Solar System
          </a>
        </div>
      </div>
    </div>
  )
}

const HeroScene = dynamic(
  () => import("./hero-scene").then((mod) => mod.HeroScene),
  {
    ssr: false,
    loading: () => (
      <div className="h-screen flex items-center justify-center bg-black">
        <div className="text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-500/10 mx-auto mb-4">
            <svg
              className="h-6 w-6 text-orange-400 animate-pulse"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
          </div>
          <p className="text-xs text-gray-500">Loading experience...</p>
        </div>
      </div>
    ),
  }
)

export function HeroLoader() {
  return (
    <HeroErrorBoundary>
      <HeroScene />
    </HeroErrorBoundary>
  )
}
