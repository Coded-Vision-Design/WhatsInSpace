import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Technology",
  description: "Discover the engineering behind NASA's Artemis programme. Learn about the Space Launch System, Orion spacecraft, Gateway station, and lunar surface systems.",
  openGraph: {
    title: "Artemis Technology | What's That In Space?",
    description: "The SLS rocket, Orion capsule, Gateway station, and lunar surface systems powering humanity's return to the Moon.",
  },
}

export default function TechnologyLayout({ children }: { children: React.ReactNode }) {
  return children
}
