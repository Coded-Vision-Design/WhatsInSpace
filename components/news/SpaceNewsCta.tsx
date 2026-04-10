"use client"

import Link from "next/link"
import { Rocket } from "lucide-react"

export function SpaceNewsCta() {
  return (
    <section className="py-20 px-4">
      <div className="mx-auto max-w-4xl text-center">
        <div className="relative rounded-2xl border border-white/10 bg-white/[0.03] p-8 sm:p-12 overflow-hidden">
          {/* Background glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-[200px] bg-orange-500/10 blur-[100px] rounded-full" />

          <div className="relative">
            <Rocket className="h-12 w-12 text-orange-400 mx-auto mb-6" />
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl text-white">
              Stay ahead of{" "}
              <span className="text-orange-400">the cosmos</span>
            </h2>
            <p className="mt-4 text-lg text-gray-400 max-w-xl mx-auto">
              Bookmark this page for the latest space news, updated
              automatically from trusted sources around the world.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                className="inline-flex items-center gap-2 rounded-lg bg-orange-500 px-8 py-3 text-base font-semibold text-gray-900 hover:bg-orange-400 transition-colors shadow-lg shadow-orange-500/25 min-w-[200px] justify-center"
              >
                Back to Top
              </button>
              <Link
                href="/solar-system"
                className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-8 py-3 text-base font-semibold text-gray-200 hover:bg-white/10 transition-colors min-w-[200px] justify-center"
              >
                Explore Solar System
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
