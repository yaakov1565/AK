/**
 * Core spin logic for prize wheel
 *
 * CRITICAL REQUIREMENTS:
 * 1. Prize selection MUST be server-side only
 * 2. MUST respect inventory (quantityRemaining > 0)
 * 3. MUST use weighted random selection
 * 4. MUST use database transactions to prevent race conditions
 * 5. NEVER expose odds or inventory to client
 */

import { prisma } from './prisma'
import { Prize } from '@prisma/client'
import { invalidateCache } from './cache'
import { cache, CacheKeys, CACHE_TTL } from './cache'

/**
 * Weighted random selection algorithm
 * Takes an array of prizes with weights and returns one based on probability
 */
function selectWeightedRandom(prizes: Prize[]): Prize {
  // Calculate total weight
  const totalWeight = prizes.reduce((sum, prize) => sum + prize.weight, 0)
  
  // Generate random number between 0 and total weight
  let random = Math.random() * totalWeight
  
  // Walk through prizes, subtracting weights until we hit our random number
  for (const prize of prizes) {
    random -= prize.weight
    if (random <= 0) {
      return prize
    }
  }
  
  // Fallback to last prize (shouldn't happen, but ensures we always return something)
  return prizes[prizes.length - 1]
}

/**
 * Main spin function - validates code and selects a prize
 * 
 * @param code - The one-time use code
 * @returns Object containing success status, prize data, and any error messages
 */
export async function performSpin(code: string) {
  try {
    // Use a transaction to ensure atomicity
    return await prisma.$transaction(async (tx) => {
      // 1. Validate the code
      const spinCode = await tx.spinCode.findUnique({
        where: { code },
      })

      if (!spinCode) {
        return {
          success: false,
          error: 'Invalid code. Please check and try again.',
        }
      }

      if (spinCode.isUsed) {
        return {
          success: false,
          error: 'This code has already been used.',
        }
      }

      // 2. Get all available prizes (quantity > 0)
      const availablePrizes = await tx.prize.findMany({
        where: {
          quantityRemaining: {
            gt: 0,
          },
        },
      })

      if (availablePrizes.length === 0) {
        return {
          success: false,
          error: 'No prizes available at this time. Please contact support.',
        }
      }

      // 3. Select a prize using weighted random selection
      const selectedPrize = selectWeightedRandom(availablePrizes)

      // 4. Update the prize inventory (decrement quantity)
      await tx.prize.update({
        where: { id: selectedPrize.id },
        data: {
          quantityRemaining: {
            decrement: 1,
          },
        },
      })

      // 5. Mark the code as used
      await tx.spinCode.update({
        where: { id: spinCode.id },
        data: {
          isUsed: true,
          usedAt: new Date(),
        },
      })

      // 6. Create a winner record
      const winner = await tx.winner.create({
        data: {
          codeId: spinCode.id,
          prizeId: selectedPrize.id,
        },
      })

      // 7. Invalidate caches since prize inventory and winners changed
      invalidateCache.prizes()
      invalidateCache.winners()

      // 8. Return success with prize info (don't expose internal IDs to client)
      return {
        success: true,
        prize: {
          id: selectedPrize.id,
          title: selectedPrize.title,
          imageUrl: selectedPrize.imageUrl,
        },
        winnerId: winner.id,
      }
    })
  } catch (error) {
    console.error('Spin error:', error)
    return {
      success: false,
      error: 'An unexpected error occurred. Please try again.',
    }
  }
}

/**
 * Get all prizes for display on the wheel
 * Returns ONLY the visual information - NO inventory or odds data
 * Uses caching to reduce database load
 */
export async function getPrizesForWheel() {
  return cache.getOrSet(
    CacheKeys.prizes.all(),
    async () => {
      const prizes = await prisma.prize.findMany({
        select: {
          id: true,
          title: true,
          imageUrl: true,
          // Explicitly do NOT select quantityRemaining or weight
        },
        orderBy: {
          createdAt: 'asc',
        },
      })
      return prizes
    },
    CACHE_TTL.PRIZES
  )
}

/**
 * Validate a code without using it
 * Used for the initial code entry form
 */
export async function validateCode(code: string) {
  const spinCode = await prisma.spinCode.findUnique({
    where: { code },
    select: {
      isUsed: true,
    },
  })

  if (!spinCode) {
    return { valid: false, message: 'Invalid code' }
  }

  if (spinCode.isUsed) {
    return { valid: false, message: 'Code already used' }
  }

  return { valid: true, message: 'Code is valid' }
}
