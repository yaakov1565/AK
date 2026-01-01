import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { isAdminAuthenticated } from '@/lib/admin-auth'
import { put } from '@vercel/blob'

/**
 * GET /api/admin/sponsors
 * Get all sponsor logos
 */
export async function GET() {
  const isAuthenticated = await isAdminAuthenticated()
  if (!isAuthenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const sponsors = await prisma.sponsorLogo.findMany({
      orderBy: { order: 'asc' }
    })
    return NextResponse.json(sponsors)
  } catch (error) {
    console.error('Failed to fetch sponsors:', error)
    return NextResponse.json(
      { error: 'Failed to fetch sponsors' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/admin/sponsors
 * Create a new sponsor logo
 */
export async function POST(request: NextRequest) {
  const isAuthenticated = await isAdminAuthenticated()
  if (!isAuthenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const formData = await request.formData()
    const file = formData.get('logo') as File
    const nameFromForm = formData.get('name') as string | null
    const linkUrl = formData.get('linkUrl') as string | null

    if (!file) {
      return NextResponse.json(
        { error: 'Logo file is required' },
        { status: 400 }
      )
    }

    // If no name provided, derive it from the filename
    const name = nameFromForm || file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ')

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/svg+xml']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only JPG, PNG, WebP, and SVG are allowed' },
        { status: 400 }
      )
    }

    // Upload to Vercel Blob
    const timestamp = Date.now()
    const filename = `sponsors/sponsor-${timestamp}-${file.name}`
    
    const blob = await put(filename, file, {
      access: 'public',
    })

    // Get the max order value to add new sponsor at the end
    const maxOrder = await prisma.sponsorLogo.findFirst({
      orderBy: { order: 'desc' },
      select: { order: true }
    })

    const newOrder = maxOrder ? maxOrder.order + 1 : 0

    // Create new sponsor
    const sponsor = await prisma.sponsorLogo.create({
      data: {
        name,
        logoUrl: blob.url,
        linkUrl: linkUrl || null,
        order: newOrder,
        isActive: true
      }
    })

    return NextResponse.json(sponsor)
  } catch (error) {
    console.error('Failed to create sponsor:', error)
    return NextResponse.json(
      { error: 'Failed to create sponsor' },
      { status: 500 }
    )
  }
}
