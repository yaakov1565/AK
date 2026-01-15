'use client'

import { useState } from 'react'

interface ViewStatus {
  hasAccess: boolean
  canView: boolean
  viewCount: number
  remaining: number
  maxViews: number
  message?: string
}

export default function HighlightsPage() {
  const [email, setEmail] = useState('')
  const [viewStatus, setViewStatus] = useState<ViewStatus | null>(null)
  const [videoRevealed, setVideoRevealed] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleCheckAccess = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    
    try {
      const res = await fetch('/api/video-access/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, videoId: 'highlights-video' })
      })
      
      const data = await res.json()
      
      if (!data.hasAccess) {
        setError(data.message || 'Email not authorized for video access')
        setViewStatus(null)
      } else {
        setViewStatus(data)
      }
    } catch (err) {
      setError('Failed to check access. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleWatchVideo = async () => {
    setError('')
    setLoading(true)
    
    try {
      const res = await fetch('/api/video-access/record', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, videoId: 'highlights-video' })
      })
      
      const data = await res.json()
      
      if (res.ok) {
        setViewStatus(data)
        setVideoRevealed(true)
      } else {
        setError(data.error || 'Failed to load video')
      }
    } catch (err) {
      setError('Failed to load video. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8">
      {/* Header */}
      <div className="text-center mb-12 animate-fade-in-up">
        <h1 className="text-6xl md:text-7xl font-bold text-gold-300 mb-2 elegant-heading">
          ATERES KALLAH
        </h1>
        <h2 className="text-3xl md:text-4xl text-gold-300 mb-4 elegant-subtitle">
          Event Highlights
        </h2>
        <p className="mt-4 text-gray-200 max-w-2xl mx-auto text-lg leading-relaxed">
          Exclusive video content for authorized viewers
        </p>
      </div>

      {/* Main Content */}
      <div className="w-full max-w-3xl animate-fade-in animation-delay-400">
        {!viewStatus ? (
          // Email Entry Form
          <div className="bg-navy-800/40 backdrop-blur-sm border-2 border-gold-400/40 rounded-lg p-8 shadow-2xl">
            <form onSubmit={handleCheckAccess}>
              <label htmlFor="email" className="block text-gold-300 mb-3 font-medium text-lg">
                Enter Your Email to Access
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && !loading && handleCheckAccess(e as any)}
                placeholder="your@email.com"
                required
                disabled={loading}
                className="w-full px-4 py-3 bg-navy-900/60 backdrop-blur-sm border border-gold-400/60 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gold-400 focus:border-transparent disabled:opacity-50 text-lg lowercase"
              />
              <p className="mt-2 text-gray-300 text-sm">Each email is limited to 3 views</p>
              {error && (
                <p className="mt-3 text-red-400 text-sm">{error}</p>
              )}
              <button
                type="submit"
                disabled={loading || !email.trim()}
                className="w-full mt-6 bg-gold-400 hover:bg-gold-500 disabled:bg-gray-600 text-navy-900 font-bold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 disabled:hover:scale-100 disabled:cursor-not-allowed shadow-lg text-lg"
              >
                {loading ? 'Checking...' : 'Continue'}
              </button>
            </form>
          </div>
        ) : viewStatus.canView ? (
          // Video Access Interface
          <div className="bg-navy-800/40 backdrop-blur-sm border-2 border-gold-400/40 rounded-lg p-8 shadow-2xl">
            <div className="text-center mb-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-gold-400/20 backdrop-blur-sm border border-gold-400/40 rounded-full">
                <svg className="w-5 h-5 text-gold-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <span className="text-lg font-semibold text-gold-300">
                  Views remaining: <span className="text-gold-400">{viewStatus.remaining}</span> of {viewStatus.maxViews}
                </span>
              </div>
            </div>
            
            {!videoRevealed ? (
              <div className="text-center">
                <button
                  onClick={handleWatchVideo}
                  disabled={loading}
                  className="inline-flex items-center gap-3 bg-gold-400 hover:bg-gold-500 disabled:bg-gray-600 text-navy-900 font-bold py-4 px-8 rounded-lg text-xl transition-all duration-200 transform hover:scale-105 disabled:hover:scale-100 disabled:cursor-not-allowed shadow-lg"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                  </svg>
                  {loading ? 'LOADING...' : 'WATCH VIDEO'}
                </button>
                {error && (
                  <p className="mt-4 text-red-400 text-sm">{error}</p>
                )}
              </div>
            ) : (
              <div>
                <div className="rounded-lg overflow-hidden shadow-2xl mb-4 border border-gold-400/30">
                  <div style={{position:"relative", paddingTop:"56.25%"}}>
                    <iframe
                      src="https://iframe.mediadelivery.net/embed/581073/4618493f-b4de-4b73-9268-15878378663f?autoplay=true&loop=false&muted=false&preload=true&responsive=true"
                      loading="lazy"
                      style={{border:0, position:"absolute", top:0, height:"100%", width:"100%"}}
                      allow="accelerometer;gyroscope;autoplay;encrypted-media;picture-in-picture;"
                      allowFullScreen
                    />
                  </div>
                </div>
                <p className="text-center text-gray-300">
                  You have <strong className="text-gold-400">{viewStatus.remaining}</strong> view{viewStatus.remaining !== 1 ? 's' : ''} remaining
                </p>
              </div>
            )}
          </div>
        ) : (
          // View Limit Reached
          <div className="bg-navy-800/40 backdrop-blur-sm border-2 border-red-400/40 rounded-lg p-8 shadow-2xl text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-red-900/30 border border-red-400/40 rounded-full mb-4">
              <svg className="w-10 h-10 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gold-300 mb-2 elegant-subtitle">
              View Limit Reached
            </h2>
            <p className="text-gray-300 mb-6">
              You've used all {viewStatus.maxViews} views for this video.
            </p>
            <button
              onClick={() => {
                setViewStatus(null)
                setVideoRevealed(false)
                setEmail('')
              }}
              className="text-gold-400 hover:text-gold-300 font-medium transition-colors"
            >
              ← Try a different email
            </button>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="mt-12 text-center text-gray-300 text-sm animate-fade-in animation-delay-600">
        <p className="text-xs text-gray-400">Created by YSLG INC</p>
      </div>
    </main>
  )
}
