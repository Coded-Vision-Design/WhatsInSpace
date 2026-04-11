"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import Image from "next/image"

const MISSION_START = new Date("2026-04-01T00:00:00Z")
const MISSION_END = new Date("2026-04-12T00:00:00Z")

const CREW_MEMBERS = [
  { name: "Reid Wiseman", slug: "reid-wiseman", role: "Commander", image: "/images/crew/wiseman.webp" },
  { name: "Victor Glover", slug: "victor-glover", role: "Pilot", image: "/images/crew/glover.webp" },
  { name: "Christina Koch", slug: "christina-koch", role: "Mission Specialist", image: "/images/crew/koch.webp" },
  { name: "Jeremy Hansen", slug: "jeremy-hansen", role: "Mission Specialist", image: "/images/crew/hansen.webp" },
]

const SOLAR_SYSTEM_BODIES = [
  { name: "The Sun", slug: "sun", color: "#FDB813" },
  { name: "Mercury", slug: "mercury", color: "#A0522D" },
  { name: "Venus", slug: "venus", color: "#E8CDA0" },
  { name: "Earth", slug: "earth", color: "#4169E1" },
  { name: "Mars", slug: "mars", color: "#CD4F39" },
  { name: "Jupiter", slug: "jupiter", color: "#C88B3A" },
  { name: "Saturn", slug: "saturn", color: "#E8D191" },
  { name: "Uranus", slug: "uranus", color: "#73C2FB" },
  { name: "Neptune", slug: "neptune", color: "#4169E1" },
  { name: "Pluto", slug: "pluto", color: "#C2B280" },
  { name: "Black Hole", slug: "black-hole", color: "#000000", border: true },
]

interface HeaderProps {
  alwaysVisible?: boolean
}

export default function Header({ alwaysVisible = false }: HeaderProps) {
  const [visible, setVisible] = useState(alwaysVisible)
  const [solid, setSolid] = useState(alwaysVisible)
  const [crewOpen, setCrewOpen] = useState(false)
  const [solarOpen, setSolarOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [mobileCrewOpen, setMobileCrewOpen] = useState(false)
  const [mobileSolarOpen, setMobileSolarOpen] = useState(false)
  const crewTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const solarTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (alwaysVisible) { setVisible(true); setSolid(true); return }
    // Skip delay if animation already seen this session
    const seen = sessionStorage.getItem("heroAnimationSeen")
    if (seen) { setVisible(true); return }
    const timer = setTimeout(() => setVisible(true), 8500)
    return () => clearTimeout(timer)
  }, [alwaysVisible])

  const handleHashClick = (e: React.MouseEvent<HTMLAnchorElement>, sectionId: string) => {
    const target = document.getElementById(sectionId)
    if (!target) return
    e.preventDefault()
    // Skip hero animation: unlock scroll, show header, scroll to section
    document.body.style.overflow = ""
    setVisible(true)
    setSolid(true)
    window.dispatchEvent(new CustomEvent("skip-hero-animation"))
    target.scrollIntoView({ behavior: "smooth" })
    // Clean URL: strip any hash fragment
    history.replaceState(null, "", window.location.pathname)
  }

  useEffect(() => {
    if (alwaysVisible) return
    const onScroll = () => setSolid(window.scrollY > 100)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [alwaysVisible])

  const now = new Date()
  const isMissionLive = now >= MISSION_START && now <= MISSION_END

  const openCrew = () => {
    if (crewTimeoutRef.current) clearTimeout(crewTimeoutRef.current)
    setCrewOpen(true)
  }
  const closeCrew = () => {
    crewTimeoutRef.current = setTimeout(() => setCrewOpen(false), 150)
  }
  const openSolar = () => {
    if (solarTimeoutRef.current) clearTimeout(solarTimeoutRef.current)
    setSolarOpen(true)
  }
  const closeSolar = () => {
    solarTimeoutRef.current = setTimeout(() => setSolarOpen(false), 150)
  }

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-[100] ${
        alwaysVisible
          ? "opacity-100 translate-y-0 bg-black/90 backdrop-blur-md border-b border-white/10"
          : `transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-full"} ${solid ? "bg-black/90 backdrop-blur-md border-b border-white/10" : "bg-transparent"}`
      }`}
    >
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold text-white tracking-wider">ARTEMIS</Link>
        <nav className="hidden md:flex items-center gap-8">
          <Link href="/" onClick={(e) => handleHashClick(e, "mission")} className="text-white/50 hover:text-white text-sm transition-colors hover-underline">Mission</Link>

          {/* Crew with dropdown */}
          <div
            className="relative"
            onMouseEnter={openCrew}
            onMouseLeave={closeCrew}
          >
            <Link
              href="/"
              onClick={(e) => handleHashClick(e, "crew")}
              className="text-white/50 hover:text-white text-sm transition-colors flex items-center gap-1"
            >
              Crew
              <svg
                className={`w-3.5 h-3.5 transition-transform duration-200 ${crewOpen ? "rotate-180" : ""}`}
                fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
              >
                <path d="M19 9l-7 7-7-7" />
              </svg>
            </Link>

            <div
              className={`absolute top-full left-1/2 -translate-x-1/2 pt-3 transition-all duration-200 ${
                crewOpen ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 -translate-y-2 pointer-events-none"
              }`}
            >
              <div className="bg-black/95 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden shadow-2xl shadow-black/50 min-w-[220px]">
                <div className="px-4 py-2.5 border-b border-white/[0.06]">
                  <p className="text-[10px] text-orange-500 uppercase tracking-widest font-medium">Artemis II Crew</p>
                </div>
                {CREW_MEMBERS.map((member, idx) => (
                  <Link
                    key={member.slug}
                    href={`/crew/${member.slug}`}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-white/[0.06] transition-all group"
                    style={{
                      opacity: crewOpen ? 1 : 0,
                      transform: crewOpen ? "translateX(0)" : "translateX(-8px)",
                      transition: `opacity 0.25s ${idx * 50}ms cubic-bezier(0.16,1,0.3,1), transform 0.25s ${idx * 50}ms cubic-bezier(0.16,1,0.3,1), background-color 0.15s`,
                    }}
                  >
                    <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 border border-white/10 group-hover:border-orange-500/40 transition-colors">
                      <Image src={member.image} alt={member.name} width={32} height={32} className="w-full h-full object-cover object-top" />
                    </div>
                    <div>
                      <p className="text-sm text-white/80 group-hover:text-white transition-colors">{member.name}</p>
                      <p className="text-[11px] text-white/30">{member.role}</p>
                    </div>
                  </Link>
                ))}
                <Link
                  href="/"
                  onClick={(e) => handleHashClick(e, "crew")}
                  className="flex items-center justify-center gap-1.5 px-4 py-2.5 border-t border-white/[0.06] text-xs text-white/40 hover:text-white/70 hover:bg-white/[0.04] transition-colors"
                >
                  View all crew
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path d="M19 9l-7 7-7-7" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>

          <Link href="/technology" className="text-white/50 hover:text-white text-sm transition-colors hover-underline">Technology</Link>
          {/* Solar System with dropdown */}
          <div
            className="relative"
            onMouseEnter={openSolar}
            onMouseLeave={closeSolar}
          >
            <Link
              href="/solar-system"
              className="text-white/50 hover:text-white text-sm transition-colors flex items-center gap-1"
            >
              Solar System
              <svg
                className={`w-3.5 h-3.5 transition-transform duration-200 ${solarOpen ? "rotate-180" : ""}`}
                fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
              >
                <path d="M19 9l-7 7-7-7" />
              </svg>
            </Link>

            <div
              className={`absolute top-full left-1/2 -translate-x-1/2 pt-3 transition-all duration-200 ${
                solarOpen ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 -translate-y-2 pointer-events-none"
              }`}
            >
              <div className="bg-black/95 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden shadow-2xl shadow-black/50 min-w-[200px] max-h-[70vh] overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                <div className="px-4 py-2.5 border-b border-white/[0.06]">
                  <p className="text-[10px] text-orange-500 uppercase tracking-widest font-medium">Explore</p>
                </div>
                {SOLAR_SYSTEM_BODIES.map((body, idx) => (
                  <Link
                    key={body.slug}
                    href={body.slug === "black-hole" ? "/solar-system/black-hole" : `/solar-system/${body.slug}`}
                    className="flex items-center gap-3 px-4 py-2.5 hover:bg-white/[0.06] transition-all group"
                    style={{
                      opacity: solarOpen ? 1 : 0,
                      transform: solarOpen ? "translateX(0)" : "translateX(-8px)",
                      transition: `opacity 0.2s ${idx * 35}ms cubic-bezier(0.16,1,0.3,1), transform 0.2s ${idx * 35}ms cubic-bezier(0.16,1,0.3,1), background-color 0.15s`,
                    }}
                  >
                    <div
                      className={`w-3 h-3 rounded-full shrink-0 transition-shadow group-hover:shadow-lg ${(body as any).border ? "border border-purple-500/60" : ""}`}
                      style={{ backgroundColor: body.color, boxShadow: `0 0 6px ${body.color}40` }}
                    />
                    <p className="text-sm text-white/80 group-hover:text-white transition-colors">{body.name}</p>
                  </Link>
                ))}
                <Link
                  href="/solar-system"
                  className="flex items-center justify-center gap-1.5 px-4 py-2.5 border-t border-white/[0.06] text-xs text-white/40 hover:text-white/70 hover:bg-white/[0.04] transition-colors"
                >
                  View solar system
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
          <Link href="/iss" className="text-white/50 hover:text-white text-sm transition-colors hover-underline">ISS</Link>
          <Link href="/news" className="text-white/50 hover:text-white text-sm transition-colors hover-underline">News</Link>
          <Link href="/" onClick={(e) => handleHashClick(e, "trajectory")} className="text-white/50 hover:text-white text-sm transition-colors hover-underline">Flight Path</Link>
        </nav>
        <div className="flex items-center gap-3">
          {isMissionLive && (
            <a
              href="https://www.youtube.com/watch?v=m3kR2KK8TEs"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex items-center gap-2 px-4 py-2 bg-red-600 text-white text-sm font-semibold rounded-lg hover:bg-red-700 transition-colors"
            >
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white" />
              </span>
              Watch Live
            </a>
          )}
          {/* Mobile hamburger */}
          <button
            onClick={() => { setMobileOpen(!mobileOpen); if (mobileOpen) { setMobileCrewOpen(false); setMobileSolarOpen(false) } }}
            className="md:hidden p-2 text-white/70 hover:text-white transition-colors"
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              {mobileOpen
                ? <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                : <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              }
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`md:hidden transition-all duration-300 overflow-hidden ${mobileOpen ? "max-h-[85vh] opacity-100" : "max-h-0 opacity-0"}`}>
        <div className="bg-black/95 backdrop-blur-xl border-t border-white/10 overflow-y-auto max-h-[85vh]">
          <nav className="px-6 py-5 space-y-1">
            {/* Mission */}
            <Link
              href="/"
              onClick={(e) => { setMobileOpen(false); handleHashClick(e, "mission") }}
              className="block py-3.5 text-center text-white/70 hover:text-white text-[15px] font-medium border-b border-white/[0.06] transition-colors"
            >
              Mission
            </Link>

            {/* Crew accordion */}
            <div className="border-b border-white/[0.06]">
              <button
                onClick={() => setMobileCrewOpen(!mobileCrewOpen)}
                className="w-full flex items-center justify-center gap-2 py-3.5 text-white/70 hover:text-white text-[15px] font-medium transition-colors"
              >
                Crew
                <svg
                  className={`w-3.5 h-3.5 transition-transform duration-300 ${mobileCrewOpen ? "rotate-180" : ""}`}
                  fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                >
                  <path d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div
                className="overflow-hidden transition-all duration-300"
                style={{ maxHeight: mobileCrewOpen ? "400px" : "0", opacity: mobileCrewOpen ? 1 : 0 }}
              >
                <div className="pb-3 space-y-0.5">
                  {CREW_MEMBERS.map((member) => (
                    <Link
                      key={member.slug}
                      href={`/crew/${member.slug}`}
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 rounded-lg hover:bg-white/[0.06] transition-colors mx-2"
                    >
                      <div className="w-9 h-9 rounded-full overflow-hidden shrink-0 border border-white/10">
                        <Image src={member.image} alt={member.name} width={36} height={36} className="w-full h-full object-cover object-top" />
                      </div>
                      <div>
                        <p className="text-sm text-white/80">{member.name}</p>
                        <p className="text-[11px] text-white/30">{member.role}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* Technology */}
            <Link
              href="/technology"
              onClick={() => setMobileOpen(false)}
              className="block py-3.5 text-center text-white/70 hover:text-white text-[15px] font-medium border-b border-white/[0.06] transition-colors"
            >
              Technology
            </Link>

            {/* Solar System accordion */}
            <div className="border-b border-white/[0.06]">
              <button
                onClick={() => setMobileSolarOpen(!mobileSolarOpen)}
                className="w-full flex items-center justify-center gap-2 py-3.5 text-white/70 hover:text-white text-[15px] font-medium transition-colors"
              >
                Solar System
                <svg
                  className={`w-3.5 h-3.5 transition-transform duration-300 ${mobileSolarOpen ? "rotate-180" : ""}`}
                  fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                >
                  <path d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div
                className="overflow-hidden transition-all duration-300"
                style={{ maxHeight: mobileSolarOpen ? "600px" : "0", opacity: mobileSolarOpen ? 1 : 0 }}
              >
                <div className="pb-3 grid grid-cols-2 gap-1 px-2">
                  {SOLAR_SYSTEM_BODIES.map((body) => (
                    <Link
                      key={body.slug}
                      href={body.slug === "black-hole" ? "/solar-system/black-hole" : `/solar-system/${body.slug}`}
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg hover:bg-white/[0.06] transition-colors"
                    >
                      <div
                        className={`w-3 h-3 rounded-full shrink-0 ${(body as any).border ? "border border-purple-500/60" : ""}`}
                        style={{ backgroundColor: body.color, boxShadow: `0 0 6px ${body.color}40` }}
                      />
                      <span className="text-sm text-white/70">{body.name}</span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* ISS */}
            <Link
              href="/iss"
              onClick={() => setMobileOpen(false)}
              className="block py-3.5 text-center text-white/70 hover:text-white text-[15px] font-medium border-b border-white/[0.06] transition-colors"
            >
              ISS
            </Link>

            {/* News */}
            <Link
              href="/news"
              onClick={() => setMobileOpen(false)}
              className="block py-3.5 text-center text-white/70 hover:text-white text-[15px] font-medium border-b border-white/[0.06] transition-colors"
            >
              News
            </Link>

            {/* Flight Path */}
            <Link
              href="/"
              onClick={(e) => { setMobileOpen(false); handleHashClick(e, "trajectory") }}
              className="block py-3.5 text-center text-white/70 hover:text-white text-[15px] font-medium border-b border-white/[0.06] transition-colors"
            >
              Flight Path
            </Link>

            {/* Gallery */}
            <Link
              href="/"
              onClick={(e) => { setMobileOpen(false); handleHashClick(e, "gallery") }}
              className="block py-3.5 text-center text-white/70 hover:text-white text-[15px] font-medium transition-colors"
            >
              Gallery
            </Link>
          </nav>

          {/* Footer branding */}
          <div className="px-6 py-4 border-t border-white/[0.06] text-center">
            <p className="text-[10px] text-white/20 uppercase tracking-[0.2em]">What&apos;s That In Space?</p>
          </div>
        </div>
      </div>
    </header>
  )
}
