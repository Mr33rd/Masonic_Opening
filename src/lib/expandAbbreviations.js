// Expand Masonic abbreviations in cue text before sending to TTS
const REPLACEMENTS = [
  // Officer titles — order matters (longer matches first)
  [/\bJMC\b/g,   'Junior Master of Ceremonies'],
  [/\bSMC\b/g,   'Senior Master of Ceremonies'],
  [/\bTREAS\b/g, 'Treasurer'],
  [/\bCHAP\b/g,  'Chaplain'],
  [/\bTYL\b/g,   'Tyler'],
  [/\bLEC\b/g,   'Lecturer'],
  [/\bMAR\b/g,   'Marshal'],
  [/\bSEC\b/g,   'Secretary'],
  [/\bSD\b/g,    'Senior Deacon'],
  [/\bJD\b/g,    'Junior Deacon'],
  [/\bSS\b/g,    'Senior Steward'],
  [/\bJS\b/g,    'Junior Steward'],
  [/\bSW\b/g,    'Senior Warden'],
  [/\bJW\b/g,    'Junior Warden'],
  [/\bWM\b/g,    'Worshipful Master'],
  // Common Masonic shorthand
  [/\bBro\b/g,   'Brother'],
  [/\bEA\b/g,    'Entered Apprentice'],
  [/\bFC\b/g,    'Fellow Craft'],
  [/\bMM\b/g,    'Master Mason'],
]

export function expandAbbreviations(text) {
  if (!text) return text
  return REPLACEMENTS.reduce((t, [pattern, replacement]) => t.replace(pattern, replacement), text)
}
