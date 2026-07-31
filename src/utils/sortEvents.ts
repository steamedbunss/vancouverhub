//declaring DriveBC event, severity, and sort option types
import type { DriveBCEvent, Severity, SortOption } from "../types/drivebc"

//declaring numeric weights for severity-based sorting, eg. MAJOR = 3
const SEVERITY_WEIGHT: Record<Severity, number> = {
  MAJOR: 3,
  MODERATE: 2,
  MINOR: 1,
  UNKNOWN: 0,
}

//This function sorts DriveBC events by severity, update time, road, or region
export function sortEvents(events: DriveBCEvent[], sortBy: SortOption): DriveBCEvent[] {
  return [...events].sort((a, b) => {
    switch (sortBy) {
      case "SEVERITY":
        return (SEVERITY_WEIGHT[b.severity] || 0) - (SEVERITY_WEIGHT[a.severity] || 0)
      case "UPDATED_DESC":
        return new Date(b.updated).getTime() - new Date(a.updated).getTime()
      case "ROAD":
        return (a.roadNames[0] ?? "").localeCompare(b.roadNames[0] ?? "")
      case "REGION":
        return a.areaName.localeCompare(b.areaName)
      default:
        return 0
    }
  })
}//sortEvents
