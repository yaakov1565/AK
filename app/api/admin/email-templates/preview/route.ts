/**
 * API Route: /api/admin/email-templates/preview
 * 
 * POST - Preview an email template with sample data
 */

import { NextRequest, NextResponse } from 'next/server'
import { isAdminAuthenticated } from '@/lib/admin-auth'
import { previewTemplate, getSampleVariables } from '@/lib/email-templates'

export async function POST(request: NextRequest) {
  // Check admin authentication
  const isAuthenticated = await isAdminAuthenticated()
  
  if (!isAuthenticated) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  try {
    const body = await request.json()
    const { type, subject, htmlBody } = body

    // Validate required fields
    if (!type || !subject || !htmlBody) {
      return NextResponse.json(
        { error: 'Type, subject, and htmlBody are required' },
        { status: 400 }
      )
    }

    // Get sample variables for this template type
    const sampleVariables = getSampleVariables(type)

    // Preview the template with sample data
    const preview = previewTemplate(subject, htmlBody, sampleVariables)

    return NextResponse.json({ 
      success: true,
      preview: {
        subject: preview.subject,
        html: preview.html
      },
      sampleVariables
    })
  } catch (error) {
    console.error('Error previewing template:', error)
    return NextResponse.json(
      { error: 'Failed to preview template' },
      { status: 500 }
    )
  }
}
