import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { isAdminAuthenticated } from '@/lib/admin-auth'

/**
 * GET /api/admin/bottom-content/settings
 * Get current bottom content display settings
 */
export async function GET() {
  const isAuthenticated = await isAdminAuthenticated()
  if (!isAuthenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    let settings = await prisma.bottomContent.findFirst({
      orderBy: { createdAt: 'desc' }
    })

    if (!settings) {
      settings = await prisma.bottomContent.create({
        data: { displayType: 'NONE' }
      })
    }

    return NextResponse.json(settings)
  } catch (error) {
    console.error('Failed to fetch settings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/admin/bottom-content/settings
 * Update bottom content display type
 */
export async function PUT(request: NextRequest) {
  const isAuthenticated = await isAdminAuthenticated()
  if (!isAuthenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { displayType } = await request.json()

    if (!['NONE', 'ADVERTISEMENT', 'SPONSOR_LOGOS'].includes(displayType)) {
      return NextResponse.json(
        { error: 'Invalid display type' },
        { status: 400 }
      )
    }

    // Get or create settings record
    let settings = await prisma.bottomContent.findFirst({
      orderBy: { createdAt: 'desc' }
    })

    if (settings) {
      settings = await prisma.bottomContent.update({
        where: { id: settings.id },
        data: { displayType }
      })
    } else {
      settings = await prisma.bottomContent.create({
        data: { displayType }
      })
    }

    // Revalidate the bottom-content route to clear cache
    revalidatePath('/api/bottom-content')
    revalidatePath('/')

    return NextResponse.json(settings)
  } catch (error) {
    console.error('Failed to update settings:', error)
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    )
  }
}
