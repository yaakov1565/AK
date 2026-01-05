/**
 * Server-side caching using Next.js unstable_cache
 * This works properly in Vercel's serverless environment
 */

import { unstable_cache } from 'next/cache'
import { prisma } from './prisma'

// Cache prizes for 5 minutes
export const getCachedPrizesForWheel = unstable_cache(
  async () => {
    return prisma.prize.findMany({
      select: {
        id: true,
        title: true,
        imageUrl: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    })
  },
  ['prizes-for-wheel'],
  {
    revalidate: 300, // 5 minutes
    tags: ['prizes'],
  }
)

// Cache recent winners for 2 minutes
export const getCachedRecentWinnersData = unstable_cache(
  async (limit: number = 10) => {
    return prisma.winner.findMany({
      take: limit,
      orderBy: { wonAt: 'desc' },
      include: {
        prize: {
          select: {
            title: true,
            imageUrl: true,
          },
        },
        code: {
          select: {
            name: true,
          },
        },
      },
    })
  },
  ['recent-winners'],
  {
    revalidate: 120, // 2 minutes
    tags: ['winners'],
  }
)

// Cache bottom content settings for 10 minutes
export const getCachedBottomContentData = unstable_cache(
  async () => {
    const settings = await prisma.bottomContent.findFirst({
      orderBy: { createdAt: 'desc' },
    })

    if (!settings) {
      return { displayType: 'NONE', content: null }
    }

    let contentData = null

    if (settings.displayType === 'ADVERTISEMENT') {
      contentData = await prisma.advertisement.findMany({
        where: { isActive: true },
        orderBy: { createdAt: 'desc' },
      })
    } else if (settings.displayType === 'SPONSOR_LOGOS') {
      contentData = await prisma.sponsorLogo.findMany({
        where: { isActive: true },
        orderBy: { order: 'asc' },
      })
    }

    return {
      displayType: settings.displayType,
      content: contentData,
    }
  },
  ['bottom-content'],
  {
    revalidate: 600, // 10 minutes
    tags: ['bottom-content', 'sponsors', 'advertisements'],
  }
)
