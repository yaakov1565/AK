import { NextRequest, NextResponse } from 'next/server'
import { isAdminAuthenticated } from '@/lib/admin-auth'
import { prisma } from '@/lib/prisma'

/**
 * Admin Reset API - DANGEROUS: Deletes all data after exporting to CSV
 * Requires admin session + additional password confirmation
 */

const RESET_PASSWORD = process.env.ADMIN_RESET_PASSWORD || 'RESET_AK_2025'

export async function POST(request: NextRequest) {
  try {
    // Check admin session
    const isAuthenticated = await isAdminAuthenticated()
    
    if (!isAuthenticated) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      )
    }

    // Verify reset password
    const body = await request.json()
    const { resetPassword } = body

    if (resetPassword !== RESET_PASSWORD) {
      return NextResponse.json(
        { error: 'Invalid reset password' },
        { status: 403 }
      )
    }

    // Fetch all data for export
    const [prizes, winners, codes] = await Promise.all([
      prisma.prize.findMany({
        orderBy: { createdAt: 'desc' },
      }),
      prisma.winner.findMany({
        include: {
          prize: true,
          code: true,
        },
        orderBy: { wonAt: 'desc' },
      }),
      prisma.spinCode.findMany({
        include: {
          winner: {
            include: {
              prize: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
    ])

    // Create CSV data
    const csvData = {
      prizes: generatePrizesCSV(prizes),
      winners: generateWinnersCSV(winners),
      codes: generateCodesCSV(codes),
    }

    // Delete all data in correct order (respecting foreign key constraints)
    await prisma.$transaction([
      prisma.winner.deleteMany({}),
      prisma.spinCode.deleteMany({}),
      prisma.prize.deleteMany({}),
      prisma.rateLimit.deleteMany({}), // Also clear rate limits
    ])

    // Return CSV data for download
    return NextResponse.json({
      success: true,
      message: 'All data has been reset successfully',
      csvData,
      stats: {
        prizesDeleted: prizes.length,
        winnersDeleted: winners.length,
        codesDeleted: codes.length,
      },
    })
  } catch (error) {
    console.error('Reset error:', error)
    return NextResponse.json(
      { error: 'Failed to reset data' },
      { status: 500 }
    )
  }
}

function generatePrizesCSV(prizes: any[]): string {
  const headers = 'ID,Title,Image URL,Quantity Total,Quantity Remaining,Weight,Created At\n'
  const rows = prizes
    .map((p) =>
      [
        p.id,
        `"${p.title}"`,
        p.imageUrl || '',
        p.quantityTotal,
        p.quantityRemaining,
        p.weight,
        p.createdAt.toISOString(),
      ].join(',')
    )
    .join('\n')
  return headers + rows
}

function generateWinnersCSV(winners: any[]): string {
  const headers = 'ID,Code,Name,Email,Prize,Won At,Prize Sent,Notes\n'
  const rows = winners
    .map((w) =>
      [
        w.id,
        w.code.code,
        `"${w.code.name || ''}"`,
        w.code.email || '',
        `"${w.prize.title}"`,
        w.wonAt.toISOString(),
        w.prizeSent,
        `"${w.notes || ''}"`,
      ].join(',')
    )
    .join('\n')
  return headers + rows
}

function generateCodesCSV(codes: any[]): string {
  const headers = 'ID,Code,Name,Email,Is Used,Used At,Created At,Winner,Prize\n'
  const rows = codes
    .map((c) =>
      [
        c.id,
        c.code,
        `"${c.name || ''}"`,
        c.email || '',
        c.isUsed,
        c.usedAt?.toISOString() || '',
        c.createdAt.toISOString(),
        c.winner ? `"${c.winner.code?.name || 'N/A'}"` : '',
        c.winner?.prize?.title ? `"${c.winner.prize.title}"` : '',
      ].join(',')
    )
    .join('\n')
  return headers + rows
}
