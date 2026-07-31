//declaring DriveBC severity and event type enums for filter UI
import type { Severity, EventType } from "../types/drivebc"

//declaring default severity filter options with labels
export const DEFAULT_SEVERITIES: { label: string; value: Severity }[] = [
  { label: "Major Delays", value: "MAJOR" },
  { label: "Moderate Delays", value: "MODERATE" },
  { label: "Minor Delays", value: "MINOR" },
]

//declaring default event type filter options with labels
export const DEFAULT_TYPES: { label: string; value: EventType }[] = [
  { label: "Construction", value: "CONSTRUCTION" },
  { label: "Incidents & Crashes", value: "INCIDENT" },
  { label: "Special Events", value: "SPECIAL_EVENT" },
  { label: "Weather Warnings", value: "WEATHER_CONDITION" },
  { label: "Road Conditions", value: "ROAD_CONDITION" },
]
