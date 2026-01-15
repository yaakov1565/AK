/**
 * API Route: /api/admin/video-access/upload-csv
 * 
 * Upload CSV file to add emails to video access whitelist
 */

import { NextRequest, NextResponse } from 'next/server'
import { isAdminAuthenticated } from '@/lib/admin-auth'
import { addEmailsToWhitelist } from '@/lib/video-access'

/**
 * Validate email format
 */
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Parse CSV content
 * Expected format: email or email,maxViews (header row optional)
 */
function parseCSV(content: string): Array<{ email: string; maxViews?: number }> {
  const lines = content.split('\n').map(line => line.trim()).filter(line => line.length > 0)
  
  if (lines.length === 0) {
    throw new Error('CSV file is empty')
  }

  const results: Array<{ email: string; maxViews?: number }> = []
  let startIndex = 0

  // Check if first line is a header
  const firstLine = lines[0].toLowerCase()
  if (firstLine.includes('email') || firstLine.includes('views') || firstLine.includes('max')) {
    startIndex = 1 // Skip header row
  }

  for (let i = startIndex; i < lines.length; i++) {
    const line = lines[i]
    const fields = line.split(',').map(f => f.trim())
    
    if (fields.length === 0 || !fields[0]) {
      continue // Skip empty lines
    }

    const email = fields[0].toLowerCase().trim()
    const maxViews = fields[1] ? parseInt(fields[1]) : undefined

    if (!email) {
      throw new Error(`Line ${i + 1}: Email is required`)
    }

    if (!isValidEmail(email)) {
      throw new Error(`Line ${i + 1}: Invalid email address: ${email}`)
    }

    if (maxViews !== undefined && (isNaN(maxViews) || maxViews < 1)) {
      throw new Error(`Line ${i + 1}: Max views must be a positive number`)
    }

    results.push({ email, maxViews })
  }

  return results
}

export async function POST(request: NextRequest) {
  const isAuthenticated = await isAdminAuthenticated()
  
  if (!isAuthenticated) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  try {
    const formData = await request.formData()
    const file = formData.get('csvFile') as File
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    // Check file type
    if (!file.name.endsWith('.csv')) {
      return NextResponse.json(
        { error: 'File must be a CSV file' },
        { status: 400 }
      )
    }

    // Read file content
    const content = await file.text()
    
    // Parse CSV
    let entries
    try {
      entries = parseCSV(content)
    } catch (parseError: any) {
      return NextResponse.json(
        { error: `CSV parsing error: ${parseError.message}` },
        { status: 400 }
      )
    }

    if (entries.length === 0) {
      return NextResponse.json(
        { error: 'No valid entries found in CSV' },
        { status: 400 }
      )
    }

    if (entries.length > 1000) {
      return NextResponse.json(
        { error: 'CSV contains too many entries. Maximum is 1000 per upload.' },
        { status: 400 }
      )
    }

    // Add emails to whitelist
    const emails = entries.map(e => e.email)
    const defaultMaxViews = entries[0].maxViews || 3
    
    const result = await addEmailsToWhitelist(emails, defaultMaxViews)

    console.log(`✅ Added ${result.added} emails to video access whitelist`)

    // Redirect with success message
    const successUrl = new URL('/admin/video-access', request.url)
    successUrl.searchParams.set('success', 'upload')
    successUrl.searchParams.set('added', String(result.added))
    
    return NextResponse.redirect(successUrl, 303)
  } catch (error) {
    console.error('Upload CSV error:', error)
    return NextResponse.json(
      { error: 'Failed to process CSV file' },
      { status: 500 }
    )
  }
}
