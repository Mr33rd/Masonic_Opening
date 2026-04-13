import { useRef, useState, useCallback, useEffect } from 'react'

// In-memory cache: `${voiceId}:${text}` → blob URL
const audioCache = new Map()

export function useElevenLabs() {
  const [isLoading, setIsLoading]   = useState(false)
  const [error, setError]           = useState(null)
  const [isEnabled, setIsEnabled]   = useState(() => localStorage.getItem('voiceEnabled') !== 'false')
  const [apiKey, setApiKeyState]    = useState(
    () => localStorage.getItem('elevenLabsApiKey') || import.meta.env.VITE_ELEVENLABS_API_KEY || ''
  )
  const currentAudioRef             = useRef(null)
  const speakEndRef                 = useRef(null) // resolve fn for current speak Promise

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

  // stop() resolves any pending speak Promise so callers unblock immediately
  const stop = useCallback(() => {
    if (currentAudioRef.current) {
      currentAudioRef.current.pause()
      currentAudioRef.current = null
    }
    speakEndRef.current?.()
    speakEndRef.current = null
  }, [])

  // speak() returns a Promise that resolves when audio finishes (or is stopped/errors)
  const speak = useCallback(async (text, voiceId) => {
    if (!isEnabled || !apiKey || !text) return

    stop()
    setError(null)

    const cacheKey = `${voiceId}:${text}`

    try {
      setIsLoading(true)

      let audioUrl = audioCache.get(cacheKey)

      if (!audioUrl) {
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

        const blob = await response.blob()
        audioUrl = URL.createObjectURL(blob)
        audioCache.set(cacheKey, audioUrl)
      }

      setIsLoading(false)

      const audio = new Audio(audioUrl)
      currentAudioRef.current = audio

      // Wait until audio ends, is stopped externally, or errors
      await new Promise((resolve) => {
        speakEndRef.current = resolve
        audio.onended = () => {
          speakEndRef.current = null
          if (currentAudioRef.current === audio) currentAudioRef.current = null
          resolve()
        }
        audio.onerror = () => { speakEndRef.current = null; resolve() }
        audio.play().catch(() => { speakEndRef.current = null; resolve() })
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
