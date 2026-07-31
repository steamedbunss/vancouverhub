//declaring DriveBC event types from shared drivebc types module
import type { DriveBCEvent, Severity } from "../../types/drivebc"

//declaring Open511 BC events API base URL
const BASE = "https://api.open511.gov.bc.ca/events"

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

//This function fetches active DriveBC highway events and normalizes them for the UI
export async function fetchDriveBCEvents(): Promise<DriveBCEvent[]> {
  const url =
    `${BASE}?format=json&status=ACTIVE` +
    `&severity=MAJOR,MODERATE,MINOR` +
    `&limit=500`

  const res = await fetch(url)
  if (!res.ok) throw new Error(`Open511 fetch failed: ${res.status}`)
  const data: Open511Response = await res.json()

  return data.events.map((e) => ({
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
}//fetchDriveBCEvents
