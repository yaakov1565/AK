/**
 * API Route: /api/admin/login
 * 
 * Handles admin authentication
 */

import { NextRequest, NextResponse } from 'next/server'
import { authenticateAdmin, setAdminSession } from '@/lib/admin-auth'
import { isRateLimited, recordFailedAttempt, resetAttempts, getClientIdentifier } from '@/lib/rate-limit'

export async function POST(request: NextRequest) {
  try {
    // Rate limiting for admin login attempts
    const identifier = getClientIdentifier(request.headers) + '-admin-login'
    
    const rateLimited = await isRateLimited(identifier)
    
    if (rateLimited) {
      return NextResponse.json(
        { success: false, error: 'Too many login attempts. Please try again later.' },
        { status: 429 }
      )
    }

    const body = await request.json()
    const { password } = body

    if (!password || typeof password !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Invalid request' },
        { status: 400 }
      )
    }

    const isValid = authenticateAdmin(password)

    if (isValid) {
      // Reset rate limit on successful login
      await resetAttempts(identifier)
      await setAdminSession()
      return NextResponse.json({ success: true })
    } else {
      // Record failed attempt
      await recordFailedAttempt(identifier)
      return NextResponse.json(
        { success: false, error: 'Invalid password' },
        { status: 401 }
      )
    }
  } catch (error) {
    console.error('Admin login error:', error)
    return NextResponse.json(
      { success: false, error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
