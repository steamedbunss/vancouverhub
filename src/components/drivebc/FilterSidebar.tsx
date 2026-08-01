import type { FilterState, EventType, Severity } from "../../types/drivebc"
import type { DerivedFilterOptions } from "../../utils/filterOptions"
import { themedCard, themedCardDivider } from "../ui/themedCard"
import { FilterGroup } from "./FilterGroup"

interface FilterSidebarProps {
  filters: FilterState
  options: DerivedFilterOptions
  onToggleFilter: <K extends keyof Omit<FilterState, "search" | "sortBy">>(
    key: K,
    value: FilterState[K][number]
  ) => void
  onSearchChange: (query: string) => void
  onClearSelections: () => void
  showSearch: boolean
  nexusEnabled: boolean
  onNexusChange: (enabled: boolean) => void
  className?: string
}

export function FilterSidebar({
  filters,
  options,
  onToggleFilter,
  onSearchChange,
  onClearSelections,
  showSearch,
  nexusEnabled,
  onNexusChange,
  className,
}: FilterSidebarProps) {
  //selectedCount is the total number of active checkbox filters across all groups
  const selectedCount =
    filters.severities.length +
    filters.types.length +
    filters.areas.length +
    filters.roads.length

  return (
    <div className={`h-fit space-y-4 rounded-xl p-4 ${themedCard} ${className ?? ''}`}>
      {/*Sidebar header with Filters title and optional Clear button*/}
      <div className={`flex items-center justify-between border-b pb-2 ${themedCardDivider}`}>
        <h3 className="text-sm font-bold">Filters</h3>
        {/*Clear button only appears when at least one filter is selected*/}
        {selectedCount > 0 && (
          <button onClick={onClearSelections} className="text-xs text-blue-600 hover:underline dark:text-sky-300">
            Clear ({selectedCount})
          </button>
        )}
      </div>

      {/*Search input in list view, NEXUS checkbox in map view*/}
      <div className="min-h-[34px]">
        {showSearch ? (
          //List view shows a text search field for road, city, or area
          <input
            type="text"
            placeholder="Search road, city, area..."
            value={filters.search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full rounded-md border border-black bg-white px-3 py-2 text-xs text-black placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-white/40 dark:bg-gray-900 dark:text-white dark:placeholder:text-gray-400"
          />
        ) : (
          //Map view replaces search with a NEXUS border wait times toggle
          <label className="flex h-[34px] cursor-pointer items-center gap-2 text-sm font-semibold">
            <input
              type="checkbox"
              checked={nexusEnabled}
              onChange={(event) => onNexusChange(event.target.checked)}
              className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />
            Border Wait Times
          </label>
        )}
      </div>

      {/*Severity filter group, open by default*/}
      <FilterGroup<Severity>
        title="Severity"
        options={options.severities}
        selected={filters.severities}
        onToggle={(val) => onToggleFilter("severities", val)}
        defaultOpen={true}
      />

      {/*Event type filter group, open by default*/}
      <FilterGroup<EventType>
        title="Event Type"
        options={options.types}
        selected={filters.types}
        onToggle={(val) => onToggleFilter("types", val)}
        defaultOpen={true}
      />

      {/*Highway/road filter group, collapsed by default*/}
      <FilterGroup<string>
        title="Highway / Road"
        options={options.roads}
        selected={filters.roads}
        onToggle={(val) => onToggleFilter("roads", val)}
        defaultOpen={false}
      />

      {/*Region filter group, collapsed by default*/}
      <FilterGroup<string>
        title="Region"
        options={options.areas}
        selected={filters.areas}
        onToggle={(val) => onToggleFilter("areas", val)}
        defaultOpen={false}
      />
    </div>
  )
}//FilterSidebar
