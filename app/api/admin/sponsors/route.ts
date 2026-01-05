import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { getCachedSponsors, createSponsorWithCache } from '@/lib/cached-queries'
import { isAdminAuthenticated } from '@/lib/admin-auth'

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
    const sponsors = await getCachedSponsors({
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

    // Convert to base64 data URL
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64 = buffer.toString('base64')
    const dataUrl = `data:${file.type};base64,${base64}`

    // Get the max order value to add new sponsor at the end
    const maxOrder = await prisma.sponsorLogo.findFirst({
      orderBy: { order: 'desc' },
      select: { order: true }
    })

    const newOrder = maxOrder ? maxOrder.order + 1 : 0

    // Create new sponsor
    const sponsor = await createSponsorWithCache({
      name,
      logoUrl: dataUrl,
      linkUrl: linkUrl || null,
      order: newOrder,
      isActive: true
    })

    // Revalidate to show new content
    revalidatePath('/api/bottom-content')
    revalidatePath('/')

    return NextResponse.json(sponsor)
  } catch (error) {
    console.error('Failed to create sponsor:', error)
    return NextResponse.json(
      { error: 'Failed to create sponsor' },
      { status: 500 }
    )
  }
}
