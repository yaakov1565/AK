/**
 * API Route: /api/spin
 * 
 * Handles the main spin logic
 * - Validates code
 * - Selects prize using weighted random
 * - Updates inventory
 * - Marks code as used
 * - Sends email notification
 */

import { NextRequest, NextResponse } from 'next/server'
import { performSpin } from '@/lib/spin-logic'
import { isRateLimited, recordFailedAttempt, resetAttempts, getClientIdentifier } from '@/lib/rate-limit'
import { sendWinNotification } from '@/lib/email'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    // Get client identifier for rate limiting
    const identifier = getClientIdentifier(request.headers)

    // Check rate limit
    const limited = await isRateLimited(identifier)
    if (limited) {
      return NextResponse.json(
        { success: false, error: 'Too many attempts. Please try again later.' },
        { status: 429 }
      )
    }

    // Parse request body
    const body = await request.json()
    const { code } = body

    if (!code || typeof code !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Invalid request' },
        { status: 400 }
      )
    }

    // Perform the spin
    const result = await performSpin(code.trim().toUpperCase())

    // Handle failure
    if (!result.success) {
      await recordFailedAttempt(identifier)
      return NextResponse.json(result, { status: 400 })
    }

    // Success - reset rate limit attempts
    await resetAttempts(identifier)

    // Send email notification to admin
    try {
      await sendWinNotification({
        code,
        prizeTitle: result.prize!.title,
        timestamp: new Date(),
      })
    } catch (emailError) {
      // Log but don't fail the request if email fails
      console.error('Failed to send email notification:', emailError)
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Spin API error:', error)
    return NextResponse.json(
      { success: false, error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
