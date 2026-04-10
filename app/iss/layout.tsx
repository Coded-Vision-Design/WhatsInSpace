import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "International Space Station",
  description: "Track the International Space Station in real-time 3D. View orbital data, crew activities, daily timeline, and live position above Earth.",
  openGraph: {
    title: "International Space Station | What's That In Space?",
    description: "Track the ISS in real-time 3D with live orbital data and crew activities.",
  },
}

export default function ISSLayout({ children }: { children: React.ReactNode }) {
  return children
}
