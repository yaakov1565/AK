'use client'

/**
 * Admin Login Page
 * Simple password-based authentication with reCAPTCHA protection
 */

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

declare global {
  interface Window {
    grecaptcha: any
  }
}

export default function AdminLoginPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [recaptchaLoaded, setRecaptchaLoaded] = useState(false)

  // Load reCAPTCHA v3 script
  useEffect(() => {
    const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY
    if (siteKey) {
      const script = document.createElement('script')
      script.src = `https://www.google.com/recaptcha/api.js?render=${siteKey}`
      script.async = true
      script.onload = () => setRecaptchaLoaded(true)
      document.head.appendChild(script)
      
      return () => {
        document.head.removeChild(script)
      }
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      let recaptchaToken = null
      
      // Get reCAPTCHA token if available
      const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY
      if (recaptchaLoaded && siteKey && window.grecaptcha) {
        try {
          recaptchaToken = await window.grecaptcha.execute(siteKey, { action: 'admin_login' })
        } catch (recaptchaError) {
          console.error('reCAPTCHA error:', recaptchaError)
          // Continue without token
        }
      }

      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password, recaptchaToken }),
      })

      const data = await res.json()

      if (data.success) {
        router.push('/admin')
      } else {
        setError(data.error || 'Invalid password')
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
