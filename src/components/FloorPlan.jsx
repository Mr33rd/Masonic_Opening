import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect, useRef } from 'react'
import StickFigure from './StickFigure'

// ─── SVG canvas ───────────────────────────────────────────────────────────────
const VW = 740
const VH = 765

const R = { x: 58, y: 28, w: 622, h: 590 }

const rx  = (pct) => R.x + R.w * pct
const ry  = (pct) => R.y + R.h * pct

// ─── Station positions (set via Edit Layout mode by the user) ─────────────────
// LEC, MAR, JMC, SMC are approximate — use Edit Layout to drag them into place.
export const STATIONS = {
  WM:    { x: 369, y: 81  },
  SW:    { x: 369, y: 527 },
  JW:    { x: 657, y: 291 },
  SD:    { x: 221, y: 166 },
  JD:    { x: 498, y: 462 },
  SS:    { x: 589, y: 268 },
  JS:    { x: 589, y: 350 },
  SEC:   { x: 616, y: 82  },
  TREAS: { x: 125, y: 85  },
  CHAP:  { x: 524, y: 148 },
  TYL:   { x: 612, y: 706 },
  LEC:   { x: 291, y: 145 },
  MAR:   { x: 458, y: 149 },
  JMC:   { x: 326, y: 454 },
  SMC:   { x: 405, y: 457 },
  ALTAR: { x: rx(0.490), y: ry(0.415) },
}

const OFFICERS = ['WM', 'SW', 'JW', 'SD', 'JD', 'SS', 'JS', 'SEC', 'TREAS', 'CHAP', 'TYL', 'LEC', 'MAR', 'JMC', 'SMC']

// ─── Sub-components ───────────────────────────────────────────────────────────
function CornerBracket({ x, y, size = 16, flipX = false, flipY = false }) {
  return (
    <g transform={`translate(${x},${y}) scale(${flipX ? -1 : 1},${flipY ? -1 : 1})`}>
      <polyline points={`0,${size} 0,0 ${size},0`}
        fill="none" stroke="#c9a84c" strokeWidth="1.5"
        strokeLinecap="square" opacity="0.55" />
    </g>
  )
}

function HorizDais({ x, y, w, h }) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h}
        fill="rgba(201,168,76,0.07)" stroke="rgba(201,168,76,0.28)" strokeWidth="1" />
      <rect x={x+4} y={y+4} width={w-8} height={h-8}
        fill="none" stroke="rgba(201,168,76,0.13)" strokeWidth="0.7" />
      <rect x={x+9} y={y+9} width={w-18} height={h-18}
        fill="none" stroke="rgba(201,168,76,0.08)" strokeWidth="0.5" />
    </g>
  )
}

function SouthDais({ x, y, w, h }) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h}
        fill="rgba(201,168,76,0.07)" stroke="rgba(201,168,76,0.28)" strokeWidth="1" />
      <rect x={x+3} y={y+4} width={w-6} height={h-8}
        fill="none" stroke="rgba(201,168,76,0.12)" strokeWidth="0.6" />
    </g>
  )
}

function AltarSymbol({ x, y }) {
  return (
    <g transform={`translate(${x},${y})`}>
      <rect x={-18} y={-18} width={36} height={36}
        fill="rgba(11,20,38,0.9)" stroke="#c9a84c" strokeWidth="1" opacity="0.85" />
      <rect x={-10} y={-10} width={20} height={20}
        fill="none" stroke="#c9a84c" strokeWidth="0.8" opacity="0.5" transform="rotate(45)" />
      <circle cx={0} cy={0} r={3} fill="#c9a84c" opacity="0.75" />
      <text x={0} y={28} textAnchor="middle"
        fill="#c9a84c" fontSize="7" fontFamily="Cinzel, serif"
        opacity="0.45" letterSpacing="0.12em">ALTAR</text>
    </g>
  )
}

function GavelIcon({ x, y, size = 13, color = '#f0c040' }) {
  return (
    <g transform={`translate(${x},${y}) rotate(-35)`}>
      <rect x={-4.5} y={-size/2} width={9} height={size*0.55} rx="1.5" fill={color} />
      <rect x={-1.1} y={size*0.05} width={2.2} height={size*0.65} rx="0.7" fill={color} />
    </g>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function FloorPlan({ currentBeat, officerPositions, isEditMode, onPositionsChange }) {
  const activeOfficer = currentBeat?.officer
  const isAll         = activeOfficer === 'ALL'
  const gavelCount    = currentBeat?.gavel ?? 0
  const svgRef        = useRef(null)

  // Edit-mode drag positions (separate from beat-driven positions)
  const [editPos, setEditPos] = useState(
    () => Object.fromEntries(OFFICERS.map(k => [k, { x: Math.round(STATIONS[k].x), y: Math.round(STATIONS[k].y) }]))
  )

  // Emit updated positions JSON whenever editPos changes in edit mode
  useEffect(() => {
    if (isEditMode && onPositionsChange) {
      onPositionsChange(editPos)
    }
  }, [editPos, isEditMode, onPositionsChange])

  // When entering edit mode, snapshot current station positions
  useEffect(() => {
    if (isEditMode) {
      setEditPos(Object.fromEntries(
        OFFICERS.map(k => [k, { x: Math.round(STATIONS[k].x), y: Math.round(STATIONS[k].y) }])
      ))
    }
  }, [isEditMode])

  const getOfficerPos = (code) => {
    if (isEditMode) return editPos[code] ?? STATIONS[code]
    const key = officerPositions?.[code] ?? code
    return STATIONS[key] ?? STATIONS[code]
  }

  const activePos = (activeOfficer && activeOfficer !== 'ALL')
    ? getOfficerPos(activeOfficer)
    : STATIONS.WM

  const wmDaisW = 240, wmDaisH = 38
  const swDaisW = 220, swDaisH = 38
  const jwDaisW = 32,  jwDaisH = 88
  const jw = STATIONS.JW

  const westWallY = R.y + R.h
  const passX1    = rx(0.447)
  const passX2    = rx(0.553)
  const anteroomB = westWallY + 130

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${VW} ${VH}`}
      className="w-full h-full"
      style={{ maxHeight: '100%', cursor: isEditMode ? 'default' : 'default' }}
    >
      <defs>
        <radialGradient id="rg" cx="50%" cy="50%" r="58%">
          <stop offset="0%"   stopColor="#0f1e38" />
          <stop offset="100%" stopColor="#060e1c" />
        </radialGradient>
        <pattern id="xhatch" width="14" height="14" patternUnits="userSpaceOnUse">
          <line x1="0" y1="14" x2="14" y2="0"   stroke="rgba(201,168,76,0.035)" strokeWidth="0.5" />
          <line x1="-3" y1="3" x2="3" y2="-3"   stroke="rgba(201,168,76,0.035)" strokeWidth="0.5" />
          <line x1="11" y1="17" x2="17" y2="11" stroke="rgba(201,168,76,0.035)" strokeWidth="0.5" />
        </pattern>
      </defs>

      {/* Room floor */}
      <rect x={R.x} y={R.y} width={R.w} height={R.h} fill="url(#rg)" />
      <rect x={R.x} y={R.y} width={R.w} height={R.h} fill="url(#xhatch)" />

      {/* East dais (WM) */}
      <HorizDais x={rx(0.5) - wmDaisW/2} y={R.y} w={wmDaisW} h={wmDaisH} />

      {/* West dais (SW) */}
      <HorizDais x={rx(0.5) - swDaisW/2} y={westWallY - swDaisH} w={swDaisW} h={swDaisH} />

      {/* South dais (JW) */}
      <SouthDais x={R.x + R.w - jwDaisW} y={jw.y - jwDaisH/2} w={jwDaisW} h={jwDaisH} />

      {/* Bench rows — North (left) wall */}
      {Array.from({ length: 8 }).map((_, i) => {
        const by = ry(0.22) + i * 42
        if (by > ry(0.78)) return null
        return (
          <rect key={i} x={R.x + 2} y={by - 5} width={20} height={10}
            rx="1" fill="rgba(201,168,76,0.06)" stroke="rgba(201,168,76,0.18)" strokeWidth="0.7" />
        )
      })}

      {/* Compass labels */}
      <text x={rx(0.50)} y={ry(0.23)} textAnchor="middle"
        fill="#c9a84c" fontSize="14" fontFamily="Cinzel, serif"
        fontWeight="600" letterSpacing="0.18em" opacity="0.18">EAST</text>
      <text x={rx(0.50)} y={ry(0.78)} textAnchor="middle"
        fill="#c9a84c" fontSize="14" fontFamily="Cinzel, serif"
        fontWeight="600" letterSpacing="0.18em" opacity="0.18">WEST</text>
      <text x={rx(0.815)} y={jw.y + 5} textAnchor="middle"
        fill="#c9a84c" fontSize="12" fontFamily="Cinzel, serif"
        fontWeight="600" letterSpacing="0.16em" opacity="0.18">SOUTH</text>

      {/* Room border */}
      <rect x={R.x} y={R.y} width={R.w} height={R.h}
        fill="none" stroke="#2a3f6b" strokeWidth="2" />
      <rect x={R.x+8} y={R.y+8} width={R.w-16} height={R.h-16}
        fill="none" stroke="rgba(201,168,76,0.1)" strokeWidth="0.7" />
      <CornerBracket x={R.x+4}     y={R.y+4}     />
      <CornerBracket x={R.x+R.w-4} y={R.y+4}     flipX />
      <CornerBracket x={R.x+4}     y={R.y+R.h-4} flipY />
      <CornerBracket x={R.x+R.w-4} y={R.y+R.h-4} flipX flipY />

      {/* West wall door */}
      <line x1={passX1} y1={westWallY} x2={passX2} y2={westWallY}
        stroke="#060e1c" strokeWidth="3.5" />
      <path d={`M ${passX1} ${westWallY} A 68 68 0 0 0 ${passX2} ${westWallY}`}
        fill="none" stroke="rgba(201,168,76,0.18)" strokeWidth="0.8" strokeDasharray="3 3" />
      <line x1={passX1} y1={westWallY-8} x2={passX1} y2={westWallY+5}
        stroke="#2a3f6b" strokeWidth="1.8" />
      <line x1={passX2} y1={westWallY-8} x2={passX2} y2={westWallY+5}
        stroke="#2a3f6b" strokeWidth="1.8" />

      {/* Anteroom */}
      <line x1={R.x}     y1={westWallY} x2={R.x}     y2={anteroomB} stroke="#2a3f6b" strokeWidth="2" />
      <line x1={R.x+R.w} y1={westWallY} x2={R.x+R.w} y2={anteroomB} stroke="#2a3f6b" strokeWidth="2" />
      <line x1={R.x} y1={anteroomB} x2={R.x+R.w} y2={anteroomB} stroke="#2a3f6b" strokeWidth="2" />
      <line x1={passX1} y1={westWallY} x2={passX1} y2={anteroomB} stroke="#2a3f6b" strokeWidth="3" />
      <line x1={passX2} y1={westWallY} x2={passX2} y2={anteroomB} stroke="#2a3f6b" strokeWidth="3" />
      <text x={(R.x + passX1)/2} y={westWallY + 52} textAnchor="middle"
        fill="rgba(201,168,76,0.2)" fontSize="8.5" fontFamily="Cinzel, serif"
        letterSpacing="0.1em">PREPARATION ROOM</text>
      <text x={(passX2 + R.x + R.w)/2} y={westWallY + 52} textAnchor="middle"
        fill="rgba(201,168,76,0.2)" fontSize="8.5" fontFamily="Cinzel, serif"
        letterSpacing="0.1em">ANTEROOM</text>

      {/* Pillars */}
      <circle cx={rx(0.140)} cy={ry(0.855)} r={11}
        fill="rgba(11,20,38,0.8)" stroke="rgba(201,168,76,0.38)" strokeWidth="1.3" />
      <circle cx={rx(0.240)} cy={ry(0.855)} r={11}
        fill="rgba(11,20,38,0.8)" stroke="rgba(201,168,76,0.38)" strokeWidth="1.3" />
      <text x={rx(0.140)} y={ry(0.855)+4} textAnchor="middle"
        fill="rgba(201,168,76,0.45)" fontSize="8" fontFamily="Cinzel, serif">B</text>
      <text x={rx(0.240)} y={ry(0.855)+4} textAnchor="middle"
        fill="rgba(201,168,76,0.45)" fontSize="8" fontFamily="Cinzel, serif">J</text>

      {/* Flag poles */}
      <circle cx={rx(0.295)} cy={R.y+14} r={4}
        fill="none" stroke="rgba(201,168,76,0.28)" strokeWidth="1" />
      <line x1={rx(0.295)} y1={R.y+10} x2={rx(0.295)} y2={R.y-2}
        stroke="rgba(201,168,76,0.22)" strokeWidth="0.8" />
      <circle cx={rx(0.705)} cy={R.y+14} r={4}
        fill="none" stroke="rgba(201,168,76,0.28)" strokeWidth="1" />
      <line x1={rx(0.705)} y1={R.y+10} x2={rx(0.705)} y2={R.y-2}
        stroke="rgba(201,168,76,0.22)" strokeWidth="0.8" />

      {/* Three Lesser Lights */}
      {[[rx(0.380), ry(0.375)], [rx(0.430), ry(0.355)], [rx(0.380), ry(0.415)]].map(([cx,cy],i) => (
        <circle key={i} cx={cx} cy={cy} r={5}
          fill="none" stroke="rgba(201,168,76,0.3)" strokeWidth="1.1" />
      ))}

      {/* TYL outside area */}
      <rect x={passX2 + (R.x+R.w-passX2)*0.25} y={westWallY+58} width={105} height={38}
        rx="3" fill="rgba(7,15,31,0.7)"
        stroke="rgba(42,63,107,0.55)" strokeWidth="0.8" strokeDasharray="4 3" />
      <text x={passX2 + (R.x+R.w-passX2)*0.25 + 52} y={westWallY+52}
        textAnchor="middle" fill="rgba(201,168,76,0.26)"
        fontSize="6.5" fontFamily="Cinzel, serif" letterSpacing="0.13em">OUTSIDE</text>

      {/* Altar */}
      <AltarSymbol x={STATIONS.ALTAR.x} y={STATIONS.ALTAR.y} />

      {/* Station marker dots (normal mode only) */}
      {!isEditMode && OFFICERS.map(code => {
        const pos = getOfficerPos(code)
        const active = (code === activeOfficer) || isAll
        return (
          <circle key={`dot-${code}`} cx={pos.x} cy={pos.y + 28} r={3}
            fill={active ? 'rgba(201,168,76,0.4)' : 'rgba(42,63,107,0.45)'}
            stroke={active ? '#c9a84c' : '#2a3f6b'} strokeWidth="0.8" />
        )
      })}

      {/* ── Officer figures ── */}
      {OFFICERS.map(code => {
        const pos      = getOfficerPos(code)
        const isActive = !isEditMode && (isAll || code === activeOfficer)

        if (isEditMode) {
          // ── Draggable figure ──────────────────────────────────────────────
          return (
            <motion.g
              key={code}
              drag
              dragMomentum={false}
              animate={{ x: editPos[code].x, y: editPos[code].y }}
              transition={{ duration: 0 }}
              onDragEnd={(_, info) => {
                setEditPos(prev => {
                  const next = {
                    ...prev,
                    [code]: {
                      x: Math.round(prev[code].x + info.offset.x),
                      y: Math.round(prev[code].y + info.offset.y),
                    }
                  }
                  return next
                })
              }}
              style={{ cursor: 'grab' }}
              whileDrag={{ scale: 1.15, cursor: 'grabbing' }}
            >
              {/* Edit-mode highlight ring */}
              <circle cx={0} cy={-12} r={28}
                fill="rgba(240,192,64,0.06)"
                stroke="rgba(240,192,64,0.5)"
                strokeWidth="1.2"
                strokeDasharray="4 3"
              />
              <StickFigure isActive={false} label={code} />
              {/* Coordinate readout */}
              <text x={0} y={52} textAnchor="middle"
                fill="rgba(240,192,64,0.6)" fontSize="7.5"
                fontFamily="monospace">
                {editPos[code].x},{editPos[code].y}
              </text>
            </motion.g>
          )
        }

        // ── Normal animated figure ────────────────────────────────────────
        return (
          <motion.g
            key={code}
            initial={false}
            animate={{ x: pos.x, y: pos.y }}
            transition={{ duration: 1.2, ease: [0.4, 0, 0.2, 1] }}
          >
            <StickFigure isActive={isActive} isAll={isAll} label={code} />
          </motion.g>
        )
      })}

      {/* Gavel animation (normal mode only) */}
      {!isEditMode && (
        <AnimatePresence mode="wait">
          {gavelCount > 0 && currentBeat && (
            <motion.g key={`gavel-${currentBeat.beat}`}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {Array.from({ length: gavelCount }).map((_, i) => (
                <motion.g key={i}
                  initial={{ opacity: 0, y: 0 }}
                  animate={{ opacity: [0,1,1,0], y: [0,-6,0,-6,0] }}
                  transition={{ delay: i*0.35, duration: 0.6, ease: 'easeInOut' }}>
                  <GavelIcon x={activePos.x + 22 + i*16} y={activePos.y - 38} color="#f0c040" />
                </motion.g>
              ))}
            </motion.g>
          )}
        </AnimatePresence>
      )}
    </svg>
  )
}
