import { NextResponse } from 'next/server'
import { isAdminAuthenticated } from '@/lib/admin-auth'
import { prisma } from '@/lib/prisma'

/**
 * API Route: Export Codes as CSV
 * GET /api/admin/codes/export-csv
 */
export async function GET() {
  try {
    const isAuthenticated = await isAdminAuthenticated()
    
    if (!isAuthenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch all codes
    const codes = await prisma.spinCode.findMany({
      orderBy: { createdAt: 'desc' },
    })

    // Create CSV content
    const headers = ['code', 'name', 'email', 'isUsed', 'createdAt', 'usedAt']
    const csvRows = [headers.join(',')]

    codes.forEach(code => {
      const row = [
        escapeCSVField(code.code),
        escapeCSVField(code.name || ''),
        escapeCSVField(code.email || ''),
        code.isUsed ? 'TRUE' : 'FALSE',
        code.createdAt.toISOString(),
        code.usedAt ? code.usedAt.toISOString() : ''
      ]
      csvRows.push(row.join(','))
    })

    const csvContent = csvRows.join('\n')

    // Return as downloadable file
    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="codes-export-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    })

  } catch (error) {
    console.error('Error exporting codes CSV:', error)
    return NextResponse.json({ 
      error: 'Failed to export codes' 
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
