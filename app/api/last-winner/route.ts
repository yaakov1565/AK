import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/last-winner
 * Fetch recent winners with prize details (limit 10)
 */
export async function GET() {
  try {
    const recentWinners = await prisma.winner.findMany({
      take: 10,
      orderBy: {
        wonAt: 'desc'
      },
      include: {
        prize: {
          select: {
            title: true,
            imageUrl: true
          }
        },
        code: {
          select: {
            name: true
          }
        }
      }
    })

    const response = recentWinners.length === 0
      ? NextResponse.json({ winners: [] })
      : NextResponse.json({
          winners: recentWinners.map((winner: any) => ({
            name: winner.code.name || 'Anonymous',
            prizeName: winner.prize.title,
            prizeImage: winner.prize.imageUrl,
            wonAt: winner.wonAt
          }))
        })

    // Disable caching to ensure fresh data after resets
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')
    response.headers.set('Pragma', 'no-cache')
    response.headers.set('Expires', '0')
    
    return response
  } catch (error) {
    console.error('Failed to fetch recent winners:', error)
    return NextResponse.json({ winners: [] })
  }
}
