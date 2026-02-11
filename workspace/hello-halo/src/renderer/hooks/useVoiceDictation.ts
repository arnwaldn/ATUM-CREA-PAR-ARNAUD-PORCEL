/**
 * useVoiceDictation - Hook for speech-to-text via microphone
 *
 * Strategy:
 * 1. Try Web Speech API (built into Chromium, free, real-time)
 *    - If it fails immediately (common in Electron), auto-fallback to Whisper
 * 2. Fallback: OpenAI Whisper API via IPC (requires OpenAI-compatible API key)
 *
 * States: idle -> recording -> (transcribing) -> idle
 */

import { useState, useRef, useCallback, useEffect } from 'react'
import { api } from '../api'

export type VoiceDictationState = 'idle' | 'recording' | 'transcribing'

// Web Speech API types (not in all TS libs)
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList
  resultIndex: number
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string
  message?: string
}

interface SpeechRecognitionInstance extends EventTarget {
  continuous: boolean
  interimResults: boolean
  lang: string
  start(): void
  stop(): void
  abort(): void
  onresult: ((event: SpeechRecognitionEvent) => void) | null
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null
  onend: (() => void) | null
  onstart: (() => void) | null
}

declare global {
  interface Window {
    SpeechRecognition?: new () => SpeechRecognitionInstance
    webkitSpeechRecognition?: new () => SpeechRecognitionInstance
  }
}

function getSpeechRecognitionClass(): (new () => SpeechRecognitionInstance) | null {
  return window.SpeechRecognition || window.webkitSpeechRecognition || null
}

function toBcp47(lang?: string): string {
  if (!lang) return 'fr-FR'
  const map: Record<string, string> = {
    en: 'en-US', fr: 'fr-FR', de: 'de-DE', es: 'es-ES',
    ja: 'ja-JP', zh: 'zh-CN', it: 'it-IT', pt: 'pt-BR',
    ko: 'ko-KR', nl: 'nl-NL', ru: 'ru-RU', ar: 'ar-SA',
  }
  return map[lang] || lang
}

// Remember if Web Speech API failed so we don't retry every time
let webSpeechKnownBroken = false

interface UseVoiceDictationOptions {
  onTranscript: (text: string) => void
  onError?: (error: string) => void
  language?: string
}

interface UseVoiceDictationReturn {
  state: VoiceDictationState
  startRecording: () => Promise<void>
  stopRecording: () => void
  toggleRecording: () => void
  isRecording: boolean
  isTranscribing: boolean
  error: string | null
}

export function useVoiceDictation({
  onTranscript,
  onError,
  language
}: UseVoiceDictationOptions): UseVoiceDictationReturn {
  const [state, setState] = useState<VoiceDictationState>('idle')
  const [error, setError] = useState<string | null>(null)

  // Web Speech API refs
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null)
  const transcriptRef = useRef<string>('')
  const startTimeRef = useRef<number>(0)
  const webSpeechFailedRef = useRef<boolean>(false)

  // Whisper fallback refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const streamRef = useRef<MediaStream | null>(null)

  const modeRef = useRef<'speech-api' | 'whisper' | null>(null)

  // Callback refs to avoid stale closures
  const onTranscriptRef = useRef(onTranscript)
  const onErrorRef = useRef(onError)
  onTranscriptRef.current = onTranscript
  onErrorRef.current = onError

  const cleanupWhisper = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    mediaRecorderRef.current = null
    chunksRef.current = []
  }, [])

  const cleanupWebSpeech = useCallback(() => {
    if (recognitionRef.current) {
      try { recognitionRef.current.abort() } catch { /* ignore */ }
      recognitionRef.current = null
    }
    transcriptRef.current = ''
  }, [])

  const cleanup = useCallback(() => {
    cleanupWebSpeech()
    cleanupWhisper()
    modeRef.current = null
  }, [cleanupWebSpeech, cleanupWhisper])

  useEffect(() => {
    return () => { cleanup() }
  }, [cleanup])

  // =========================================================================
  // Whisper API (primary method — reliable in Electron)
  // =========================================================================
  const startWhisper = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          sampleRate: 16000,
          echoCancellation: true,
          noiseSuppression: true,
        }
      })
      streamRef.current = stream

      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : MediaRecorder.isTypeSupported('audio/webm')
          ? 'audio/webm'
          : MediaRecorder.isTypeSupported('audio/ogg;codecs=opus')
            ? 'audio/ogg;codecs=opus'
            : 'audio/webm'

      const mediaRecorder = new MediaRecorder(stream, { mimeType })
      mediaRecorderRef.current = mediaRecorder
      chunksRef.current = []
      modeRef.current = 'whisper'

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: mimeType })
        stream.getTracks().forEach(track => track.stop())
        streamRef.current = null

        if (audioBlob.size < 1000) {
          setState('idle')
          cleanupWhisper()
          modeRef.current = null
          return
        }

        setState('transcribing')

        try {
          const arrayBuffer = await audioBlob.arrayBuffer()
          const audioData = Array.from(new Uint8Array(arrayBuffer))

          const result = await api.transcribeAudio({ audioData, mimeType, language })

          if (result.success && result.data?.text) {
            const trimmedText = result.data.text.trim()
            if (trimmedText) {
              onTranscriptRef.current(trimmedText)
            }
          } else if (!result.success) {
            const errMsg = result.error || 'Transcription failed'
            setError(errMsg)
            onErrorRef.current?.(errMsg)
          }
        } catch (err) {
          const errMsg = err instanceof Error ? err.message : 'Transcription error'
          setError(errMsg)
          onErrorRef.current?.(errMsg)
        } finally {
          setState('idle')
          cleanupWhisper()
          modeRef.current = null
        }
      }

      mediaRecorder.onerror = () => {
        const errMsg = 'Recording failed'
        setError(errMsg)
        onErrorRef.current?.(errMsg)
        setState('idle')
        cleanupWhisper()
        modeRef.current = null
      }

      mediaRecorder.start(250)
      setState('recording')
    } catch (err) {
      const errMsg = err instanceof Error
        ? (err.name === 'NotAllowedError'
          ? 'Microphone access denied. Please allow microphone access.'
          : err.message)
        : 'Failed to access microphone'
      setError(errMsg)
      onErrorRef.current?.(errMsg)
      setState('idle')
      cleanupWhisper()
      modeRef.current = null
    }
  }, [language, cleanupWhisper])

  // =========================================================================
  // Web Speech API (attempted first, but may not work in Electron)
  // =========================================================================
  const startWebSpeech = useCallback((): Promise<boolean> => {
    return new Promise((resolve) => {
      if (webSpeechKnownBroken) {
        resolve(false)
        return
      }

      const SpeechRecognition = getSpeechRecognitionClass()
      if (!SpeechRecognition) {
        resolve(false)
        return
      }

      const recognition = new SpeechRecognition()
      recognition.continuous = true
      recognition.interimResults = false
      recognition.lang = toBcp47(language)

      transcriptRef.current = ''
      startTimeRef.current = Date.now()
      webSpeechFailedRef.current = false

      let resolved = false
      const resolveOnce = (value: boolean) => {
        if (!resolved) {
          resolved = true
          resolve(value)
        }
      }

      recognition.onstart = () => {
        console.log('[Voice] Web Speech API started, lang:', recognition.lang)
        modeRef.current = 'speech-api'
        setState('recording')
        // Successfully started — resolve true
        resolveOnce(true)
      }

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let finalText = ''
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i]
          if (result.isFinal) {
            finalText += result[0].transcript
          }
        }
        if (finalText) {
          transcriptRef.current += (transcriptRef.current ? ' ' : '') + finalText
        }
      }

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.warn('[Voice] Web Speech API error:', event.error)

        if (event.error === 'not-allowed') {
          // Mic permission denied — this is a real user error, don't fallback
          const errMsg = 'Microphone access denied. Please allow microphone access.'
          setError(errMsg)
          onErrorRef.current?.(errMsg)
          setState('idle')
          recognitionRef.current = null
          modeRef.current = null
          resolveOnce(true) // true = we handled it, don't try Whisper
          return
        }

        // For network, aborted, service-not-allowed, etc: mark as failed
        webSpeechFailedRef.current = true
      }

      recognition.onend = () => {
        const elapsed = Date.now() - startTimeRef.current
        const hadFail = webSpeechFailedRef.current
        const text = transcriptRef.current.trim()

        recognitionRef.current = null
        transcriptRef.current = ''
        modeRef.current = null

        // If it ended too quickly (< 1.5s) or had an error — Web Speech doesn't work
        if (elapsed < 1500 || (hadFail && !text)) {
          console.log(`[Voice] Web Speech API ended too quickly (${elapsed}ms) or error — marking broken`)
          webSpeechKnownBroken = true
          setState('idle')
          resolveOnce(false) // false = try Whisper instead
          return
        }

        // Normal end with transcript
        if (text) {
          onTranscriptRef.current(text)
        }
        setState('idle')
      }

      recognitionRef.current = recognition

      try {
        recognition.start()
        // If start() succeeds without throwing, we wait for onstart or onend to resolve
        // Timeout: if nothing happens in 3 seconds, give up
        setTimeout(() => {
          if (!resolved) {
            console.log('[Voice] Web Speech API timeout — marking broken')
            webSpeechKnownBroken = true
            try { recognition.abort() } catch { /* ignore */ }
            recognitionRef.current = null
            modeRef.current = null
            resolveOnce(false)
          }
        }, 3000)
      } catch (err) {
        console.error('[Voice] Failed to start Web Speech API:', err)
        recognitionRef.current = null
        resolveOnce(false)
      }
    })
  }, [language])

  // =========================================================================
  // Public API
  // =========================================================================
  const startRecording = useCallback(async () => {
    setError(null)

    // Try Web Speech API first (free, no API key needed)
    const webSpeechWorked = await startWebSpeech()
    if (webSpeechWorked) return

    // Fallback to Whisper API
    console.log('[Voice] Using Whisper API for transcription')
    await startWhisper()
  }, [startWebSpeech, startWhisper])

  const stopRecording = useCallback(() => {
    if (modeRef.current === 'speech-api' && recognitionRef.current) {
      recognitionRef.current.stop()
    } else if (modeRef.current === 'whisper' && mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop()
    }
  }, [])

  const toggleRecording = useCallback(() => {
    if (state === 'recording') {
      stopRecording()
    } else if (state === 'idle') {
      startRecording()
    }
  }, [state, startRecording, stopRecording])

  return {
    state,
    startRecording,
    stopRecording,
    toggleRecording,
    isRecording: state === 'recording',
    isTranscribing: state === 'transcribing',
    error,
  }
}
