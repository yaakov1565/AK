/**
 * API Route: /api/spin
 * 
 * Handles the main spin logic
 * - Validates code
 * - Selects prize using weighted random
 * - Updates inventory
 * - Marks code as used
 * - Sends email notification
 */

import { NextRequest, NextResponse } from 'next/server'
import { performSpin } from '@/lib/spin-logic'
import { isRateLimited, recordFailedAttempt, resetAttempts, getClientIdentifier } from '@/lib/rate-limit'
import { sendTemplatedEmail } from '@/lib/email-templates'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    // Get client identifier for rate limiting
    const identifier = getClientIdentifier(request.headers)

    // Check rate limit
    const limited = await isRateLimited(identifier)
    if (limited) {
      return NextResponse.json(
        { success: false, error: 'Too many attempts. Please try again later.' },
        { status: 429 }
      )
    }

    // Parse request body
    const body = await request.json()
    const { code } = body

    if (!code || typeof code !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Invalid request' },
        { status: 400 }
      )
    }

    // Perform the spin
    const result = await performSpin(code.trim().toUpperCase())

    // Handle failure
    if (!result.success) {
      await recordFailedAttempt(identifier)
      return NextResponse.json(result, { status: 400 })
    }

    // Success - reset rate limit attempts
    await resetAttempts(identifier)

    // Get code data and full prize details for emails
    const codeData = await prisma.spinCode.findUnique({
      where: { code: code.trim().toUpperCase() }
    })
    
    const prizeData = await prisma.prize.findUnique({
      where: { id: result.prize!.id }
    })

    // Send email notifications using templates
    try {
      // 1. Send admin notification
      await sendTemplatedEmail('ADMIN_WIN_NOTIFICATION', {
        to: process.env.ADMIN_EMAIL || '',
        variables: {
          prize_name: prizeData?.title || result.prize!.title,
          prize_description: prizeData?.description || 'Amazing prize',
          winner_name: codeData?.name || 'Unknown',
          winner_email: codeData?.email || 'Unknown',
          spin_code: code,
          won_at: new Date().toLocaleString(),
          admin_panel_url: `${process.env.NEXT_PUBLIC_APP_URL}/admin/winners`,
          app_name: 'Ateres Kallah',
          current_year: new Date().getFullYear()
        }
      })
      console.log('✅ Admin win notification sent')

      // 2. Send winner confirmation
      if (codeData?.email) {
        await sendTemplatedEmail('WINNER_CONFIRMATION', {
          to: codeData.email,
          variables: {
            winner_name: codeData.name || 'Winner',
            prize_name: prizeData?.title || result.prize!.title,
            prize_description: prizeData?.description || 'Amazing prize',
            prize_image_url: result.prize!.imageUrl || '',
            spin_code: code,
            won_at: new Date().toLocaleString(),
            contact_email: process.env.ADMIN_EMAIL || 'admin@example.com',
            app_name: 'Ateres Kallah',
            current_year: new Date().getFullYear()
          }
        })
        console.log(`✅ Winner confirmation sent to ${codeData.email}`)
      }
    } catch (emailError) {
      // Log but don't fail the request if email fails
      console.error('Failed to send email notifications:', emailError)
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Spin API error:', error)
    return NextResponse.json(
      { success: false, error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
