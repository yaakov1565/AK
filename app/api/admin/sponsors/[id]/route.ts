import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { isAdminAuthenticated } from '@/lib/admin-auth'
import { unlink } from 'fs/promises'
import path from 'path'

/**
 * PUT /api/admin/sponsors/[id]
 * Update a sponsor logo
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
    const { name, linkUrl, isActive, order } = await request.json()
    const { id } = await params

    const sponsor = await prisma.sponsorLogo.update({
      where: { id },
      data: {
        name: name || undefined,
        linkUrl: linkUrl || null,
        isActive: isActive ?? undefined,
        order: order ?? undefined
      }
    })

    return NextResponse.json(sponsor)
  } catch (error) {
    console.error('Failed to update sponsor:', error)
    return NextResponse.json(
      { error: 'Failed to update sponsor' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/admin/sponsors/[id]
 * Delete a sponsor logo
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

    // Get sponsor to find logo file
    const sponsor = await prisma.sponsorLogo.findUnique({
      where: { id }
    })

    if (!sponsor) {
      return NextResponse.json(
        { error: 'Sponsor not found' },
        { status: 404 }
      )
    }

    // Delete from database
    await prisma.sponsorLogo.delete({
      where: { id }
    })

    // Try to delete logo file (don't fail if it doesn't exist)
    try {
      const logoPath = path.join(process.cwd(), 'public', sponsor.logoUrl)
      await unlink(logoPath)
    } catch (fileError) {
      console.warn('Failed to delete logo file:', fileError)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete sponsor:', error)
    return NextResponse.json(
      { error: 'Failed to delete sponsor' },
      { status: 500 }
    )
  }
}
