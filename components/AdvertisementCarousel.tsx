'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'

interface Advertisement {
  id: string
  imageUrl: string
  linkUrl: string | null
}

interface AdvertisementCarouselProps {
  ads: Advertisement[]
}

export default function AdvertisementCarousel({ ads }: AdvertisementCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [nextIndex, setNextIndex] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)

  useEffect(() => {
    // Only auto-scroll if there are multiple ads
    if (ads.length <= 1) return

    const interval = setInterval(() => {
      const next = (currentIndex + 1) % ads.length
      setNextIndex(next)
      setIsTransitioning(true)
      
      setTimeout(() => {
        setCurrentIndex(next)
        setIsTransitioning(false)
      }, 600)
    }, 5000)

    return () => clearInterval(interval)
  }, [ads.length, currentIndex])

  if (!ads || ads.length === 0) return null

  const handlePrevious = () => {
    const next = (currentIndex - 1 + ads.length) % ads.length
    setNextIndex(next)
    setIsTransitioning(true)
    setTimeout(() => {
      setCurrentIndex(next)
      setIsTransitioning(false)
    }, 600)
  }

  const handleNext = () => {
    const next = (currentIndex + 1) % ads.length
    setNextIndex(next)
    setIsTransitioning(true)
    setTimeout(() => {
      setCurrentIndex(next)
      setIsTransitioning(false)
    }, 600)
  }

  const handleDotClick = (index: number) => {
    if (index !== currentIndex) {
      setNextIndex(index)
      setIsTransitioning(true)
      setTimeout(() => {
        setCurrentIndex(index)
        setIsTransitioning(false)
      }, 600)
    }
  }

  const AdContainer = ({ ad, isVisible }: { ad: Advertisement; isVisible: boolean }) => (
    <div className={`absolute inset-0 transition-opacity duration-600 ease-in-out ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
      <div className="relative w-full h-full">
        <Image
          src={ad.imageUrl}
          alt="Advertisement"
          fill
          sizes="(max-width: 1536px) 100vw, 1536px"
          className="object-cover"
          quality={85}
          priority={isVisible}
        />
      </div>
    </div>
  )

  const currentAd = ads[currentIndex]
  const nextAd = ads[nextIndex]

  return (
    <div className="relative w-full">
      <div className="relative w-full max-w-7xl mx-auto overflow-hidden rounded-lg border-2 border-gold-400/30 shadow-xl bg-navy-800/40">
        <div className="relative w-full h-[300px]">
          {currentAd.linkUrl && !isTransitioning ? (
            <a
              href={currentAd.linkUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full h-full hover:opacity-90 transition-opacity duration-200"
            >
              <AdContainer ad={currentAd} isVisible={!isTransitioning} />
              {isTransitioning && <AdContainer ad={nextAd} isVisible={true} />}
            </a>
          ) : (
            <>
              <AdContainer ad={currentAd} isVisible={!isTransitioning} />
              {isTransitioning && <AdContainer ad={nextAd} isVisible={true} />}
            </>
          )}
        </div>
      </div>

      {/* Navigation Controls - Only show if multiple ads */}
      {ads.length > 1 && (
        <>
          {/* Previous/Next Buttons */}
          <button
            onClick={handlePrevious}
            disabled={isTransitioning}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-navy-900/80 hover:bg-navy-800 text-gold-400 p-3 rounded-full shadow-lg transition-all z-10 disabled:opacity-50"
            aria-label="Previous advertisement"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <button
            onClick={handleNext}
            disabled={isTransitioning}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-navy-900/80 hover:bg-navy-800 text-gold-400 p-3 rounded-full shadow-lg transition-all z-10 disabled:opacity-50"
            aria-label="Next advertisement"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* Dots Indicator */}
          <div className="flex justify-center gap-2 mt-4">
            {ads.map((_, index) => (
              <button
                key={index}
                onClick={() => handleDotClick(index)}
                disabled={isTransitioning}
                className={`w-3 h-3 rounded-full transition-all disabled:opacity-50 ${
                  index === currentIndex ? 'bg-gold-400 w-8' : 'bg-gray-500 hover:bg-gray-400'
                }`}
                aria-label={`Go to advertisement ${index + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
