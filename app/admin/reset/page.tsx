'use client'

/**
 * Admin Reset Page - DANGER ZONE
 * Allows admin to export all data and reset the database
 * Requires additional password confirmation for safety
 */

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function AdminResetPage() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const [resetPassword, setResetPassword] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState('')
  const [confirmText, setConfirmText] = useState('')
  const [showSuccess, setShowSuccess] = useState(false)
  const [stats, setStats] = useState<any>(null)

  // Check authentication on mount
  useEffect(() => {
    fetch('/api/admin/session-status')
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated) {
          setIsAuthenticated(true)
        } else {
          router.push('/admin/login')
        }
      })
      .catch(() => {
        router.push('/admin/login')
      })
  }, [router])

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (confirmText !== 'DELETE ALL DATA') {
      setError('Please type the confirmation text exactly')
      return
    }

    if (!resetPassword.trim()) {
      setError('Please enter the reset password')
      return
    }

    setIsProcessing(true)
    setError('')

    try {
      const res = await fetch('/api/admin/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resetPassword }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Failed to reset data')
        setIsProcessing(false)
        return
      }

      // Download CSV files
      downloadCSV(data.csvData.prizes, 'prizes_backup.csv')
      downloadCSV(data.csvData.winners, 'winners_backup.csv')
      downloadCSV(data.csvData.codes, 'codes_backup.csv')

      setStats(data.stats)
      setShowSuccess(true)
      setResetPassword('')
      setConfirmText('')
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setIsProcessing(false)
    }
  }

  const downloadCSV = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-400">Checking authentication...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/admin"
            className="text-gold-400 hover:text-gold-300 mb-4 inline-block"
          >
            ← Back to Admin Dashboard
          </Link>
          <h1 className="text-4xl font-bold text-red-500 mb-2">⚠️ DANGER ZONE ⚠️</h1>
          <p className="text-gray-300">Database Reset & Export</p>
        </div>

        {showSuccess ? (
          <div className="bg-green-900/20 border border-green-500/50 rounded-lg p-8 mb-6">
            <h2 className="text-2xl font-bold text-green-400 mb-4">✓ Reset Complete</h2>
            <p className="text-gray-300 mb-4">
              All data has been exported and deleted successfully.
            </p>
            {stats && (
              <div className="bg-navy-900/50 rounded p-4 mb-4">
                <h3 className="text-gold-300 font-semibold mb-2">Statistics:</h3>
                <ul className="text-gray-300 space-y-1">
                  <li>• Prizes deleted: {stats.prizesDeleted}</li>
                  <li>• Winners deleted: {stats.winnersDeleted}</li>
                  <li>• Codes deleted: {stats.codesDeleted}</li>
                </ul>
              </div>
            )}
            <p className="text-sm text-gray-400 mb-4">
              CSV files have been downloaded to your computer.
            </p>
            <div className="flex gap-4">
              <Link
                href="/admin"
                className="bg-gold-400 hover:bg-gold-500 text-navy-900 font-bold py-2 px-6 rounded"
              >
                Return to Dashboard
              </Link>
              <button
                onClick={() => {
                  setShowSuccess(false)
                  setStats(null)
                }}
                className="bg-navy-800 hover:bg-navy-700 text-white font-bold py-2 px-6 rounded"
              >
                Reset Again
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Warning Box */}
            <div className="bg-red-900/20 border-2 border-red-500/50 rounded-lg p-6 mb-6">
              <h2 className="text-xl font-bold text-red-400 mb-3">⚠️ WARNING ⚠️</h2>
              <ul className="text-gray-300 space-y-2 mb-4">
                <li>• This action will <strong className="text-red-400">DELETE ALL DATA</strong> from the database</li>
                <li>• All prizes, winners, and codes will be permanently removed</li>
                <li>• CSV backups will be downloaded before deletion</li>
                <li>• This action <strong className="text-red-400">CANNOT BE UNDONE</strong></li>
              </ul>
              <p className="text-yellow-300 text-sm">
                Only use this if you want to completely reset the system for a new event.
              </p>
            </div>

            {/* Reset Form */}
            <form onSubmit={handleReset} className="bg-navy-800/40 border border-gold-400/30 rounded-lg p-8">
              <h2 className="text-2xl font-bold text-gold-300 mb-6">Reset Database</h2>
              
              {/* Confirmation Text */}
              <div className="mb-6">
                <label className="block text-gray-300 mb-2 font-medium">
                  Type <code className="bg-red-900/30 px-2 py-1 rounded text-red-400">DELETE ALL DATA</code> to confirm:
                </label>
                <input
                  type="text"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  placeholder="DELETE ALL DATA"
                  disabled={isProcessing}
                  className="w-full px-4 py-3 bg-navy-900/60 border border-gold-400/60 rounded text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50"
                />
              </div>

              {/* Reset Password */}
              <div className="mb-6">
                <label className="block text-gray-300 mb-2 font-medium">
                  Reset Password:
                </label>
                <input
                  type="password"
                  value={resetPassword}
                  onChange={(e) => setResetPassword(e.target.value)}
                  placeholder="Enter reset password"
                  disabled={isProcessing}
                  className="w-full px-4 py-3 bg-navy-900/60 border border-gold-400/60 rounded text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gold-400 disabled:opacity-50"
                />
                <p className="text-xs text-gray-400 mt-2">
                  Default: RESET_AK_2025 (Set via ADMIN_RESET_PASSWORD env variable)
                </p>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-900/30 border border-red-500/50 rounded text-red-300">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isProcessing || confirmText !== 'DELETE ALL DATA'}
                className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white font-bold py-4 px-6 rounded transition-colors disabled:cursor-not-allowed"
              >
                {isProcessing ? 'RESETTING DATABASE...' : 'EXPORT & DELETE ALL DATA'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
