/**
 * useTextToSpeech - Hook for reading text aloud via SpeechSynthesis
 *
 * Uses the native Web Speech API (SpeechSynthesis) which works in Electron
 * with OS-native voices. Zero dependencies required.
 *
 * States: idle -> speaking -> idle
 */

import { useState, useRef, useCallback, useEffect } from 'react'

export type TextToSpeechState = 'idle' | 'speaking'

interface UseTextToSpeechOptions {
  /** Language hint for voice selection (BCP-47, e.g. 'en-US', 'fr-FR') */
  language?: string
  /** Speech rate (0.5 to 2, default 1) */
  rate?: number
  /** Speech pitch (0 to 2, default 1) */
  pitch?: number
}

interface UseTextToSpeechReturn {
  /** Current state */
  state: TextToSpeechState
  /** Start speaking the given text */
  speak: (text: string) => void
  /** Stop speaking */
  stop: () => void
  /** Toggle speaking for a given text */
  toggle: (text: string) => void
  /** True if currently speaking */
  isSpeaking: boolean
  /** True if SpeechSynthesis is supported */
  isSupported: boolean
}

/**
 * Strip markdown formatting from text for cleaner speech output.
 * Removes code blocks, inline code, bold, italic, links, images, headers, etc.
 */
function stripMarkdown(text: string): string {
  return text
    // Remove code blocks (```...```)
    .replace(/```[\s\S]*?```/g, '')
    // Remove inline code (`...`)
    .replace(/`([^`]+)`/g, '$1')
    // Remove images ![alt](url)
    .replace(/!\[.*?\]\(.*?\)/g, '')
    // Convert links [text](url) to just text
    .replace(/\[([^\]]+)\]\(.*?\)/g, '$1')
    // Remove bold/italic markers
    .replace(/\*\*\*(.+?)\*\*\*/g, '$1')
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/\*(.+?)\*/g, '$1')
    .replace(/___(.+?)___/g, '$1')
    .replace(/__(.+?)__/g, '$1')
    .replace(/_(.+?)_/g, '$1')
    // Remove headers (# ## ### etc.)
    .replace(/^#{1,6}\s+/gm, '')
    // Remove horizontal rules
    .replace(/^[-*_]{3,}\s*$/gm, '')
    // Remove blockquotes
    .replace(/^>\s+/gm, '')
    // Remove list markers
    .replace(/^[\s]*[-*+]\s+/gm, '')
    .replace(/^[\s]*\d+\.\s+/gm, '')
    // Collapse multiple newlines
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

export function useTextToSpeech({
  language,
  rate = 1,
  pitch = 1,
}: UseTextToSpeechOptions = {}): UseTextToSpeechReturn {
  const [state, setState] = useState<TextToSpeechState>('idle')
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)
  const isSupported = typeof window !== 'undefined' && 'speechSynthesis' in window

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (isSupported) {
        window.speechSynthesis.cancel()
      }
    }
  }, [isSupported])

  const stop = useCallback(() => {
    if (isSupported) {
      window.speechSynthesis.cancel()
    }
    utteranceRef.current = null
    setState('idle')
  }, [isSupported])

  const speak = useCallback((text: string) => {
    if (!isSupported || !text.trim()) return

    // Stop any current speech
    window.speechSynthesis.cancel()

    const cleanText = stripMarkdown(text)
    if (!cleanText) return

    const utterance = new SpeechSynthesisUtterance(cleanText)
    utterance.rate = rate
    utterance.pitch = pitch

    // Try to pick a voice matching the requested language
    if (language) {
      utterance.lang = language
      const voices = window.speechSynthesis.getVoices()
      const match = voices.find(v => v.lang.startsWith(language))
      if (match) {
        utterance.voice = match
      }
    }

    utterance.onstart = () => setState('speaking')
    utterance.onend = () => {
      utteranceRef.current = null
      setState('idle')
    }
    utterance.onerror = () => {
      utteranceRef.current = null
      setState('idle')
    }

    utteranceRef.current = utterance
    window.speechSynthesis.speak(utterance)
  }, [isSupported, language, rate, pitch])

  const toggle = useCallback((text: string) => {
    if (state === 'speaking') {
      stop()
    } else {
      speak(text)
    }
  }, [state, speak, stop])

  return {
    state,
    speak,
    stop,
    toggle,
    isSpeaking: state === 'speaking',
    isSupported,
  }
}
