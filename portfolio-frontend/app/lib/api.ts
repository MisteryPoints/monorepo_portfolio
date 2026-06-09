const BASE_URL = import.meta.env.VITE_API_URL || ''

const cachePrefix = 'portfolio_cache_'
const cacheTTL = 10 * 60 * 1000

function getCached<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(cachePrefix + key)
    if (!raw) return null
    const { data, timestamp } = JSON.parse(raw)
    if (Date.now() - timestamp > cacheTTL) {
      localStorage.removeItem(cachePrefix + key)
      return null
    }
    return data as T
  } catch {
    return null
  }
}

function setCache(key: string, data: unknown) {
  try {
    localStorage.setItem(cachePrefix + key, JSON.stringify({ data, timestamp: Date.now() }))
  } catch {
    // localStorage full or unavailable
  }
}

export async function fetchWithCache<T>(url: string, cacheKey: string): Promise<T> {
  const cached = getCached<T>(cacheKey)
  if (cached) {
    fetchAndUpdateCache(url, cacheKey)
    return cached
  }
  return fetchAndUpdateCache<T>(url, cacheKey)
}

async function fetchAndUpdateCache<T>(url: string, cacheKey: string): Promise<T> {
  const res = await fetch(`${BASE_URL}${url}`)
  if (!res.ok) throw new Error(`Error fetching ${url}`)
  const data = await res.json()
  setCache(cacheKey, data)
  return data as T
}

export async function fetchProjects() {
  return fetchWithCache<any[]>('/api/get-projects', 'projects')
}

export async function fetchPosts() {
  return fetchWithCache<any[]>('/api/get-posts', 'posts')
}

export async function fetchTranslations(lang: string) {
  return fetchWithCache<Record<string, string>>(`/api/get-translations?lang=${lang}`, `translations_${lang}`)
}
