import { useState } from "react"
import { themedCardDivider } from "../ui/themedCard"

//FilterOption describes a single checkbox choice with label, value, and event count
export interface FilterOption<T extends string> {
  label: string
  value: T
  count: number
}

interface FilterGroupProps<T extends string> {
  title: string
  options: FilterOption<T>[]
  selected: T[]
  onToggle: (value: T) => void
  defaultOpen?: boolean
}

export function FilterGroup<T extends string>({
  title,
  options,
  selected,
  onToggle,
  defaultOpen = false,
}: FilterGroupProps<T>) {
  //declaring state to track whether this filter group is expanded or collapsed
  const [isOpen, setIsOpen] = useState(defaultOpen)

  //If there are no options to show, render nothing
  if (options.length === 0) return null

  return (
    <div className={`border-b pb-3 ${themedCardDivider}`}>
      {/*Header button toggles the checkbox list open and closed*/}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex w-full items-center justify-between py-1 text-sm font-semibold hover:opacity-80`}
      >
        <span>
          {title} {selected.length > 0 && <span className="text-blue-600 dark:text-sky-300">({selected.length})</span>}
        </span>
        <span className="text-xs">{isOpen ? "−" : "+"}</span>
      </button>

      {/*Checkbox list is only rendered when the group is open*/}
      {isOpen && (
        <div className="mt-2 max-h-48 space-y-1.5 overflow-y-auto pl-1 pr-1">
          {/*This map iterates through each filter option and renders a checkbox row*/}
          {options.map((opt) => {
            //isChecked is true when this option's value is in the selected array
            const isChecked = selected.includes(opt.value)
            return (
              <label
                key={opt.value}
                className="flex cursor-pointer items-center justify-between text-xs hover:opacity-80"
              >
                <div className="flex items-center gap-2 truncate pr-2">
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => onToggle(opt.value)}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="truncate">{opt.label}</span>
                </div>
                {/*Count badge highlights when the option is checked*/}
                <span
                  className={`rounded-full px-1.5 py-0.5 text-[10px] ${
                    isChecked
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-black dark:bg-gray-800 dark:text-gray-200"
                  }`}
                >
                  {opt.count}
                </span>
              </label>
            )
          })}
        </div>
      )}
    </div>
  )
}//FilterGroup
