"use client"

import Header from "@/components/Header"
import Footer from "@/components/Footer"
import dynamic from "next/dynamic"
import Link from "next/link"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faArrowLeft, faInfinity, faRadiation, faClock, faCompress } from "@fortawesome/free-solid-svg-icons"

const BlackHoleViewer = dynamic(() => import("@/components/BlackHoleViewer"), { ssr: false })
const StarField = dynamic(() => import("@/components/StarField"), { ssr: false })

const FACTS = [
  { icon: faInfinity, title: "Singularity", description: "At the center lies a singularity, a point of infinite density where the known laws of physics break down. All matter that crosses the event horizon is inevitably drawn toward it." },
  { icon: faRadiation, title: "Hawking Radiation", description: "Black holes slowly evaporate over unimaginable timescales through Hawking radiation, a quantum mechanical process predicted by Stephen Hawking in 1974. A stellar-mass black hole would take longer than the age of the universe to evaporate." },
  { icon: faClock, title: "Time Dilation", description: "Near a black hole, time slows dramatically due to extreme gravitational fields. An observer falling in would experience time normally, but to an outside observer, they would appear to slow down and freeze at the event horizon." },
  { icon: faCompress, title: "Spaghettification", description: "As you approach a black hole, tidal forces stretch you vertically and compress you horizontally in a process called spaghettification. For a stellar-mass black hole, this would happen before you reach the event horizon." },
]

const STATS = [
  { label: "Minimum mass", value: "~3 solar masses" },
  { label: "Event horizon", value: "Proportional to mass" },
  { label: "Escape velocity", value: "> speed of light" },
  { label: "Temperature", value: "Near absolute zero (exterior)" },
  { label: "Interior temperature", value: "Unknown (singularity)" },
  { label: "Nearest known", value: "Gaia BH1, ~1,560 ly" },
  { label: "Sagittarius A*", value: "4M solar masses, 26,000 ly" },
  { label: "Largest known", value: "TON 618, 66 billion solar masses" },
]

export default function BlackHolePage() {
  return (
    <div className="bg-black min-h-screen">
      <Header alwaysVisible />

      {/* Hero - full-bleed 3D black hole */}
      <section className="relative min-h-[90vh] overflow-hidden">
        {/* 3D Black Hole as full background */}
        <div className="absolute inset-0 z-0">
          <BlackHoleViewer />
        </div>

        {/* Text overlay */}
        <div className="relative z-10 max-w-6xl mx-auto px-6 pt-24 md:pt-32">
          <Link href="/solar-system" className="inline-flex items-center gap-2 text-white/60 hover:text-white text-sm transition-colors mb-8 backdrop-blur-sm bg-black/20 px-3 py-1.5 rounded-lg">
            <FontAwesomeIcon icon={faArrowLeft} className="w-3 h-3" />
            Back to solar system
          </Link>

          <div className="text-center mb-12">
            <p className="text-purple-400 uppercase tracking-[0.3em] text-sm font-medium mb-4">Beyond Light</p>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-4 drop-shadow-2xl">Black Holes</h1>
            <p className="text-white/60 text-lg max-w-2xl mx-auto drop-shadow-lg">
              Regions of spacetime where gravity is so extreme that nothing, not even light,
              can escape once it crosses the event horizon.
            </p>
          </div>
        </div>

        {/* Bottom fade into content */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black to-transparent z-10" />
      </section>

      {/* Key Concepts */}
      <section className="relative z-30 bg-black border-t border-white/10">
        <div className="max-w-6xl mx-auto px-6 py-20">
          <h2 className="text-3xl font-bold text-white mb-12">Key Concepts</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            {FACTS.map((fact, i) => (
              <div key={i} className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-6 hover:border-purple-500/20 transition-colors">
                <div className="w-10 h-10 bg-purple-500/20 rounded-full flex items-center justify-center mb-4">
                  <FontAwesomeIcon icon={fact.icon} className="w-5 h-5 text-purple-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{fact.title}</h3>
                <p className="text-white/50 leading-relaxed">{fact.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="relative z-30 bg-black border-t border-white/10">
        <div className="max-w-6xl mx-auto px-6 py-20">
          <h2 className="text-3xl font-bold text-white mb-8">By The Numbers</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {STATS.map((stat, i) => (
              <div key={i} className="bg-white/[0.03] border border-white/[0.06] rounded-lg p-4">
                <p className="text-white/30 text-[10px] uppercase tracking-wider mb-1">{stat.label}</p>
                <p className="text-white text-sm font-medium">{stat.value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Survival */}
      <section className="relative z-30 bg-black border-t border-white/10">
        <div className="max-w-6xl mx-auto px-6 py-20">
          <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-8 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">Could You Survive?</h2>
            <p className="text-5xl font-bold text-red-400 mb-4">No.</p>
            <p className="text-white/50 max-w-xl mx-auto">
              Crossing the event horizon of a stellar-mass black hole would spaghettify you
              in milliseconds. For a supermassive black hole, you could cross the horizon
              without immediate harm, but escape would be impossible. Either way, the singularity awaits.
            </p>
          </div>
        </div>
      </section>

      {/* Types */}
      <section className="relative z-30 bg-black border-t border-white/10">
        <div className="max-w-6xl mx-auto px-6 py-20">
          <h2 className="text-3xl font-bold text-white mb-8">Types of Black Holes</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
            <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-6">
              <h3 className="text-xl font-bold text-white mb-2">Stellar</h3>
              <p className="text-purple-400 text-sm mb-3">3-100 solar masses</p>
              <p className="text-white/50 text-sm leading-relaxed">
                Formed when massive stars (25+ solar masses) collapse at the end of their lives.
                The Milky Way likely contains hundreds of millions of stellar black holes.
              </p>
            </div>
            <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-6">
              <h3 className="text-xl font-bold text-white mb-2">Intermediate</h3>
              <p className="text-purple-400 text-sm mb-3">100-100,000 solar masses</p>
              <p className="text-white/50 text-sm leading-relaxed">
                The rarest and most mysterious type. May form from the merger of stellar black holes
                or the collapse of massive gas clouds in the early universe.
              </p>
            </div>
            <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-6">
              <h3 className="text-xl font-bold text-white mb-2">Supermassive</h3>
              <p className="text-purple-400 text-sm mb-3">Millions to billions of solar masses</p>
              <p className="text-white/50 text-sm leading-relaxed">
                Found at the center of nearly every large galaxy. Sagittarius A*, at the center
                of the Milky Way, has a mass of 4 million Suns. Their formation mechanism remains debated.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
