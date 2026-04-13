// ElevenLabs male voice assignments per officer
// Voice IDs are from ElevenLabs' built-in voice library
export const VOICE_MAP = {
  WM:    { voiceId: 'onwK4e9ZLuTAKqWW03F9', name: 'Daniel',  desc: 'Deep & Authoritative' },
  SW:    { voiceId: 'JBFqnCBsd6RMkjVDRZzb', name: 'George',  desc: 'Warm British' },
  JW:    { voiceId: 'TxGEqnHWrfWFTfGW9XjX', name: 'Josh',    desc: 'Deep & Steady' },
  SD:    { voiceId: 'TX3LPaxmHKxFdv7VOQHJ', name: 'Liam',    desc: 'Clear & Neutral' },
  JD:    { voiceId: 'Yko7PKHZNXotIFUBG7I9', name: 'Matthew', desc: 'Precise & Crisp' },
  CHAP:  { voiceId: 'GBv7mTt0atIp3Br8iCZE', name: 'Thomas',  desc: 'Calm & Solemn' },
  TYL:   { voiceId: 'VR6AewLTigWG4xSOukaG', name: 'Arnold',  desc: 'Mature & Direct' },
  SS:    { voiceId: 'pqHfZKP75CvOlQylNhV4', name: 'Bill',    desc: 'Trustworthy' },
  JS:    { voiceId: 'g5CIjZEefAph4nQFvHAz', name: 'Ethan',   desc: 'Soft & Young' },
  SEC:   { voiceId: '29vD33N1BoQ1agpkEQnr', name: 'Drew',    desc: 'Well-Rounded' },
  TREAS: { voiceId: 'CYw3kZ02Vc0SzWCWTCYk', name: 'Dave',    desc: 'British Refined' },
  LEC:   { voiceId: 'flq6f7xtIhjJZOip1GjV', name: 'Michael', desc: 'Storyteller' },
  MAR:   { voiceId: 'ZQe5CZNOzWyzPSCn5a3c', name: 'James',   desc: 'Calm Southern' },
  JMC:   { voiceId: 'bVMeCyTHy58xNoL34h3p', name: 'Jeremy',  desc: 'American Clear' },
  SMC:   { voiceId: 'ErXwobaYiN019PkySvjV', name: 'Antoni',  desc: 'Well-Rounded' },
  ALL:   { voiceId: 'onwK4e9ZLuTAKqWW03F9', name: 'Daniel',  desc: 'Deep & Authoritative' },
}

export function getVoice(officerCode) {
  return VOICE_MAP[officerCode] ?? VOICE_MAP.WM
}
