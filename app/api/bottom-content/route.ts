import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Force dynamic rendering - don't cache this route
export const dynamic = 'force-dynamic'
export const revalidate = 0

/**
 * GET /api/bottom-content
 * Get the current bottom content settings and data
 */
export async function GET() {
  try {
    // Get or create the bottom content settings
    let settings = await prisma.bottomContent.findFirst({
      orderBy: { createdAt: 'desc' }
    })

    if (!settings) {
      // Create default settings if none exist
      settings = await prisma.bottomContent.create({
        data: { displayType: 'NONE' }
      })
    }

    let contentData = null

    // Fetch the appropriate content based on display type
    if (settings.displayType === 'ADVERTISEMENT') {
      contentData = await prisma.advertisement.findMany({
        where: { isActive: true },
        orderBy: { createdAt: 'desc' }
      })
    } else if (settings.displayType === 'SPONSOR_LOGOS') {
      contentData = await prisma.sponsorLogo.findMany({
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
