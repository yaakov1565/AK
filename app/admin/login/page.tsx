'use client'

/**
 * Admin Login Page
 * Simple password-based authentication
 */

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminLoginPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })

      const data = await res.json()

      if (data.success) {
        router.push('/admin')
      } else {
        setError('Invalid password')
      }
    } catch (err) {
      setError('An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-navy-900 flex items-center justify-center p-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-serif font-bold text-gold-500 mb-2">
            Admin Login
          </h1>
          <p className="text-gray-400">Ateres Kallah – Spin to Win</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-navy-800 border-2 border-gold-500/30 rounded-lg p-8 shadow-2xl">
          <div className="mb-6">
            <label htmlFor="password" className="block text-gold-400 mb-2 font-medium">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              className="w-full px-4 py-3 bg-navy-900 border border-gold-500/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent disabled:opacity-50"
              placeholder="Enter admin password"
              required
            />
          </div>

          {error && (
            <p className="mb-4 text-red-400 text-sm">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gold-500 hover:bg-gold-600 disabled:bg-gray-600 text-navy-900 font-bold py-3 px-6 rounded-lg transition-colors disabled:cursor-not-allowed"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <a href="/" className="text-gold-400 hover:text-gold-500 transition-colors">
            ← Back to Home
          </a>
        </div>
      </div>
    </div>
  )
}
