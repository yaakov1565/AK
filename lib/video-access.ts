/**
 * Video Access Management
 * 
 * Tracks email-based video view limits
 */

import { prisma } from './prisma'

const DEFAULT_MAX_VIEWS = 3

/**
 * Check if an email has access to view a video and how many views remain
 * @param email - Email address to check
 * @param videoId - Video identifier (e.g., "highlights-video")
 * @returns Access status with view counts
 */
export async function checkEmailAccess(email: string, videoId: string) {
  const normalizedEmail = email.toLowerCase().trim()
  
  // Check if email is in whitelist
  const access = await prisma.videoAccess.findUnique({
    where: { email: normalizedEmail },
    include: {
      views: {
        where: { videoId },
        orderBy: { viewedAt: 'desc' }
      }
    }
  })
  
  if (!access) {
    return { 
      hasAccess: false, 
      canView: false,
      viewCount: 0, 
      remaining: 0,
      maxViews: 0,
      message: 'Email not authorized for video access'
    }
  }
  
  const viewCount = access.views.length
  const remaining = access.maxViews - viewCount
  
  return {
    hasAccess: true,
    canView: remaining > 0,
    viewCount,
    remaining: Math.max(0, remaining),
    maxViews: access.maxViews
  }
}

/**
 * Record a video view for an email
 * @param email - Email address of viewer
 * @param videoId - Video identifier
 * @throws Error if email not authorized or view limit reached
 */
export async function recordView(email: string, videoId: string) {
  const normalizedEmail = email.toLowerCase().trim()
  
  const access = await prisma.videoAccess.findUnique({
    where: { email: normalizedEmail }
  })
  
  if (!access) {
    throw new Error('Email not authorized')
  }
  
  const status = await checkEmailAccess(normalizedEmail, videoId)
  
  if (!status.canView) {
    throw new Error('View limit reached')
  }
  
  await prisma.videoView.create({
    data: {
      email: normalizedEmail,
      videoId,
      accessId: access.id
    }
  })
}

/**
 * Add emails to the whitelist
 * @param emails - Array of email addresses to add
 * @param maxViews - Optional custom max views per email (default 3)
 */
export async function addEmailsToWhitelist(emails: string[], maxViews: number = DEFAULT_MAX_VIEWS) {
  const normalized = emails.map(e => e.toLowerCase().trim())
  
  await prisma.videoAccess.createMany({
    data: normalized.map(email => ({ email, maxViews })),
    skipDuplicates: true
  })
  
  return { added: normalized.length }
}

/**
 * Remove email from whitelist
 * @param email - Email address to remove
 */
export async function removeEmailFromWhitelist(email: string) {
  const normalizedEmail = email.toLowerCase().trim()
  
  await prisma.videoAccess.delete({
    where: { email: normalizedEmail }
  })
}

/**
 * Reset view count for an email
 * @param email - Email address
 * @param videoId - Video identifier
 */
export async function resetViews(email: string, videoId: string) {
  const normalizedEmail = email.toLowerCase().trim()
  
  const access = await prisma.videoAccess.findUnique({
    where: { email: normalizedEmail }
  })
  
  if (!access) {
    throw new Error('Email not found in whitelist')
  }
  
  await prisma.videoView.deleteMany({
    where: {
      accessId: access.id,
      videoId
    }
  })
}

/**
 * Get all emails with their view statistics
 * @param videoId - Optional video ID to filter by
 */
export async function getAllEmailStats(videoId?: string) {
  const accessRecords = await prisma.videoAccess.findMany({
    include: {
      views: videoId ? {
        where: { videoId }
      } : true
    },
    orderBy: {
      createdAt: 'desc'
    }
  })
  
  return accessRecords.map(access => ({
    email: access.email,
    maxViews: access.maxViews,
    viewCount: access.views.length,
    remaining: access.maxViews - access.views.length,
    lastView: access.views[0]?.viewedAt || null,
    createdAt: access.createdAt
  }))
}
