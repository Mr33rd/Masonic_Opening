import { useState, useEffect, useRef, useCallback } from 'react'
import scriptData from './data/script.json'
import FloorPlan from './components/FloorPlan'
import CuePanel from './components/CuePanel'
import DirectorControls from './components/DirectorControls'
import VoiceControl from './components/VoiceControl'
import { useElevenLabs } from './hooks/useElevenLabs'
import { getVoice } from './lib/voiceMap'
import { expandAbbreviations } from './lib/expandAbbreviations'
import { playGavel } from './lib/gavelSound'
import { playSoundEffect } from './lib/soundEffects'
import { unlockAudio } from './lib/audioContext'

const OFFICERS = ['WM', 'SW', 'JW', 'SD', 'JD', 'SS', 'JS', 'SEC', 'TREAS', 'CHAP', 'TYL', 'LEC', 'MAR', 'JMC', 'SMC']
const initialPositions = Object.fromEntries(OFFICERS.map(k => [k, k]))

export default function App() {
  const [beatIndex, setBeatIndex]         = useState(0)
  const [isPlaying, setIsPlaying]         = useState(false)
  const [officerPositions, setOfficerPositions] = useState(initialPositions)
  const [pendingReturn, setPendingReturn] = useState(null)
  const [isEditMode, setIsEditMode]       = useState(false)
  const [editJson, setEditJson]           = useState('')
  const [copied, setCopied]               = useState(false)
  const timerRef = useRef(null)
  const { speak, stop, isLoading: voiceLoading, error: voiceError,
          isEnabled: voiceEnabled, toggleEnabled: toggleVoice,
          apiKey, saveApiKey } = useElevenLabs()

  const beats       = scriptData
  const currentBeat = beats[beatIndex]
  const totalBeats  = beats.length

  // Document-level fallback unlock (belt-and-suspenders alongside direct button calls)
  useEffect(() => {
    const handler = () => unlockAudio()
    document.addEventListener('touchstart', handler, { once: true })
    document.addEventListener('mousedown',  handler, { once: true })
    return () => {
      document.removeEventListener('touchstart', handler)
      document.removeEventListener('mousedown',  handler)
    }
  }, [])

  // Button handlers — call unlockAudio() SYNCHRONOUSLY before state updates
  // so Android Chrome links the AudioContext resume to the user gesture chain.
  const handlePlayPause = useCallback(() => {
    unlockAudio()
    setIsPlaying(p => !p)
  }, [])
  const handleNext = useCallback(() => {
    unlockAudio()
    setBeatIndex(p => Math.min(beats.length - 1, p + 1))
  }, [beats.length])
  const handlePrev = useCallback(() => {
    unlockAudio()
    setBeatIndex(p => Math.max(0, p - 1))
  }, [])
  const handleRestart = useCallback(() => {
    unlockAudio()
    setIsPlaying(false)
    setBeatIndex(0)
  }, [])

  // ── Beat processing (positions) ──────────────────────────────────────────
  useEffect(() => {
    const beat = beats[beatIndex]
    if (!beat) return
    setOfficerPositions(prev => {
      const next = { ...prev }
      if (beat.resetPositions) {
        Object.entries(beat.resetPositions).forEach(([off, station]) => { next[off] = station })
      }
      if (pendingReturn) {
        const { officer, homeStation } = pendingReturn
        if (!(beat.officer === officer && beat.action === 'move')) next[officer] = homeStation
      }
      if (beat.action === 'move' && beat.moveTo && beat.officer !== 'ALL') next[beat.officer] = beat.moveTo
      if (beat.secondaryOfficer && beat.secondaryMoveTo) next[beat.secondaryOfficer] = beat.secondaryMoveTo
      return next
    })
    if (beat.action === 'move' && beat.moveTo && beat.officer !== 'ALL')
      setPendingReturn({ officer: beat.officer, homeStation: beat.officer })
    else setPendingReturn(null)
  }, [beatIndex, beats])

  // ── Voice + auto-advance (combined so voice finishes before advancing) ────
  useEffect(() => {
    if (isEditMode) { stop(); return }

    const beat = beats[beatIndex]
    if (!beat) return

    // Only speak when an officer is actually delivering a line
    const isSpeechBeat = ['speak', 'respond'].includes(beat.action) && beat.officer !== 'ALL'

    let cancelled = false

    async function run() {
      // Only play audio when the ceremony is actively running.
      // Guarding here prevents AudioContext creation on mount (before any user gesture)
      // which would leave it suspended and break mobile audio unlock.
      if (isPlaying) {
        // Gavel strikes come first
        if (beat.gavel > 0) {
          await playGavel(beat.gavel, () => cancelled)
        }

        // Beat-specific sound effects
        if (beat.soundEffect) {
          await playSoundEffect(beat.soundEffect, () => cancelled)
        }

        if (cancelled) return

        // TTS — only for officer speech/response lines
        if (isSpeechBeat) {
          const { voiceId } = getVoice(beat.officer)
          await speak(expandAbbreviations(beat.cue), voiceId)
        }

        if (cancelled) return
      }

      if (!isPlaying || cancelled) return

      // Pause before auto-advancing.
      // Audio beats get a short breath gap; silent beats use their own duration.
      const hasAudio = isSpeechBeat || beat.gavel > 0 || !!beat.soundEffect
      const gap = hasAudio ? 700 : (beat.duration ?? 4000)
      await new Promise(r => { timerRef.current = setTimeout(r, gap) })

      if (!cancelled) {
        setBeatIndex(prev => {
          if (prev >= beats.length - 1) { setIsPlaying(false); return prev }
          return prev + 1
        })
      }
    }

    run()

    return () => {
      cancelled = true
      clearTimeout(timerRef.current)
      stop()
    }
  }, [beatIndex, isEditMode, isPlaying, speak, stop])

  // ── Edit mode position callback ───────────────────────────────────────────
  const handlePositionsChange = useCallback((positions) => {
    const json = JSON.stringify(positions, null, 2)
    setEditJson(json)
  }, [])

  const handleCopy = () => {
    navigator.clipboard.writeText(editJson).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div className="flex flex-col" style={{ height: '100vh', overflow: 'hidden' }}>

      {/* ── Header ── */}
      <header
        className="flex-shrink-0 flex items-center justify-between px-5 py-2 border-b"
        style={{
          borderColor: 'rgba(42,63,107,0.5)',
          background: 'linear-gradient(to bottom, rgba(3,9,19,0.98), rgba(7,15,31,0.95))',
        }}
      >
        <div className="flex items-center gap-3">
          <svg width="24" height="24" viewBox="0 0 26 26" fill="none">
            <path d="M13 2 L14.6 10.4 L22 13 L14.6 15.6 L13 24 L11.4 15.6 L4 13 L11.4 10.4 Z"
              fill="none" stroke="#c9a84c" strokeWidth="1.2" />
            <circle cx="13" cy="13" r="2.5" fill="#c9a84c" />
          </svg>
          <div>
            <h1 className="font-cinzel font-semibold tracking-widest text-base leading-tight"
              style={{ color: '#f0c040', letterSpacing: '0.22em' }}>
              LODGE DIRECTOR
            </h1>
            <p className="font-cinzel text-xs" style={{ color: 'rgba(201,168,76,0.45)', letterSpacing: '0.18em' }}>
              RITUAL OPENING
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Voiceover control */}
          <VoiceControl
            isEnabled={voiceEnabled}
            isLoading={voiceLoading}
            error={voiceError}
            apiKey={apiKey}
            onToggle={toggleVoice}
            onSaveApiKey={saveApiKey}
          />

          {/* Edit layout toggle */}
          <button
            onClick={() => { setIsEditMode(m => !m); setIsPlaying(false) }}
            className="font-cinzel text-xs px-3 py-1.5 rounded border tracking-widest transition-all"
            style={{
              color: isEditMode ? '#070f1f' : '#c9a84c',
              borderColor: isEditMode ? '#f0c040' : 'rgba(201,168,76,0.5)',
              background: isEditMode ? '#f0c040' : 'rgba(11,20,38,0.5)',
              letterSpacing: '0.15em',
            }}
          >
            {isEditMode ? '✓ DONE EDITING' : 'EDIT LAYOUT'}
          </button>

          {!isEditMode && (
            <div className="font-cinzel text-xs px-3 py-1 rounded border"
              style={{ color: 'rgba(201,168,76,0.6)', borderColor: 'rgba(42,63,107,0.7)', background: 'rgba(11,20,38,0.5)' }}>
              {beatIndex + 1} / {totalBeats}
            </div>
          )}
        </div>
      </header>

      {/* ── Edit mode banner ── */}
      {isEditMode && (
        <div className="flex-shrink-0 flex items-center justify-center gap-2 py-1.5 font-cinzel text-xs tracking-widest"
          style={{ background: 'rgba(240,192,64,0.1)', borderBottom: '1px solid rgba(240,192,64,0.25)', color: '#f0c040' }}>
          DRAG OFFICERS TO CORRECT POSITIONS
        </div>
      )}

      {/* ── Floor Plan ── */}
      <div className="flex-1 flex items-center justify-center min-h-0" style={{ padding: '4px 8px 0' }}>
        <FloorPlan
          currentBeat={isEditMode ? null : currentBeat}
          officerPositions={officerPositions}
          isEditMode={isEditMode}
          onPositionsChange={handlePositionsChange}
        />
      </div>

      {/* ── Edit mode: positions JSON panel ── */}
      {isEditMode ? (
        <div className="flex-shrink-0 border-t px-4 py-2"
          style={{ borderColor: 'rgba(42,63,107,0.5)', background: 'rgba(3,9,19,0.97)' }}>
          <div className="flex items-center justify-between mb-1">
            <span className="font-cinzel text-xs tracking-widest" style={{ color: 'rgba(201,168,76,0.6)' }}>
              POSITIONS — give this to Claude when done
            </span>
            <button
              onClick={handleCopy}
              className="font-cinzel text-xs px-3 py-1 rounded border transition-all"
              style={{
                color: copied ? '#070f1f' : '#c9a84c',
                borderColor: copied ? '#6abf6a' : 'rgba(201,168,76,0.5)',
                background: copied ? '#6abf6a' : 'rgba(11,20,38,0.5)',
              }}
            >
              {copied ? '✓ COPIED' : 'COPY JSON'}
            </button>
          </div>
          <textarea
            readOnly
            value={editJson}
            className="w-full font-mono text-xs rounded border px-2 py-1 resize-none"
            rows={4}
            style={{
              background: 'rgba(11,20,38,0.8)',
              borderColor: 'rgba(42,63,107,0.6)',
              color: '#c9a84c',
              outline: 'none',
            }}
          />
        </div>
      ) : (
        <>
          <CuePanel currentBeat={currentBeat} />
          <DirectorControls
            beatIndex={beatIndex}
            totalBeats={totalBeats}
            currentBeat={currentBeat}
            isPlaying={isPlaying}
            onPrev={handlePrev}
            onNext={handleNext}
            onPlayPause={handlePlayPause}
            onRestart={handleRestart}
          />
        </>
      )}
    </div>
  )
}
