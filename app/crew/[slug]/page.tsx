import Image from "next/image"
import Link from "next/link"
import { crewData } from "@/lib/crew-data"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faArrowLeft, faRocket, faGraduationCap, faMapPin, faCalendarCheck } from "@fortawesome/free-solid-svg-icons"

export function generateStaticParams() {
  return crewData.map((c) => ({ slug: c.slug }))
}

function XIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  )
}

function InstagramIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
    </svg>
  )
}

export default async function CrewPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const member = crewData.find((c) => c.slug === slug)
  if (!member) return <div className="bg-black min-h-screen text-white flex items-center justify-center">Crew member not found</div>

  const otherCrew = crewData.filter((c) => c.slug !== slug)

  return (
    <div className="bg-black min-h-screen">
      <Header alwaysVisible />

      {/* Hero */}
      <section className="relative pt-24 pb-16 md:pt-32 md:pb-24">
        <div className="max-w-6xl mx-auto px-6">
          <Link href="/#crew" className="inline-flex items-center gap-2 text-white/40 hover:text-white text-sm transition-colors mb-8">
            <FontAwesomeIcon icon={faArrowLeft} className="w-3 h-3" />
            Back to crew
          </Link>

          <div className="grid md:grid-cols-[350px_1fr] lg:grid-cols-[400px_1fr] gap-12 items-start">
            {/* Portrait */}
            <div className="relative aspect-[3/4] rounded-2xl overflow-hidden">
              <Image src={member.image} alt={member.name} fill className="object-cover object-top" priority />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              {/* Agency badge */}
              <div className="absolute top-4 right-4 drop-shadow-lg bg-black/40 backdrop-blur-sm rounded-xl p-2">
                <Image
                  src={member.agency === "NASA" ? "/images/nasa.webp" : "/images/CSA.png"}
                  alt={member.agency}
                  width={56}
                  height={56}
                  className="object-contain"
                />
              </div>
            </div>

            {/* Info */}
            <div>
              <p className="text-orange-500 uppercase tracking-[0.3em] text-sm font-medium mb-2">{member.role}</p>
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">{member.name}</h1>

              {/* Quick facts */}
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                  <FontAwesomeIcon icon={faMapPin} className="w-4 h-4 text-orange-400 mb-2" />
                  <p className="text-white/30 text-[11px] uppercase tracking-wider mb-1">Birthplace</p>
                  <p className="text-white text-sm">{member.birthplace}</p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                  <FontAwesomeIcon icon={faCalendarCheck} className="w-4 h-4 text-orange-400 mb-2" />
                  <p className="text-white/30 text-[11px] uppercase tracking-wider mb-1">Selected</p>
                  <p className="text-white text-sm">{member.selectionYear} by {member.agency}</p>
                </div>
              </div>

              {/* Social links */}
              <div className="flex gap-3 mb-8">
                <a href={`https://x.com/${member.x}`} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 hover:border-white/20 transition-all text-white/50 hover:text-white">
                  <XIcon /><span className="text-sm">@{member.x}</span>
                </a>
                <a href={`https://instagram.com/${member.instagram}`} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 hover:border-white/20 transition-all text-white/50 hover:text-white">
                  <InstagramIcon /><span className="text-sm">@{member.instagram}</span>
                </a>
              </div>

              {/* Highlights */}
              <div className="flex flex-wrap gap-2 mb-8">
                {member.highlights.map((h, i) => (
                  <span key={i} className="px-3 py-1.5 bg-orange-500/10 border border-orange-500/20 rounded-full text-orange-400 text-sm">{h}</span>
                ))}
              </div>

              {/* Fun fact */}
              <div className="bg-orange-500/5 border border-orange-500/15 rounded-xl p-5 mb-8">
                <p className="text-orange-300/70 text-xs font-medium uppercase tracking-wider mb-2">Fun Fact</p>
                <p className="text-white/60 leading-relaxed">{member.funFact}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Full Biography */}
      <section className="relative z-30 bg-black border-t border-white/10">
        <div className="max-w-4xl mx-auto px-6 py-20">
          <h2 className="text-3xl font-bold text-white mb-8">Biography</h2>
          <p className="text-white/60 text-lg leading-relaxed">{member.fullBio}</p>
        </div>
      </section>

      {/* Education */}
      <section className="relative z-30 bg-black border-t border-white/10">
        <div className="max-w-4xl mx-auto px-6 py-20">
          <div className="flex items-center gap-3 mb-8">
            <FontAwesomeIcon icon={faGraduationCap} className="w-5 h-5 text-orange-400" />
            <h2 className="text-3xl font-bold text-white">Education</h2>
          </div>
          <ul className="space-y-4">
            {member.education.map((ed, i) => (
              <li key={i} className="flex items-start gap-3">
                <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 shrink-0" />
                <p className="text-white/60 text-lg">{ed}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Mission History */}
      <section className="relative z-30 bg-black border-t border-white/10">
        <div className="max-w-4xl mx-auto px-6 py-20">
          <div className="flex items-center gap-3 mb-8">
            <FontAwesomeIcon icon={faRocket} className="w-5 h-5 text-orange-400" />
            <h2 className="text-3xl font-bold text-white">Missions</h2>
          </div>
          <div className="space-y-6">
            {member.missions.map((mission, i) => (
              <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-6">
                <div className="flex items-baseline gap-3 mb-3">
                  <h3 className="text-xl font-bold text-white">{mission.name}</h3>
                  <span className="text-orange-400 text-sm font-mono">{mission.year}</span>
                </div>
                <p className="text-white/50 leading-relaxed">{mission.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Other Crew */}
      <section className="relative z-30 bg-black border-t border-white/10">
        <div className="max-w-6xl mx-auto px-6 py-20">
          <h2 className="text-3xl font-bold text-white mb-8">Meet the rest of the crew</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {otherCrew.map((c) => (
              <Link key={c.slug} href={`/crew/${c.slug}`} className="group">
                <div className="relative aspect-[3/4] rounded-xl overflow-hidden mb-3">
                  <Image src={c.image} alt={c.name} fill className="object-cover object-top transition-transform duration-500 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                  <div className="absolute bottom-3 left-3">
                    <h3 className="text-lg font-bold text-white">{c.name}</h3>
                    <p className="text-orange-400 text-sm">{c.role}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
