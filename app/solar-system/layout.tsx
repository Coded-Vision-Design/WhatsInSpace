import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Solar System",
  description: "Explore every planet in our Solar System with interactive 3D models, key statistics, atmospheric data, and fun facts. From the Sun to Pluto and beyond.",
  openGraph: {
    title: "The Solar System | What's That In Space?",
    description: "Interactive 3D exploration of every planet, from the Sun to Pluto and beyond.",
  },
}

export default function SolarSystemLayout({ children }: { children: React.ReactNode }) {
  return children
}
