import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCachedBottomContentSettings, getCachedSponsors, getCachedAdvertisements } from '@/lib/cached-queries'

// Cache this route for 10 minutes at the edge
export const revalidate = 600

/**
 * GET /api/bottom-content
 * Get the current bottom content settings and data
 */
export async function GET() {
  try {
    // Get or create the bottom content settings
    let settings = await getCachedBottomContentSettings()

    if (!settings) {
      // Create default settings if none exist
      settings = await prisma.bottomContent.create({
        data: { displayType: 'NONE' }
      })
    }

    let contentData = null

    // Fetch the appropriate content based on display type
    if (settings.displayType === 'ADVERTISEMENT') {
      contentData = await getCachedAdvertisements({
        where: { isActive: true },
        orderBy: { createdAt: 'desc' }
      })
    } else if (settings.displayType === 'SPONSOR_LOGOS') {
      contentData = await getCachedSponsors({
        where: { isActive: true },
        orderBy: { order: 'asc' }
      })
    }

    const response = NextResponse.json({
      displayType: settings.displayType,
      content: contentData
    })

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
