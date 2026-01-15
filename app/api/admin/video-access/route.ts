/**
 * API Route: /api/admin/video-access
 * 
 * Get all video access records with statistics
 */

import { NextRequest, NextResponse } from 'next/server'
import { isAdminAuthenticated } from '@/lib/admin-auth'
import { getAllEmailStats } from '@/lib/video-access'

export async function GET(request: NextRequest) {
  const isAuthenticated = await isAdminAuthenticated()
  
  if (!isAuthenticated) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  try {
    const { searchParams } = new URL(request.url)
    const videoId = searchParams.get('videoId') || undefined
    
    const stats = await getAllEmailStats(videoId)
    
    return NextResponse.json(stats)
  } catch (error) {
    console.error('Error fetching video access stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch video access records' },
      { status: 500 }
    )
  }
}
