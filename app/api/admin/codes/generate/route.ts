/**
 * API Route: /api/admin/codes/generate
 *
 * Generates new one-time spin codes
 */

import { NextRequest, NextResponse } from 'next/server'
import { isAdminAuthenticated } from '@/lib/admin-auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
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
    const quantity = parseInt(formData.get('quantity') as string)
    const namesText = formData.get('names') as string || ''
    const emailsText = formData.get('emails') as string || ''

    if (!quantity || quantity < 1 || quantity > 100) {
      return NextResponse.json(
        { error: 'Invalid quantity' },
        { status: 400 }
      )
    }

    // Parse names (one per line)
    const names = namesText
      .split('\n')
      .map(name => name.trim())
      .filter(name => name.length > 0)

    // Parse emails (one per line)
    const emails = emailsText
      .split('\n')
      .map(email => email.trim())
      .filter(email => email.length > 0)

    // Names and emails are required and must match quantity
    if (names.length === 0) {
      return NextResponse.json(
        { error: 'Names are required. Please enter one per line.' },
        { status: 400 }
      )
    }

    if (emails.length === 0) {
      return NextResponse.json(
        { error: 'Email addresses are required. Please enter one per line.' },
        { status: 400 }
      )
    }

    // Validate email formats
    const invalidEmails = emails.filter(email => !isValidEmail(email))
    if (invalidEmails.length > 0) {
      return NextResponse.json(
        { error: `Invalid email address(es): ${invalidEmails.join(', ')}` },
        { status: 400 }
      )
    }

    if (names.length !== quantity) {
      return NextResponse.json(
        { error: `Number of names (${names.length}) must match quantity (${quantity})` },
        { status: 400 }
      )
    }

    if (emails.length !== quantity) {
      return NextResponse.json(
        { error: `Number of emails (${emails.length}) must match quantity (${quantity})` },
        { status: 400 }
      )
    }

    // Generate codes
    const codes = []
    for (let i = 0; i < quantity; i++) {
      let code = generateCode()
      
      // Ensure uniqueness
      let exists = await prisma.spinCode.findUnique({ where: { code } })
      while (exists) {
        code = generateCode()
        exists = await prisma.spinCode.findUnique({ where: { code } })
      }
      
      codes.push({
        code,
        name: sanitizeString(names[i]),
        email: emails[i].toLowerCase().trim()
      })
    }

    // Bulk create
    await prisma.spinCode.createMany({
      data: codes,
    })

    // Send CODE_CREATED email to each customer
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://spin2win-ak.org'
    
    for (const codeData of codes) {
      try {
        await sendTemplatedEmail('CODE_CREATED', {
          to: codeData.email,
          variables: {
            customer_name: codeData.name,
            customer_email: codeData.email,
            spin_code: codeData.code,
            code_value: '$1,000',
            spin_url: appUrl,
            expiry_date: 'No expiration',
            current_year: new Date().getFullYear(),
            app_name: 'Ateres Kallah'
          }
        })
        console.log(`✅ Code created email sent to ${codeData.email}`)
        
        // Add delay between emails to respect Resend rate limits (600ms = ~1.67 emails/sec)
        // Resend free tier: 2 emails per second max
        await new Promise(resolve => setTimeout(resolve, 600))
      } catch (emailError) {
        // Log but don't fail the request if email fails
        console.error(`Failed to send code email to ${codeData.email}:`, emailError)
      }
    }

    // Redirect back to codes page
    return NextResponse.redirect(new URL('/admin/codes', request.url))
  } catch (error) {
    console.error('Generate codes error:', error)
    return NextResponse.json(
      { error: 'Failed to generate codes' },
      { status: 500 }
    )
  }
}
