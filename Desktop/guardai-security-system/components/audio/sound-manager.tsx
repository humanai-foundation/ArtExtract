"use client"

import type React from "react"

import { useEffect } from "react"

export class SoundManager {
  private audioContext: AudioContext | null = null
  private isInitialized = false

  async initialize() {
    if (this.isInitialized) return

    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      this.isInitialized = true
    } catch (error) {
      console.error("Failed to initialize audio context:", error)
    }
  }

  private createBeep(frequency: number, duration: number, volume = 0.3) {
    if (!this.audioContext) return

    const oscillator = this.audioContext.createOscillator()
    const gainNode = this.audioContext.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(this.audioContext.destination)

    oscillator.frequency.value = frequency
    oscillator.type = "sine"

    gainNode.gain.setValueAtTime(0, this.audioContext.currentTime)
    gainNode.gain.linearRampToValueAtTime(volume, this.audioContext.currentTime + 0.01)
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration)

    oscillator.start(this.audioContext.currentTime)
    oscillator.stop(this.audioContext.currentTime + duration)
  }

  playAlertBeep() {
    this.createBeep(800, 0.2, 0.4)
    setTimeout(() => this.createBeep(600, 0.2, 0.4), 300)
  }

  playHighPriorityAlert() {
    // Rapid beeping for high priority
    for (let i = 0; i < 3; i++) {
      setTimeout(() => this.createBeep(1000, 0.1, 0.5), i * 150)
    }
  }

  playSystemBeep() {
    this.createBeep(440, 0.1, 0.2)
  }

  playAccessGranted() {
    this.createBeep(523, 0.3, 0.3) // C note
    setTimeout(() => this.createBeep(659, 0.3, 0.3), 200) // E note
  }

  playAccessDenied() {
    this.createBeep(200, 0.5, 0.4)
  }
}

export const soundManager = new SoundManager()

export function SoundProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const initializeSound = async () => {
      await soundManager.initialize()
    }

    // Initialize on first user interaction
    const handleFirstInteraction = () => {
      initializeSound()
      document.removeEventListener("click", handleFirstInteraction)
      document.removeEventListener("keydown", handleFirstInteraction)
    }

    document.addEventListener("click", handleFirstInteraction)
    document.addEventListener("keydown", handleFirstInteraction)

    return () => {
      document.removeEventListener("click", handleFirstInteraction)
      document.removeEventListener("keydown", handleFirstInteraction)
    }
  }, [])

  return <>{children}</>
}
