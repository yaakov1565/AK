import { NextRequest, NextResponse } from 'next/server'
import { isAdminAuthenticated } from '@/lib/admin-auth'
import { prisma } from '@/lib/prisma'

// File upload security limits
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const MAX_ROWS = 1000
const ALLOWED_MIME_TYPES = ['text/csv', 'application/csv', 'text/plain']

/**
 * Sanitize CSV value to prevent CSV injection
 */
function sanitizeCSVValue(value: string): string {
  // Remove dangerous characters that could trigger formulas in Excel/Sheets
  const dangerous = /^[=+\-@\t\r]/
  if (dangerous.test(value)) {
    return "'" + value // Prefix with quote to prevent execution
  }
  return value
}

/**
 * API Route: Upload Prizes from CSV
 * POST /api/admin/prizes/upload-csv
 */
export async function POST(request: NextRequest) {
  try {
    const isAuthenticated = await isAdminAuthenticated()
    
    if (!isAuthenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({
        error: 'File too large. Maximum size is 5MB'
      }, { status: 400 })
    }

    // Validate MIME type
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json({
        error: 'Invalid file type. Only CSV files are allowed'
      }, { status: 400 })
    }

    const text = await file.text()
    const lines = text.split('\n').filter(line => line.trim())
    
    if (lines.length < 2) {
      return NextResponse.json({ error: 'CSV file is empty or invalid' }, { status: 400 })
    }

    // Validate row count
    if (lines.length > MAX_ROWS) {
      return NextResponse.json({
        error: `Too many rows. Maximum is ${MAX_ROWS} prizes`
      }, { status: 400 })
    }

    // Parse header
    const headers = lines[0].split(',').map(h => h.trim())
    
    // Validate headers
    const requiredHeaders = ['title', 'description', 'quantityTotal', 'weight']
    const missingHeaders = requiredHeaders.filter(h => !headers.includes(h))
    
    if (missingHeaders.length > 0) {
      return NextResponse.json({ 
        error: `Missing required columns: ${missingHeaders.join(', ')}` 
      }, { status: 400 })
    }

    // Parse prizes
    const prizes = []
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim())
      
      if (values.length !== headers.length) {
        continue // Skip malformed rows
      }

      const prize: any = {}
      headers.forEach((header, index) => {
        prize[header] = values[index]
      })

      // Validate and convert types
      const quantityTotal = parseInt(prize.quantityTotal)
      const weight = parseInt(prize.weight)
      
      if (!prize.title || !prize.description || isNaN(quantityTotal) || isNaN(weight)) {
        continue // Skip invalid rows
      }

      prizes.push({
        title: sanitizeCSVValue(prize.title),
        description: sanitizeCSVValue(prize.description),
        imageUrl: prize.imageUrl || null,
        quantityTotal,
        quantityRemaining: quantityTotal,
        weight,
      })
    }

    if (prizes.length === 0) {
      return NextResponse.json({ 
        error: 'No valid prizes found in CSV' 
      }, { status: 400 })
    }

    // Insert prizes into database
    const result = await prisma.prize.createMany({
      data: prizes,
    })

    return NextResponse.json({ 
      success: true, 
      count: result.count,
      message: `Successfully imported ${result.count} prizes`
    })

  } catch (error) {
    console.error('Error uploading prizes CSV:', error)
    return NextResponse.json({ 
      error: 'Failed to upload prizes' 
    }, { status: 500 })
  }
}
