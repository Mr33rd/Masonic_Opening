// Shared AudioContext singleton — shared by ElevenLabs, gavel, and sound effects
// Web Audio API only needs the context unlocked ONCE by a user gesture,
// after which all programmatic plays (including from setTimeout) work on mobile.
let _ctx = null

export function getAudioCtx() {
  if (!_ctx) _ctx = new (window.AudioContext || window.webkitAudioContext)()
  return _ctx
}

// Call once from any user-gesture handler to unlock audio on iOS/Android
export function unlockAudio() {
  const ctx = getAudioCtx()
  if (ctx.state === 'suspended') ctx.resume()
  // Kick a silent 1-frame buffer — required to fully unlock on older iOS
  const buf = ctx.createBuffer(1, 1, 22050)
  const src = ctx.createBufferSource()
  src.buffer = buf
  src.connect(ctx.destination)
  src.start(0)
}
