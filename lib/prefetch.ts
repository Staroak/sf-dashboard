// Data prefetch service - starts loading data on app open
// so it's ready when user navigates to dashboard/map

interface CacheEntry<T> {
  data: T
  timestamp: number
}

const cache: Record<string, CacheEntry<unknown>> = {}
const CACHE_TTL = 60000 // 1 minute

export function getCached<T>(key: string): T | null {
  const entry = cache[key]
  if (!entry) return null
  if (Date.now() - entry.timestamp > CACHE_TTL) {
    delete cache[key]
    return null
  }
  return entry.data as T
}

export function setCache<T>(key: string, data: T): void {
  cache[key] = { data, timestamp: Date.now() }
}

// Track in-flight requests to avoid duplicates
const inFlight: Record<string, Promise<void> | undefined> = {}

// Prefetch dashboard data
export async function prefetchDashboard(): Promise<void> {
  if (getCached('dashboard')) return

  const existing = inFlight['dashboard']
  if (existing) return existing

  const promise = (async () => {
    try {
      const response = await fetch('/api/dashboard')
      if (response.ok) {
        const data = await response.json()
        setCache('dashboard', data)
      }
    } catch (error) {
      console.error('Prefetch dashboard failed:', error)
    } finally {
      delete inFlight['dashboard']
    }
  })()

  inFlight['dashboard'] = promise
  return promise
}

// Prefetch map data
export async function prefetchMapData(): Promise<void> {
  if (getCached('mapData')) return

  const existing = inFlight['mapData']
  if (existing) return existing

  const apiUrl = process.env.NEXT_PUBLIC_MAP_API_URL || 'https://www.bpportal.ca/api/mobile/map-data'
  const apiKey = process.env.NEXT_PUBLIC_MAP_API_KEY || ''

  if (!apiKey) return

  const promise = (async () => {
    try {
      const response = await fetch(apiUrl, {
        headers: { Authorization: `Bearer ${apiKey}` }
      })
      if (response.ok) {
        const data = await response.json()
        setCache('mapData', data)
      }
    } catch (error) {
      console.error('Prefetch map failed:', error)
    } finally {
      delete inFlight['mapData']
    }
  })()

  inFlight['mapData'] = promise
  return promise
}

// Start all prefetches in parallel
export function startPrefetch(): void {
  prefetchDashboard()
  prefetchMapData()
}
