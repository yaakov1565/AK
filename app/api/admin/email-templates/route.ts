/**
 * API Route: /api/admin/email-templates
 * 
 * Manages email templates
 * GET - Retrieve all email templates
 * PUT - Update a specific template
 */

import { NextRequest, NextResponse } from 'next/server'
import { isAdminAuthenticated } from '@/lib/admin-auth'
import { getAllTemplates, updateTemplate } from '@/lib/email-templates'

export async function GET(request: NextRequest) {
  // Check admin authentication
  const isAuthenticated = await isAdminAuthenticated()
  
  if (!isAuthenticated) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  try {
    const templates = await getAllTemplates()
    return NextResponse.json({ templates })
  } catch (error) {
    console.error('Error fetching templates:', error)
    return NextResponse.json(
      { error: 'Failed to fetch templates' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
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
    const { type, subject, htmlBody, textBody, isActive } = body

    // Validate required fields
    if (!type) {
      return NextResponse.json(
        { error: 'Template type is required' },
        { status: 400 }
      )
    }

    // Update template
    const template = await updateTemplate(type, {
      subject,
      htmlBody,
      textBody,
      isActive
    })

    return NextResponse.json({ 
      success: true, 
      template 
    })
  } catch (error) {
    console.error('Error updating template:', error)
    return NextResponse.json(
      { error: 'Failed to update template' },
      { status: 500 }
    )
  }
}
