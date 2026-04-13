import { motion, AnimatePresence } from 'framer-motion'

const ACTION_LABELS = {
  speak:   { label: 'SPEAKING',  color: '#6a9ec8' },
  respond: { label: 'RESPONDING', color: '#7abf8a' },
  gavel:   { label: 'GAVEL',     color: '#f0c040' },
  move:    { label: 'MOVING',    color: '#c896e0' },
  salute:  { label: 'SALUTING',  color: '#e09060' },
}

// Small SVG gavel inline icon
function GavelBadge() {
  return (
    <svg width="16" height="18" viewBox="0 0 16 18" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
      <g transform="translate(8, 9) rotate(-30)">
        <rect x={-4.5} y={-7} width={9} height={6} rx="1.5" fill="#f0c040" />
        <rect x={-1.2} y={-1} width={2.4} height={8} rx="0.8" fill="#f0c040" />
      </g>
    </svg>
  )
}

export default function CuePanel({ currentBeat }) {
  if (!currentBeat) return null

  const actionInfo = ACTION_LABELS[currentBeat.action] ?? { label: currentBeat.action?.toUpperCase(), color: '#6a85b0' }
  const gavelCount = currentBeat.gavel ?? 0

  return (
    <div className="flex-shrink-0 px-6 py-3 border-t border-navy-600/40">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentBeat.beat}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="flex items-start gap-4"
        >
          {/* Action badge */}
          <div
            className="flex-shrink-0 mt-1 px-2 py-0.5 rounded text-xs font-cinzel tracking-widest border"
            style={{
              color: actionInfo.color,
              borderColor: `${actionInfo.color}40`,
              backgroundColor: `${actionInfo.color}12`,
            }}
          >
            {actionInfo.label}
          </div>

          {/* Cue text */}
          <p
            className="font-crimson text-xl leading-snug flex-1"
            style={{ color: '#f0e6c8', fontStyle: 'italic' }}
          >
            {currentBeat.cue}

            {/* Gavel icons inline */}
            {gavelCount > 0 && (
              <motion.span
                className="ml-2 inline-flex gap-1 items-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                {Array.from({ length: gavelCount }).map((_, i) => (
                  <motion.span
                    key={i}
                    initial={{ opacity: 0, scale: 0.6 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 + i * 0.18 }}
                  >
                    <GavelBadge />
                  </motion.span>
                ))}
              </motion.span>
            )}
          </p>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
