'use client'

/**
 * Main landing page - Code entry and spin interface
 * 
 * User flow:
 * 1. Enter code
 * 2. Click spin button
 * 3. Watch wheel animate
 * 4. See result
 */

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import PrizeWheel from '@/components/PrizeWheel'

interface Prize {
  id: string
  title: string
  imageUrl: string | null
}

export default function HomePage() {
  const router = useRouter()
  const [code, setCode] = useState('')
  const [prizes, setPrizes] = useState<Prize[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [hasValidCode, setHasValidCode] = useState(false)
  const [isSpinning, setIsSpinning] = useState(false)
  const [selectedPrizeId, setSelectedPrizeId] = useState<string | null>(null)

  // Load prizes on mount
  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/prizes`)
      .then(res => res.json())
      .then(data => setPrizes(data))
      .catch(err => console.error('Failed to load prizes:', err))
  }, [])

  // Handle code validation
  const handleValidateCode = async () => {
    if (!code.trim()) {
      setError('Please enter a code')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const res = await fetch('/api/validate-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: code.trim().toUpperCase() }),
      })

      const data = await res.json()

      if (data.valid) {
        setHasValidCode(true)
        setError('')
      } else {
        setError(data.message || 'Invalid code')
      }
    } catch (err) {
      setError('Failed to validate code. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  // Handle spin
  const handleSpin = async () => {
    setIsLoading(true)
    setError('')

    try {
      const res = await fetch('/api/spin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: code.trim().toUpperCase() }),
      })

      const data = await res.json()

      if (data.success) {
        // Start spinning animation
        setSelectedPrizeId(data.prize.id)
        setIsSpinning(true)
      } else {
        setError(data.error || 'Failed to spin. Please try again.')
        setIsLoading(false)
      }
    } catch (err) {
      setError('An unexpected error occurred.')
      setIsLoading(false)
    }
  }

  // Handle spin animation complete
  const handleSpinComplete = () => {
    setIsLoading(false)
    setIsSpinning(false)
    // Navigate to result page
    router.push(`/result?prize=${selectedPrizeId}`)
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-6xl md:text-7xl font-serif font-bold text-gold-300 mb-2 text-glow tracking-wide animate-fade-in-up">
          ATERES KALLAH
        </h1>
        <h2 className="text-3xl md:text-4xl text-gold-400 font-light italic mb-4 tracking-wider animate-fade-in-up animation-delay-200">
          Spin to Win
        </h2>
        <p className="mt-4 text-gray-200 max-w-2xl mx-auto text-lg leading-relaxed animate-fade-in-up animation-delay-400">
          Enter your one-time code below to spin the prize wheel and win your exclusive prize.
        </p>
      </div>

      {/* Prize Wheel */}
      {prizes.length > 0 && (
        <div className="mb-12 animate-fade-in animation-delay-600">
          <PrizeWheel
            prizes={prizes}
            selectedPrizeId={selectedPrizeId}
            isSpinning={isSpinning}
            onSpinComplete={handleSpinComplete}
          />
        </div>
      )}

      {/* Code Input Section */}
      {!hasValidCode ? (
        <div className="w-full max-w-2xl animate-fade-in-up animation-delay-800">
          <div className="bg-navy-800/40 backdrop-blur-sm border-2 border-gold-400/40 rounded-lg p-8 shadow-2xl">
            <label htmlFor="code" className="block text-gold-300 mb-3 font-medium text-lg">
              Enter Your Code
            </label>
            <input
              id="code"
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              onKeyPress={(e) => e.key === 'Enter' && handleValidateCode()}
              placeholder="AK-XXXX-XXXX"
              disabled={isLoading}
              className="w-full px-4 py-3 bg-navy-900/60 backdrop-blur-sm border border-gold-400/60 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gold-400 focus:border-transparent disabled:opacity-50 uppercase text-lg"
            />
            {error && (
              <p className="mt-3 text-red-400 text-sm">{error}</p>
            )}
            <button
              onClick={handleValidateCode}
              disabled={isLoading || !code.trim()}
              className="w-full mt-6 bg-gold-400 hover:bg-gold-500 disabled:bg-gray-600 text-navy-900 font-bold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 disabled:hover:scale-100 disabled:cursor-not-allowed shadow-lg text-lg"
            >
              {isLoading ? 'Validating...' : 'Validate Code'}
            </button>
          </div>
        </div>
      ) : (
        <div className="w-full max-w-2xl text-center">
          <div className="bg-navy-800/40 backdrop-blur-sm border-2 border-gold-400/40 rounded-lg p-8 shadow-2xl">
            <p className="text-gold-300 mb-6 text-xl">
              Code validated! Ready to spin?
            </p>
            <button
              onClick={handleSpin}
              disabled={isLoading || isSpinning}
              className="w-full bg-gold-400 hover:bg-gold-500 disabled:bg-gray-600 text-navy-900 font-bold py-4 px-8 rounded-lg text-xl transition-all duration-200 transform hover:scale-105 disabled:hover:scale-100 disabled:cursor-not-allowed shadow-lg"
            >
              {isLoading || isSpinning ? 'SPINNING...' : 'SPIN THE WHEEL'}
            </button>
            {error && (
              <p className="mt-4 text-red-400 text-sm">{error}</p>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="mt-16 text-center text-gray-300 text-sm">
        <p>Each code can only be used once</p>
        <p className="mt-2 text-xs text-gray-400">Created by YSLG INC</p>
      </div>
    </main>
  )
}
