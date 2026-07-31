//declaring default filter enums and DriveBC event types
import { DEFAULT_SEVERITIES, DEFAULT_TYPES } from "../constants/drivebcFilters"
import type { DriveBCEvent, EventType, Severity } from "../types/drivebc"
import type { FilterOption } from "../components/drivebc/FilterGroup"

//declaring shape of derived filter options with counts per value
export interface DerivedFilterOptions {
  severities: FilterOption<Severity>[]
  types: FilterOption<EventType>[]
  roads: FilterOption<string>[]
  areas: FilterOption<string>[]
}

//This function counts events per filter dimension and builds selectable filter options
export function getFilterOptions(events: DriveBCEvent[]): DerivedFilterOptions {
  const counts = {
    severities: {} as Record<string, number>,
    types: {} as Record<string, number>,
    areas: {} as Record<string, number>,
    roads: {} as Record<string, number>,
  }

  events.forEach((e) => {
    counts.severities[e.severity] = (counts.severities[e.severity] || 0) + 1
    counts.types[e.eventType] = (counts.types[e.eventType] || 0) + 1
    if (e.areaName) counts.areas[e.areaName] = (counts.areas[e.areaName] || 0) + 1
    e.roadNames.forEach((road) => {
      counts.roads[road] = (counts.roads[road] || 0) + 1
    })
  })

  //Fixed enums keep zero-count options visible
  const severities: FilterOption<Severity>[] = DEFAULT_SEVERITIES.map((opt) => ({
    label: opt.label,
    value: opt.value,
    count: counts.severities[opt.value] || 0,
  }))

  const types: FilterOption<EventType>[] = DEFAULT_TYPES.map((opt) => ({
    label: opt.label,
    value: opt.value,
    count: counts.types[opt.value] || 0,
  }))

  const roads: FilterOption<string>[] = Object.keys(counts.roads)
    .sort()
    .map((road) => ({
      label: road,
      value: road,
      count: counts.roads[road],
    }))

  const areas: FilterOption<string>[] = Object.keys(counts.areas)
    .sort()
    .map((area) => ({
      label: area,
      value: area,
      count: counts.areas[area],
    }))

  return { severities, types, roads, areas }
}//getFilterOptions
