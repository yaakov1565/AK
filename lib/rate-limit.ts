/**
 * Rate limiting to prevent brute force code attempts
 * 
 * Tracks attempts per IP/identifier and blocks after too many failures
 */

import { prisma } from './prisma'

const MAX_ATTEMPTS = 5 // Maximum failed attempts
const WINDOW_MS = 15 * 60 * 1000 // 15 minutes

/**
 * Check if an identifier (IP address) is rate limited
 * @param identifier - Usually the IP address
 * @returns true if rate limited, false if allowed
 */
export async function isRateLimited(identifier: string): Promise<boolean> {
  const now = new Date()
  const windowStart = new Date(now.getTime() - WINDOW_MS)

  const record = await prisma.rateLimit.findUnique({
    where: { identifier },
  })

  if (!record) {
    return false
  }

  // If last attempt was outside the window, reset
  if (record.lastAttempt < windowStart) {
    await prisma.rateLimit.update({
      where: { identifier },
      data: {
        attempts: 0,
        lastAttempt: now,
      },
    })
    return false
  }

  // Check if exceeded max attempts
  return record.attempts >= MAX_ATTEMPTS
}

/**
 * Record a failed attempt
 * @param identifier - Usually the IP address
 */
export async function recordFailedAttempt(identifier: string): Promise<void> {
  const now = new Date()

  await prisma.rateLimit.upsert({
    where: { identifier },
    update: {
      attempts: {
        increment: 1,
      },
      lastAttempt: now,
    },
    create: {
      identifier,
      attempts: 1,
      lastAttempt: now,
    },
  })
}

/**
 * Reset attempts for an identifier (e.g., after successful code)
 * @param identifier - Usually the IP address
 */
export async function resetAttempts(identifier: string): Promise<void> {
  await prisma.rateLimit.updateMany({
    where: { identifier },
    data: {
      attempts: 0,
    },
  })
}

/**
 * Get client identifier from request headers
 * @param headers - Request headers
 * @returns IP address or fallback identifier
 */
export function getClientIdentifier(headers: Headers): string {
  // Try to get real IP from common headers
  const forwardedFor = headers.get('x-forwarded-for')
  const realIp = headers.get('x-real-ip')
  
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim()
  }
  
  if (realIp) {
    return realIp
  }
  
  // Fallback to a generic identifier
  return 'unknown'
}
