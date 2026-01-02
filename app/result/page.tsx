'use client'

/**
 * Result page - Shows the prize won
 * Displays confetti animation and prize details
 */

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import confetti from 'canvas-confetti'
import SoundEffects from '@/lib/sound-effects'
import WinnersTicker from '@/components/WinnersTicker'

interface Prize {
  id: string
  title: string
  description: string
  imageUrl: string | null
}

interface Winner {
  name: string
  prizeName: string
  prizeImage: string | null
  wonAt: string
}

function ResultContent() {
  const searchParams = useSearchParams()
  const prizeId = searchParams.get('prize')
  const [prize, setPrize] = useState<Prize | null>(null)
  const [loading, setLoading] = useState(true)
  const [soundEffects] = useState(() => new SoundEffects())
  const [winners, setWinners] = useState<Winner[]>([])

  // Function to fetch recent winners
  const fetchWinners = () => {
    const url = `/api/last-winner?t=${Date.now()}`
    fetch(url, {
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })
      .then(res => res.json())
      .then(data => {
        if (data.winners) {
          setWinners(data.winners)
        }
      })
      .catch(err => console.error('Failed to load recent winners:', err))
  }

  useEffect(() => {
    if (!prizeId) return

    // Fetch prize details
    fetch(`/api/prizes/${prizeId}`)
      .then(res => res.json())
      .then(data => {
        setPrize(data)
        setLoading(false)
        
        // Fire confetti and play clapping sound immediately when prize data is loaded
        triggerConfetti()
        soundEffects.playClappingSound()
        
        // Fetch winners to show the latest including this win
        fetchWinners()
      })
      .catch(err => {
        console.error('Failed to load prize:', err)
        setLoading(false)
      })
  }, [prizeId, soundEffects])

  const triggerConfetti = () => {
    console.log('🎉 Triggering confetti!')
    
    // Big initial burst from center
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      disableForReducedMotion: true
    })
    
    console.log('✅ Initial burst fired')

    // Continuous confetti from sides for 3 seconds
    const duration = 3000
    const animationEnd = Date.now() + duration
    const colors = ['#d4af37', '#e8c468', '#f9d367']

    const randomInRange = (min: number, max: number) => {
      return Math.random() * (max - min) + min
    }

    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now()

      if (timeLeft <= 0) {
        clearInterval(interval)
        return
      }

      const particleCount = 50 * (timeLeft / duration)

      // Left side
      confetti({
        particleCount,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: colors,
        disableForReducedMotion: true
      })

      // Right side
      confetti({
        particleCount,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: colors,
        disableForReducedMotion: true
      })
    }, 250)

    return () => clearInterval(interval)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gold-300 text-xl">Loading...</div>
      </div>
    )
  }

  if (!prize) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-400 text-xl">Prize not found</div>
      </div>
    )
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8">
      {/* Winners Ticker at the top */}
      {winners.length > 0 && (
        <div className="mb-8 w-full flex justify-center">
          <WinnersTicker winners={winners} />
        </div>
      )}
      
      <div className="max-w-2xl w-full text-center">
        {/* Success Header */}
        <div className="mb-8 animate-[fadeInUp_0.6s_ease-out]">
          <h1 className="text-6xl md:text-7xl font-serif font-bold text-gold-300 mb-4 animate-[bounce_1s_ease-in-out_0.3s]">
            🎉
          </h1>
          <h2 className="text-5xl md:text-6xl font-serif font-bold text-gold-300 mb-4 text-glow animate-[fadeInUp_0.8s_ease-out_0.2s_both]">
            Congratulations!
          </h2>
          <p className="text-2xl text-gold-400 italic animate-[fadeInUp_0.8s_ease-out_0.4s_both]">
            You won:
          </p>
        </div>

        {/* Prize Display */}
        <div className="bg-navy-800/40 backdrop-blur-sm border-4 border-gold-400/60 rounded-2xl p-12 shadow-2xl mb-8 animate-[scaleIn_0.8s_ease-out_0.6s_both]">
          {prize.imageUrl && (
            <div className="mb-6 animate-[fadeIn_0.8s_ease-out_0.8s_both]">
              <img
                src={prize.imageUrl}
                alt={prize.description}
                className="max-w-full max-h-64 mx-auto rounded-lg shadow-lg transform transition-transform hover:scale-105"
              />
            </div>
          )}
          <h3 className="text-3xl md:text-4xl font-bold text-gold-300 mb-4 text-glow animate-[fadeIn_0.8s_ease-out_1s_both]">
            {prize.description}
          </h3>
        </div>

        {/* Next Steps */}
        <div className="bg-navy-800/40 backdrop-blur-sm border-2 border-gold-400/40 rounded-lg p-8 mb-6 animate-[fadeInUp_0.8s_ease-out_1.2s_both]">
          <h4 className="text-xl font-bold text-gold-300 mb-4">
            What happens next?
          </h4>
          <p className="text-gray-200 mb-4 leading-relaxed">
            We will contact you shortly via email or phone to arrange your prize delivery.
          </p>
          <p className="text-sm text-gray-300 italic">
            Thank you for supporting Ateres Kallah!
          </p>
        </div>

        {/* Back to Home */}
        <div className="mt-8 animate-[fadeInUp_0.8s_ease-out_1.4s_both]">
          <a
            href="/"
            className="inline-block bg-gold-400 hover:bg-gold-500 text-navy-900 font-bold py-3 px-8 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg text-lg"
          >
            Return to Home
          </a>
        </div>
      </div>
    </main>
  )
}

export default function ResultPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gold-300 text-xl">Loading...</div>
      </div>
    }>
      <ResultContent />
    </Suspense>
  )
}
