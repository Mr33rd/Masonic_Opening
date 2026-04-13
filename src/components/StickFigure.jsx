import { motion } from 'framer-motion'

/**
 * SVG stick figure drawn centered at (0, 0).
 * Parent <motion.g> handles absolute positioning.
 * Span: roughly y=-40 to y=28, x=-14 to x=14
 */
export default function StickFigure({ isActive, label, isAll = false }) {
  const baseColor = '#6a85b0'
  const activeColor = '#f0c040'
  const figureColor = isActive ? activeColor : baseColor
  const strokeW = isActive ? 2 : 1.5

  return (
    <g>
      {/* Outer pulse ring — active state */}
      {isActive && (
        <motion.circle
          cx={0}
          cy={-12}
          r={26}
          fill="rgba(201,168,76,0.08)"
          stroke="#c9a84c"
          strokeWidth={1.5}
          initial={{ opacity: 0.3, scale: 0.85 }}
          animate={{
            opacity: [0.2, 0.75, 0.2],
            scale: [0.88, 1.12, 0.88],
          }}
          transition={{
            duration: 1.8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      )}

      {/* Second outer ring for "ALL" state */}
      {isAll && (
        <motion.circle
          cx={0}
          cy={-12}
          r={32}
          fill="none"
          stroke="#e0bc68"
          strokeWidth={1}
          strokeDasharray="4 4"
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
          style={{ transformOrigin: '0px -12px' }}
        />
      )}

      {/* Head */}
      <circle
        cx={0}
        cy={-32}
        r={8}
        fill="none"
        stroke={figureColor}
        strokeWidth={strokeW}
      />

      {/* Body */}
      <line
        x1={0} y1={-24}
        x2={0} y2={2}
        stroke={figureColor}
        strokeWidth={strokeW}
        strokeLinecap="round"
      />

      {/* Arms */}
      <line
        x1={-13} y1={-10}
        x2={13} y2={-10}
        stroke={figureColor}
        strokeWidth={strokeW}
        strokeLinecap="round"
      />

      {/* Left leg */}
      <line
        x1={0} y1={2}
        x2={-9} y2={22}
        stroke={figureColor}
        strokeWidth={strokeW}
        strokeLinecap="round"
      />

      {/* Right leg */}
      <line
        x1={0} y1={2}
        x2={9} y2={22}
        stroke={figureColor}
        strokeWidth={strokeW}
        strokeLinecap="round"
      />

      {/* Label */}
      <text
        x={0}
        y={36}
        textAnchor="middle"
        fill={isActive ? '#f0c040' : '#7a9abf'}
        fontSize={9}
        fontFamily="Cinzel, Georgia, serif"
        fontWeight={isActive ? '600' : '400'}
        letterSpacing="0.08em"
      >
        {label}
      </text>
    </g>
  )
}
