import type { MetadataRoute } from "next"
import { solarSystemData } from "@/lib/planet-data"
import { crewData } from "@/lib/crew-data"

export const dynamic = "force-static"

const SITE_URL = "https://whatsthatin.space"

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()

  const staticPages: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: now, changeFrequency: "weekly", priority: 1.0 },
    { url: `${SITE_URL}/news`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/iss`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE_URL}/technology`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/solar-system`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE_URL}/solar-system/black-hole`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
  ]

  const planetPages: MetadataRoute.Sitemap = solarSystemData.map((body) => ({
    url: `${SITE_URL}/solar-system/${body.slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }))

  const crewPages: MetadataRoute.Sitemap = crewData.map((member) => ({
    url: `${SITE_URL}/crew/${member.slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }))

  return [...staticPages, ...planetPages, ...crewPages]
}
