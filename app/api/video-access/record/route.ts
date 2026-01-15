import { NextResponse } from 'next/server'
import { recordView, checkEmailAccess } from '@/lib/video-access'
import { isRateLimited, recordFailedAttempt, getClientIdentifier, resetAttempts } from '@/lib/rate-limit'

/**
 * POST /api/video-access/record
 * Record a video view for an email
 * Protected with rate limiting to prevent abuse
 *
 * Optimization: recordView() now validates access and view limits internally,
 * so we only need to call checkEmailAccess() once after recording the view.
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

    const { email, videoId = 'highlights-video', recaptchaToken } = await request.json()
    
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
    
    // Verify reCAPTCHA if token provided
    if (recaptchaToken) {
      const recaptchaSecret = process.env.RECAPTCHA_SECRET_KEY
      if (recaptchaSecret) {
        try {
          const recaptchaResponse = await fetch('https://www.google.com/recaptcha/api/siteverify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: `secret=${recaptchaSecret}&response=${recaptchaToken}`
          })
          
          const recaptchaData = await recaptchaResponse.json()
          
          if (!recaptchaData.success || recaptchaData.score < 0.5) {
            await recordFailedAttempt(identifier)
            return NextResponse.json(
              { error: 'reCAPTCHA verification failed. Please try again.' },
              { status: 403 }
            )
          }
        } catch (recaptchaError) {
          console.error('reCAPTCHA verification error:', recaptchaError)
          // Continue even if reCAPTCHA fails to avoid blocking legitimate users
        }
      }
    }
    
    // Record the view (already validates access and limits internally)
    await recordView(email, videoId)
    
    // Reset rate limit attempts on successful view
    await resetAttempts(identifier)
    
    // Get updated status in a single query
    const updatedStatus = await checkEmailAccess(email, videoId)
    
    return NextResponse.json({
      success: true,
      ...updatedStatus
    })
  } catch (error) {
    console.error('Error recording video view:', error)
    
    // Get identifier for error handling
    const identifier = getClientIdentifier(request.headers)
    
    // Handle specific error messages
    if (error instanceof Error) {
      if (error.message === 'Email not authorized') {
        await recordFailedAttempt(identifier)
        return NextResponse.json(
          { error: 'Email not authorized for video access' },
          { status: 403 }
        )
      }
      if (error.message === 'View limit reached') {
        return NextResponse.json(
          { error: 'View limit has been reached' },
          { status: 403 }
        )
      }
    }
    
    return NextResponse.json(
      { error: 'Failed to record view' },
      { status: 500 }
    )
  }
}
