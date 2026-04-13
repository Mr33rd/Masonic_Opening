import { useState, useRef, useEffect } from 'react'
import { VOICE_MAP } from '../lib/voiceMap'

function IconSpeaker({ muted }) {
  return muted ? (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M3 6.5H6L10 3v12l-4-3.5H3V6.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" fill="none" />
      <line x1="13" y1="6" x2="17" y2="12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="17" y1="6" x2="13" y2="12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ) : (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M3 6.5H6L10 3v12l-4-3.5H3V6.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" fill="none" />
      <path d="M12.5 5.5a4 4 0 0 1 0 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      <path d="M14.2 3.5a7 7 0 0 1 0 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none" />
    </svg>
  )
}

function IconSettings() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <circle cx="7" cy="7" r="2" stroke="currentColor" strokeWidth="1.3" />
      <path d="M7 1v1.5M7 11.5V13M13 7h-1.5M2.5 7H1M10.95 3.05l-1.06 1.06M4.11 9.89l-1.06 1.06M10.95 10.95l-1.06-1.06M4.11 4.11l-1.06-1.06"
        stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  )
}

const OFFICER_LABELS = {
  WM: 'Worshipful Master', SW: 'Senior Warden', JW: 'Junior Warden',
  SD: 'Senior Deacon',     JD: 'Junior Deacon', CHAP: 'Chaplain',
  TYL: 'Tyler',           SS: 'Senior Steward', JS: 'Junior Steward',
  SEC: 'Secretary',       TREAS: 'Treasurer',   LEC: 'Lecturer',
  MAR: 'Marshal',         JMC: 'Jr. Master of Ceremonies',
  SMC: 'Sr. Master of Ceremonies',
}

export default function VoiceControl({ isEnabled, isLoading, error, apiKey, onToggle, onSaveApiKey }) {
  const needsKey = !apiKey
  const [showSettings, setShowSettings] = useState(false)
  const [draftKey, setDraftKey]         = useState(apiKey)
  const [saved, setSaved]               = useState(false)
  const modalRef                        = useRef(null)

  // Sync draft when apiKey prop changes
  useEffect(() => { setDraftKey(apiKey) }, [apiKey])

  // Close on outside click
  useEffect(() => {
    if (!showSettings) return
    const handler = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) setShowSettings(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [showSettings])

  const handleSave = () => {
    onSaveApiKey(draftKey)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="relative flex items-center gap-1">

      {/* Loading pulse */}
      {isLoading && (
        <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#f0c040' }} />
      )}

      {/* Error or needs-key dot */}
      {!isLoading && (error || needsKey) && (
        <span
          title={error ?? 'Enter API key in settings'}
          className="w-1.5 h-1.5 rounded-full cursor-pointer"
          style={{ background: error ? '#e06060' : '#c9a84c', opacity: needsKey && !error ? 0.5 : 1 }}
          onClick={() => setShowSettings(true)}
        />
      )}

      {/* Speaker toggle */}
      <button
        onClick={onToggle}
        title={needsKey ? 'Add API key in settings to enable voiceover' : (isEnabled ? 'Mute voiceover' : 'Enable voiceover')}
        className="flex items-center justify-center w-8 h-8 rounded border transition-all"
        style={{
          color: isEnabled && !needsKey ? '#f0c040' : 'rgba(201,168,76,0.35)',
          borderColor: isEnabled && !needsKey ? 'rgba(201,168,76,0.5)' : 'rgba(42,63,107,0.6)',
          background: 'rgba(11,20,38,0.5)',
        }}
      >
        <IconSpeaker muted={!isEnabled || needsKey} />
      </button>

      {/* Settings button */}
      <button
        onClick={() => setShowSettings(s => !s)}
        title="Voice settings"
        className="flex items-center justify-center w-6 h-6 rounded border transition-all"
        style={{
          color: showSettings ? '#f0c040' : 'rgba(201,168,76,0.4)',
          borderColor: showSettings ? 'rgba(201,168,76,0.5)' : 'rgba(42,63,107,0.5)',
          background: showSettings ? 'rgba(201,168,76,0.08)' : 'rgba(11,20,38,0.4)',
        }}
      >
        <IconSettings />
      </button>

      {/* Settings modal */}
      {showSettings && (
        <div
          ref={modalRef}
          className="absolute right-0 top-10 z-50 rounded border shadow-xl"
          style={{
            width: '340px',
            background: 'rgba(3,9,19,0.98)',
            borderColor: 'rgba(42,63,107,0.8)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
          }}
        >
          {/* Header */}
          <div className="px-4 py-2.5 border-b flex items-center justify-between"
            style={{ borderColor: 'rgba(42,63,107,0.6)' }}>
            <span className="font-cinzel text-xs tracking-widest" style={{ color: '#c9a84c' }}>
              VOICE SETTINGS
            </span>
            <button onClick={() => setShowSettings(false)}
              className="text-xs" style={{ color: 'rgba(201,168,76,0.4)' }}>✕</button>
          </div>

          <div className="px-4 py-3 space-y-3">
            {/* API Key */}
            <div>
              <label className="font-cinzel text-xs tracking-widest block mb-1.5"
                style={{ color: needsKey ? '#f0c040' : 'rgba(201,168,76,0.6)' }}>
                ELEVENLABS API KEY{needsKey ? ' — required' : ''}
              </label>
              <div className="flex gap-2">
                <input
                  type="password"
                  value={draftKey}
                  onChange={e => setDraftKey(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSave()}
                  placeholder="sk-..."
                  className="flex-1 font-mono text-xs px-2 py-1.5 rounded border outline-none"
                  style={{
                    background: 'rgba(11,20,38,0.8)',
                    borderColor: error ? '#e0606088' : 'rgba(42,63,107,0.7)',
                    color: '#f0e6c8',
                  }}
                />
                <button
                  onClick={handleSave}
                  className="font-cinzel text-xs px-3 py-1.5 rounded border transition-all"
                  style={{
                    color: saved ? '#070f1f' : '#c9a84c',
                    borderColor: saved ? '#6abf6a' : 'rgba(201,168,76,0.5)',
                    background: saved ? '#6abf6a' : 'rgba(201,168,76,0.08)',
                  }}
                >
                  {saved ? '✓' : 'SAVE'}
                </button>
              </div>
              {error && (
                <p className="font-cinzel text-xs mt-1" style={{ color: '#e06060' }}>{error}</p>
              )}
              <p className="text-xs mt-1.5" style={{ color: 'rgba(201,168,76,0.35)' }}>
                Stored in browser localStorage only.
              </p>
            </div>

            {/* Voice roster */}
            <div>
              <div className="font-cinzel text-xs tracking-widest mb-2"
                style={{ color: 'rgba(201,168,76,0.6)' }}>
                OFFICER VOICES
              </div>
              <div className="space-y-0.5 max-h-56 overflow-y-auto pr-1"
                style={{ scrollbarWidth: 'thin' }}>
                {Object.entries(VOICE_MAP)
                  .filter(([code]) => code !== 'ALL')
                  .map(([code, { name, desc }]) => (
                    <div key={code}
                      className="flex items-center justify-between px-2 py-1 rounded"
                      style={{ background: 'rgba(42,63,107,0.15)' }}>
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="font-cinzel text-xs font-semibold flex-shrink-0"
                          style={{ color: '#f0c040', minWidth: '36px' }}>{code}</span>
                        <span className="text-xs truncate" style={{ color: 'rgba(240,230,200,0.6)' }}>
                          {OFFICER_LABELS[code] ?? code}
                        </span>
                      </div>
                      <div className="flex-shrink-0 text-right ml-2">
                        <span className="font-cinzel text-xs" style={{ color: '#c9a84c' }}>{name}</span>
                        <span className="text-xs ml-1" style={{ color: 'rgba(201,168,76,0.4)' }}>· {desc}</span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
