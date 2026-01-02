'use client'

/**
 * Admin Session Status Component
 * Shows remaining session time and warns when session is about to expire
 */

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminSessionStatus() {
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null)
  const [showWarning, setShowWarning] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await fetch('/api/admin/session-status')
        if (res.ok) {
          const data = await res.json()
          setTimeRemaining(data.minutesRemaining)
          
          // Show warning if less than 15 minutes remaining
          setShowWarning(data.minutesRemaining < 15)
          
          // Redirect to login if session expired
          if (data.minutesRemaining <= 0) {
            router.push('/admin/login')
          }
        } else {
          router.push('/admin/login')
        }
      } catch (error) {
        console.error('Session check error:', error)
      }
    }

    // Check immediately
    checkSession()

    // Check every minute
    const interval = setInterval(checkSession, 60000)

    return () => clearInterval(interval)
  }, [router])

  if (timeRemaining === null) return null

  const hours = Math.floor(timeRemaining / 60)
  const minutes = timeRemaining % 60

  return (
    <div className={`fixed top-4 right-4 px-4 py-2 rounded-lg text-sm font-medium ${
      showWarning 
        ? 'bg-yellow-500/20 border border-yellow-500 text-yellow-300' 
        : 'bg-navy-800/80 border border-gold-500/30 text-gray-400'
    }`}>
      {showWarning ? '⚠️ ' : '🔒 '}
      Session expires in: {hours > 0 && `${hours}h `}{minutes}m
      {showWarning && (
        <button
          onClick={() => router.refresh()}
          className="ml-3 text-yellow-400 hover:text-yellow-300 underline"
        >
          Refresh
        </button>
      )}
    </div>
  )
}
