//declaring DriveBC event types from shared drivebc types module
import type { DriveBCEvent } from '../types/drivebc'

//declaring ordered incident title rules, most-specific first, eg. wildfire before road closure
const INCIDENT_TITLE_RULES: { pattern: RegExp; title: string }[] = [
  { pattern: /\bwildfire/i, title: 'Wildfire incident' },
  { pattern: /\blandslide/i, title: 'Landslide incident' },
  { pattern: /\brockfall/i, title: 'Rockfall incident' },
  { pattern: /\bwashout/i, title: 'Washout incident' },
  { pattern: /\bflood(?:ing|ed|s)?\b/i, title: 'Flooding incident' },
  {
    pattern: /\bbridge\b[\s\S]{0,40}\b(?:closed|closure)\b|\b(?:closed|closure)\b[\s\S]{0,40}\bbridge\b/i,
    title: 'Bridge closure',
  },
  { pattern: /\bcrash(?:es|ed|ing)?\b|\bcollision|\baccident/i, title: 'Crash incident' },
  { pattern: /\bdebris\b/i, title: 'Debris incident' },
  { pattern: /\bhazard/i, title: 'Hazard incident' },
  { pattern: /\broad closed|\bclosure|\bclosed\b/i, title: 'Road closure' },
]

//This function returns a richer display title for generic Open511 INCIDENT headlines
export function resolveIncidentHeadline(event: DriveBCEvent): string {
  if (event.eventType !== 'INCIDENT') return event.headline

  const text = `${event.headline}\n${event.description}`
  for (const rule of INCIDENT_TITLE_RULES) {
    if (rule.pattern.test(text)) return rule.title
  }

  return event.headline || 'Incident'
}//resolveIncidentHeadline
