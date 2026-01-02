import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { isAdminAuthenticated } from '@/lib/admin-auth'
import { unlink } from 'fs/promises'
import path from 'path'

/**
 * PUT /api/admin/advertisements/[id]
 * Update an advertisement
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const isAuthenticated = await isAdminAuthenticated()
  if (!isAuthenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { linkUrl, isActive } = await request.json()
    const { id } = await params

    const advertisement = await prisma.advertisement.update({
      where: { id },
      data: {
        linkUrl: linkUrl || null,
        isActive: isActive ?? undefined
      }
    })

    return NextResponse.json(advertisement)
  } catch (error) {
    console.error('Failed to update advertisement:', error)
    return NextResponse.json(
      { error: 'Failed to update advertisement' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/admin/advertisements/[id]
 * Delete an advertisement
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const isAuthenticated = await isAdminAuthenticated()
  if (!isAuthenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { id } = await params

    // Get advertisement to find image file
    const advertisement = await prisma.advertisement.findUnique({
      where: { id }
    })

    if (!advertisement) {
      return NextResponse.json(
        { error: 'Advertisement not found' },
        { status: 404 }
      )
    }

    // Delete from database
    await prisma.advertisement.delete({
      where: { id }
    })

    // Try to delete image file (don't fail if it doesn't exist)
    try {
      const imagePath = path.join(process.cwd(), 'public', advertisement.imageUrl)
      await unlink(imagePath)
    } catch (fileError) {
      console.warn('Failed to delete image file:', fileError)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete advertisement:', error)
    return NextResponse.json(
      { error: 'Failed to delete advertisement' },
      { status: 500 }
    )
  }
}
