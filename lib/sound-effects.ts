/**
 * Sound Effects Utility
 * Generates sound effects using Web Audio API
 */

class SoundEffects {
  private audioContext: AudioContext | null = null

  constructor() {
    if (typeof window !== 'undefined') {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    }
  }

  /**
   * Play a tick sound - short pleasant click for each segment
   */
  playTick() {
    if (!this.audioContext) return

    const oscillator = this.audioContext.createOscillator()
    const gainNode = this.audioContext.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(this.audioContext.destination)

    oscillator.frequency.value = 600  // Softer, lower frequency
    oscillator.type = 'sine'  // Smooth sine wave

    gainNode.gain.setValueAtTime(0.05, this.audioContext.currentTime)  // Reduced volume
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.08)

    oscillator.start(this.audioContext.currentTime)
    oscillator.stop(this.audioContext.currentTime + 0.08)
  }

  /**
   * Play spinning sound - pleasant continuous tone that varies with speed
   */
  playSpinSound(speed: number = 1) {
    if (!this.audioContext) return null

    const oscillator = this.audioContext.createOscillator()
    const gainNode = this.audioContext.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(this.audioContext.destination)

    // Frequency varies with speed - more musical range
    oscillator.frequency.value = 200 + (speed * 150)
    oscillator.type = 'triangle'  // Softer, more pleasant than sawtooth

    gainNode.gain.setValueAtTime(0.03, this.audioContext.currentTime)  // Lower volume

    oscillator.start(this.audioContext.currentTime)

    return { oscillator, gainNode }
  }

  /**
   * Stop spinning sound
   */
  stopSpinSound(nodes: { oscillator: OscillatorNode; gainNode: GainNode } | null) {
    if (!nodes || !this.audioContext) return

    const { oscillator, gainNode } = nodes
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.2)
    oscillator.stop(this.audioContext.currentTime + 0.2)
  }

  /**
   * Play win sound - pleasant celebratory ascending tones
   */
  playWinSound() {
    if (!this.audioContext) return

    // Major chord progression - C, E, G, C (more harmonious)
    const notes = [523.25, 659.25, 783.99, 1046.50] // C5, E5, G5, C6

    notes.forEach((frequency, index) => {
      const oscillator = this.audioContext!.createOscillator()
      const gainNode = this.audioContext!.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(this.audioContext!.destination)

      oscillator.frequency.value = frequency
      oscillator.type = 'sine'  // Keep sine for pure, pleasant tones

      const startTime = this.audioContext!.currentTime + (index * 0.12)
      const endTime = startTime + 0.4

      gainNode.gain.setValueAtTime(0, startTime)
      gainNode.gain.linearRampToValueAtTime(0.15, startTime + 0.01)  // Softer volume
      gainNode.gain.exponentialRampToValueAtTime(0.01, endTime)

      oscillator.start(startTime)
      oscillator.stop(endTime)
    })
  }

  /**
   * Play clapping sound - simulates applause with multiple short bursts of noise
   */
  playClappingSound() {
    if (!this.audioContext) return

    // Create multiple clap sounds to simulate applause
    const clapTimes = [0, 0.15, 0.25, 0.4, 0.5, 0.65, 0.75, 0.9, 1.05, 1.2]
    
    clapTimes.forEach((time) => {
      // Create white noise for clapping effect
      const bufferSize = this.audioContext!.sampleRate * 0.05 // 50ms of noise
      const buffer = this.audioContext!.createBuffer(1, bufferSize, this.audioContext!.sampleRate)
      const data = buffer.getChannelData(0)
      
      // Generate noise with varying intensity
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * 0.3
      }
      
      const noise = this.audioContext!.createBufferSource()
      noise.buffer = buffer
      
      const filter = this.audioContext!.createBiquadFilter()
      filter.type = 'bandpass'
      filter.frequency.value = 1000 + (Math.random() * 500) // Vary frequency
      filter.Q.value = 1
      
      const gainNode = this.audioContext!.createGain()
      const startTime = this.audioContext!.currentTime + time
      
      // Quick attack and decay for clap sound
      gainNode.gain.setValueAtTime(0, startTime)
      gainNode.gain.linearRampToValueAtTime(0.2 + (Math.random() * 0.1), startTime + 0.01)
      gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.05)
      
      noise.connect(filter)
      filter.connect(gainNode)
      gainNode.connect(this.audioContext!.destination)
      
      noise.start(startTime)
      noise.stop(startTime + 0.05)
    })
  }
}

export default SoundEffects
