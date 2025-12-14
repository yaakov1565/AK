'use client'

/**
 * Winners Ticker Component
 * Displays recent winners in an auto-sliding carousel
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
      }, 500) // Match this with slide-out animation duration
    }, 4000) // Show each winner for 4 seconds

    return () => clearInterval(interval)
  }, [winners.length])

  if (winners.length === 0) {
    return null
  }

  const currentWinner = winners[currentIndex]

  return (
    <div className="w-full max-w-2xl mb-8">
      <div className="overflow-hidden">
        <h3 className="text-gold-300 text-center text-lg font-semibold mb-3 tracking-wide">
          ✨ Latest Winners ✨
        </h3>
        <div className="bg-gradient-to-r from-gold-400/10 to-gold-600/10 backdrop-blur-sm border border-gold-400/30 rounded-lg p-6 shadow-xl relative overflow-hidden">
          {/* Sliding animation wrapper */}
          <div
            className={`transition-all duration-500 ease-in-out ${
              isSliding ? 'transform translate-x-full opacity-0' : 'transform translate-x-0 opacity-100'
            }`}
          >
            <div className="flex flex-col items-center gap-4 text-center">
              {currentWinner.prizeImage && (
                <div className="flex-shrink-0">
                  <img
                    src={currentWinner.prizeImage}
                    alt={currentWinner.prizeName}
                    className="w-20 h-20 object-cover rounded-lg border-2 border-gold-400/50 shadow-lg"
                  />
                </div>
              )}
              <div className="flex-1">
                <p className="text-gold-300 text-sm font-medium mb-1">🎉 Winner</p>
                <p className="text-white text-lg font-bold">{currentWinner.name}</p>
                <p className="text-gold-200 text-sm mt-1">Won: {currentWinner.prizeName}</p>
              </div>
            </div>
          </div>
          
          {/* Progress indicator dots */}
          {winners.length > 1 && (
            <div className="flex justify-center gap-2 mt-4">
              {winners.map((_, index) => (
                <div
                  key={index}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    index === currentIndex
                      ? 'w-8 bg-gold-400'
                      : 'w-1.5 bg-gold-400/30'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
