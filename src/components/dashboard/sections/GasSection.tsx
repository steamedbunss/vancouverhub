import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../../context/AuthContext'
import { getCheapestGasStations } from '../../../lib/api/gas'
import { formatUpdateDateTime } from '../../../lib/formatters/dateTime'
import type { ApiFuelType, ApiGasStation } from '../../../types/backend'

//FUEL_OPTIONS lists the fuel types the user can switch between
const FUEL_OPTIONS: Array<{ key: ApiFuelType; label: string }> = [
  { key: 'REGULAR', label: 'Regular' },
  { key: 'MIDGRADE', label: 'Midgrade' },
  { key: 'PREMIUM', label: 'Premium' },
]

//constant for how many stations are visible in the scroll viewport at once
const VISIBLE_STATION_COUNT = 3

//INITIAL_STATION_LIMIT is the first batch size fetched from the API
const INITIAL_STATION_LIMIT = VISIBLE_STATION_COUNT * 2

//STATION_BATCH_SIZE is how many additional stations to load on scroll
const STATION_BATCH_SIZE = 3

export function GasSection({ featured = false, compact = false }: { featured?: boolean; compact?: boolean }) {
  //token and user from auth context; gas prices require a signed-in user with a location
  const { token, user } = useAuth()

  //declaring state for the currently selected fuel type
  const [fuelType, setFuelType] = useState<ApiFuelType>('REGULAR')

  //declaring state to track whether the user has manually chosen a fuel type
  const [hasChosenFuelType, setHasChosenFuelType] = useState(false)

  //declaring state to hold gas stations returned from the API
  const [stations, setStations] = useState<ApiGasStation[]>([])

  //declaring state for the fuel type that the current stations list was fetched with
  const [stationsFuelType, setStationsFuelType] = useState<ApiFuelType | null>(null)

  //declaring state to track whether stations are being loaded
  const [loading, setLoading] = useState(true)

  //declaring state for how many stations to request from the API
  const [stationLimit, setStationLimit] = useState(INITIAL_STATION_LIMIT)

  //declaring state for whether more stations can be loaded on scroll
  const [hasMore, setHasMore] = useState(true)

  //declaring state for whether the user is actively scrolling the station list
  const [isScrolling, setIsScrolling] = useState(false)

  //declaring state for error messages shown to the user
  const [error, setError] = useState<string | null>(null)

  //scrollIdleTimer ref holds the timeout id used to detect scroll idle
  const scrollIdleTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  //This useEffect syncs fuelType with the user profile preference until they pick manually
  useEffect(() => {
    if (!hasChosenFuelType) {
      setFuelType(user?.preferredFuelType ?? 'REGULAR')
    }
  }, [hasChosenFuelType, user?.preferredFuelType])

  //This useEffect resets pagination when fuel type or auth token changes
  useEffect(() => {
    setStationLimit(INITIAL_STATION_LIMIT)
    setHasMore(true)
  }, [fuelType, token])

  //This useEffect loads gas stations whenever token, fuelType, or stationLimit change
  //The cancelled flag prevents state updates if the component unmounts mid-fetch
  useEffect(() => {
    const currentToken = token
    let cancelled = false

    if (!currentToken) {
      setStations([])
      setStationsFuelType(null)
      setError(null)
      setLoading(false)
      return () => {
        cancelled = true
      }
    }

    async function loadStations() {
      setLoading(true)
      setError(null)

      try {
        const data = await getCheapestGasStations(currentToken, fuelType, stationLimit)
        if (!cancelled) {
          setStations(data)
          setStationsFuelType(fuelType)
          setHasMore(data.length >= stationLimit)
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Could not load gas stations')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void loadStations()
    return () => {
      cancelled = true
    }
  }, [token, fuelType, stationLimit])

  //This useEffect clears the scroll idle timer when the component unmounts
  useEffect(
    () => () => {
      if (scrollIdleTimer.current) clearTimeout(scrollIdleTimer.current)
    },
    [],
  )

  //selectFuelType marks a manual choice and updates the active fuel type
  function selectFuelType(nextFuelType: ApiFuelType) {
    setHasChosenFuelType(true)
    setFuelType(nextFuelType)
  }//selectFuelType

  //handleStationScroll detects near-bottom scroll and loads the next batch of stations
  //It also toggles isScrolling while the user is actively scrolling
  function handleStationScroll(event: React.UIEvent<HTMLDivElement>) {
    const viewport = event.currentTarget
    setIsScrolling(true)

    if (scrollIdleTimer.current) clearTimeout(scrollIdleTimer.current)
    scrollIdleTimer.current = setTimeout(() => setIsScrolling(false), 700)

    const distanceFromBottom =
      viewport.scrollHeight - viewport.scrollTop - viewport.clientHeight
    if (distanceFromBottom < 40 && !loading && hasMore) {
      setStationLimit((current) => current + STATION_BATCH_SIZE)
    }
  }//handleStationScroll

  //isFuelSwitching is true while loading after the user changed fuel type
  const isFuelSwitching = loading && stationsFuelType !== null && stationsFuelType !== fuelType

  //isPaging is true while loading additional stations for the same fuel type
  const isPaging = loading && stations.length > 0 && stationsFuelType === fuelType

  return (
    <section className={compact ? 'w-full max-w-2xl min-w-0' : featured ? 'mx-auto w-fit max-w-full py-8 md:py-10' : 'py-8 md:py-10'}>
      {/*Section title; size varies by featured and compact props*/}
      <div className="flex flex-wrap items-baseline gap-x-4 gap-y-2">
        <h2 className={compact ? 'text-5xl font-black tracking-tighter text-gray-900 md:text-6xl md:leading-[0.9] dark:text-white' : featured ? 'text-6xl font-black tracking-tighter text-gray-900 md:text-7xl md:leading-[0.9] dark:text-white' : 'text-5xl font-black tracking-tighter text-gray-900 md:text-6xl md:leading-[0.9] dark:text-white'}>
          Gas
        </h2>
      </div>

      <div className="mt-6">
        {/*Fuel type toggle buttons and last-updated timestamp*/}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-semibold tracking-wide text-gray-400 uppercase dark:text-gray-400">
          <div className="flex items-center gap-4">
            {/*This map renders a button for each fuel type option*/}
            {FUEL_OPTIONS.map((option) => (
              <button
                key={option.key}
                type="button"
                onClick={() => selectFuelType(option.key)}
                className={option.key === fuelType ? 'font-bold text-gray-900 dark:text-white' : 'text-gray-400 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}
              >
                {option.label}
              </button>
            ))}
          </div>
          {stations[0] && (
            <p className="ml-auto normal-case text-gray-400 dark:text-gray-400">
              Updated {formatUpdateDateTime(stations[0].observedAt)}
            </p>
          )}
        </div>

        <div className="mt-4">
          <span className="inline-flex items-center gap-1.5 text-[10px] font-bold tracking-[0.12em] text-teal-700 uppercase">
            <span className="h-1.5 w-1.5 rounded-full bg-teal-600" />
            Cheapest nearby
          </span>
        </div>

        {/*Initial loading skeleton when no stations are loaded yet*/}
        {loading && stations.length === 0 && (
          <div className="mt-4 space-y-3">
            {/*This loop renders three placeholder skeleton rows*/}
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="h-14 animate-pulse rounded-lg bg-gray-100" />
            ))}
          </div>
        )}

        {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

        {!error && (!loading || stations.length > 0) && (
          !token ? (
            //Guest prompt to sign in for personalized gas prices
            <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
              <Link to="/login" className="font-semibold text-hub-navy underline underline-offset-2 dark:text-white">Sign in</Link> to see the three cheapest gas prices near your saved location.
            </p>
          ) : stations.length > 0 ? (
            //Scrollable station list with infinite scroll pagination
            <div
              onScroll={handleStationScroll}
              role="region"
              aria-label="Gas stations"
              tabIndex={0}
              className={`gas-station-scroll mt-5 h-[13.5rem] w-full max-w-full min-w-0 touch-pan-y overflow-y-auto overflow-x-hidden overscroll-contain pr-2 outline-none transition-opacity duration-200 ${
                isScrolling ? 'is-scrolling' : ''
              } ${isFuelSwitching ? 'opacity-60' : 'opacity-100'}`}
            >
              <ul className="min-w-0 space-y-3">
                {/*This map iterates through each station and renders name, distance, and price*/}
                {stations.map((station) => (
                  <li key={station.id} className="grid h-16 min-w-0 grid-cols-[minmax(0,1fr)_7.5rem] items-center gap-5">
                    <div className="min-w-0">
                      <p className="text-base font-medium text-gray-800 dark:text-gray-100">{station.name}</p>
                      <p className="mt-0.5 truncate text-sm text-gray-400 dark:text-gray-400">
                        {station.distanceKm.toFixed(1)} km away · {station.address}
                      </p>
                    </div>
                    <p className="text-right text-2xl font-black tracking-tight tabular-nums text-gray-900 dark:text-white">
                      {station.price.toFixed(2)}c
                    </p>
                  </li>
                ))}
                {isPaging && (
                  <li className="flex h-16 items-center text-sm text-gray-500 dark:text-gray-400">
                    Loading more stations...
                  </li>
                )}
              </ul>
            </div>
          ) : (
            //Empty state when no stations exist for the selected fuel type nearby
            <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
              No {fuelType.toLowerCase()} gas prices are available within 25 km of your location yet.
            </p>
          )
        )}
      </div>
    </section>
  )
}//GasSection
