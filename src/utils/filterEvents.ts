//declaring DriveBC event and filter state types
import type { DriveBCEvent, FilterState } from "../types/drivebc"

//This function filters DriveBC events by search text and multi-select criteria
export function filterEvents(events: DriveBCEvent[], filters: FilterState): DriveBCEvent[] {
  const searchLower = filters.search.trim().toLowerCase()

  return events.filter((e) => {
    // 1. Full-text search match against haystack
    if (searchLower !== "") {
      const haystack = [
        e.headline,
        e.description,
        e.areaName,
        e.severity,
        e.eventType,
        e.roadState,
        ...e.roadNames,
      ]
        .join(" ")
        .toLowerCase()

      if (!haystack.includes(searchLower)) return false
    }

    // 2. Multi-select checks
    if (filters.severities.length > 0 && !filters.severities.includes(e.severity)) return false
    if (filters.types.length > 0 && !filters.types.includes(e.eventType)) return false
    if (filters.areas.length > 0 && !filters.areas.includes(e.areaName)) return false

    // 3. Highway / Road intersection check
    if (filters.roads.length > 0) {
      const matchesRoad = e.roadNames.some((r) => filters.roads.includes(r))
      if (!matchesRoad) return false
    }

    return true
  })
}//filterEvents
