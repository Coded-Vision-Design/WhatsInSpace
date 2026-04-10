import { Satellite, Globe, Rocket, Newspaper } from "lucide-react"

const SOURCES = [
  { icon: Satellite, label: "NASA", description: "National Aeronautics and Space Administration" },
  { icon: Globe, label: "ESA", description: "European Space Agency" },
  { icon: Rocket, label: "SpaceX", description: "Launch and mission updates" },
  { icon: Newspaper, label: "Spaceflight News API", description: "Aggregated space journalism" },
]

export function SpaceSourceBadges() {
  return (
    <section className="py-16 px-4 bg-white/[0.02]">
      <div className="mx-auto max-w-7xl">
        <div className="text-center mb-10">
          <p className="text-sm font-medium text-orange-400 uppercase tracking-wider">
            Trusted Data Sources
          </p>
        </div>
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {SOURCES.map((source) => (
            <div key={source.label} className="flex flex-col items-center text-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-500/5 border border-orange-500/10">
                <source.icon className="h-6 w-6 text-orange-400/70" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">{source.label}</p>
                <p className="text-xs text-gray-500 mt-1">{source.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
