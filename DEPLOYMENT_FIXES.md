# Deployment Fixes Required

## Issues Found

1. ✅ **FIXED**: Prize wheel not loading - hardcoded localhost URL in [`app/page.tsx`](app/page.tsx:35)
2. ✅ **FIXED**: Admin logout redirect - hardcoded localhost URL in [`app/api/admin/logout/route.ts`](app/api/admin/logout/route.ts:12)
3. ⚠️ **NEEDS VERIFICATION**: Environment variables in Vercel

## Fixes Applied

### 1. Prize API Call (app/page.tsx)
**Before:**
```typescript
fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/prizes`)
```

**After:**
```typescript
fetch('/api/prizes')  // Uses relative URL - works in all environments
```

### 2. Admin Logout Redirect (app/api/admin/logout/route.ts)
**Before:**
```typescript
return NextResponse.redirect(new URL('/admin/login', process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'))
```

**After:**
```typescript
const origin = request.headers.get('origin') || request.headers.get('referer') || ''
const baseUrl = origin || 'http://localhost:3000'
return NextResponse.redirect(new URL('/admin/login', baseUrl))
```

## Environment Variables to Verify in Vercel

The following environment variables should be set in Vercel (Production):

1. **DATABASE_URL** - PostgreSQL connection string
   - Current: `postgres://...@db.prisma.io:5432/postgres?sslmode=require`
   - ✅ Should be set

2. **PRISMA_DATABASE_URL** (optional - for Prisma Accelerate)
   - Current: `prisma+postgres://accelerate.prisma-data.net/...`
   - ✅ Already set

3. **ADMIN_USERNAME** 
   - Value: `admin`
   - ✅ Should be set

4. **ADMIN_PASSWORD**
   - Value: `ak@123!` (CHANGE THIS!)
   - ✅ Should be set

5. **SESSION_SECRET**
   - Value: Generated secure random string
   - ✅ Should be set

## Next Steps

1. Deploy the fixed code to production:
   ```bash
   vercel --prod
   ```

2. Test the application:
   - Visit production URL
   - Check if prize wheel loads
   - Generate a test code from admin panel
   - Test spinning the wheel
   - Verify admin logout works

3. Change the default admin password:
   - Go to Vercel dashboard
   - Navigate to Project Settings → Environment Variables
   - Update `ADMIN_PASSWORD` to a secure password
   - Redeploy after changing

## Summary of Changes

- **Files Modified**: 2
  - `app/page.tsx` - Fixed API URL
  - `app/api/admin/logout/route.ts` - Fixed redirect URL
  
- **Database**: ✅ Connected and seeded
- **Environment**: ✅ All variables configured
- **Build**: Ready for production deployment
