/**
 * API Route: /api/admin/logout
 *
 * Clears admin session
 */

import { NextResponse } from 'next/server'
import { clearAdminSession } from '@/lib/admin-auth'

export async function POST(request: Request) {
  await clearAdminSession()
  
  // Get the base URL from request headers
  const origin = request.headers.get('origin')
  const referer = request.headers.get('referer')
  
  let baseUrl = 'http://localhost:3000'
  
  if (origin) {
    baseUrl = origin
  } else if (referer) {
    // Extract base URL from referer
    try {
      const url = new URL(referer)
      baseUrl = url.origin
    } catch {
      baseUrl = 'http://localhost:3000'
    }
  }
  
  return NextResponse.redirect(new URL('/admin/login', baseUrl))
}
