import { NextResponse } from 'next/server'
import { getCachedRecentWinnersData } from '@/lib/server-cache'

// Cache this route for 2 minutes at the edge
export const revalidate = 120

/**
 * GET /api/last-winner
 * Fetch recent winners with prize details (limit 10)
 */
export async function GET() {
  try {
    const recentWinners = await getCachedRecentWinnersData(10)

    // Filter out any winners with null/deleted prize or code references
    const validWinners = recentWinners.filter((winner: any) => {
      return winner.prize && winner.code && winner.prize.title && winner.code.name
    })

    const response = validWinners.length === 0
      ? NextResponse.json({ winners: [], timestamp: Date.now() })
      : NextResponse.json({
          winners: validWinners.map((winner: any) => ({
            name: winner.code.name || 'Anonymous',
            prizeName: winner.prize.title,
            prizeImage: winner.prize.imageUrl,
            wonAt: winner.wonAt
          })),
          timestamp: Date.now()
        })

    // Aggressive cache prevention
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0')
    response.headers.set('Pragma', 'no-cache')
    response.headers.set('Expires', '0')
    response.headers.set('Surrogate-Control', 'no-store')
    
    return response
  } catch (error) {
    console.error('Failed to fetch recent winners:', error)
    return NextResponse.json({ winners: [], timestamp: Date.now() })
  }
}
