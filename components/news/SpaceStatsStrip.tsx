"use client"

import { Orbit, Rocket, Satellite, Globe } from "lucide-react"
import { useStaggerReveal, useNumberTicker } from "@/hooks/useAnimations"

const STATS = [
  { icon: Orbit, value: 150000, label: "ISS orbits since 1998", suffix: "+" },
  { icon: Rocket, value: 50, label: "Active missions", suffix: "+" },
  { icon: Satellite, value: 10000, label: "Objects in orbit", suffix: "+" },
  { icon: Globe, value: 72, label: "Space agencies worldwide", suffix: "" },
]

function StatItem({ icon: Icon, value, label, suffix, inView }: {
  icon: typeof Orbit
  value: number
  label: string
  suffix: string
  inView: boolean
}) {
  const { display } = useNumberTicker(value, { duration: 2500, inView })
  return (
    <div className="flex flex-col items-center text-center gap-2">
      <Icon className="h-5 w-5 text-orange-400" />
      <span className="text-3xl font-bold tabular-nums text-white">
        {display}{suffix}
      </span>
      <span className="text-sm text-gray-400">{label}</span>
    </div>
  )
}

export function SpaceStatsStrip() {
  const { containerRef, isVisible } = useStaggerReveal(STATS.length)

  return (
    <section className="border-y border-white/10 bg-white/[0.02]">
      <div ref={containerRef} className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
          {STATS.map((stat) => (
            <StatItem key={stat.label} {...stat} inView={isVisible} />
          ))}
        </div>
      </div>
    </section>
  )
}
