import type { FilterState } from "../../types/drivebc"

interface ActiveChipsProps {
  filters: FilterState
  onRemove: <K extends keyof Omit<FilterState, "search" | "sortBy">>(key: K, value: string) => void
  onClearSearch: () => void
  showSearch: boolean
}

export function ActiveChips({ filters, onRemove, onClearSearch, showSearch }: ActiveChipsProps) {
  //hasChips is true when at least one active filter or search term exists
  const hasChips =
    (showSearch && filters.search) ||
    filters.severities.length > 0 ||
    filters.types.length > 0 ||
    filters.areas.length > 0 ||
    filters.roads.length > 0

  //If no filters are active, render nothing
  if (!hasChips) return null

  return (
    <div className="flex flex-wrap gap-1.5 items-center mb-3 text-xs">
      {/*Search chip with remove button, only shown in list view*/}
      {showSearch && filters.search && (
        <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full border border-blue-200">
          Search: "{filters.search}"
          <button onClick={onClearSearch} className="hover:text-blue-900 font-bold">×</button>
        </span>
      )}

      {/*This map renders a removable chip for each selected severity*/}
      {filters.severities.map((v) => (
        <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full border dark:bg-gray-800 dark:text-slate-200 dark:border-gray-600">
          {v}
          <button onClick={() => onRemove("severities", v)} className="hover:text-black font-bold dark:hover:text-white">×</button>
        </span>
      ))}

      {/*This map renders a removable chip for each selected event type*/}
      {filters.types.map((v) => (
        <span key={v} className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full border dark:bg-gray-800 dark:text-slate-200 dark:border-gray-600">
          {v.replace("_", " ")}
          <button onClick={() => onRemove("types", v)} className="hover:text-black font-bold dark:hover:text-white">×</button>
        </span>
      ))}

      {/*This map renders a removable chip for each selected road/highway*/}
      {filters.roads.map((v) => (
        <span key={v} className="inline-flex items-center gap-1 bg-amber-50 text-amber-800 px-2 py-0.5 rounded-full border border-amber-200 dark:bg-amber-950/40 dark:text-amber-200 dark:border-amber-800">
          {v}
          <button onClick={() => onRemove("roads", v)} className="hover:text-black font-bold dark:hover:text-amber-100">×</button>
        </span>
      ))}

      {/*This map renders a removable chip for each selected region/area*/}
      {filters.areas.map((v) => (
        <span key={v} className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full border dark:bg-gray-800 dark:text-slate-200 dark:border-gray-600">
          {v}
          <button onClick={() => onRemove("areas", v)} className="hover:text-black font-bold dark:hover:text-white">×</button>
        </span>
      ))}
    </div>
  )
}//ActiveChips
