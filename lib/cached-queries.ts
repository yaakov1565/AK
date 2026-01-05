/**
 * Cached database query helpers
 * Wraps Prisma queries with caching to reduce database load
 */

import { prisma } from './prisma'
import { cache, CacheKeys, CACHE_TTL, invalidateCache } from './cache'
import type { Prize, SponsorLogo, Winner, Prisma } from '@prisma/client'

// ========== PRIZES ==========

export async function getCachedPrizes(options?: {
  where?: Prisma.PrizeWhereInput
  orderBy?: Prisma.PrizeOrderByWithRelationInput
  select?: Prisma.PrizeSelect
}) {
  const cacheKey = options?.where 
    ? CacheKeys.prizes.active()
    : CacheKeys.prizes.all()

  return cache.getOrSet(
    cacheKey,
    async () => {
      return prisma.prize.findMany({
        where: options?.where,
        orderBy: options?.orderBy,
        select: options?.select,
      })
    },
    CACHE_TTL.PRIZES
  )
}

export async function getCachedPrizeById(id: string) {
  return cache.getOrSet(
    CacheKeys.prizes.byId(id),
    async () => {
      return prisma.prize.findUnique({
        where: { id },
      })
    },
    CACHE_TTL.PRIZES
  )
}

export async function createPrizeWithCache(data: Prisma.PrizeCreateInput) {
  const prize = await prisma.prize.create({ data })
  invalidateCache.prizes()
  return prize
}

export async function updatePrizeWithCache(
  id: string,
  data: Prisma.PrizeUpdateInput
) {
  const prize = await prisma.prize.update({
    where: { id },
    data,
  })
  invalidateCache.prizes()
  return prize
}

export async function deletePrizeWithCache(id: string) {
  const prize = await prisma.prize.delete({
    where: { id },
  })
  invalidateCache.prizes()
  return prize
}

// ========== SPONSORS ==========

export async function getCachedSponsors(options?: {
  where?: Prisma.SponsorLogoWhereInput
  orderBy?: Prisma.SponsorLogoOrderByWithRelationInput
}) {
  const cacheKey = options?.where
    ? CacheKeys.sponsors.active()
    : CacheKeys.sponsors.all()

  return cache.getOrSet(
    cacheKey,
    async () => {
      return prisma.sponsorLogo.findMany({
        where: options?.where,
        orderBy: options?.orderBy,
      })
    },
    CACHE_TTL.SPONSORS
  )
}

export async function getCachedSponsorById(id: string) {
  return cache.getOrSet(
    CacheKeys.sponsors.byId(id),
    async () => {
      return prisma.sponsorLogo.findUnique({
        where: { id },
      })
    },
    CACHE_TTL.SPONSORS
  )
}

export async function createSponsorWithCache(data: Prisma.SponsorLogoCreateInput) {
  const sponsor = await prisma.sponsorLogo.create({ data })
  invalidateCache.sponsors()
  return sponsor
}

export async function updateSponsorWithCache(
  id: string,
  data: Prisma.SponsorLogoUpdateInput
) {
  const sponsor = await prisma.sponsorLogo.update({
    where: { id },
    data,
  })
  invalidateCache.sponsors()
  return sponsor
}

export async function deleteSponsorWithCache(id: string) {
  const sponsor = await prisma.sponsorLogo.delete({
    where: { id },
  })
  invalidateCache.sponsors()
  return sponsor
}

// ========== WINNERS ==========

export async function getCachedRecentWinners(limit: number = 10) {
  return cache.getOrSet(
    CacheKeys.winners.recent(limit),
    async () => {
      return prisma.winner.findMany({
        take: limit,
        orderBy: { wonAt: 'desc' },
        include: {
          prize: true,
        },
      })
    },
    CACHE_TTL.WINNERS
  )
}

export async function getCachedWinnerById(id: string) {
  return cache.getOrSet(
    CacheKeys.winners.byId(id),
    async () => {
      return prisma.winner.findUnique({
        where: { id },
        include: {
          prize: true,
        },
      })
    },
    CACHE_TTL.WINNERS
  )
}

export async function createWinnerWithCache(data: Prisma.WinnerCreateInput) {
  const winner = await prisma.winner.create({ data })
  invalidateCache.winners()
  // Also invalidate prizes since stock changes
  invalidateCache.prizes()
  return winner
}

export async function updateWinnerWithCache(
  id: string,
  data: Prisma.WinnerUpdateInput
) {
  const winner = await prisma.winner.update({
    where: { id },
    data,
  })
  invalidateCache.winners()
  return winner
}

export async function deleteWinnerWithCache(id: string) {
  const winner = await prisma.winner.delete({
    where: { id },
  })
  invalidateCache.winners()
  // Also invalidate prizes since stock might be restored
  invalidateCache.prizes()
  return winner
}

// ========== SETTINGS ==========

export async function getCachedBottomContentSettings() {
  return cache.getOrSet(
    CacheKeys.settings.bottomContent(),
    async () => {
      return prisma.bottomContent.findFirst()
    },
    CACHE_TTL.SETTINGS
  )
}

export async function updateBottomContentSettingsWithCache(
  id: string,
  data: Prisma.BottomContentUpdateInput
) {
  const settings = await prisma.bottomContent.update({
    where: { id },
    data,
  })
  invalidateCache.settings()
  return settings
}

// ========== EMAIL TEMPLATES ==========

export async function getCachedEmailTemplates() {
  return cache.getOrSet(
    CacheKeys.templates.all(),
    async () => {
      return prisma.emailTemplate.findMany()
    },
    CACHE_TTL.TEMPLATES
  )
}

export async function getCachedEmailTemplateByType(type: string) {
  return cache.getOrSet(
    CacheKeys.templates.byType(type),
    async () => {
      return prisma.emailTemplate.findUnique({
        where: { type },
      })
    },
    CACHE_TTL.TEMPLATES
  )
}

export async function updateEmailTemplateWithCache(
  type: string,
  data: Prisma.EmailTemplateUpdateInput
) {
  const template = await prisma.emailTemplate.update({
    where: { type },
    data,
  })
  invalidateCache.templates()
  return template
}

// ========== ADVERTISEMENTS ==========

export async function getCachedAdvertisements(options?: {
  where?: Prisma.AdvertisementWhereInput
  orderBy?: Prisma.AdvertisementOrderByWithRelationInput
}) {
  const cacheKey = 'advertisements:active'

  return cache.getOrSet(
    cacheKey,
    async () => {
      return prisma.advertisement.findMany({
        where: options?.where,
        orderBy: options?.orderBy,
      })
    },
    CACHE_TTL.SETTINGS
  )
}

export async function createAdvertisementWithCache(data: Prisma.AdvertisementCreateInput) {
  const advertisement = await prisma.advertisement.create({ data })
  cache.deletePattern('^advertisements:')
  return advertisement
}

export async function updateAdvertisementWithCache(
  id: string,
  data: Prisma.AdvertisementUpdateInput
) {
  const advertisement = await prisma.advertisement.update({
    where: { id },
    data,
  })
  cache.deletePattern('^advertisements:')
  return advertisement
}

export async function deleteAdvertisementWithCache(id: string) {
  const advertisement = await prisma.advertisement.delete({
    where: { id },
  })
  cache.deletePattern('^advertisements:')
  return advertisement
}

// ========== UTILITY ==========

/**
 * Invalidate all caches after bulk operations
 */
export function invalidateAllCaches() {
  invalidateCache.all()
}

/**
 * Get cache statistics
 */
export function getCacheStats() {
  return {
    size: cache.size(),
    ttl: CACHE_TTL,
  }
}
