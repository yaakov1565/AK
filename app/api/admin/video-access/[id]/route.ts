/**
 * API Route: /api/admin/video-access/[id]
 * 
 * Delete a video access record
 */

import { NextRequest, NextResponse } from 'next/server'
import { isAdminAuthenticated } from '@/lib/admin-auth'
import { prisma } from '@/lib/prisma'

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
    const { id } = params

    // Delete the access record (CASCADE will delete associated views)
    await prisma.videoAccess.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting video access:', error)
    return NextResponse.json(
      { error: 'Failed to delete video access record' },
      { status: 500 }
    )
  }
}
