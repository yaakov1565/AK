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
   * Play a tick sound - short click for each segment
   */
  playTick() {
    if (!this.audioContext) return

    const oscillator = this.audioContext.createOscillator()
    const gainNode = this.audioContext.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(this.audioContext.destination)

    oscillator.frequency.value = 800
    oscillator.type = 'sine'

    gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.05)

    oscillator.start(this.audioContext.currentTime)
    oscillator.stop(this.audioContext.currentTime + 0.05)
  }

  /**
   * Play spinning sound - continuous tone that varies with speed
   */
  playSpinSound(speed: number = 1) {
    if (!this.audioContext) return null

    const oscillator = this.audioContext.createOscillator()
    const gainNode = this.audioContext.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(this.audioContext.destination)

    // Frequency varies with speed
    oscillator.frequency.value = 100 + (speed * 200)
    oscillator.type = 'sawtooth'

    gainNode.gain.setValueAtTime(0.05, this.audioContext.currentTime)

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
   * Play win sound - celebratory ascending tones
   */
  playWinSound() {
    if (!this.audioContext) return

    const notes = [523.25, 659.25, 783.99, 1046.50] // C5, E5, G5, C6

    notes.forEach((frequency, index) => {
      const oscillator = this.audioContext!.createOscillator()
      const gainNode = this.audioContext!.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(this.audioContext!.destination)

      oscillator.frequency.value = frequency
      oscillator.type = 'sine'

      const startTime = this.audioContext!.currentTime + (index * 0.15)
      const endTime = startTime + 0.3

      gainNode.gain.setValueAtTime(0, startTime)
      gainNode.gain.linearRampToValueAtTime(0.2, startTime + 0.01)
      gainNode.gain.exponentialRampToValueAtTime(0.01, endTime)

      oscillator.start(startTime)
      oscillator.stop(endTime)
    })
  }
}

export default SoundEffects
