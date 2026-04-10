"use client"

import { Rocket, Orbit, Globe, Telescope, Building2, Scale, Cpu, Users } from "lucide-react"
import { useStaggerReveal, useGlowHover } from "@/hooks/useAnimations"

const FEATURES = [
  { icon: Rocket, title: "Rocket Launches", description: "Upcoming and recent launches from around the world" },
  { icon: Orbit, title: "ISS Updates", description: "Crew activities, experiments, and spacewalks" },
  { icon: Globe, title: "Mars Exploration", description: "Rovers, orbiters, and future mission plans" },
  { icon: Telescope, title: "Astronomy", description: "Discoveries, exoplanets, and deep space observations" },
  { icon: Building2, title: "Commercial Space", description: "SpaceX, Blue Origin, and private ventures" },
  { icon: Scale, title: "Space Policy", description: "Funding, treaties, and international cooperation" },
  { icon: Cpu, title: "Technology", description: "New propulsion, habitats, and innovations" },
  { icon: Users, title: "Human Spaceflight", description: "Astronaut news and training updates" },
]

function FeatureCard({ icon: Icon, title, description }: typeof FEATURES[number]) {
  const { style: glowStyle, handlers } = useGlowHover()
  return (
    <div
      className="rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.06] p-6 text-center flex flex-col items-center transition-all duration-300 cursor-default"
      style={glowStyle}
      {...handlers}
    >
      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-orange-500/10 group-hover:bg-orange-500/20 transition-colors">
        <Icon className="h-5 w-5 text-orange-400" />
      </div>
      <h3 className="font-semibold text-white mb-2">{title}</h3>
      <p className="text-sm text-gray-400 leading-relaxed">{description}</p>
    </div>
  )
}

export function SpaceFeatureGrid() {
  const { containerRef, getItemStyle } = useStaggerReveal(FEATURES.length)

  return (
    <section className="py-20 px-4">
      <div className="mx-auto max-w-7xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl text-white">
            Space intelligence,{" "}
            <span className="text-orange-400">simplified</span>
          </h2>
          <p className="mt-4 text-lg text-gray-400 max-w-2xl mx-auto">
            Stay on top of every corner of the space industry with curated
            coverage across all major categories.
          </p>
        </div>

        <div ref={containerRef} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((feature, i) => (
            <div key={feature.title} style={getItemStyle(i)}>
              <FeatureCard {...feature} />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
