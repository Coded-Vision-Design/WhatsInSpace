import type { Metadata } from "next"
import { solarSystemData } from "@/lib/planet-data"
import PlanetPageClient from "./client"

export function generateStaticParams() {
  return solarSystemData.map((b) => ({ slug: b.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const body = solarSystemData.find((b) => b.slug === slug)
  if (!body) return { title: "Not Found" }
  return {
    title: body.name,
    description: body.description?.slice(0, 160) || `Explore ${body.name} with interactive 3D models, key statistics, and fun facts.`,
    openGraph: {
      title: `${body.name} | What's That In Space?`,
      description: `Explore ${body.name} with interactive 3D models, key statistics, and fun facts.`,
    },
  }
}

export default async function PlanetPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const body = solarSystemData.find((b) => b.slug === slug)
  if (!body) return <div className="bg-black min-h-screen text-white flex items-center justify-center">Body not found</div>
  return <PlanetPageClient body={body} />
}
