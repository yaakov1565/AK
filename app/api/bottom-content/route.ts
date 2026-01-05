import { NextRequest, NextResponse } from 'next/server'
import { getCachedBottomContentData } from '@/lib/server-cache'

// Cache this route for 10 minutes at the edge
export const revalidate = 600

/**
 * GET /api/bottom-content
 * Get the current bottom content settings and data
 */
export async function GET() {
  try {
    const data = await getCachedBottomContentData()

    const response = NextResponse.json(data)

    // Add no-cache headers to ensure fresh data
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
    response.headers.set('Pragma', 'no-cache')
    response.headers.set('Expires', '0')

    return response
  } catch (error) {
    console.error('Failed to fetch bottom content:', error)
    return NextResponse.json(
      { error: 'Failed to fetch content' },
      { status: 500 }
    )
  }
}
