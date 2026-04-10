"use client"

import { useEffect, useState } from "react"
import { Newspaper, ExternalLink, Clock } from "lucide-react"
import { fetchSpaceNews, timeAgo, type SpaceNewsArticle } from "@/lib/space-news"

export function SpaceNewsFeed() {
  const [articles, setArticles] = useState<SpaceNewsArticle[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSpaceNews(12)
      .then(setArticles)
      .catch(() => setArticles([]))
      .finally(() => setLoading(false))
  }, [])

  return (
    <section id="news-feed" className="pt-36 pb-16 px-4 bg-black">
      <div className="mx-auto max-w-7xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl text-white">
              Latest <span className="text-orange-400">Space News</span>
            </h2>
            <p className="mt-2 text-sm text-gray-400">
              Live articles from NASA, SpaceNews, ESA and more
            </p>
          </div>
          <a
            href="https://api.spaceflightnewsapi.net"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-gray-300 hover:bg-white/10 transition-colors"
          >
            <Newspaper className="h-3.5 w-3.5" />
            Powered by SNAPI
          </a>
        </div>

        {loading ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-48 rounded-xl bg-white/5 animate-pulse" />
            ))}
          </div>
        ) : articles.length === 0 ? (
          <div className="text-center py-12 text-gray-500 text-sm">
            Unable to load articles. Please try again later.
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {articles.map((article) => (
              <a
                key={article.id}
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.06] overflow-hidden transition-all duration-200 hover:border-orange-500/20"
              >
                {article.image_url && (
                  <div className="relative h-36 overflow-hidden">
                    <img
                      src={article.image_url}
                      alt=""
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                    <span className="absolute bottom-2 left-3 text-[10px] text-orange-400 font-medium uppercase tracking-wider bg-black/60 backdrop-blur-sm px-2 py-0.5 rounded">
                      {article.news_site}
                    </span>
                  </div>
                )}
                <div className="p-4">
                  <h3 className="text-sm font-medium text-white leading-tight line-clamp-2 group-hover:text-orange-400 transition-colors">
                    {article.title}
                  </h3>
                  <p className="mt-2 text-xs text-gray-500 line-clamp-2">
                    {article.summary}
                  </p>
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-1.5 text-[11px] text-gray-500">
                      <Clock className="h-3 w-3" />
                      <span>{timeAgo(article.published_at)}</span>
                    </div>
                    <ExternalLink className="h-3.5 w-3.5 text-gray-600 group-hover:text-orange-400 transition-colors" />
                  </div>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
