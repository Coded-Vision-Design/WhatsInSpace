"use client"

import { useEffect, useState } from "react"
import { PenLine, Clock, ExternalLink } from "lucide-react"
import { fetchBlogPosts, timeAgo, type BlogPost } from "@/lib/space-news"

const BLOG_API_BASE = process.env.NEXT_PUBLIC_BLOG_API_URL || ""

export function BlogPostsFeed() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [available, setAvailable] = useState(true)

  useEffect(() => {
    if (!BLOG_API_BASE) {
      setAvailable(false)
      setLoading(false)
      return
    }
    fetchBlogPosts(BLOG_API_BASE, 10)
      .then(setPosts)
      .catch(() => setAvailable(false))
      .finally(() => setLoading(false))
  }, [])

  return (
    <section className="py-16 px-4 bg-white/[0.02]">
      <div className="mx-auto max-w-7xl">
        <div className="flex items-center gap-3 mb-8">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-500/10">
            <PenLine className="h-5 w-5 text-orange-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl text-white">
              Our <span className="text-orange-400">Blog</span>
            </h2>
            <p className="text-sm text-gray-400">
              Original articles and commentary from our team
            </p>
          </div>
        </div>

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-16 rounded-xl bg-white/5 animate-pulse" />
            ))}
          </div>
        ) : !available || posts.length === 0 ? (
          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-8 text-center">
            <PenLine className="h-8 w-8 text-gray-600 mx-auto mb-3" />
            <p className="text-sm text-gray-400">
              Blog posts coming soon. Stay tuned for original space content.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {posts.map((post) => (
              <div
                key={post.id}
                className="group flex items-center gap-4 rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.06] p-4 transition-all duration-200 hover:border-orange-500/20"
              >
                <div className="relative shrink-0">
                  <span className="flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-40" />
                    <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-orange-500" />
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium leading-tight truncate text-white group-hover:text-orange-400 transition-colors">
                    {post.title}
                  </p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="text-[10px] px-1.5 py-0 rounded border border-white/10 text-gray-400">
                      {post.author}
                    </span>
                    <span className="text-[11px] text-gray-500 flex items-center gap-1">
                      <Clock className="h-2.5 w-2.5" />
                      {timeAgo(post.published_at)}
                    </span>
                  </div>
                  {post.excerpt && (
                    <p className="mt-1 text-xs text-gray-500 line-clamp-1">{post.excerpt}</p>
                  )}
                </div>
                <ExternalLink className="h-3.5 w-3.5 text-gray-600 group-hover:text-orange-400 transition-colors shrink-0" />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
