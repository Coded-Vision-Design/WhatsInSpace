import Link from "next/link"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faCode } from "@fortawesome/free-solid-svg-icons"

export default function Footer() {
  return (
    <footer className="relative z-30 bg-black border-t border-white/10">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-12">
          <Link href="/" className="text-2xl font-bold text-white tracking-wider">ARTEMIS</Link>
          <div className="flex gap-8">
            <Link href="/" className="text-white/40 hover:text-white/70 transition-colors text-sm">Mission</Link>
            <Link href="/" className="text-white/40 hover:text-white/70 transition-colors text-sm">Crew</Link>
            <Link href="/technology" className="text-white/40 hover:text-white/70 transition-colors text-sm">Technology</Link>
            <Link href="/news" className="text-white/40 hover:text-white/70 transition-colors text-sm">News</Link>
            <Link href="/" className="text-white/40 hover:text-white/70 transition-colors text-sm">Gallery</Link>
          </div>
          <p className="text-white/20 text-sm">2026 Artemis Program</p>
        </div>
        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-center md:justify-end items-center gap-4 md:gap-8">
          <p className="text-white/20 text-[9px] uppercase tracking-[0.3em] font-bold">
            &copy; 2026 ARTEMIS. ALL RIGHTS RESERVED.
          </p>
          <a
            href="https://codedvisiondesign.co.uk"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white/20 hover:text-white text-[9px] uppercase tracking-[0.3em] font-bold transition-all duration-300 flex items-center gap-2"
          >
            <FontAwesomeIcon icon={faCode} className="w-3 h-3" />
            BY CODED VISION DESIGN
          </a>
        </div>
      </div>
    </footer>
  )
}
