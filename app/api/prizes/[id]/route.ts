/**
 * API Route: /api/prizes/[id]
 *
 * GET: Returns a single prize by ID
 * DELETE: Deletes a prize (admin only)
 */

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { isAdminAuthenticated } from '@/lib/admin-auth'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const prize = await prisma.prize.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        title: true,
        imageUrl: true,
        // Do not expose inventory or weight
      },
    })

    if (!prize) {
      return NextResponse.json(
        { error: 'Prize not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(prize)
  } catch (error) {
    console.error('Get prize API error:', error)
    return NextResponse.json(
      { error: 'Failed to load prize' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
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
    const { title, imageUrl, quantityTotal, weight } = body

    // Validate required fields
    if (!title || !quantityTotal || !weight) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if prize exists
    const existingPrize = await prisma.prize.findUnique({
      where: { id: params.id }
    })

    if (!existingPrize) {
      return NextResponse.json(
        { error: 'Prize not found' },
        { status: 404 }
      )
    }

    // Calculate new remaining quantity based on change in total
    const quantityDifference = quantityTotal - existingPrize.quantityTotal
    const newQuantityRemaining = Math.max(0, existingPrize.quantityRemaining + quantityDifference)

    // Update the prize
    const updatedPrize = await prisma.prize.update({
      where: { id: params.id },
      data: {
        title,
        imageUrl: imageUrl || null,
        quantityTotal,
        quantityRemaining: newQuantityRemaining,
        weight,
      }
    })

    return NextResponse.json(updatedPrize)
  } catch (error) {
    console.error('Update prize API error:', error)
    return NextResponse.json(
      { error: 'Failed to update prize' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Check admin authentication
    const isAuthenticated = await isAdminAuthenticated()
    if (!isAuthenticated) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if prize exists
    const prize = await prisma.prize.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: { winners: true }
        }
      }
    })

    if (!prize) {
      return NextResponse.json(
        { error: 'Prize not found' },
        { status: 404 }
      )
    }

    // Check if prize has been won
    if (prize._count.winners > 0) {
      return NextResponse.json(
        { error: 'Cannot delete prize that has already been won' },
        { status: 400 }
      )
    }

    // Delete the prize
    await prisma.prize.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete prize API error:', error)
    return NextResponse.json(
      { error: 'Failed to delete prize' },
      { status: 500 }
    )
  }
}
