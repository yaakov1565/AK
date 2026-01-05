/**
 * API Route: /api/admin/codes/upload-csv
 *
 * Upload CSV file to generate codes in bulk
 */

import { NextRequest, NextResponse } from 'next/server'
import { isAdminAuthenticated } from '@/lib/admin-auth'
import { prisma } from '@/lib/prisma'
import { sendTemplatedEmail } from '@/lib/email-templates'

/**
 * Generate a unique code in format AK-2024-XXXX
 */
function generateCode(): string {
  const year = new Date().getFullYear()
  const random = Math.random().toString(36).substring(2, 8).toUpperCase()
  return `AK-${year}-${random}`
}

/**
 * Validate email format
 */
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Sanitize string input (basic XSS prevention)
 */
function sanitizeString(str: string): string {
  return str.replace(/[<>]/g, '').trim()
}

/**
 * Parse amount string to number (remove $, commas, etc.)
 */
function parseAmount(amountStr: string): number {
  const cleaned = amountStr.replace(/[\$,]/g, '').trim()
  const num = parseFloat(cleaned)
  return isNaN(num) ? 0 : num
}

/**
 * Parse CSV content
 * Expected format: name,"email1,email2",amount (header row optional)
 * Emails can be comma-separated within quotes, or use semicolon/pipe
 */
function parseCSV(content: string): Array<{ name: string; emails: string[]; amount: string; amountNum: number }> {
  const lines = content.split('\n').map(line => line.trim()).filter(line => line.length > 0)
  
  if (lines.length === 0) {
    throw new Error('CSV file is empty')
  }

  const results: Array<{ name: string; emails: string[]; amount: string; amountNum: number }> = []
  let startIndex = 0

  // Check if first line is a header (contains common header keywords)
  const firstLine = lines[0].toLowerCase()
  if (firstLine.includes('name') || firstLine.includes('email') || firstLine.includes('amount')) {
    startIndex = 1 // Skip header row
  }

  for (let i = startIndex; i < lines.length; i++) {
    const line = lines[i]
    // Split by comma, but handle quoted fields (improved regex)
    const fields = line.match(/(".*?"|[^",]+)(?=\s*,|\s*$)/g) || []
    
    if (fields.length < 2) {
      throw new Error(`Line ${i + 1}: Invalid format. Expected at least: name,emails,amount`)
    }

    const name = (fields[0] || '').replace(/^"|"$/g, '').trim()
    const emailsField = (fields[1] || '').replace(/^"|"$/g, '').trim()
    const amount = fields[2] ? (fields[2] || '').replace(/^"|"$/g, '').trim() : '$1,000'

    if (!name) {
      throw new Error(`Line ${i + 1}: Name is required`)
    }

    if (!emailsField) {
      throw new Error(`Line ${i + 1}: Email is required`)
    }

    // Parse multiple emails (separated by comma, semicolon, or pipe)
    const emails = emailsField
      .split(/[,;|]/)
      .map(e => e.trim())
      .filter(e => e.length > 0)

    if (emails.length === 0) {
      throw new Error(`Line ${i + 1}: At least one email is required`)
    }

    // Validate all emails
    for (const email of emails) {
      if (!isValidEmail(email)) {
        throw new Error(`Line ${i + 1}: Invalid email address: ${email}`)
      }
    }

    // Parse amount to number for validation
    const amountNum = parseAmount(amount)

    results.push({ name, emails, amount, amountNum })
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

    if (entries.length > 500) {
      return NextResponse.json(
        { error: 'CSV contains too many entries. Maximum is 500 per upload.' },
        { status: 400 }
      )
    }

    // Track statistics
    let skippedLowAmount = 0
    let skippedDuplicate = 0
    let codesCreated = 0
    let emailsSent = 0
    let emailsFailed = 0

    // Process each entry
    for (const entry of entries) {
      // Check if amount is at least $1000
      if (entry.amountNum < 1000) {
        console.log(`⚠️ Skipping ${entry.name}: Amount ${entry.amount} is less than $1,000`)
        skippedLowAmount++
        continue
      }

      // Check if ANY of the emails already have a code
      const emailsLower = entry.emails.map(e => e.toLowerCase().trim())
      
      // Get all existing codes
      const allCodes = await prisma.spinCode.findMany({
        select: { email: true }
      })
      
      // Check if any of our emails appear in any existing code's email field
      let hasDuplicate = false
      let duplicateEmail = ''
      
      for (const email of emailsLower) {
        for (const code of allCodes) {
          if (code.email && code.email.includes(email)) {
            hasDuplicate = true
            duplicateEmail = email
            break
          }
        }
        if (hasDuplicate) break
      }

      if (hasDuplicate) {
        console.log(`⚠️ Skipping ${entry.name}: Email ${duplicateEmail} already has a code`)
        skippedDuplicate++
        continue
      }

      // Generate unique code
      let code = generateCode()
      let exists = await prisma.spinCode.findUnique({ where: { code } })
      while (exists) {
        code = generateCode()
        exists = await prisma.spinCode.findUnique({ where: { code } })
      }

      // Create ONE code record with all emails in the email field
      const allEmails = emailsLower.join(', ')
      
      await prisma.spinCode.create({
        data: {
          code,
          name: sanitizeString(entry.name),
          email: allEmails // All emails comma-separated
        }
      })
      
      codesCreated++

      // Send CODE_CREATED email to all recipients
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://spin2win-ak.org'
      
      for (const email of entry.emails) {
        try {
          await sendTemplatedEmail('CODE_CREATED', {
            to: email,
            variables: {
              customer_name: entry.name,
              customer_email: email,
              spin_code: code,
              code_value: entry.amount,
              spin_url: appUrl,
              expiry_date: 'No expiration',
              current_year: new Date().getFullYear(),
              app_name: 'Ateres Kallah'
            }
          })
          console.log(`✅ Code created email sent to ${email}`)
          emailsSent++
        } catch (emailError) {
          console.error(`Failed to send code email to ${email}:`, emailError)
          emailsFailed++
        }
      }
    }

    console.log(`
📊 Upload Summary:
   - Codes created: ${codesCreated}
   - Emails sent: ${emailsSent}
   - Emails failed: ${emailsFailed}
   - Skipped (< $1000): ${skippedLowAmount}
   - Skipped (duplicate): ${skippedDuplicate}
    `)

    // For form submissions, we need to use a 303 redirect with success message
    const successUrl = new URL('/admin/codes', request.url)
    successUrl.searchParams.set('success', 'upload')
    successUrl.searchParams.set('created', String(codesCreated))
    successUrl.searchParams.set('sent', String(emailsSent))
    successUrl.searchParams.set('skipped', String(skippedLowAmount + skippedDuplicate))
    
    return NextResponse.redirect(successUrl, 303)
  } catch (error) {
    console.error('Upload CSV error:', error)
    return NextResponse.json(
      { error: 'Failed to process CSV file' },
      { status: 500 }
    )
  }
}
