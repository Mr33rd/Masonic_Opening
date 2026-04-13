import { getAudioCtx } from './audioContext'

function doorClose() {
  const ctx = getAudioCtx()
  const now = ctx.currentTime

  const osc = ctx.createOscillator()
  osc.type = 'sine'
  osc.frequency.setValueAtTime(170, now)
  osc.frequency.exponentialRampToValueAtTime(52, now + 0.45)
  const oscGain = ctx.createGain()
  oscGain.gain.setValueAtTime(0.85, now)
  oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.48)
  osc.connect(oscGain); oscGain.connect(ctx.destination)
  osc.start(now); osc.stop(now + 0.48)

  const buf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.18), ctx.sampleRate)
  const data = buf.getChannelData(0)
  for (let i = 0; i < data.length; i++)
    data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.018))
  const noise = ctx.createBufferSource()
  noise.buffer = buf
  const bp = ctx.createBiquadFilter()
  bp.type = 'bandpass'; bp.frequency.value = 480; bp.Q.value = 1
  const noiseGain = ctx.createGain()
  noiseGain.gain.setValueAtTime(0.55, now)
  noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.18)
  noise.connect(bp); bp.connect(noiseGain); noiseGain.connect(ctx.destination)
  noise.start(now); noise.stop(now + 0.18)
}

function lockClick() {
  const ctx = getAudioCtx()
  const now = ctx.currentTime

  const buf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.1), ctx.sampleRate)
  const data = buf.getChannelData(0)
  for (let i = 0; i < data.length; i++)
    data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.012))
  const noise = ctx.createBufferSource()
  noise.buffer = buf
  const hp = ctx.createBiquadFilter()
  hp.type = 'highpass'; hp.frequency.value = 1800
  const noiseGain = ctx.createGain()
  noiseGain.gain.setValueAtTime(0.65, now)
  noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.09)
  noise.connect(hp); hp.connect(noiseGain); noiseGain.connect(ctx.destination)
  noise.start(now); noise.stop(now + 0.09)

  const osc = ctx.createOscillator()
  osc.type = 'sine'; osc.frequency.value = 3400
  const oscGain = ctx.createGain()
  oscGain.gain.setValueAtTime(0.18, now)
  oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.07)
  osc.connect(oscGain); oscGain.connect(ctx.destination)
  osc.start(now); osc.stop(now + 0.07)
}

const EFFECTS = {
  door_lock: async (isCancelled) => {
    doorClose()
    await new Promise(r => setTimeout(r, 650))
    if (isCancelled()) return
    lockClick()
    await new Promise(r => setTimeout(r, 250))
  },
}

export async function playSoundEffect(name, isCancelled = () => false) {
  const fn = EFFECTS[name]
  if (fn) await fn(isCancelled)
}
