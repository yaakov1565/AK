import { NextResponse } from 'next/server'
import { isAdminAuthenticated } from '@/lib/admin-auth'
import { prisma } from '@/lib/prisma'

/**
 * API Route: Export Prizes as CSV
 * GET /api/admin/prizes/export-csv
 */
export async function GET() {
  try {
    const isAuthenticated = await isAdminAuthenticated()
    
    if (!isAuthenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch all prizes
    const prizes = await prisma.prize.findMany({
      orderBy: { createdAt: 'asc' },
    })

    // Create CSV content
    const headers = ['title', 'description', 'imageUrl', 'quantityTotal', 'quantityRemaining', 'weight']
    const csvRows = [headers.join(',')]

    prizes.forEach(prize => {
      const row = [
        escapeCSVField(prize.title),
        escapeCSVField(prize.description),
        escapeCSVField(prize.imageUrl || ''),
        prize.quantityTotal.toString(),
        prize.quantityRemaining.toString(),
        prize.weight.toString()
      ]
      csvRows.push(row.join(','))
    })

    const csvContent = csvRows.join('\n')

    // Return as downloadable file
    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="prizes-export-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    })

  } catch (error) {
    console.error('Error exporting prizes CSV:', error)
    return NextResponse.json({ 
      error: 'Failed to export prizes' 
    }, { status: 500 })
  }
}

/**
 * Escape CSV field to handle commas, quotes, and special characters
 */
function escapeCSVField(field: string): string {
  if (!field) return ''
  
  // If field contains comma, quote, or newline, wrap in quotes and escape inner quotes
  if (field.includes(',') || field.includes('"') || field.includes('\n') || field.includes('&')) {
    return '"' + field.replace(/"/g, '""') + '"'
  }
  
  return field
}
