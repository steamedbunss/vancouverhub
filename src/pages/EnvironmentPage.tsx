//EnvironmentPage.tsx shows weather, air quality, fire weather, and active wildfires for BC
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { RainbowText } from '../components/RainbowText'
import { AirQualityCard } from '../components/environment/AirQualityCard'
import { AirQualityLoginPrompt } from '../components/environment/AirQualityLoginPrompt'
import { CurrentConditionsCard } from '../components/environment/CurrentConditionsCard'
import { FireWeatherCard } from '../components/environment/FireWeatherCard'
import {
  EvacuationAlertIcon,
  EvacuationOrderIcon,
  WildfireCard,
} from '../components/environment/WildfireCard'
import { NumberStepper } from '../components/ui/NumberStepper'
import { useAuth } from '../context/AuthContext'
import { useResolvedLocation } from '../context/LocationContext'
import {
  getActiveWildfires,
  getCurrentAqhi,
  getNearbyFireWeather,
} from '../lib/api/environment'
import { getFireEvacuationLookup, type EvacuationNotice } from '../lib/api/evacuation'
import { distanceBetweenKm } from '../lib/location/distance'
import type { ApiAqhi, ApiFireWeather, ApiWildfire } from '../types/backend'

//EnvironmentData groups all fetched environment API results for the page
interface EnvironmentData {
  aqhi: ApiAqhi | null
  activeFires: ApiWildfire[]
  fireWeather: ApiFireWeather | null
  evacuations: Map<string, EvacuationNotice[]>
}

//constant for the default number of wildfire cards shown before pagination
const DEFAULT_WILDFIRE_CARD_COUNT = 9
//constant limiting how many wildfire cards guest users may view
const GUEST_WILDFIRE_LIMIT = DEFAULT_WILDFIRE_CARD_COUNT

//WildfireFilter selects which wildfires appear in the grid
type WildfireFilter =
  | 'out-of-control'
  | 'under-control'
  | 'being-held'
  | 'unknown'
  | 'evacuation-order'
  | 'evacuation-alert'
  | 'noteworthy'

//WildfireSort selects the ordering applied after status filters
type WildfireSort =
  | 'distance-nearest'
  | 'size-largest'
  | 'size-smallest'
  | 'updated-newest'
  | 'updated-oldest'
  | 'discovered-newest'
  | 'discovered-oldest'
  | 'name-az'

const WILDFIRE_SORTS: Array<{ value: WildfireSort; label: string }> = [
  { value: 'distance-nearest', label: 'Distance: nearest' },
  { value: 'size-largest', label: 'Size: largest' },
  { value: 'size-smallest', label: 'Size: smallest' },
  { value: 'updated-newest', label: 'Updated: newest' },
  { value: 'updated-oldest', label: 'Updated: oldest' },
  { value: 'discovered-newest', label: 'Discovered: newest' },
  { value: 'discovered-oldest', label: 'Discovered: oldest' },
  { value: 'name-az', label: 'Name: A to Z' },
]

export function EnvironmentPage() {
  const { token } = useAuth()
  const location = useResolvedLocation()
  //declaring state to hold fetched environment data; null until the first load completes
  const [data, setData] = useState<EnvironmentData | null>(null)
  //declaring state to hold load error messages
  const [error, setError] = useState<string | null>(null)
  //declaring state for how many wildfire cards the user wants visible
  const [cardCount, setCardCount] = useState(DEFAULT_WILDFIRE_CARD_COUNT)
  //declaring state for whether signed in users chose to show all wildfires
  const [showAllWildfires, setShowAllWildfires] = useState(false)
  //declaring state for checkbox-like status filters and result ordering
  const [wildfireFilters, setWildfireFilters] = useState<WildfireFilter[]>([])
  const [wildfireSort, setWildfireSort] = useState<WildfireSort>('distance-nearest')

  //This function changes the number of visible wildfire cards within its bounds
  function stepCardCount(direction: 1 | -1) {
    const maximum = Math.max(inputMaximumCardCount, 1)
    setShowAllWildfires(false)
    setCardCount((currentCount) => Math.min(maximum, Math.max(1, currentCount + direction)))
  }//stepCardCount

  //This function toggles one visual filter chip without affecting other selections
  function toggleWildfireFilter(filter: WildfireFilter) {
    setWildfireFilters((current) => current.includes(filter)
      ? current.filter((item) => item !== filter)
      : [...current, filter])
  }//toggleWildfireFilter

  //This function gives selected filter chips a distinct filled background
  function wildfireFilterClass(filter: WildfireFilter) {
    return `inline-flex items-center gap-2 rounded-full border px-3 py-2 transition ${
      wildfireFilters.includes(filter)
        ? 'border-black bg-hub-navy text-white dark:border-sky-300 dark:bg-sky-300 dark:text-gray-950'
        : 'border-black hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-800'
    }`
  }//wildfireFilterClass

  //This useEffect runs when location or token changes
  //It loads active wildfires, evacuation notices, and optional signed in AQHI and fire weather
  //The cleanup function sets cancelled to true to ignore stale responses
  useEffect(() => {
    let cancelled = false

    async function loadEnvironment() {
      setError(null)
      try {
        const [activeFires, evacuations] = await Promise.all([
          getActiveWildfires(),
          getFireEvacuationLookup(),
        ])

        const aqhi = token ? await getCurrentAqhi(token).catch(() => null) : null

        const fireWeather = token
          ? await getNearbyFireWeather(token).then((items) => items[0] ?? null).catch(() => null)
          : null

        if (!cancelled) {
          setData({ aqhi, activeFires, fireWeather, evacuations })
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : 'Could not load environment information.')
        }
      }
    }

    void loadEnvironment()
    return () => { cancelled = true }
  }, [location?.lat, location?.lon, token])

  //If the fetch failed, show an error message and stop rendering the rest
  if (error) {
    return <div className="mx-auto max-w-6xl px-6 py-20 text-sm text-red-600">{error}</div>
  }

  //If data or location is not ready yet, show a loading message
  if (!data || !location) {
    return <div className="mx-auto max-w-6xl px-6 py-20 text-gray-500 dark:text-gray-400">Loading environment information...</div>
  }

  //Everyone browses the same province wide active fire data
  //Signed in users may reveal the complete API result, while guests are limited to nine cards
  //Nearby data is kept only for the personal nearest fire summary below
  //The public active fire feed does not include distances; enrich it locally using resolved location
  const fires = data.activeFires
    .map((fire) => ({
      ...fire,
      distanceKm: distanceBetweenKm(location.lat, location.lon, fire.latitude, fire.longitude),
    }))
    .sort((first, second) => first.distanceKm - second.distanceKm)
  const wildfireTitle = 'Active wildfires in British Columbia'
  const maximumCardCount = fires.length
  //inputMaximumCardCount caps the number input for guests at GUEST_WILDFIRE_LIMIT
  const inputMaximumCardCount = token
    ? maximumCardCount
    : Math.min(maximumCardCount, GUEST_WILDFIRE_LIMIT)
  //safeCardCount clamps cardCount between 1 and the allowed maximum
  const safeCardCount = Math.min(Math.max(cardCount, 1), Math.max(inputMaximumCardCount, 1))

  //filteredFires applies any selected status, evacuation, or noteworthy filters
  const filteredFires = fires.filter((fire) => {
    if (wildfireFilters.length === 0) return true
    const evacuations = data.evacuations.get(fire.fireNumber) ?? []
    const status = fire.status.toLowerCase()
    const knownStatuses = ['out of control', 'under control', 'being held']

    return wildfireFilters.some((filter) => {
      switch (filter) {
        case 'out-of-control': return status === 'out of control'
        case 'under-control': return status === 'under control'
        case 'being-held': return status === 'being held'
        case 'unknown': return !knownStatuses.includes(status)
        case 'evacuation-order': return evacuations.some((notice) => notice.status === 'Order')
        case 'evacuation-alert': return evacuations.some((notice) => notice.status === 'Alert')
        case 'noteworthy': return fire.fireOfNote
      }
    })
  })

  //sortedFires orders the filtered set before the card limit is applied
  const sortedFires = [...filteredFires].sort((first, second) => {
    const firstUpdated = Date.parse(first.lastSyncedAt)
    const secondUpdated = Date.parse(second.lastSyncedAt)
    const firstDiscovered = first.ignitionDate ? Date.parse(first.ignitionDate) : Number.NaN
    const secondDiscovered = second.ignitionDate ? Date.parse(second.ignitionDate) : Number.NaN
    const firstName = first.incidentName?.trim() || first.geographicDescription?.trim() || first.fireNumber
    const secondName = second.incidentName?.trim() || second.geographicDescription?.trim() || second.fireNumber

    switch (wildfireSort) {
      case 'size-largest': return (second.sizeHectares ?? -1) - (first.sizeHectares ?? -1)
      case 'size-smallest': return (first.sizeHectares ?? Number.MAX_VALUE) - (second.sizeHectares ?? Number.MAX_VALUE)
      case 'updated-newest': return (Number.isFinite(secondUpdated) ? secondUpdated : 0) - (Number.isFinite(firstUpdated) ? firstUpdated : 0)
      case 'updated-oldest': return (Number.isFinite(firstUpdated) ? firstUpdated : Number.MAX_VALUE) - (Number.isFinite(secondUpdated) ? secondUpdated : Number.MAX_VALUE)
      case 'discovered-newest': return (Number.isFinite(secondDiscovered) ? secondDiscovered : 0) - (Number.isFinite(firstDiscovered) ? firstDiscovered : 0)
      case 'discovered-oldest': return (Number.isFinite(firstDiscovered) ? firstDiscovered : Number.MAX_VALUE) - (Number.isFinite(secondDiscovered) ? secondDiscovered : Number.MAX_VALUE)
      case 'name-az': return firstName.localeCompare(secondName)
      default: return first.distanceKm - second.distanceKm
    }
  })

  //visibleFires slices filtered results for guests or shows all when showAllWildfires is true
  const visibleFires = showAllWildfires && token
    ? sortedFires
    : sortedFires.slice(0, safeCardCount)
  //hasMoreForGuest is true when a guest has additional wildfires beyond the guest limit
  const hasMoreForGuest = !token && filteredFires.length > visibleFires.length

  return (
    <div className="mx-auto max-w-6xl px-6 py-14 md:py-20">
      {/*Page title and description*/}
      <h1 className="mt-3 text-5xl font-black tracking-tighter md:text-7xl"><RainbowText>Environment</RainbowText></h1>
      <p className="mt-4 max-w-2xl text-lg text-gray-500 dark:text-gray-300">Current weather, air quality, and wildfires for British Columbia.</p>

      {/*Current conditions and air quality cards in a two column grid*/}
      <div className="mt-10 grid gap-6 md:grid-cols-2">
        {location.weather ? (
          <CurrentConditionsCard weather={location.weather} />
        ) : (
          <section className="h-fit rounded-3xl border border-black bg-white p-6 text-gray-900 shadow-sm md:p-8 dark:border-white dark:bg-gray-950 dark:text-white dark:shadow-[0_0_18px_rgba(255,255,255,0.45)]">
            <h2 className="text-3xl font-black tracking-tight">Weather unavailable</h2>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">We could not load weather for your current location.</p>
          </section>
        )}
        {data.aqhi ? <AirQualityCard aqhi={data.aqhi} /> : <AirQualityLoginPrompt />}
      </div>

      {/*Fire weather card for signed in users with nearby station data*/}
      {data.fireWeather && (
        <div className="mt-6 w-full">
          <FireWeatherCard weather={data.fireWeather} />
        </div>
      )}

      {/*Active wildfires section with filters, legend, and card grid*/}
      <section className="mt-14">
        <div className="flex flex-col gap-4 lg:flex-row lg:flex-nowrap lg:items-end lg:justify-between lg:gap-4">
          <h2 className="shrink-0 text-3xl font-black tracking-tight text-gray-900 dark:text-white">{wildfireTitle}</h2>

          {/*Wildfire count input, show all toggle, and status filter dropdown*/}
          <div className="grid items-end gap-3 sm:grid-cols-[auto_13rem] lg:grid-cols-[auto_13rem_13.5rem]">
            <label className="flex flex-col gap-1.5 text-sm font-semibold text-gray-700 dark:text-gray-200">
              Cards to show
              <div className="flex overflow-hidden rounded-lg border border-gray-300 bg-white dark:border-gray-600 dark:bg-gray-900">
                <NumberStepper
                  min={1}
                  max={Math.max(inputMaximumCardCount, 1)}
                  value={safeCardCount}
                  disabled={showAllWildfires && Boolean(token)}
                  onChange={(event) => {
                    setShowAllWildfires(false)
                    setCardCount(Number(event.target.value) || 1)
                  }}
                  onIncrement={() => stepCardCount(1)}
                  onDecrement={() => stepCardCount(-1)}
                  inputClassName="w-20 px-3 py-2 pr-7 text-sm font-medium text-gray-900 outline-none disabled:bg-gray-100 disabled:text-gray-400 dark:bg-gray-900 dark:text-white dark:disabled:bg-gray-800 dark:disabled:text-gray-500"
                />
                <button
                  type="button"
                  disabled={!token}
                  onClick={() => setShowAllWildfires((showAll) => !showAll)}
                  className={`border-l border-gray-300 px-3 py-2 text-sm font-semibold transition dark:border-gray-600 ${
                    showAllWildfires && token
                      ? 'bg-hub-navy text-white'
                      : 'text-hub-navy hover:bg-gray-50 disabled:cursor-not-allowed disabled:text-gray-400 dark:text-sky-300 dark:hover:bg-gray-800 dark:disabled:text-gray-600'
                  }`}
                >
                  All
                </button>
              </div>
            </label>

            <label className="flex min-w-52 flex-col gap-1.5 text-sm font-semibold text-gray-700 dark:text-gray-200">
              Sort wildfires
              <select
                value={wildfireSort}
                onChange={(event) => setWildfireSort(event.target.value as WildfireSort)}
                className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-900 outline-none transition focus:border-hub-navy focus:ring-2 focus:ring-hub-navy/15 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
              >
                {WILDFIRE_SORTS.map((sort) => (
                  <option key={sort.value} value={sort.value}>{sort.label}</option>
                ))}
              </select>
            </label>

            <p className="pb-2 text-sm whitespace-nowrap text-gray-500 sm:col-span-2 lg:col-span-1 dark:text-gray-400">
              Showing <strong className="inline-block w-7 text-right font-bold tabular-nums text-gray-700 dark:text-gray-200">{visibleFires.length}</strong> of{' '}
              <strong className="inline-block w-7 text-right font-bold tabular-nums text-gray-700 dark:text-gray-200">{filteredFires.length}</strong> wildfires
            </p>
          </div>
        </div>

        {/*Color and icon chips act as checkbox-like multi-select wildfire filters*/}
        <div
          className="mt-5 flex flex-wrap items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-200"
          aria-label="Filter wildfires"
        >
          <button type="button" aria-pressed={wildfireFilters.includes('under-control')} onClick={() => toggleWildfireFilter('under-control')} className={wildfireFilterClass('under-control')}>
            <span className="h-3.5 w-3.5 rounded-full bg-lime-400" aria-hidden />
            Under Control
          </button>
          <button type="button" aria-pressed={wildfireFilters.includes('being-held')} onClick={() => toggleWildfireFilter('being-held')} className={wildfireFilterClass('being-held')}>
            <span className="h-3.5 w-3.5 rounded-full bg-yellow-300" aria-hidden />
            Being Held
          </button>
          <button type="button" aria-pressed={wildfireFilters.includes('out-of-control')} onClick={() => toggleWildfireFilter('out-of-control')} className={wildfireFilterClass('out-of-control')}>
            <span className="h-3.5 w-3.5 rounded-full bg-red-600" aria-hidden />
            Out of Control
          </button>
          <button type="button" aria-pressed={wildfireFilters.includes('unknown')} onClick={() => toggleWildfireFilter('unknown')} className={wildfireFilterClass('unknown')}>
            <span className="h-3.5 w-3.5 rounded-full bg-gray-400" aria-hidden />
            Unknown
          </button>
          <button type="button" aria-pressed={wildfireFilters.includes('evacuation-alert')} onClick={() => toggleWildfireFilter('evacuation-alert')} className={wildfireFilterClass('evacuation-alert')}>
            <EvacuationAlertIcon className="h-5 w-5 text-[11px]" />
            Evacuation Alert
          </button>
          <button type="button" aria-pressed={wildfireFilters.includes('evacuation-order')} onClick={() => toggleWildfireFilter('evacuation-order')} className={wildfireFilterClass('evacuation-order')}>
            <EvacuationOrderIcon className="h-5 w-5 [&_span]:text-[10px]" />
            Evacuation Order
          </button>
          <button type="button" aria-pressed={wildfireFilters.includes('noteworthy')} onClick={() => toggleWildfireFilter('noteworthy')} className={wildfireFilterClass('noteworthy')}>
            <span className="text-base leading-none" aria-hidden>🔥</span>
            Noteworthy
          </button>
          {wildfireFilters.length > 0 && (
            <button type="button" onClick={() => setWildfireFilters([])} className="rounded-full px-3 py-2 text-gray-500 underline underline-offset-2 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
              Clear filters
            </button>
          )}
        </div>

        {/*This map iterates through each visible wildfire and renders a WildfireCard*/}
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {visibleFires.map((fire) => (
            <WildfireCard 
              key={fire.id} 
              fire={fire} 
              evacuations={data.evacuations.get(fire.fireNumber) ?? []} 
            />
          ))}
        </div>

        {fires.length === 0 && <p className="mt-6 text-sm text-gray-500 dark:text-gray-400">No active wildfires reported.</p>}

        {/*Guest upsell when more wildfires exist beyond the guest card limit*/}
        {hasMoreForGuest && (
          <div className="mt-8 rounded-2xl border border-black bg-white p-6 text-center text-gray-900 dark:border-white dark:bg-gray-950 dark:text-white dark:shadow-[0_0_18px_rgba(255,255,255,0.45)]">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Showing {visibleFires.length} of {fires.length} active wildfires. Sign in to view more than {GUEST_WILDFIRE_LIMIT}.
            </p>
            <Link
              to="/login"
              className="mt-3 inline-block rounded-lg bg-hub-navy px-5 py-2 text-sm font-semibold text-white hover:opacity-90"
            >
              Sign in to see all wildfires
            </Link>
          </div>
        )}
      </section>
    </div>
  )
}//EnvironmentPage
