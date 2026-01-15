import { NextResponse } from 'next/server'
import { recordView, checkEmailAccess } from '@/lib/video-access'

/**
 * POST /api/video-access/record
 * Record a video view for an email
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
    
    // Record the view
    await recordView(email, videoId)
    
    // Get updated status
    const updatedStatus = await checkEmailAccess(email, videoId)
    
    return NextResponse.json({ 
      success: true, 
      ...updatedStatus 
    })
  } catch (error) {
    console.error('Error recording video view:', error)
    
    // Handle specific error messages
    if (error instanceof Error) {
      if (error.message === 'Email not authorized') {
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
