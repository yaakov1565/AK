'use client'

/**
 * Prize Wheel Component
 * 
 * Displays all prizes in a spinning wheel
 * IMPORTANT: Shows ALL prizes regardless of availability (per requirements)
 * Spins to land on server-selected prize
 */

import { useEffect, useRef, useState, useCallback } from 'react'
import SoundEffects from '@/lib/sound-effects'

interface Prize {
  id: string
  title: string
  imageUrl: string | null
}

interface PrizeWheelProps {
  prizes: Prize[]
  selectedPrizeId: string | null
  isSpinning: boolean
  onSpinComplete?: () => void
}

export default function PrizeWheel({ 
  prizes, 
  selectedPrizeId, 
  isSpinning,
  onSpinComplete 
}: PrizeWheelProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [rotation, setRotation] = useState(0)
  const [hasEntrance, setHasEntrance] = useState(false)
  const animationRef = useRef<number>()
  const soundEffectsRef = useRef<SoundEffects | null>(null)
  const spinSoundNodesRef = useRef<{ oscillator: OscillatorNode; gainNode: GainNode } | null>(null)
  const lastTickRotation = useRef<number>(0)

  // Entrance animation - subtle spin when wheel first appears
  useEffect(() => {
    if (prizes.length === 0 || hasEntrance) return
    
    const duration = 1500 // 1.5 seconds
    const startTime = Date.now()
    const targetRotation = 360 * 0.5 // Half spin
    
    const animate = () => {
      const now = Date.now()
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      
      // Ease-in-out for smooth entrance
      const easeProgress = progress < 0.5
        ? 2 * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 2) / 2
      
      const currentRotation = targetRotation * easeProgress
      setRotation(currentRotation)
      
      if (progress < 1) {
        requestAnimationFrame(animate)
      } else {
        setHasEntrance(true)
      }
    }
    
    // Small delay before starting entrance animation
    setTimeout(() => requestAnimationFrame(animate), 300)
  }, [prizes.length, hasEntrance])

  // Initialize sound effects
  useEffect(() => {
    soundEffectsRef.current = new SoundEffects()
    
    return () => {
      // Cleanup
      if (spinSoundNodesRef.current && soundEffectsRef.current) {
        soundEffectsRef.current.stopSpinSound(spinSoundNodesRef.current)
        spinSoundNodesRef.current = null
      }
    }
  }, [])

  // Play tick sound when wheel rotates through a segment
  const playTickSound = useCallback((currentRotation: number) => {
    const sliceAngle = 360 / prizes.length
    const currentSegment = Math.floor(Math.abs(currentRotation % 360) / sliceAngle)
    const lastSegment = Math.floor(Math.abs(lastTickRotation.current % 360) / sliceAngle)
    
    if (currentSegment !== lastSegment && soundEffectsRef.current) {
      soundEffectsRef.current.playTick()
    }
    
    lastTickRotation.current = currentRotation
  }, [prizes.length])

  // Draw the wheel
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || prizes.length === 0) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const centerX = canvas.width / 2
    const centerY = canvas.height / 2
    const radius = Math.min(centerX, centerY) - 20

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Save context state
    ctx.save()
    ctx.translate(centerX, centerY)
    ctx.rotate((rotation * Math.PI) / 180)

    const sliceAngle = (2 * Math.PI) / prizes.length

    // Draw each prize slice
    prizes.forEach((prize, index) => {
      const startAngle = sliceAngle * index
      const endAngle = startAngle + sliceAngle

      // Cosmic colors matching the background
      const isEven = index % 2 === 0
      const fillColor = isEven ? '#2d3561' : '#4a1859'  // Dark blue and deep purple
      const textColor = '#ffffff'  // White text for maximum contrast

      // Draw slice
      ctx.beginPath()
      ctx.moveTo(0, 0)
      ctx.arc(0, 0, radius, startAngle, endAngle)
      ctx.closePath()
      ctx.fillStyle = fillColor
      ctx.fill()

      // Draw border
      ctx.strokeStyle = '#fbbf24'  // Gold border
      ctx.lineWidth = 3
      ctx.stroke()

      // Draw text
      ctx.save()
      
      // Rotate to the middle of the slice
      const textAngle = startAngle + sliceAngle / 2
      ctx.rotate(textAngle)
      
      // Set text style - keep font size consistent
      ctx.fillStyle = textColor
      ctx.font = 'bold 16px Arial'
      ctx.textAlign = 'right'
      ctx.textBaseline = 'middle'
      
      // Add text shadow for readability
      ctx.shadowColor = 'rgba(0, 0, 0, 0.8)'
      ctx.shadowBlur = 4
      ctx.shadowOffsetX = 2
      ctx.shadowOffsetY = 2
      
      // Position text closer to the edge
      const textRadius = radius * 0.88
      
      // Calculate max width based on slice angle to prevent text from spilling
      // The available width narrows as we move toward the edge
      const maxWidth = radius * 0.30
      
      // Try to fit text, truncating if necessary
      let displayText = prize.title
      let textWidth = ctx.measureText(displayText).width
      
      // If text is too wide, truncate with ellipsis
      if (textWidth > maxWidth) {
        while (displayText.length > 0 && textWidth > maxWidth) {
          displayText = displayText.substring(0, displayText.length - 1)
          textWidth = ctx.measureText(displayText + '...').width
        }
        displayText = displayText + '...'
      }
      
      // Draw the text at the calculated position
      ctx.fillText(displayText, textRadius, 0)
      
      ctx.restore()
    })

    // Draw center circle
    ctx.beginPath()
    ctx.arc(0, 0, 30, 0, 2 * Math.PI)
    ctx.fillStyle = '#d4af37'
    ctx.fill()

    ctx.restore()

    // Draw pointer/arrow at top
    ctx.fillStyle = '#d4af37'
    ctx.beginPath()
    ctx.moveTo(centerX, 10)
    ctx.lineTo(centerX - 15, 40)
    ctx.lineTo(centerX + 15, 40)
    ctx.closePath()
    ctx.fill()
    
  }, [prizes, rotation])

  // Handle spinning animation
  useEffect(() => {
    if (!isSpinning || !selectedPrizeId) {
      // Stop spinning sound when not spinning
      if (spinSoundNodesRef.current && soundEffectsRef.current) {
        soundEffectsRef.current.stopSpinSound(spinSoundNodesRef.current)
        spinSoundNodesRef.current = null
      }
      return
    }

    // Start spinning sound
    if (soundEffectsRef.current) {
      spinSoundNodesRef.current = soundEffectsRef.current.playSpinSound(1)
    }

    // Find the index of the selected prize
    const selectedIndex = prizes.findIndex(p => p.id === selectedPrizeId)
    if (selectedIndex === -1) return

    // Calculate target rotation
    const sliceAngle = 360 / prizes.length
    
    // Calculate the initial angle of the selected prize's center
    // Prize 0 starts at 0° (right), its center is at sliceAngle/2
    // Prize 1 center is at sliceAngle + sliceAngle/2, etc.
    const prizeCenterAngle = selectedIndex * sliceAngle + sliceAngle / 2
    
    // The arrow is drawn at the top of the canvas (270 degrees)
    // Try the opposite operation - maybe rotation moves prizes the other way
    const rotationNeeded = 270 - prizeCenterAngle
    
    // Add multiple full rotations (5-7 spins) for dramatic effect
    const fullRotations = Math.floor(5 + Math.random() * 3)  // Now returns 5, 6, or 7
    
    // Calculate final target rotation
    // We want: (targetRotation % 360) = (rotationNeeded % 360)
    // Starting from current rotation, remove the current angle, add full spins, then add needed rotation
    const normalizedNeeded = ((rotationNeeded % 360) + 360) % 360  // Ensure positive
    const currentNormalized = ((rotation % 360) + 360) % 360
    const targetRotation = rotation - currentNormalized + (360 * fullRotations) + normalizedNeeded

    // Animation settings
    const duration = 5000 // 5 seconds
    const startTime = Date.now()
    const startRotation = rotation

    const animate = () => {
      const now = Date.now()
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)

      // Ease-out cubic for smooth deceleration
      const easeProgress = 1 - Math.pow(1 - progress, 3)
      const currentRotation = startRotation + (targetRotation - startRotation) * easeProgress

      setRotation(currentRotation)
      
      // Play tick sound
      playTickSound(currentRotation)
      
      // Adjust spin sound based on speed (slower = lower frequency)
      if (spinSoundNodesRef.current && progress > 0.5) {
        const slowdownProgress = (progress - 0.5) / 0.5
        const speed = 1 - slowdownProgress * 0.8 // Gradually decrease speed
        
        // Update oscillator frequency to simulate slowdown
        const baseFreq = 100
        const maxFreq = 300
        spinSoundNodesRef.current.oscillator.frequency.value = baseFreq + (speed * (maxFreq - baseFreq))
        
        // Decrease volume as it slows
        spinSoundNodesRef.current.gainNode.gain.value = 0.05 * (1 - slowdownProgress * 0.5)
      }

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate)
      } else {
        // Animation complete - stop spinning sound and play win sound
        if (spinSoundNodesRef.current && soundEffectsRef.current) {
          soundEffectsRef.current.stopSpinSound(spinSoundNodesRef.current)
          spinSoundNodesRef.current = null
        }
        
        if (soundEffectsRef.current) {
          soundEffectsRef.current.playWinSound()
        }
        
        if (onSpinComplete) {
          onSpinComplete()
        }
      }
    }

    animationRef.current = requestAnimationFrame(animate)

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
      if (spinSoundNodesRef.current && soundEffectsRef.current) {
        soundEffectsRef.current.stopSpinSound(spinSoundNodesRef.current)
        spinSoundNodesRef.current = null
      }
    }
  }, [isSpinning, selectedPrizeId, prizes, onSpinComplete, playTickSound])

  if (prizes.length === 0) {
    return (
      <div className="flex items-center justify-center h-[500px] text-gold-500">
        <p>Loading prizes...</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-4 animate-[fadeInScale_1s_ease-out]">
      <canvas
        ref={canvasRef}
        width={700}
        height={700}
        className="max-w-full h-auto"
      />
    </div>
  )
}
