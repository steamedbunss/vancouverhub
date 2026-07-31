//declaring DriveBC event severity levels from Open511 API
export type Severity = "MAJOR" | "MODERATE" | "MINOR" | "UNKNOWN"

//declaring DriveBC event type categories from Open511 API
export type EventType =
  | "CONSTRUCTION"
  | "INCIDENT"
  | "SPECIAL_EVENT"
  | "ROAD_CONDITION"
  | "WEATHER_CONDITION"
  | string

//declaring DriveBC event lifecycle status
export type EventStatus = "ACTIVE" | "ARCHIVED" | string

//declaring available sort options for the DriveBC events list
export type SortOption = "SEVERITY" | "UPDATED_DESC" | "ROAD" | "REGION"

//declaring GeoJSON geometry attached to a DriveBC event
export interface EventGeometry {
  type: "Point" | "LineString" | "Polygon" | string
  coordinates: unknown
}

//declaring normalized DriveBC highway event for the traffic UI
export interface DriveBCEvent {
  id: string
  headline: string
  description: string
  status: EventStatus
  eventType: EventType
  severity: Severity
  roadState: string
  roadNames: string[]
  closedRoadNames: string[]
  areaName: string
  updated: string
  geography: EventGeometry
}

//declaring filter state for the DriveBC events panel
export interface FilterState {
  search: string
  severities: Severity[]
  types: EventType[]
  areas: string[]
  roads: string[]
  sortBy: SortOption
}
