# Highlights Page Optimizations

## Overview
This document describes the performance optimizations, security enhancements, and bot protection measures implemented for the `/highlights` video access page.

## Database Query Optimizations

### 1. Optimized `checkEmailAccess()` Function
**Location**: [`lib/video-access.ts`](lib/video-access.ts:17)

**Before**:
```typescript
// Loaded ALL VideoView records
include: {
  views: {
    where: { videoId },
    orderBy: { viewedAt: 'desc' }
  }
}
const viewCount = access.views.length
```

**After**:
```typescript
// Uses Prisma _count aggregation
include: {
  _count: {
    select: {
      views: { where: { videoId } }
    }
  }
}
const viewCount = access._count.views
```

**Benefits**:
- Reduces data transfer from database
- Minimizes memory usage, especially for emails with many views
- Faster query execution with aggregation

### 2. Optimized `recordView()` Function
**Location**: [`lib/video-access.ts`](lib/video-access.ts:63)

**Before**:
- Made 2 separate database queries:
  1. Fetch VideoAccess record
  2. Call `checkEmailAccess()` (another query with views)
- Total: 3 queries to record a view

**After**:
- Single query with `_count` to fetch access data and view count
- Validation happens in the same query
- Total: 1 query for validation + 1 query to insert = 2 queries

**Benefits**:
- 33% reduction in database queries
- Eliminates redundant round-trips
- Improved response time

### 3. Optimized `/api/video-access/record` Route
**Location**: [`app/api/video-access/record/route.ts`](app/api/video-access/record/route.ts:8)

**Before**:
- Called `checkEmailAccess()` before validation
- Called `recordView()` which internally called `checkEmailAccess()` again
- Called `checkEmailAccess()` after recording
- Total: 3 calls to `checkEmailAccess()`

**After**:
- Validation happens within `recordView()`
- Only calls `checkEmailAccess()` once after recording
- Total: 1 call to `checkEmailAccess()`

## Performance Impact Summary

### Per User Session Metrics

**Initial Check (Accessing Video)**:
- Before: 1 query loading all views
- After: 1 query using _count
- Improvement: Faster with less data transfer

**Recording a View**:
- Before: 3-4 database queries
- After: 2 database queries
- Improvement: 33-50% reduction in queries

**Data Transfer**:
- Before: Loads all VideoView records (growing over time)
- After: Only fetches counts (constant size)
- Improvement: Significant reduction, especially for popular emails

## Security Enhancements

### 1. Rate Limiting
**Locations**: 
- [`app/api/video-access/check/route.ts`](app/api/video-access/check/route.ts:1)
- [`app/api/video-access/record/route.ts`](app/api/video-access/record/route.ts:1)

**Implementation**:
- Uses existing rate limit infrastructure from [`lib/rate-limit.ts`](lib/rate-limit.ts:1)
- Tracks attempts per IP address
- Limits: 10 attempts per 15-minute window
- Returns 429 (Too Many Requests) when limit exceeded

**Features**:
- Tracks failed authorization attempts
- Resets counter on successful view
- Uses IP-based identification (supports X-Forwarded-For headers)
- Automatic cleanup of expired rate limit records

**Protection Against**:
- Brute force email enumeration
- Automated scraping attempts
- DDoS attacks on video endpoints

### 2. reCAPTCHA v3 Integration
**Locations**:
- Frontend: [`app/highlights/page.tsx`](app/highlights/page.tsx:1)
- Backend: [`app/api/video-access/record/route.ts`](app/api/video-access/record/route.ts:1)

**Implementation**:
- Uses Google reCAPTCHA v3 (invisible, no user interaction)
- Executes on "watch video" action
- Score threshold: 0.5 (adjustable)
- Graceful degradation if reCAPTCHA fails

**Features**:
- Invisible to legitimate users (no checkboxes)
- Risk analysis scoring (0.0 = bot, 1.0 = human)
- Action-specific tokens ('watch_video')
- Optional - works without keys configured

**Protection Against**:
- Automated bots
- Scripted video access
- View limit circumvention attempts

## Configuration

### Environment Variables

Add to your `.env` file:

```bash
# reCAPTCHA v3 (Optional - for bot protection)
NEXT_PUBLIC_RECAPTCHA_SITE_KEY="your-recaptcha-site-key"
RECAPTCHA_SECRET_KEY="your-recaptcha-secret-key"
```

### Getting reCAPTCHA Keys

1. Visit [Google reCAPTCHA Admin](https://www.google.com/recaptcha/admin)
2. Register a new site
3. Choose **reCAPTCHA v3**
4. Add your domain(s)
5. Copy Site Key → `NEXT_PUBLIC_RECAPTCHA_SITE_KEY`
6. Copy Secret Key → `RECAPTCHA_SECRET_KEY`

### Rate Limit Configuration

Adjust limits in [`lib/rate-limit.ts`](lib/rate-limit.ts:9):

```typescript
const MAX_ATTEMPTS = 5 // Maximum failed attempts
const WINDOW_MS = 15 * 60 * 1000 // 15 minutes
```

## Why No Caching?

Caching was deliberately **NOT** implemented for video access because:

1. **Real-time Accuracy Required**: View counts must be accurate to enforce limits
2. **Security Concern**: Stale cache could allow users to exceed view limits
3. **Low Query Frequency**: Each email only checks 3 times maximum
4. **Optimizations Sufficient**: Database optimizations make queries fast enough
5. **Data Integrity**: View enforcement requires fresh data

## Testing Recommendations

### Database Performance
```bash
# Test query performance
npm run dev
# Monitor Prisma query logs in console
```

### Rate Limiting
```bash
# Try multiple failed access attempts from same IP
# Should block after MAX_ATTEMPTS (default 10)
curl -X POST http://localhost:3000/api/video-access/check \
  -H "Content-Type: application/json" \
  -d '{"email":"unauthorized@example.com"}'
```

### reCAPTCHA
1. Enable browser DevTools Network tab
2. Watch for `watch_video` action
3. Verify token in POST request body
4. Check server logs for verification results

## Monitoring

### Key Metrics to Track

1. **Query Performance**:
   - Average response time for `/api/video-access/check`
   - Average response time for `/api/video-access/record`

2. **Rate Limiting**:
   - Number of 429 responses
   - Top rate-limited IPs

3. **reCAPTCHA**:
   - Score distribution
   - Failed verification rate

### Database Indexes

Ensure these indexes exist (already in schema):
```prisma
model VideoAccess {
  @@index([email])
}

model VideoView {
  @@index([email, videoId])
  @@index([accessId])
}

model RateLimit {
  @@index([identifier, lastAttempt])
}
```

## Migration Notes

### Breaking Changes
None - all changes are backward compatible.

### Deployment Checklist

- [ ] Update environment variables with reCAPTCHA keys (optional)
- [ ] Run `npx prisma generate` to regenerate Prisma client
- [ ] Test rate limiting in staging environment
- [ ] Verify reCAPTCHA integration
- [ ] Monitor query performance after deployment

## Support

For issues or questions:
1. Check Prisma query logs for slow queries
2. Review rate limit records in database
3. Verify reCAPTCHA configuration in Google Console
4. Check browser console for frontend errors

## Future Enhancements

Potential improvements:
- [ ] Add Redis caching for rate limit tracking (for multi-instance deployments)
- [ ] Implement email verification before granting access
- [ ] Add admin dashboard for rate limit monitoring
- [ ] Implement IP whitelist for trusted networks
- [ ] Add analytics for video view patterns
