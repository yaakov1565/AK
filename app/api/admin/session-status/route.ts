/**
 * API Route: /api/admin/session-status
 * 
 * Returns the remaining session time in minutes
 */

import { NextResponse } from 'next/server'
import { getSessionTimeRemaining, isAdminAuthenticated } from '@/lib/admin-auth'

export async function GET() {
  const isAuthenticated = await isAdminAuthenticated()
  
  if (!isAuthenticated) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  const minutesRemaining = await getSessionTimeRemaining()

  return NextResponse.json({ 
    minutesRemaining: minutesRemaining ?? 0,
    authenticated: true,
  })
}
