# Database Caching Implementation

## Overview

This application now includes an **in-memory caching layer** to significantly reduce database operations and improve performance. The caching system is built on top of Prisma queries and provides automatic cache invalidation on write operations.

## Architecture

### Core Components

1. **[`lib/cache.ts`](lib/cache.ts)** - Core cache utility with TTL support
2. **[`lib/cached-queries.ts`](lib/cached-queries.ts)** - Cached database query helpers
3. **API Routes** - Updated to use cached queries instead of direct Prisma calls

## How It Works

### Cache Storage
- Uses an **in-memory Map** for fast access
- Each cache entry includes data and expiration timestamp
- Automatic cleanup of expired entries every 60 seconds
- Singleton pattern ensures one cache instance per application

### Time-To-Live (TTL) Configuration

Different data types have different cache durations based on their update frequency:

```typescript
CACHE_TTL = {
  PRIZES: 30000,      // 30 seconds - frequently accessed
  SPONSORS: 60000,    // 1 minute - rarely changes
  WINNERS: 10000,     // 10 seconds - changes frequently
  SETTINGS: 60000,    // 1 minute - rarely changes
  TEMPLATES: 300000,  // 5 minutes - rarely changes
}
```

### Cache Keys

Structured cache keys prevent collisions and enable pattern-based invalidation:

```typescript
// Examples:
'prizes:all'           // All prizes
'prizes:active'        // Active prizes only
'prize:abc123'         // Specific prize by ID
'sponsors:all'         // All sponsors
'winners:recent:10'    // Recent 10 winners
```

## Cached Operations

### Prizes
- ✅ **GET** [`/api/prizes`](app/api/prizes/route.ts) - Wheel display prizes
- ✅ **GET** [`/api/prizes/[id]`](app/api/prizes/[id]/route.ts) - Single prize
- ✅ **POST** [`/api/prizes`](app/api/prizes/route.ts) - Create with cache invalidation
- ✅ **PUT** [`/api/prizes/[id]`](app/api/prizes/[id]/route.ts) - Update with cache invalidation
- ✅ **DELETE** [`/api/prizes/[id]`](app/api/prizes/[id]/route.ts) - Delete with cache invalidation

### Sponsors
- ✅ **GET** [`/api/admin/sponsors`](app/api/admin/sponsors/route.ts) - All sponsors
- ✅ **POST** [`/api/admin/sponsors`](app/api/admin/sponsors/route.ts) - Create with cache invalidation
- ✅ **PUT** [`/api/admin/sponsors/[id]`](app/api/admin/sponsors/[id]/route.ts) - Update with cache invalidation
- ✅ **DELETE** [`/api/admin/sponsors/[id]`](app/api/admin/sponsors/[id]/route.ts) - Delete with cache invalidation

### Winners
- ✅ **GET** [`/api/last-winner`](app/api/last-winner/route.ts) - Recent winners with caching
- ✅ **PATCH** [`/api/admin/winners/[id]`](app/api/admin/winners/[id]/route.ts) - Update with cache invalidation
- ✅ **DELETE** [`/api/admin/winners/[id]`](app/api/admin/winners/[id]/route.ts) - Delete with cache invalidation

### Spin Logic
- ✅ [`getPrizesForWheel()`](lib/spin-logic.ts:137) - Cached prize fetching
- ✅ [`performSpin()`](lib/spin-logic.ts:112) - Invalidates cache after creating winner

### Bottom Content
- ✅ **GET** [`/api/bottom-content`](app/api/bottom-content/route.ts) - Settings and content

## Cache Invalidation Strategy

### Automatic Invalidation

All write operations automatically invalidate related caches:

```typescript
// Creating a prize
createPrizeWithCache(data)
// → Invalidates: prizes:*, prize:*

// Creating a winner
createWinnerWithCache(data)
// → Invalidates: winners:*, winner:*, prizes:* (inventory changed)

// Updating a sponsor
updateSponsorWithCache(id, data)
// → Invalidates: sponsors:*, sponsor:*
```

### Manual Invalidation

You can manually invalidate caches when needed:

```typescript
import { invalidateCache } from '@/lib/cache'

// Invalidate specific cache groups
invalidateCache.prizes()
invalidateCache.sponsors()
invalidateCache.winners()
invalidateCache.settings()
invalidateCache.templates()

// Invalidate ALL caches
invalidateCache.all()
```

## Usage Examples

### Reading from Cache

```typescript
import { getCachedPrizes, getCachedPrizeById } from '@/lib/cached-queries'

// Get all prizes (cached for 30 seconds)
const prizes = await getCachedPrizes()

// Get specific prize (cached for 30 seconds)
const prize = await getCachedPrizeById('prize-id')
```

### Writing with Cache Invalidation

```typescript
import { createPrizeWithCache, updatePrizeWithCache } from '@/lib/cached-queries'

// Create a new prize (automatically invalidates prize caches)
const newPrize = await createPrizeWithCache({
  title: 'New Prize',
  description: 'Description',
  quantityTotal: 10,
  quantityRemaining: 10,
  weight: 10,
})

// Update existing prize (automatically invalidates prize caches)
const updated = await updatePrizeWithCache('prize-id', {
  quantityTotal: 20,
})
```

## Performance Benefits

### Before Caching
- Every API request = Database query
- High database load during traffic spikes
- Slower response times under load

### After Caching
- **First request**: Database query + cache storage
- **Subsequent requests**: Instant cache retrieval
- **On write**: Cache invalidation + database write
- **Significantly reduced** database operations
- **Faster** response times
- **Lower** database load

### Example Impact

For a page displaying prizes that receives 100 requests per minute:

**Without cache:**
- 100 database queries/minute

**With cache (30s TTL):**
- 2 database queries/minute (one every 30 seconds)
- **98% reduction** in database operations

## Monitoring Cache Performance

Get cache statistics programmatically:

```typescript
import { getCacheStats } from '@/lib/cached-queries'

const stats = getCacheStats()
console.log('Cache size:', stats.size)
console.log('TTL config:', stats.ttl)
```

## Best Practices

### ✅ Do's
- Use cached queries for read operations
- Let write operations handle cache invalidation automatically
- Adjust TTL values based on data change frequency
- Monitor cache hit rates in production

### ❌ Don'ts
- Don't bypass cached queries for reads
- Don't forget to invalidate cache on write operations
- Don't set TTL too high for frequently changing data
- Don't cache user-specific data without proper key isolation

## Files Modified

### New Files
- [`lib/cache.ts`](lib/cache.ts) - Core cache implementation
- [`lib/cached-queries.ts`](lib/cached-queries.ts) - Query helpers
- `CACHING_IMPLEMENTATION.md` - This documentation

### Updated Files
- [`lib/spin-logic.ts`](lib/spin-logic.ts) - Uses cache for prize fetching
- [`app/api/prizes/route.ts`](app/api/prizes/route.ts) - Uses cached operations
- [`app/api/prizes/[id]/route.ts`](app/api/prizes/[id]/route.ts) - Uses cached operations
- [`app/api/admin/sponsors/route.ts`](app/api/admin/sponsors/route.ts) - Uses cached operations
- [`app/api/admin/sponsors/[id]/route.ts`](app/api/admin/sponsors/[id]/route.ts) - Uses cached operations
- [`app/api/last-winner/route.ts`](app/api/last-winner/route.ts) - Uses cached queries
- [`app/api/admin/winners/[id]/route.ts`](app/api/admin/winners/[id]/route.ts) - Uses cached operations
- [`app/api/bottom-content/route.ts`](app/api/bottom-content/route.ts) - Uses cached queries

## Future Enhancements

Potential improvements for the caching system:

1. **Redis Integration** - For multi-instance deployments
2. **Cache Warming** - Pre-populate cache on startup
3. **Metrics Dashboard** - Visual cache performance monitoring
4. **Smart TTL** - Dynamic TTL based on access patterns
5. **Cache Tags** - More granular invalidation control

## Troubleshooting

### Stale Data
If you see stale data, check:
- TTL values might be too high
- Cache invalidation might not be triggered on write

### Memory Usage
If memory usage is high:
- Reduce TTL values
- Implement cache size limits
- Clear expired entries more frequently

### Cache Misses
If cache hit rate is low:
- Increase TTL for stable data
- Check if queries have consistent parameters
- Verify cache key generation

## Summary

The caching layer provides:
- ⚡ **Faster response times**
- 📉 **Reduced database load** (up to 98% reduction)
- 🔄 **Automatic cache invalidation**
- 🎯 **Targeted caching** with appropriate TTLs
- 🛠️ **Easy to use** helper functions

All database operations now benefit from intelligent caching without sacrificing data freshness.
