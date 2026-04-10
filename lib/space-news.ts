/**
 * Space News API types and helpers.
 * Uses the Spaceflight News API (https://api.spaceflightnewsapi.net)
 * and a PHP/MySQL blog backend on Hostinger.
 */

const SNAPI_BASE = "https://api.spaceflightnewsapi.net/v4"
const CACHE_KEY = "space-news-cache"
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

export interface SpaceNewsArticle {
  id: number
  title: string
  url: string
  image_url: string
  news_site: string
  summary: string
  published_at: string
}

export interface BlogPost {
  id: number
  title: string
  slug: string
  excerpt: string
  author: string
  image_url: string | null
  published_at: string
}

interface CachedData<T> {
  data: T
  timestamp: number
}

function getCached<T>(key: string): T | null {
  try {
    const raw = sessionStorage.getItem(key)
    if (!raw) return null
    const cached: CachedData<T> = JSON.parse(raw)
    if (Date.now() - cached.timestamp > CACHE_TTL) {
      sessionStorage.removeItem(key)
      return null
    }
    return cached.data
  } catch {
    return null
  }
}

function setCache<T>(key: string, data: T): void {
  try {
    const entry: CachedData<T> = { data, timestamp: Date.now() }
    sessionStorage.setItem(key, JSON.stringify(entry))
  } catch {
    // sessionStorage full or unavailable
  }
}

/**
 * Fetch articles from the Spaceflight News API with client-side caching.
 */
export async function fetchSpaceNews(limit = 12): Promise<SpaceNewsArticle[]> {
  const cacheKey = `${CACHE_KEY}-articles-${limit}`
  const cached = getCached<SpaceNewsArticle[]>(cacheKey)
  if (cached) return cached

  const res = await fetch(
    `${SNAPI_BASE}/articles/?limit=${limit}&ordering=-published_at`
  )
  if (!res.ok) throw new Error(`Spaceflight News API error: ${res.status}`)

  const json = await res.json()
  const articles: SpaceNewsArticle[] = json.results || []
  setCache(cacheKey, articles)
  return articles
}

/**
 * Fetch blog posts from the PHP/MySQL backend.
 * Falls back gracefully if the API is unreachable.
 */
export async function fetchBlogPosts(
  apiBase: string,
  limit = 10
): Promise<BlogPost[]> {
  const cacheKey = `${CACHE_KEY}-blog-${limit}`
  const cached = getCached<BlogPost[]>(cacheKey)
  if (cached) return cached

  const res = await fetch(`${apiBase}/posts.php?limit=${limit}`)
  if (!res.ok) throw new Error(`Blog API error: ${res.status}`)

  const posts: BlogPost[] = await res.json()
  setCache(cacheKey, posts)
  return posts
}

/**
 * Relative time formatting (e.g. "2h ago", "3d ago").
 */
export function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return "just now"
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  if (days < 30) return `${days}d ago`
  const months = Math.floor(days / 30)
  return `${months}mo ago`
}
