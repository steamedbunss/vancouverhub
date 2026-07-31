import { useEffect, useMemo, useState } from "react"
import { fetchDriveBCEvents } from "../lib/api/open511"
import type { DriveBCEvent, SortOption } from "../types/drivebc"
import { useDriveBCFilters } from "../hooks/useDriveBCFilters"
import { FilterSidebar } from "./drivebc/FilterSidebar"
import { ActiveChips } from "./drivebc/ActiveChips"
import { EventCard } from "./drivebc/EventCard"
import { DriveBCMap } from "./drivebc/DriveBCMap"

//declaring the view mode type as either list or map
type ViewMode = "list" | "map"

//initial number of event cards shown in list view before the user clicks Show more
const LIST_INITIAL_COUNT = 9

//number of additional event cards revealed each time the user clicks Show more
const LIST_SHOW_MORE_COUNT = 10

//shared minimum height class so list and map views do not jump when toggling
const CONTENT_MIN_HEIGHT_CLASS = "min-h-[560px]"

//This function builds a stable React key and expansion id for each rendered card row
function getEventCardKey(event: DriveBCEvent, index: number) {
  return `${String(event.id)}-${index}`
}

export function DriveBCSection() {
  //declaring state to hold all road events fetched from the Open511 API
  const [events, setEvents] = useState<DriveBCEvent[]>([])

  //declaring state to track whether data is loading, loaded successfully, or failed
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")

  //declaring state for the current display mode; list is the default
  const [viewMode, setViewMode] = useState<ViewMode>("list")

  //declaring state for whether NEXUS border wait times appear on the map
  const [showNexusWaits, setShowNexusWaits] = useState(false)

  //declaring state for how many filtered events are visible in list view
  const [visibleListCount, setVisibleListCount] = useState(LIST_INITIAL_COUNT)

  //declaring state as a list of expanded card keys for reliable React updates at scale
  const [expandedCardKeys, setExpandedCardKeys] = useState<string[]>([])

  const expandedCardKeySet = useMemo(() => new Set(expandedCardKeys), [expandedCardKeys])

  //This useEffect runs once when the component mounts
  //fetchDriveBCEvents is called to load road events from the API
  //On success, events is updated and status is set to success
  //On failure, the error is logged and status is set to error
  useEffect(() => {
    fetchDriveBCEvents()
      .then((data) => {
        setEvents(data)
        setStatus("success")
      })
      .catch((err) => {
        console.error(err)
        setStatus("error")
      })
  }, [])

  //useDriveBCFilters hook applies search, sort, and checkbox filters to events
  //Search is only enabled in list view; map view disables the search filter
  const {
    filters,
    filteredEvents,
    options,
    toggleFilter,
    setSearch,
    setSortBy,
    clearSelections,
  } = useDriveBCFilters(events, viewMode === "list")

  //This useEffect resets visibleListCount back to LIST_INITIAL_COUNT
  //whenever the user changes filters or switches between list and map
  useEffect(() => {
    setVisibleListCount(LIST_INITIAL_COUNT)
  }, [filters, viewMode])

  //This useEffect clears all expanded cards when filters or view mode change
  //so descriptions do not stay open after the event list changes
  useEffect(() => {
    setExpandedCardKeys([])
  }, [filters, viewMode])

  //toggleEventExpanded adds or removes a card key from expandedCardKeys
  function toggleEventExpanded(cardKey: string) {
    setExpandedCardKeys((current) =>
      current.includes(cardKey)
        ? current.filter((key) => key !== cardKey)
        : [...current, cardKey],
    )
  }//toggleEventExpanded

  //collapseAllEvents clears every expanded card key, regardless of list length
  function collapseAllEvents() {
    setExpandedCardKeys([])
  }//collapseAllEvents

  //hasMapSelection is true when the user has selected at least one map filter
  //Map events are only drawn when a severity, type, area, or road is checked
  const hasMapSelection =
    filters.severities.length > 0 ||
    filters.types.length > 0 ||
    filters.areas.length > 0 ||
    filters.roads.length > 0

  //shouldShowMapEvents is true in list view or when map filters are selected
  const shouldShowMapEvents = viewMode === "list" || hasMapSelection

  //visibleListEvents holds only the first visibleListCount items from filteredEvents
  //eg. if visibleListCount is 9, only the first 9 filtered events are shown
  const visibleListEvents = filteredEvents.slice(0, visibleListCount)

  //displayedEventCount shows how many events appear in the header count
  //In list view it uses visibleListEvents.length
  //In map view it uses filteredEvents.length when filters are selected, otherwise 0
  const displayedEventCount =
    viewMode === "list"
      ? visibleListEvents.length
      : shouldShowMapEvents
        ? filteredEvents.length
        : 0

  //If data is still loading, show a loading message and stop rendering the rest
  if (status === "loading") return <div className="p-4 text-slate-500 text-sm dark:text-slate-300">Loading DriveBC road events...</div>

  //If the fetch failed, show an error message and stop rendering the rest
  if (status === "error") return <div className="p-4 text-red-500 text-sm dark:text-red-400">Error loading DriveBC events.</div>

  //isList is a shorthand boolean for whether list view is active
  const isList = viewMode === "list"

  return (
    <div className="p-4">
      <div className="mx-auto w-full max-w-[51.5rem] space-y-3">
        {/*Header row with event count, sort dropdown, and list/map toggle*/}
        <div className="relative z-20 flex flex-wrap items-center justify-between gap-2 border-b pb-2 dark:border-gray-700">
          <div className="text-xs text-slate-500 dark:text-slate-300">
            Showing <strong className="dark:text-white">{displayedEventCount}</strong> of {events.length} active events
          </div>

          <div className="relative z-20 flex items-center gap-2 text-xs">
            {/*Collapse all sits left of sort controls; hidden in map view*/}
            <button
              type="button"
              onClick={collapseAllEvents}
              aria-hidden={!isList}
              tabIndex={isList ? 0 : -1}
              className={`rounded-md border border-black bg-white px-2.5 py-1 text-[11px] font-bold whitespace-nowrap text-black transition hover:bg-gray-100 dark:border-white dark:bg-gray-950 dark:text-white dark:hover:bg-gray-900 ${isList ? "" : "invisible"}`}
            >
              Collapse all
            </button>
            {/*Sort by label and dropdown are hidden in map view but keep their space*/}
            <span className={`text-slate-500 dark:text-slate-300 ${isList ? "" : "invisible"}`}>Sort by:</span>
            <select
              value={filters.sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              disabled={!isList}
              aria-hidden={!isList}
              tabIndex={isList ? 0 : -1}
              className={`rounded border border-black bg-white px-2 py-1 text-xs text-black ${isList ? "" : "invisible"}`}
            >
              <option value="SEVERITY">Severity</option>
              <option value="UPDATED_DESC">Recently Updated</option>
              <option value="ROAD">Highway Name</option>
              <option value="REGION">Region</option>
            </select>
            {/*List/Map toggle buttons; the active mode gets a black background*/}
            <div className="flex rounded-md border border-black bg-white p-0.5" aria-label="Display mode">
              <button
                type="button"
                onClick={() => setViewMode("list")}
                aria-pressed={isList}
                className={`rounded px-2 py-1 ${isList ? "bg-black text-white" : "text-black hover:bg-gray-100"}`}
              >
                List
              </button>
              <button
                type="button"
                onClick={() => setViewMode("map")}
                aria-pressed={!isList}
                className={`rounded px-2 py-1 ${!isList ? "bg-black text-white" : "text-black hover:bg-gray-100"}`}
              >
                Map
              </button>
            </div>
          </div>
        </div>

        {/*ActiveChips shows removable tags for each active filter*/}
        <div className="min-h-10">
          <ActiveChips
            filters={filters}
            onRemove={toggleFilter}
            onClearSearch={() => setSearch("")}
            showSearch={isList}
          />
        </div>

        {/*Main content area with filter sidebar on the left and list or map on the right*/}
        <div className="flex flex-col items-stretch gap-6 md:flex-row md:items-start">
          <FilterSidebar
            filters={filters}
            options={options}
            onToggleFilter={toggleFilter}
            onSearchChange={setSearch}
            onClearSelections={() => {
              clearSelections()
              setShowNexusWaits(false)
            }}
            showSearch={isList}
            nexusEnabled={showNexusWaits}
            onNexusChange={setShowNexusWaits}
            className={`w-full shrink-0 md:w-56 ${CONTENT_MIN_HEIGHT_CLASS} overflow-y-auto`}
          />

          <div className={`min-w-0 flex-1 ${CONTENT_MIN_HEIGHT_CLASS}`}>
            {isList ? (
              //List view renders event cards with pagination
              <div className="space-y-3">
                {filteredEvents.length === 0 ? (
                  //If no events match the filters, show an empty state message
                  <div className="rounded-xl border bg-slate-50 p-8 text-center text-sm text-slate-500 dark:border-gray-700 dark:bg-gray-900 dark:text-slate-300">
                    No active road events match your current filters.
                  </div>
                ) : (
                  <>
                    <div className="relative z-0 grid grid-cols-[minmax(0,1fr)_22px_max-content] gap-x-3 gap-y-3">
                      {/*This map iterates through each visible filtered event and renders an EventCard*/}
                      {visibleListEvents.map((event, index) => {
                        const cardKey = getEventCardKey(event, index)
                        return (
                          <EventCard
                            key={cardKey}
                            event={event}
                            expanded={expandedCardKeySet.has(cardKey)}
                            onToggleExpanded={() => toggleEventExpanded(cardKey)}
                          />
                        )
                      })}
                    </div>
                    {/*Show more button appears when additional filtered events exist beyond visibleListCount*/}
                    {visibleListCount < filteredEvents.length && (
                      <div className="pt-3 text-center">
                        <button
                          type="button"
                          onClick={() => setVisibleListCount((count) => count + LIST_SHOW_MORE_COUNT)}
                          className="rounded-lg border border-black bg-white px-5 py-2.5 text-sm font-bold text-black transition hover:bg-gray-100"
                        >
                          Show more
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            ) : (
              <DriveBCMap
                events={hasMapSelection ? filteredEvents : []}
                showNexusWaits={showNexusWaits}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}//DriveBCSection
