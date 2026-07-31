//declaring react hooks and DriveBC filter utilities
import { useMemo, useState, useEffect } from "react"
import type { DriveBCEvent, FilterState } from "../types/drivebc"
import { filterEvents } from "../utils/filterEvents"
import { sortEvents } from "../utils/sortEvents"
import { getFilterOptions } from "../utils/filterOptions"
import { useDebounce } from "./useDebounce"

//declaring default filter state when no saved preferences exist
const DEFAULT_FILTERS: FilterState = {
  search: "",
  severities: [],
  types: [],
  areas: [],
  roads: [],
  sortBy: "UPDATED_DESC",
}

//declaring localStorage key for persisting DriveBC filter preferences
const STORAGE_KEY = "vancouverhub_drivebc_filters_v1"

//declaring filter fields saved across page refreshes; sort always resets to default
type PersistedFilters = Omit<FilterState, "sortBy">

//This function loads persisted filters and always applies the default sort option
function loadPersistedFilters(): FilterState {
  if (typeof window === "undefined") return DEFAULT_FILTERS
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (!saved) return DEFAULT_FILTERS
    const parsed = JSON.parse(saved) as Partial<PersistedFilters>
    return {
      ...DEFAULT_FILTERS,
      search: parsed.search ?? "",
      severities: parsed.severities ?? [],
      types: parsed.types ?? [],
      areas: parsed.areas ?? [],
      roads: parsed.roads ?? [],
    }
  } catch {
    return DEFAULT_FILTERS
  }
}//loadPersistedFilters

//This function saves filter preferences without persisting the sort selection
function savePersistedFilters(filters: FilterState) {
  try {
    const { sortBy: _sortBy, ...persisted } = filters
    localStorage.setItem(STORAGE_KEY, JSON.stringify(persisted))
  } catch (e) {
    console.warn("Could not save filters to localStorage", e)
  }
}//savePersistedFilters

//This function manages DriveBC event filtering, sorting, and persisted filter state
export function useDriveBCFilters(events: DriveBCEvent[], enableSearch = true) {
  const [filters, setFilters] = useState<FilterState>(loadPersistedFilters)

  useEffect(() => {
    savePersistedFilters(filters)
  }, [filters])

  const debouncedSearch = useDebounce(filters.search, 250)

  const activeFiltersForEngine = useMemo(
    () => ({ ...filters, search: enableSearch ? debouncedSearch : "" }),
    [filters, debouncedSearch, enableSearch]
  )

  const filteredEvents = useMemo(() => {
    const matched = filterEvents(events, activeFiltersForEngine)
    return sortEvents(matched, filters.sortBy)
  }, [events, activeFiltersForEngine, filters.sortBy])

  const options = useMemo(() => getFilterOptions(events), [events])

  const toggleFilter = <K extends keyof Omit<FilterState, "search" | "sortBy">>(
    key: K,
    value: FilterState[K][number]
  ) => {
    setFilters((prev) => {
      const list = prev[key] as string[]
      const exists = list.includes(value as string)
      const updated = exists ? list.filter((i) => i !== value) : [...list, value]
      return { ...prev, [key]: updated }
    })
  }//toggleFilter

  const setSearch = (search: string) => setFilters((p) => ({ ...p, search }))
  const setSortBy = (sortBy: FilterState["sortBy"]) => setFilters((p) => ({ ...p, sortBy }))
  const clearSelections = () =>
    setFilters((p) => ({ ...p, severities: [], types: [], areas: [], roads: [] }))
  const resetFilters = () => setFilters(DEFAULT_FILTERS)

  const activeCount =
    filters.severities.length +
    filters.types.length +
    filters.areas.length +
    filters.roads.length +
    (filters.search ? 1 : 0)

  return {
    filters,
    filteredEvents,
    options,
    activeCount,
    toggleFilter,
    setSearch,
    setSortBy,
    clearSelections,
    resetFilters,
  }
}//useDriveBCFilters
