import { solarSystemData } from "@/lib/planet-data"
import PlanetPageClient from "./client"

export function generateStaticParams() {
  return solarSystemData.map((b) => ({ slug: b.slug }))
}

export default async function PlanetPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const body = solarSystemData.find((b) => b.slug === slug)
  if (!body) return <div className="bg-black min-h-screen text-white flex items-center justify-center">Body not found</div>
  return <PlanetPageClient body={body} />
}
