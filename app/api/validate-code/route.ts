/**
 * API Route: /api/validate-code
 * 
 * Pre-validates a code without using it
 * Used for the initial code entry form
 */

import { NextRequest, NextResponse } from 'next/server'
import { validateCode } from '@/lib/spin-logic'
import { isRateLimited, recordFailedAttempt, getClientIdentifier } from '@/lib/rate-limit'

export async function POST(request: NextRequest) {
  try {
    // Get client identifier for rate limiting
    const identifier = getClientIdentifier(request.headers)

    // Check rate limit
    const limited = await isRateLimited(identifier)
    if (limited) {
      return NextResponse.json(
        { valid: false, message: 'Too many attempts. Please try again later.' },
        { status: 429 }
      )
    }

    // Parse request body
    const body = await request.json()
    const { code } = body

    if (!code || typeof code !== 'string') {
      return NextResponse.json(
        { valid: false, message: 'Invalid request' },
        { status: 400 }
      )
    }

    // Validate the code
    const result = await validateCode(code.trim().toUpperCase())

    // Record failed attempt if invalid
    if (!result.valid) {
      await recordFailedAttempt(identifier)
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Validate code API error:', error)
    return NextResponse.json(
      { valid: false, message: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
