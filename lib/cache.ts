/**
 * In-memory cache utility with TTL (Time To Live) support
 * Reduces database operations by caching frequently accessed data
 */

interface CacheEntry<T> {
  data: T
  expiresAt: number
}

class MemoryCache {
  private cache: Map<string, CacheEntry<any>>
  private defaultTTL: number

  constructor(defaultTTL: number = 60000) { // Default 60 seconds
    this.cache = new Map()
    this.defaultTTL = defaultTTL
    
    // Clean up expired entries every minute
    setInterval(() => this.cleanup(), 60000)
  }

  /**
   * Get a value from cache
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key)
    
    if (!entry) {
      return null
    }

    // Check if expired
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key)
      return null
    }

    return entry.data as T
  }

  /**
   * Set a value in cache with optional custom TTL
   */
  set<T>(key: string, data: T, ttl?: number): void {
    const expiresAt = Date.now() + (ttl || this.defaultTTL)
    this.cache.set(key, { data, expiresAt })
  }

  /**
   * Delete a specific key from cache
   */
  delete(key: string): void {
    this.cache.delete(key)
  }

  /**
   * Delete all keys matching a pattern
   */
  deletePattern(pattern: string): void {
    const regex = new RegExp(pattern)
    const keys = Array.from(this.cache.keys())
    for (const key of keys) {
      if (regex.test(key)) {
        this.cache.delete(key)
      }
    }
  }

  /**
   * Clear all cache
   */
  clear(): void {
    this.cache.clear()
  }

  /**
   * Clean up expired entries
   */
  private cleanup(): void {
    const now = Date.now()
    const entries = Array.from(this.cache.entries())
    for (const [key, entry] of entries) {
      if (now > entry.expiresAt) {
        this.cache.delete(key)
      }
    }
  }

  /**
   * Get cache size
   */
  size(): number {
    return this.cache.size
  }

  /**
   * Get or set pattern - fetch from cache or execute function and cache result
   */
  async getOrSet<T>(
    key: string,
    fetchFn: () => Promise<T>,
    ttl?: number
  ): Promise<T> {
    // Try to get from cache first
    const cached = this.get<T>(key)
    if (cached !== null) {
      return cached
    }

    // If not in cache, fetch and store
    const data = await fetchFn()
    this.set(key, data, ttl)
    return data
  }
}

// Create singleton cache instance
const globalForCache = globalThis as unknown as {
  cache: MemoryCache | undefined
}

// Cache TTL configurations (in milliseconds)
export const CACHE_TTL = {
  PRIZES: 30000, // 30 seconds - frequently accessed
  SPONSORS: 60000, // 1 minute - rarely changes
  WINNERS: 10000, // 10 seconds - changes frequently
  SETTINGS: 60000, // 1 minute - rarely changes
  TEMPLATES: 300000, // 5 minutes - rarely changes
} as const

export const cache = globalForCache.cache ?? new MemoryCache()

if (process.env.NODE_ENV !== 'production') {
  globalForCache.cache = cache
}

// Cache key builders
export const CacheKeys = {
  prizes: {
    all: () => 'prizes:all',
    active: () => 'prizes:active',
    byId: (id: string) => `prize:${id}`,
  },
  sponsors: {
    all: () => 'sponsors:all',
    active: () => 'sponsors:active',
    byId: (id: string) => `sponsor:${id}`,
  },
  winners: {
    recent: (limit: number) => `winners:recent:${limit}`,
    byId: (id: string) => `winner:${id}`,
  },
  settings: {
    bottomContent: () => 'settings:bottom-content',
  },
  templates: {
    byType: (type: string) => `template:${type}`,
    all: () => 'templates:all',
  },
} as const

// Cache invalidation helpers
export const invalidateCache = {
  prizes: () => {
    cache.deletePattern('^prizes:')
    cache.deletePattern('^prize:')
  },
  sponsors: () => {
    cache.deletePattern('^sponsors:')
    cache.deletePattern('^sponsor:')
  },
  winners: () => {
    cache.deletePattern('^winners:')
    cache.deletePattern('^winner:')
  },
  settings: () => {
    cache.deletePattern('^settings:')
  },
  templates: () => {
    cache.deletePattern('^template')
  },
  all: () => {
    cache.clear()
  },
} as const
