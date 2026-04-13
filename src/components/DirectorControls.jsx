import { motion } from 'framer-motion'

const OFFICER_NAMES = {
  WM:    'Worshipful Master',
  SW:    'Senior Warden',
  JW:    'Junior Warden',
  SD:    'Senior Deacon',
  JD:    'Junior Deacon',
  SS:    'Senior Steward',
  JS:    'Junior Steward',
  SEC:   'Secretary',
  TREAS: 'Treasurer',
  CHAP:  'Chaplain',
  TYL:   'Tyler',
  LEC:   'Lecturer',
  MAR:   'Marshal',
  JMC:   'Junior Master of Ceremonies',
  SMC:   'Senior Master of Ceremonies',
  ALL:   'All Officers',
}

// SVG icons for controls
function IconBack() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <polyline points="11,4 6,9 11,14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="4" y1="9" x2="5.5" y2="9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

function IconNext() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <polyline points="7,4 12,9 7,14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="14" y1="9" x2="12.5" y2="9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

function IconPlay() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <polygon points="7,4 16,10 7,16" fill="currentColor" />
    </svg>
  )
}

function IconPause() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <rect x="5" y="4" width="3.5" height="12" rx="1" fill="currentColor" />
      <rect x="11.5" y="4" width="3.5" height="12" rx="1" fill="currentColor" />
    </svg>
  )
}

export default function DirectorControls({
  beatIndex,
  totalBeats,
  currentBeat,
  isPlaying,
  onPrev,
  onNext,
  onPlayPause,
}) {
  const officerCode = currentBeat?.officer ?? '—'
  const officerName = OFFICER_NAMES[officerCode] ?? officerCode
  const beatNumber = beatIndex + 1

  return (
    <div
      className="flex-shrink-0 border-t"
      style={{
        borderColor: 'rgba(42,63,107,0.6)',
        background: 'linear-gradient(to bottom, rgba(7,15,31,0.96), rgba(3,9,19,0.98))',
      }}
    >
      {/* Progress bar */}
      <div className="h-0.5 w-full" style={{ background: 'rgba(42,63,107,0.4)' }}>
        <motion.div
          className="h-full"
          style={{ background: 'linear-gradient(to right, #a07c2e, #f0c040, #a07c2e)' }}
          animate={{ width: `${(beatNumber / totalBeats) * 100}%` }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        />
      </div>

      <div className="flex items-center justify-between px-6 py-3 gap-4">
        {/* Beat counter */}
        <div className="flex-1 min-w-0">
          <div
            className="font-cinzel text-xs tracking-widest mb-0.5"
            style={{ color: 'rgba(201,168,76,0.5)' }}
          >
            BEAT
          </div>
          <div
            className="font-cinzel text-sm font-semibold"
            style={{ color: '#c9a84c' }}
          >
            {beatNumber}{' '}
            <span style={{ color: 'rgba(201,168,76,0.4)', fontWeight: 400 }}>
              of {totalBeats}
            </span>
          </div>
        </div>

        {/* Playback controls */}
        <div className="flex items-center gap-2">
          {/* Back */}
          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.94 }}
            onClick={onPrev}
            disabled={beatIndex === 0}
            className="flex items-center justify-center rounded-full w-9 h-9 border transition-colors disabled:opacity-30"
            style={{
              borderColor: 'rgba(42,63,107,0.8)',
              color: '#6a85b0',
              background: 'rgba(11,20,38,0.5)',
            }}
          >
            <IconBack />
          </motion.button>

          {/* Play / Pause */}
          <motion.button
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.92 }}
            onClick={onPlayPause}
            className="flex items-center justify-center rounded-full w-12 h-12 border"
            style={{
              borderColor: isPlaying ? '#c9a84c' : 'rgba(201,168,76,0.4)',
              color: '#f0c040',
              background: isPlaying
                ? 'rgba(201,168,76,0.12)'
                : 'rgba(11,20,38,0.6)',
              boxShadow: isPlaying
                ? '0 0 16px rgba(201,168,76,0.25)'
                : 'none',
              transition: 'all 0.2s ease',
            }}
          >
            {isPlaying ? <IconPause /> : <IconPlay />}
          </motion.button>

          {/* Next */}
          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.94 }}
            onClick={onNext}
            disabled={beatIndex >= totalBeats - 1}
            className="flex items-center justify-center rounded-full w-9 h-9 border transition-colors disabled:opacity-30"
            style={{
              borderColor: 'rgba(42,63,107,0.8)',
              color: '#6a85b0',
              background: 'rgba(11,20,38,0.5)',
            }}
          >
            <IconNext />
          </motion.button>
        </div>

        {/* Active officer */}
        <div className="flex-1 min-w-0 text-right">
          <div
            className="font-cinzel text-xs tracking-widest mb-0.5"
            style={{ color: 'rgba(201,168,76,0.5)' }}
          >
            OFFICER
          </div>
          <motion.div
            key={officerCode}
            initial={{ opacity: 0, x: 6 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.25 }}
            className="font-cinzel text-sm font-semibold truncate"
            style={{ color: '#f0c040' }}
          >
            {officerName}
          </motion.div>
          {officerCode !== 'ALL' && (
            <div
              className="font-cinzel text-xs"
              style={{ color: 'rgba(201,168,76,0.4)' }}
            >
              [{officerCode}]
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
