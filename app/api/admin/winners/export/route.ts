/**
 * API Route: /api/admin/winners/export
 * 
 * Exports winners to CSV file
 */

import { NextResponse } from 'next/server'
import { isAdminAuthenticated } from '@/lib/admin-auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const isAuthenticated = await isAdminAuthenticated()
  
  if (!isAuthenticated) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  try {
    const winners = await prisma.winner.findMany({
      include: {
        prize: {
          select: {
            title: true,
          },
        },
        code: {
          select: {
            code: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { wonAt: 'desc' },
    })

    // Create CSV content
    const headers = ['Date', 'Time', 'Name', 'Email', 'Code', 'Prize', 'Prize Sent', 'Notes']
    const rows = winners.map((winner: any) => {
      const date = new Date(winner.wonAt)
      return [
        date.toLocaleDateString(),
        date.toLocaleTimeString(),
        winner.code.name || '',
        winner.code.email || '',
        winner.code.code,
        winner.prize.title,
        winner.prizeSent ? 'Yes' : 'No',
        winner.notes || '',
      ]
    })

    const csv = [
      headers.join(','),
      ...rows.map((row: any) => row.map((cell: any) => `"${cell}"`).join(',')),
    ].join('\n')

    // Return CSV file
    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="ateres-kallah-winners-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    })
  } catch (error) {
    console.error('Export winners error:', error)
    return NextResponse.json(
      { error: 'Failed to export winners' },
      { status: 500 }
    )
  }
}
