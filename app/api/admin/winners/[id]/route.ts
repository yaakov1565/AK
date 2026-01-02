/**
 * API Route: /api/admin/winners/[id]
 * 
 * Update winner prize fulfillment status
 */

import { NextRequest, NextResponse } from 'next/server'
import { isAdminAuthenticated } from '@/lib/admin-auth'
import { prisma } from '@/lib/prisma'

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

    const winner = await prisma.winner.update({
      where: { id: params.id },
      data: {
        prizeSent: prizeSent ?? undefined,
        notes: notes ?? undefined,
      },
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
