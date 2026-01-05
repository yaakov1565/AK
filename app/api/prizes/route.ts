/**
 * API Route: /api/prizes
 *
 * GET: Returns all prizes for the wheel display
 * POST: Creates a new prize (admin only)
 */

import { NextResponse } from 'next/server'
import { getPrizesForWheel } from '@/lib/spin-logic'
import { createPrizeWithCache } from '@/lib/cached-queries'
import { isAdminAuthenticated } from '@/lib/admin-auth'

// Cache this route for 5 minutes
export const revalidate = 300

export async function GET() {
  try {
    const prizes = await getPrizesForWheel()
    return NextResponse.json(prizes)
  } catch (error) {
    console.error('Get prizes API error:', error)
    return NextResponse.json(
      { error: 'Failed to load prizes' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    // Check admin authentication
    const isAuthenticated = await isAdminAuthenticated()
    if (!isAuthenticated) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { title, description, imageUrl, quantityTotal, weight } = body

    // Validate required fields
    if (!title || !description || !quantityTotal || !weight) {
      return NextResponse.json(
        { error: 'Missing required fields: title, description, quantityTotal, and weight are required' },
        { status: 400 }
      )
    }

    // Validate numeric fields
    if (quantityTotal < 1 || weight < 1) {
      return NextResponse.json(
        { error: 'Quantity and weight must be at least 1' },
        { status: 400 }
      )
    }

    // Create the prize
    const prize = await createPrizeWithCache({
      title,
      description,
      imageUrl: imageUrl || null,
      quantityTotal,
      quantityRemaining: quantityTotal, // Initially, all are remaining
      weight,
    })

    return NextResponse.json(prize, { status: 201 })
  } catch (error) {
    console.error('Create prize API error:', error)
    return NextResponse.json(
      { error: 'Failed to create prize' },
      { status: 500 }
    )
  }
}
