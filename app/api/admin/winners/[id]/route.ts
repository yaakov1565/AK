/**
 * API Route: /api/admin/winners/[id]
 *
 * Update or delete winner records
 */

import { NextRequest, NextResponse } from 'next/server'
import { isAdminAuthenticated } from '@/lib/admin-auth'
import { prisma } from '@/lib/prisma'
import { updateWinnerWithCache, getCachedWinnerById } from '@/lib/cached-queries'
import { invalidateCache } from '@/lib/cache'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const isAuthenticated = await isAdminAuthenticated()
  
  if (!isAuthenticated) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  try {
    const { prizeSent, notes } = await request.json()

    const winner = await updateWinnerWithCache(params.id, {
      prizeSent: prizeSent ?? undefined,
      notes: notes ?? undefined,
    })

    return NextResponse.json({ success: true, winner })
  } catch (error) {
    console.error('Update winner error:', error)
    return NextResponse.json(
      { error: 'Failed to update winner' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const isAuthenticated = await isAdminAuthenticated()
  
  if (!isAuthenticated) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  try {
    // Get winner info before deleting to restore prize quantity
    const winner = await getCachedWinnerById(params.id)

    if (!winner) {
      return NextResponse.json(
        { error: 'Winner not found' },
        { status: 404 }
      )
    }

    // Delete winner and restore prize quantity in a transaction
    await prisma.$transaction([
      // Restore prize quantity
      prisma.prize.update({
        where: { id: winner.prizeId },
        data: {
          quantityRemaining: {
            increment: 1,
          },
        },
      }),
      // Mark code as unused
      prisma.spinCode.update({
        where: { id: winner.codeId },
        data: {
          isUsed: false,
          usedAt: null,
        },
      }),
      // Delete the winner record
      prisma.winner.delete({
        where: { id: params.id },
      }),
    ])

    // Invalidate caches since we modified prizes and winners
    invalidateCache.prizes()
    invalidateCache.winners()

    return NextResponse.json({
      success: true,
      message: 'Winner deleted and prize quantity restored'
    })
  } catch (error) {
    console.error('Delete winner error:', error)
    return NextResponse.json(
      { error: 'Failed to delete winner' },
      { status: 500 }
    )
  }
}
