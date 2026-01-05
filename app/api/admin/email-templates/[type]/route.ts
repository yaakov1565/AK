/**
 * API Route: /api/admin/email-templates/[type]
 * 
 * GET - Retrieve a specific email template by type
 */

import { NextRequest, NextResponse } from 'next/server'
import { isAdminAuthenticated } from '@/lib/admin-auth'
import { getTemplate, getAvailableVariables } from '@/lib/email-templates'

export async function GET(
  request: NextRequest,
  { params }: { params: { type: string } }
) {
  // Check admin authentication
  const isAuthenticated = await isAdminAuthenticated()
  
  if (!isAuthenticated) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  try {
    const { type } = params

    // Get template
    const template = await getTemplate(type)
    
    if (!template) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      )
    }

    // Get available variables for this template type
    const availableVariables = getAvailableVariables(type)

    return NextResponse.json({ 
      template,
      availableVariables
    })
  } catch (error) {
    console.error('Error fetching template:', error)
    return NextResponse.json(
      { error: 'Failed to fetch template' },
      { status: 500 }
    )
  }
}
