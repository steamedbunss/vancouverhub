import { useEffect, useState } from "react"
import { fetchDriveBCEvents } from "../lib/api/open511"
import type { DriveBCEvent, SortOption } from "../types/drivebc"
import { useDriveBCFilters } from "../hooks/useDriveBCFilters"
import { FilterSidebar } from "./drivebc/FilterSidebar"
import { ActiveChips } from "./drivebc/ActiveChips"
import { EventCard } from "./drivebc/EventCard"
import { DriveBCMap } from "./drivebc/DriveBCMap"

//declaring the view mode type as either list or map
type ViewMode = "list" | "map"

//constant for how many event cards to show before the user clicks Show more
const LIST_PAGE_SIZE = 4

//shared minimum height class so list and map views do not jump when toggling
const CONTENT_MIN_HEIGHT_CLASS = "min-h-[560px]"

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
  const [visibleListCount, setVisibleListCount] = useState(LIST_PAGE_SIZE)

  //declaring state as a Set to track which event cards are expanded
  //eg. if an event id is in the Set, that card shows its full description
  const [expandedEventIds, setExpandedEventIds] = useState<Set<string>>(() => new Set())

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

  //This useEffect resets visibleListCount back to LIST_PAGE_SIZE
  //whenever the user changes filters or switches between list and map
  useEffect(() => {
    setVisibleListCount(LIST_PAGE_SIZE)
  }, [filters, viewMode])

  //This useEffect clears all expanded cards when filters or view mode change
  //so descriptions do not stay open after the event list changes
  useEffect(() => {
    setExpandedEventIds(new Set())
  }, [filters, viewMode])

  //toggleEventExpanded adds or removes an event id from expandedEventIds
  //If the id is already in the Set, it is removed to collapse the card
  //If the id is not in the Set, it is added to expand the card
  function toggleEventExpanded(eventId: string) {
    setExpandedEventIds((current) => {
      const next = new Set(current)
      if (next.has(eventId)) next.delete(eventId)
      else next.add(eventId)
      return next
    })
  }//toggleEventExpanded

  //collapseAllEvents clears the Set so every event card returns to collapsed
  function collapseAllEvents() {
    setExpandedEventIds(new Set())
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
  //eg. if visibleListCount is 4, only the first 4 filtered events are shown
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
        <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-2 dark:border-gray-700">
          <div className="text-xs text-slate-500 dark:text-slate-300">
            Showing <strong className="dark:text-white">{displayedEventCount}</strong> of {events.length} active events
          </div>

          <div className="flex items-center gap-2 text-xs">
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

          <div className={`w-full max-w-xl shrink-0 md:w-[36rem] ${CONTENT_MIN_HEIGHT_CLASS}`}>
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
                    <div className="relative space-y-3">
                      {/*Collapse all button sits at the top right, aligned with the first card*/}
                      <button
                        type="button"
                        onClick={collapseAllEvents}
                        disabled={expandedEventIds.size === 0}
                        className="absolute top-0 right-0 z-10 rounded-md border border-black bg-white px-2.5 py-1 text-[11px] font-bold whitespace-nowrap text-black transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40 dark:border-white dark:bg-gray-950 dark:text-white dark:hover:bg-gray-900"
                      >
                        Collapse all
                      </button>
                      {/*This map iterates through each visible filtered event and renders an EventCard*/}
                      {visibleListEvents.map((event) => (
                        <EventCard
                          key={event.id}
                          event={event}
                          expanded={expandedEventIds.has(event.id)}
                          onToggleExpanded={() => toggleEventExpanded(event.id)}
                        />
                      ))}
                    </div>
                    {/*Show more button appears when additional filtered events exist beyond visibleListCount*/}
                    {visibleListCount < filteredEvents.length && (
                      <div className="pt-3 text-center">
                        <button
                          type="button"
                          onClick={() => setVisibleListCount((count) => count + LIST_PAGE_SIZE)}
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
              //Map view renders the DriveBC map; events are passed only when filters are selected
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
