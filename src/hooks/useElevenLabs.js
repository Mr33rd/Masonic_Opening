import { useRef, useState, useCallback, useEffect } from 'react'
import { getAudioCtx } from '../lib/audioContext'

// Cache decoded AudioBuffers — only needs to be fetched once per text+voice
const audioBufferCache = new Map()

export function useElevenLabs() {
  const [isLoading, setIsLoading]   = useState(false)
  const [error, setError]           = useState(null)
  const [isEnabled, setIsEnabled]   = useState(() => localStorage.getItem('voiceEnabled') !== 'false')
  const [apiKey, setApiKeyState]    = useState(
    () => localStorage.getItem('elevenLabsApiKey') || import.meta.env.VITE_ELEVENLABS_API_KEY || ''
  )
  const currentSourceRef = useRef(null) // AudioBufferSourceNode
  const speakEndRef      = useRef(null) // resolve fn for current speak Promise

  const saveApiKey = useCallback((key) => {
    setApiKeyState(key)
    localStorage.setItem('elevenLabsApiKey', key.trim())
    setError(null)
  }, [])

  const toggleEnabled = useCallback(() => {
    setIsEnabled(prev => {
      const next = !prev
      localStorage.setItem('voiceEnabled', String(next))
      return next
    })
  }, [])

  const stop = useCallback(() => {
    if (currentSourceRef.current) {
      try { currentSourceRef.current.stop() } catch (_) {}
      currentSourceRef.current = null
    }
    speakEndRef.current?.()
    speakEndRef.current = null
  }, [])

  // Returns a Promise that resolves when the audio finishes playing (or is stopped).
  // Uses Web Audio API (AudioBufferSourceNode) so that after the AudioContext is
  // unlocked once by a user gesture, all subsequent calls — including those fired
  // from setTimeout — work on iOS/Android.
  const speak = useCallback(async (text, voiceId) => {
    if (!isEnabled || !apiKey || !text) return

    stop()
    setError(null)

    const cacheKey = `${voiceId}:${text}`

    try {
      setIsLoading(true)

      let audioBuffer = audioBufferCache.get(cacheKey)

      if (!audioBuffer) {
        const response = await fetch(
          `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
          {
            method: 'POST',
            headers: {
              Accept: 'audio/mpeg',
              'Content-Type': 'application/json',
              'xi-api-key': apiKey,
            },
            body: JSON.stringify({
              text,
              model_id: 'eleven_turbo_v2_5',
              voice_settings: { stability: 0.55, similarity_boost: 0.75 },
            }),
          }
        )

        if (!response.ok) {
          throw new Error(response.status === 401 ? 'Invalid API key' : `ElevenLabs error ${response.status}`)
        }

        const arrayBuf = await response.arrayBuffer()
        const ctx = getAudioCtx()
        audioBuffer = await ctx.decodeAudioData(arrayBuf)
        audioBufferCache.set(cacheKey, audioBuffer)
      }

      setIsLoading(false)

      const ctx = getAudioCtx()

      // Try to resume if suspended (will succeed if we're in or near a user-gesture chain)
      if (ctx.state === 'suspended') await ctx.resume()

      // If the context is still not running (user hasn't tapped yet on mobile),
      // fall back to an estimated timer so the ceremony doesn't rush ahead silently.
      if (ctx.state !== 'running') {
        const words = text.trim().split(/\s+/).length
        await new Promise(r => setTimeout(r, Math.max(2500, Math.round((words / 2.2) * 1000))))
        return
      }

      const source = ctx.createBufferSource()
      source.buffer = audioBuffer
      source.connect(ctx.destination)
      currentSourceRef.current = source

      await new Promise((resolve) => {
        speakEndRef.current = resolve
        source.onended = () => {
          speakEndRef.current = null
          if (currentSourceRef.current === source) currentSourceRef.current = null
          resolve()
        }
        source.start(0)
      })
    } catch (err) {
      setError(err.message)
      setIsLoading(false)
      console.error('ElevenLabs TTS:', err)
    }
  }, [isEnabled, apiKey, stop])

  useEffect(() => () => stop(), [stop])

  return { speak, stop, isLoading, error, isEnabled, toggleEnabled, apiKey, saveApiKey }
}
