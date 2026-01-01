import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { isAdminAuthenticated } from '@/lib/admin-auth'
import { put } from '@vercel/blob'

/**
 * GET /api/admin/advertisements
 * Get all advertisements
 */
export async function GET() {
  const isAuthenticated = await isAdminAuthenticated()
  if (!isAuthenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const advertisements = await prisma.advertisement.findMany({
      orderBy: { createdAt: 'desc' }
    })
    return NextResponse.json(advertisements)
  } catch (error) {
    console.error('Failed to fetch advertisements:', error)
    return NextResponse.json(
      { error: 'Failed to fetch advertisements' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/admin/advertisements
 * Create a new advertisement
 */
export async function POST(request: NextRequest) {
  const isAuthenticated = await isAdminAuthenticated()
  if (!isAuthenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const formData = await request.formData()
    const file = formData.get('image') as File
    const linkUrl = formData.get('linkUrl') as string | null

    if (!file) {
      return NextResponse.json(
        { error: 'Image file is required' },
        { status: 400 }
      )
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only JPG, PNG, and WebP are allowed' },
        { status: 400 }
      )
    }

    // Upload to Vercel Blob
    const timestamp = Date.now()
    const filename = `advertisements/ad-${timestamp}-${file.name}`
    
    const blob = await put(filename, file, {
      access: 'public',
    })

    console.log('Creating advertisement with imageUrl:', blob.url)

    // Create new advertisement (all ads can be active for carousel)
    const advertisement = await prisma.advertisement.create({
      data: {
        imageUrl: blob.url,
        linkUrl: linkUrl || null,
        isActive: true
      }
    })

    console.log('Advertisement created successfully:', advertisement)
    return NextResponse.json(advertisement)
  } catch (error: any) {
    console.error('Failed to create advertisement:', error)
    console.error('Error message:', error.message)
    console.error('Error stack:', error.stack)
    return NextResponse.json(
      { error: `Failed to create advertisement: ${error.message}` },
      { status: 500 }
    )
  }
}
