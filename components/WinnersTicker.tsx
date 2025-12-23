'use client'

/**
 * Winners Ticker Component
 * Displays recent winners in an elegant horizontal carousel
 */

import { useState, useEffect } from 'react'

interface Winner {
  name: string
  prizeName: string
  prizeImage: string | null
  wonAt: string
}

interface WinnersTickerProps {
  winners: Winner[]
}

export default function WinnersTicker({ winners }: WinnersTickerProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isSliding, setIsSliding] = useState(false)

  useEffect(() => {
    if (winners.length === 0) return

    const interval = setInterval(() => {
      setIsSliding(true)
      
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % winners.length)
        setIsSliding(false)
      }, 500)
    }, 4000)

    return () => clearInterval(interval)
  }, [winners.length])

  if (winners.length === 0) {
    return null
  }

  const currentWinner = winners[currentIndex]

  return (
    <div className="w-full max-w-4xl mb-8">
      <div className="relative">
        <div className="bg-gradient-to-br from-gold-500/5 via-gold-400/10 to-gold-500/5 backdrop-blur-md border-2 border-gold-400/40 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
          {/* Shimmer effect overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-shimmer"></div>
          
          {/* Title */}
          <div className="text-center mb-4">
            <h3 className="text-gold-400/90 text-sm font-semibold tracking-[0.3em] uppercase">
              Recent Winners
            </h3>
          </div>

          {/* Winner Content with fade animation */}
          <div
            className={`transition-all duration-700 ease-in-out ${
              isSliding ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
            }`}
          >
            <div className="flex flex-col items-center justify-center gap-4">
              {/* Prize Image */}
              {currentWinner.prizeImage && (
                <div className="flex-shrink-0 relative group">
                  <div className="absolute inset-0 bg-gold-400/20 rounded-xl blur-xl group-hover:blur-2xl transition-all"></div>
                  <img
                    src={currentWinner.prizeImage}
                    alt={currentWinner.prizeName}
                    className="relative w-24 h-24 object-cover rounded-xl border-2 border-gold-400/60 shadow-2xl transform group-hover:scale-105 transition-transform"
                  />
                </div>
              )}
              
              {/* Winner Info - Centered */}
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <span className="text-gold-400 text-lg">🎉</span>
                  <p className="text-gold-300 text-2xl font-bold tracking-wide">
                    {currentWinner.name}
                  </p>
                </div>
                <p className="text-gold-400/80 text-base">
                  won{' '}
                  <span className="font-semibold text-gold-300">
                    {currentWinner.prizeName}
                  </span>
                </p>
              </div>
            </div>
          </div>
          
          {/* Progress Indicator */}
          {winners.length > 1 && (
            <div className="flex justify-center gap-2 mt-5 pt-4 border-t border-gold-400/20">
              {winners.map((_, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setIsSliding(true)
                    setTimeout(() => {
                      setCurrentIndex(index)
                      setIsSliding(false)
                    }, 500)
                  }}
                  className={`h-2 rounded-full transition-all duration-300 hover:opacity-100 ${
                    index === currentIndex
                      ? 'w-10 bg-gold-400 opacity-100'
                      : 'w-2 bg-gold-400/40 opacity-60'
                  }`}
                  aria-label={`View winner ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add shimmer animation to global styles */}
      <style jsx>{`
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
        .animate-shimmer {
          animation: shimmer 3s infinite;
        }
      `}</style>
    </div>
  )
}
