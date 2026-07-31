import { useEffect, useRef, useState } from 'react'
import { Search } from 'lucide-react'
import {
  getAddressSuggestions,
  getPlaceLocation,
  type PlaceSuggestion,
} from '../../lib/api/placesAutocomplete'

//declaring the shape returned when the user picks an address
interface SelectedAddress {
  label: string
  latitude: number
  longitude: number
}

//declaring props for the Vancouver address search input
interface AddressAutocompleteProps {
  value: string
  onChange: (value: string) => void
  onSelect: (address: SelectedAddress) => void | Promise<void>
}

//constant minimum characters before the Places API is queried
const MINIMUM_SEARCH_LENGTH = 3
//constant debounce delay in ms before firing a search request
const SEARCH_DEBOUNCE_MS = 350

//AddressAutocomplete debounces user input and shows Vancouver address suggestions
export function AddressAutocomplete({ value, onChange, onSelect }: AddressAutocompleteProps) {
  //declaring state for the current suggestion list from the Places API
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSelecting, setIsSelecting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  //sessionTokenRef keeps one Google Places session token per search session
  const sessionTokenRef = useRef<string | null>(null)
  //cacheRef stores prior query results to avoid repeat API calls
  const cacheRef = useRef(new Map<string, PlaceSuggestion[]>())

  //getSessionToken creates or returns the current Places session token
  function getSessionToken() {
    if (!sessionTokenRef.current) sessionTokenRef.current = crypto.randomUUID()
    return sessionTokenRef.current
  }//getSessionToken

  //resetSearch clears the session token, cache, and suggestion list
  function resetSearch() {
    sessionTokenRef.current = null
    cacheRef.current.clear()
    setSuggestions([])
  }//resetSearch

  //This useEffect debounces value changes and fetches address suggestions
  //If input is too short, search state is cleared
  //If a cached result exists, it is reused without a network call
  useEffect(() => {
    const input = value.trim()
    if (input.length < MINIMUM_SEARCH_LENGTH) {
      resetSearch()
      setIsLoading(false)
      setError(null)
      return
    }

    const cached = cacheRef.current.get(input)
    if (cached) {
      setSuggestions(cached)
      setError(null)
      return
    }

    const controller = new AbortController()
    const timer = window.setTimeout(() => {
      setIsLoading(true)
      setError(null)
      void getAddressSuggestions(input, getSessionToken(), controller.signal)
        .then((results) => {
          cacheRef.current.set(input, results)
          setSuggestions(results)
        })
        .catch((requestError: unknown) => {
          if (controller.signal.aborted) return
          setSuggestions([])
          setError(requestError instanceof Error ? requestError.message : 'Address search is unavailable.')
        })
        .finally(() => {
          if (!controller.signal.aborted) setIsLoading(false)
        })
    }, SEARCH_DEBOUNCE_MS)

    return () => {
      window.clearTimeout(timer)
      controller.abort()
    }
  }, [value])

  //handleSelect resolves the chosen place to lat/lng and calls onSelect
  async function handleSelect(suggestion: PlaceSuggestion) {
    setIsSelecting(true)
    setError(null)
    try {
      const selected = await getPlaceLocation(suggestion.placeId, getSessionToken())
      resetSearch()
      onChange('')
      await onSelect(selected)
    } catch (selectionError) {
      setError(selectionError instanceof Error ? selectionError.message : 'Could not use that address.')
    } finally {
      setIsSelecting(false)
      sessionTokenRef.current = null
    }
  }//handleSelect

  const shouldShowSuggestions = value.trim().length >= MINIMUM_SEARCH_LENGTH

  return (
    <div className="relative">
      {/*Search input with magnifying glass icon*/}
      <div className="relative mt-3">
        <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pr-3 pl-10 text-sm text-gray-900 outline-none transition focus:border-hub-navy focus:ring-2 focus:ring-hub-navy/10 dark:border-gray-600 dark:bg-gray-900 dark:text-white dark:placeholder:text-gray-500"
          placeholder="Search a Vancouver address"
          autoComplete="off"
        />
      </div>

      {/*Suggestion dropdown with loading, results, empty, and error states*/}
      {shouldShowSuggestions && (isLoading || suggestions.length > 0 || error) && (
        <div className="address-suggestions absolute z-20 mt-1 w-full overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-900">
          {isLoading && <p className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">Searching Vancouver addresses...</p>}
          {!isLoading && suggestions.map((suggestion) => (
            <button
              key={suggestion.placeId}
              type="button"
              disabled={isSelecting}
              onClick={() => void handleSelect(suggestion)}
              className="block w-full px-3 py-2 text-left text-sm text-gray-900 transition hover:bg-gray-50 disabled:cursor-wait dark:text-sky-300 dark:hover:bg-gray-800"
            >
              {suggestion.label}
            </button>
          ))}
          {!isLoading && !error && suggestions.length === 0 && (
            <p className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">No Vancouver addresses found.</p>
          )}
          {error && <p className="px-3 py-2 text-sm text-red-600 dark:text-red-400">{error}</p>}
        </div>
      )}
    </div>
  )
}//AddressAutocomplete

export type { SelectedAddress }
