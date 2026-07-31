//declaring react hooks for debounce state management
import { useEffect, useState } from "react"

//This function delays updating a value until the user stops typing, eg. search input
export function useDebounce<T>(value: T, delayMs: number = 250): T {
  //declaring debounced copy of the incoming value
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    //scheduling update after delayMs milliseconds of inactivity
    const handler = setTimeout(() => setDebouncedValue(value), delayMs)
    return () => clearTimeout(handler)
  }, [value, delayMs])

  return debouncedValue
}//useDebounce
