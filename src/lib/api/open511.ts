//declaring DriveBC event types from shared drivebc types module
import type { DriveBCEvent, Severity } from "../../types/drivebc"

//declaring Open511 BC events API base URL
const BASE = "https://api.open511.gov.bc.ca/events"

//declaring localStorage cache key and 10-minute TTL for DriveBC events
const CACHE_KEY = "drivebc_events_cache_v1"
const CACHE_DURATION_MS = 10 * 60 * 1000

//declaring raw Open511 event shape from the API response
interface RawEvent {
  id: string
  headline: string
  description: string
  status: string
  event_type: string
  severity: string
  updated: string
  geography: any
  roads?: { name: string; state?: string }[]
  areas?: { name: string }[]
}

//declaring Open511 paginated events response wrapper
interface Open511Response {
  events: RawEvent[]
}

//declaring localStorage cache payload shape
interface CachePayload {
  timestamp: number
  events: DriveBCEvent[]
}

//This function normalizes raw Open511 events into DriveBCEvent objects
function normalizeEvents(rawEvents: RawEvent[]): DriveBCEvent[] {
  return rawEvents.map((e) => ({
    id: e.id,
    headline: e.headline,
    description: e.description,
    status: e.status,
    eventType: e.event_type,
    severity: (e.severity as Severity) || "UNKNOWN",
    roadState: e.roads?.[0]?.state ?? "UNKNOWN",
    roadNames: e.roads?.map((r) => r.name) ?? [],
    closedRoadNames:
      e.roads
        ?.filter((road) => road.state?.toUpperCase() === "CLOSED")
        .map((road) => road.name) ?? [],
    areaName: e.areas?.[0]?.name ?? "BC Highway Network",
    updated: e.updated,
    geography: e.geography,
  }))
}//normalizeEvents

//This function reads cached DriveBC events; stale entries are returned only when requested
function readCache(allowStale = false): DriveBCEvent[] | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    if (!raw) return null
    const parsed: CachePayload = JSON.parse(raw)
    const isFresh = Date.now() - parsed.timestamp <= CACHE_DURATION_MS
    if (!isFresh && !allowStale) return null
    return parsed.events
  } catch {
    return null
  }
}//readCache

//This function writes normalized DriveBC events to localStorage cache
function writeCache(events: DriveBCEvent[]) {
  try {
    const payload: CachePayload = {
      timestamp: Date.now(),
      events,
    }
    localStorage.setItem(CACHE_KEY, JSON.stringify(payload))
  } catch {
    // storage full or unavailable, not critical, just skip caching
  }
}//writeCache

//This function fetches active DriveBC highway events and normalizes them for the UI
export async function fetchDriveBCEvents(): Promise<DriveBCEvent[]> {
  const cached = readCache()
  if (cached) return cached

  const url =
    `${BASE}?format=json&status=ACTIVE` +
    `&severity=MAJOR,MODERATE,MINOR` +
    `&limit=500`

  try {
    const res = await fetch(url)
    if (!res.ok) throw new Error(`Open511 fetch failed: ${res.status}`)
    const data: Open511Response = await res.json()
    const events = normalizeEvents(data.events)
    writeCache(events)
    return events
  } catch (err) {
    const stale = readCache(true)
    if (stale) return stale
    throw err
  }
}//fetchDriveBCEvents
