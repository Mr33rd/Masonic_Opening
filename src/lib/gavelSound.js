let audioCtx = null

function getCtx() {
  if (!audioCtx) audioCtx = new AudioContext()
  if (audioCtx.state === 'suspended') audioCtx.resume()
  return audioCtx
}

/** Synthesise a single wooden gavel strike using the Web Audio API */
function strikeOnce() {
  const ctx = getCtx()
  const now = ctx.currentTime

  // ── Wooden impact: noise through a bandpass filter ──────────────────────
  const buf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.35), ctx.sampleRate)
  const data = buf.getChannelData(0)
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1

  const noise = ctx.createBufferSource()
  noise.buffer = buf

  const bp = ctx.createBiquadFilter()
  bp.type = 'bandpass'
  bp.frequency.value = 420
  bp.Q.value = 1.8

  const noiseGain = ctx.createGain()
  noiseGain.gain.setValueAtTime(0.55, now)
  noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.22)

  noise.connect(bp)
  bp.connect(noiseGain)
  noiseGain.connect(ctx.destination)
  noise.start(now)
  noise.stop(now + 0.22)

  // ── Low thud: sine sweep down (the block resonance) ──────────────────────
  const osc = ctx.createOscillator()
  osc.type = 'sine'
  osc.frequency.setValueAtTime(200, now)
  osc.frequency.exponentialRampToValueAtTime(65, now + 0.18)

  const oscGain = ctx.createGain()
  oscGain.gain.setValueAtTime(0.75, now)
  oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.28)

  osc.connect(oscGain)
  oscGain.connect(ctx.destination)
  osc.start(now)
  osc.stop(now + 0.28)
}

/**
 * Play `count` gavel strikes, ~700 ms apart.
 * Pass `isCancelled` so the loop aborts cleanly on beat change.
 * Returns a Promise that resolves after the last strike fades out.
 */
export async function playGavel(count, isCancelled = () => false) {
  for (let i = 0; i < count; i++) {
    if (isCancelled()) return
    strikeOnce()
    if (i < count - 1) {
      // Wait between strikes — check cancellation during the pause
      await new Promise(r => setTimeout(r, 700))
    }
  }
  // Short tail so last strike isn't cut off by the next action
  if (!isCancelled()) await new Promise(r => setTimeout(r, 350))
}
