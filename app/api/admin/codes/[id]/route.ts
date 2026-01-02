/**
 * API Route: /api/admin/codes/[id]
 * 
 * PUT: Updates a code's email/name
 * DELETE: Deletes a code (only if not used)
 */

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { isAdminAuthenticated } from '@/lib/admin-auth'

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const isAuthenticated = await isAdminAuthenticated()
    if (!isAuthenticated) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { name, email } = body

    // Check if code exists
    const code = await prisma.spinCode.findUnique({
      where: { id: params.id }
    })

    if (!code) {
      return NextResponse.json(
        { error: 'Code not found' },
        { status: 404 }
      )
    }

    // Update the code
    const updatedCode = await prisma.spinCode.update({
      where: { id: params.id },
      data: {
        name: name || null,
        email: email || null
      }
    })

    return NextResponse.json(updatedCode)
  } catch (error) {
    console.error('Update code API error:', error)
    return NextResponse.json(
      { error: 'Failed to update code' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const isAuthenticated = await isAdminAuthenticated()
    if (!isAuthenticated) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if code exists
    const code = await prisma.spinCode.findUnique({
      where: { id: params.id }
    })

    if (!code) {
      return NextResponse.json(
        { error: 'Code not found' },
        { status: 404 }
      )
    }

    // Prevent deletion of used codes
    if (code.isUsed) {
      return NextResponse.json(
        { error: 'Cannot delete a code that has been used' },
        { status: 400 }
      )
    }

    // Delete the code
    await prisma.spinCode.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete code API error:', error)
    return NextResponse.json(
      { error: 'Failed to delete code' },
      { status: 500 }
    )
  }
}
