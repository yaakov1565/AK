import { NextResponse } from 'next/server'
import { checkEmailAccess } from '@/lib/video-access'
import { isRateLimited, recordFailedAttempt, getClientIdentifier } from '@/lib/rate-limit'

/**
 * POST /api/video-access/check
 * Check if an email has access to view a video
 * Protected with rate limiting to prevent abuse
 */
export async function POST(request: Request) {
  try {
    // Get client identifier for rate limiting
    const identifier = getClientIdentifier(request.headers)
    
    // Check rate limit (10 attempts per 15 minutes)
    if (await isRateLimited(identifier)) {
      return NextResponse.json(
        { error: 'Too many attempts. Please try again later.' },
        { status: 429 }
      )
    }

    const { email, videoId = 'highlights-video' } = await request.json()
    
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }
    
    const status = await checkEmailAccess(email, videoId)
    
    // Record failed attempt if email is not authorized
    if (!status.hasAccess) {
      await recordFailedAttempt(identifier)
    }
    
    return NextResponse.json(status)
  } catch (error) {
    console.error('Error checking video access:', error)
    return NextResponse.json(
      { error: 'Failed to check access' },
      { status: 500 }
    )
  }
}
