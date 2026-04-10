"use client"

import Link from "next/link"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import dynamic from "next/dynamic"
import { solarSystemData, type CelestialBody } from "@/lib/planet-data"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faArrowLeft, faClock, faGlobe, faTemperatureHigh, faWind, faSkull, faMoon } from "@fortawesome/free-solid-svg-icons"

const PlanetViewer = dynamic(() => import("@/components/PlanetViewer"), { ssr: false })
const EarthGLBViewer = dynamic(() => import("@/components/EarthGLBViewer"), { ssr: false })
const WeightCalculator = dynamic(() => import("@/components/WeightCalculator"), { ssr: false })
const StarField = dynamic(() => import("@/components/StarField"), { ssr: false })
const MoonSection = dynamic(() => import("@/components/MoonSection"), { ssr: false })

export default function PlanetPageClient({ body }: { body: CelestialBody }) {
  const dayComparison = body.dayLengthHours / 24
  const yearComparison = body.yearLengthDays / 365.25

  return (
    <div className="bg-black min-h-screen">
      <Header alwaysVisible />

      <section className="relative pt-24 pb-8 md:pt-32 md:pb-12 overflow-hidden">
        <StarField starCount={600} />
        <div className="relative z-10 max-w-6xl mx-auto px-6">
          <Link href="/solar-system" className="inline-flex items-center gap-2 text-white/40 hover:text-white text-sm transition-colors mb-8">
            <FontAwesomeIcon icon={faArrowLeft} className="w-3 h-3" />
            Back to solar system
          </Link>

          <div className="grid md:grid-cols-2 gap-12 items-start">
            {/* Left: 3D Planet */}
            <div>
              {body.slug === "earth" ? (
                <EarthGLBViewer />
              ) : (
                <PlanetViewer
                  slug={body.slug}
                  color={body.color}
                  accentColor={body.accentColor}
                  hasRings={body.hasRings}
                  ringColor={body.ringColor}
                  isStar={body.type === "star"}
                  rotationSpeed={body.type === "star" ? 0.001 : 0.004}
                />
              )}
              <p className="text-white/20 text-xs text-center mt-2">Drag to rotate{body.slug === "earth" ? " | NASA 3D model" : ""}</p>
            </div>

            {/* Right: Name & Description */}
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: body.color }} />
                <span className="text-white/40 text-xs uppercase tracking-wider">{body.type === "star" ? "Star" : body.type === "dwarf-planet" ? "Dwarf Planet" : `Planet #${body.orderFromSun}`}</span>
              </div>
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-3">{body.name}</h1>
              <p className="text-lg mb-6" style={{ color: body.color }}>{body.tagline}</p>
              <p className="text-white/50 leading-relaxed mb-6">{body.description}</p>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-white/5 border border-white/10 rounded-lg p-3 backdrop-blur-sm">
                  <FontAwesomeIcon icon={faClock} className="w-3 h-3 mb-1" style={{ color: body.color }} />
                  <p className="text-white/30 text-[10px] uppercase tracking-wider">Day Length</p>
                  <p className="text-white font-mono text-sm">{body.dayLengthHours.toLocaleString()}h</p>
                  <p className="text-white/20 text-[10px]">{dayComparison.toFixed(1)}x Earth days</p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-lg p-3 backdrop-blur-sm">
                  <FontAwesomeIcon icon={faGlobe} className="w-3 h-3 mb-1" style={{ color: body.color }} />
                  <p className="text-white/30 text-[10px] uppercase tracking-wider">Year Length</p>
                  <p className="text-white font-mono text-sm">{body.yearLengthDays > 0 ? `${body.yearLengthDays.toLocaleString()}d` : "N/A"}</p>
                  <p className="text-white/20 text-[10px]">{yearComparison > 0 ? `${yearComparison.toFixed(2)}x Earth years` : ""}</p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-lg p-3 backdrop-blur-sm">
                  <FontAwesomeIcon icon={faTemperatureHigh} className="w-3 h-3 mb-1" style={{ color: body.color }} />
                  <p className="text-white/30 text-[10px] uppercase tracking-wider">Avg Temperature</p>
                  <p className="text-white font-mono text-sm">{body.surfaceTempC.avg > 999 ? `${(body.surfaceTempC.avg / 1000000).toFixed(1)}M` : body.surfaceTempC.avg}&deg;C</p>
                  <p className="text-white/20 text-[10px]">{body.surfaceTempC.min}&deg; to {body.surfaceTempC.max > 999999 ? `${(body.surfaceTempC.max / 1000000).toFixed(0)}M` : body.surfaceTempC.max}&deg;C</p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-lg p-3 backdrop-blur-sm">
                  <FontAwesomeIcon icon={faMoon} className="w-3 h-3 mb-1" style={{ color: body.color }} />
                  <p className="text-white/30 text-[10px] uppercase tracking-wider">Moons</p>
                  <p className="text-white font-mono text-sm">{body.moons}</p>
                  <p className="text-white/20 text-[10px]">{body.hasRings ? "Has rings" : "No rings"}</p>
                </div>
              </div>

              <div className="p-3 rounded-lg backdrop-blur-sm" style={{ backgroundColor: `${body.color}10`, borderColor: `${body.color}25`, borderWidth: 1, borderStyle: "solid" }}>
                <div className="flex items-center gap-2 mb-1">
                  <div className={`w-2 h-2 rounded-full ${body.hasSurface ? "bg-green-500" : "bg-orange-500"}`} />
                  <p className="text-white text-sm font-medium">{body.hasSurface ? "Solid Surface" : "No Solid Surface"}</p>
                </div>
                <p className="text-white/40 text-xs">{body.surfaceType}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative z-30 bg-black border-t border-white/10">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <h2 className="text-2xl font-bold text-white mb-8">Physical Properties</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Radius", value: `${body.radiusKm.toLocaleString()} km` },
              { label: "Mass", value: body.massKg },
              { label: "Surface Gravity", value: `${body.surfaceGravity} m/s\u00B2` },
              { label: "Escape Velocity", value: `${body.escapeVelocity} km/s` },
              { label: "Rotation Speed", value: `${body.rotationSpeedKmh.toLocaleString()} km/h` },
              { label: "Orbital Speed", value: body.orbitalSpeedKmS > 0 ? `${body.orbitalSpeedKmS} km/s` : "N/A" },
              { label: "Distance from Sun", value: body.distanceFromSunKm || "Center" },
              { label: "Composition", value: body.composition },
            ].map((stat, i) => (
              <div key={i} className="bg-white/[0.03] border border-white/[0.06] rounded-lg p-4">
                <p className="text-white/30 text-[10px] uppercase tracking-wider mb-1">{stat.label}</p>
                <p className="text-white text-sm font-medium">{stat.value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative z-30 bg-black border-t border-white/10">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <div className="flex items-center gap-3 mb-6">
            <FontAwesomeIcon icon={faWind} className="w-4 h-4" style={{ color: body.color }} />
            <h2 className="text-2xl font-bold text-white">Atmosphere Composition</h2>
          </div>
          <div className="space-y-3">
            {body.atmosphere.map((gas, i) => (
              <div key={i}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-white/60">{gas.gas}</span>
                  <span className="text-white font-mono">{gas.percent}%</span>
                </div>
                <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${Math.min(gas.percent, 100)}%`, backgroundColor: body.color }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Moons Section */}
      {body.moons > 0 && <MoonSection planetSlug={body.slug} planetColor={body.color} />}

      <section className="relative z-30 bg-black border-t border-white/10">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <div className="flex items-center gap-3 mb-6">
            <FontAwesomeIcon icon={faSkull} className="w-4 h-4 text-red-400" />
            <h2 className="text-2xl font-bold text-white">Could You Survive?</h2>
          </div>
          <div className={`p-6 rounded-2xl border ${body.survivalSeconds < 0 ? "bg-green-500/5 border-green-500/20" : body.survivalSeconds === 0 ? "bg-red-500/10 border-red-500/20" : "bg-orange-500/5 border-orange-500/20"}`}>
            <p className="text-3xl font-bold text-white mb-2">{body.survivalEstimate}</p>
            {body.slug !== "earth" && (
              <p className="text-white/40 text-sm">
                {body.surfaceTempC.avg > 100 ? `Surface temperature of ${body.surfaceTempC.avg > 999999 ? `${(body.surfaceTempC.avg / 1000000).toFixed(1)} million` : body.surfaceTempC.avg}\u00B0C would be instantly lethal. ` : ""}
                {body.surfaceGravity > 20 ? `Gravity of ${body.surfaceGravity} m/s\u00B2 (${(body.surfaceGravity / 9.81).toFixed(1)}x Earth) would crush you. ` : ""}
                {!body.hasSurface ? "There is no solid surface to stand on. " : ""}
                {body.atmosphere.find(a => a.gas === "Oxygen" && a.percent > 10) ? "" : "No breathable oxygen. "}
                {body.surfaceTempC.avg < -100 ? `Extreme cold of ${body.surfaceTempC.avg}\u00B0C would freeze you instantly.` : ""}
              </p>
            )}
          </div>
        </div>
      </section>

      <section className="relative z-30 bg-black border-t border-white/10">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            <WeightCalculator planetName={body.name} weightMultiplier={body.weightMultiplier} surfaceGravity={body.surfaceGravity} color={body.color} />
            <div>
              <h3 className="text-xl font-bold text-white mb-6">Did You Know?</h3>
              <div className="space-y-4">
                {body.funFacts.map((fact, i) => (
                  <div key={i} className="flex gap-3 items-start">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-xs font-bold" style={{ backgroundColor: `${body.color}20`, color: body.color }}>{i + 1}</div>
                    <p className="text-white/50 text-sm leading-relaxed">{fact}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative z-30 bg-black border-t border-white/10">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <h2 className="text-2xl font-bold text-white mb-6">Explore More</h2>
          <div className="flex gap-3 overflow-x-auto pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {solarSystemData.filter(b => b.slug !== body.slug).map((b) => (
              <Link key={b.slug} href={`/solar-system/${b.slug}`} className="shrink-0 flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-lg hover:border-white/20 transition-all">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: b.color }} />
                <span className="text-white/60 text-sm whitespace-nowrap">{b.name}</span>
              </Link>
            ))}
            <Link href="/solar-system/black-hole" className="shrink-0 flex items-center gap-2 px-4 py-2 bg-white/5 border border-purple-500/20 rounded-lg hover:border-purple-500/40 transition-all">
              <div className="w-3 h-3 rounded-full bg-black border border-purple-500/50" />
              <span className="text-purple-400 text-sm whitespace-nowrap">Black Hole</span>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
