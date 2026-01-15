import { NextResponse } from 'next/server'
import { checkEmailAccess } from '@/lib/video-access'

/**
 * POST /api/video-access/check
 * Check if an email has access to view a video
 */
export async function POST(request: Request) {
  try {
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
    
    return NextResponse.json(status)
  } catch (error) {
    console.error('Error checking video access:', error)
    return NextResponse.json(
      { error: 'Failed to check access' }, 
      { status: 500 }
    )
  }
}
