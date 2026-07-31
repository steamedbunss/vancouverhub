//declaring DriveBC event types from shared drivebc types module
import type { DriveBCEvent } from '../types/drivebc'

//declaring ordered incident title rules, most-specific first, eg. wildfire before road closure
const INCIDENT_TITLE_RULES: { pattern: RegExp; title: string }[] = [
  { pattern: /\bwildfire/i, title: 'Wildfire incident' },
  { pattern: /\blandslide/i, title: 'Landslide incident' },
  { pattern: /\bmudslide/i, title: 'Mudslide incident' },
  { pattern: /\brockfall|\bfalling rocks?\b/i, title: 'Rockfall incident' },
  { pattern: /\bavalanche/i, title: 'Avalanche incident' },
  { pattern: /\bwashout/i, title: 'Washout incident' },
  { pattern: /\bflood(?:ing|ed|s)?\b/i, title: 'Flooding incident' },
  {
    pattern: /\bbridge\b[\s\S]{0,40}\b(?:closed|closure)\b|\b(?:closed|closure)\b[\s\S]{0,40}\bbridge\b/i,
    title: 'Bridge closure',
  },
  {
    pattern: /\bcrash(?:es|ed|ing)?\b|\bcollision(?:s)?\b|\baccident(?:s)?\b/i,
    title: 'Crash incident',
  },
  {
    pattern: /\bsailing wait\b|\bferry\b[\s\S]{0,80}\bwait\b/i,
    title: 'Ferry delay',
  },
  {
    pattern: /\bvehicle\s+stall\b|\b(?:disabled|abandoned)\s+vehicle\b/i,
    title: 'Vehicle stall',
  },
  { pattern: /\bwildlife\b/i, title: 'Wildlife advisory' },
  { pattern: /\bdowned power line\b|\bpower lines?\s+down\b/i, title: 'Downed power line' },
  { pattern: /\bdebris\b/i, title: 'Debris incident' },
  {
    pattern: /\blane blocked\b|\b(?:centre|center)\s+lane\b[\s\S]{0,30}\bblocked\b/i,
    title: 'Lane blocked',
  },
  { pattern: /\bhazard/i, title: 'Hazard incident' },
  { pattern: /\bdetour\b/i, title: 'Detour in effect' },
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
