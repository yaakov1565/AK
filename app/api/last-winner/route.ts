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

    if (recentWinners.length === 0) {
      return NextResponse.json({ winners: [] })
    }

    return NextResponse.json({
      winners: recentWinners.map((winner: any) => ({
        name: winner.code.name || 'Anonymous',
        prizeName: winner.prize.title,
        prizeImage: winner.prize.imageUrl,
        wonAt: winner.wonAt
      }))
    })
  } catch (error) {
    console.error('Failed to fetch recent winners:', error)
    return NextResponse.json({ winners: [] })
  }
}
