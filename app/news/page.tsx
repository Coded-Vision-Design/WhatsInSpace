import type { Metadata } from "next"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import { HeroLoader } from "@/components/news/hero-3d/hero-loader"
import { SpaceNewsFeed } from "@/components/news/SpaceNewsFeed"
import { BlogPostsFeed } from "@/components/news/BlogPostsFeed"
import { SpaceStatsStrip } from "@/components/news/SpaceStatsStrip"
import { SpaceFeatureGrid } from "@/components/news/SpaceFeatureGrid"
import { SpaceSourceBadges } from "@/components/news/SpaceSourceBadges"
import { SpaceNewsCta } from "@/components/news/SpaceNewsCta"

export const metadata: Metadata = {
  title: "Space News | What's That In Space?",
  description:
    "The latest space launches, discoveries, and missions from NASA, ESA, SpaceX and more. Live news from across the cosmos.",
}

export default function NewsPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <Header alwaysVisible />
      <main>
        <HeroLoader />
        {/* Tight transition: clouds fade to black, news emerges immediately */}
        <div className="relative -mt-1">
          <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black to-transparent z-10 pointer-events-none" />
          <SpaceNewsFeed />
        </div>
        <BlogPostsFeed />
        <SpaceStatsStrip />
        <SpaceFeatureGrid />
        <SpaceSourceBadges />
        <SpaceNewsCta />
      </main>
      <Footer />
    </div>
  )
}
