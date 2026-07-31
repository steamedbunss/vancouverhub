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
  | 'all'
  | 'out-of-control'
  | 'under-control'
  | 'being-held'
  | 'evacuation-order'
  | 'evacuation-alert'

//WILDFIRE_FILTERS lists the dropdown options for filtering the wildfire grid
const WILDFIRE_FILTERS: Array<{ value: WildfireFilter; label: string }> = [
  { value: 'all', label: 'All active wildfires' },
  { value: 'out-of-control', label: 'Out of control' },
  { value: 'under-control', label: 'Under control' },
  { value: 'being-held', label: 'Being held' },
  { value: 'evacuation-order', label: 'Evacuation order' },
  { value: 'evacuation-alert', label: 'Evacuation alert' },
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
  //declaring state for the active wildfire status or evacuation filter
  const [wildfireFilter, setWildfireFilter] = useState<WildfireFilter>('all')

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

  //filteredFires applies the selected wildfire status or evacuation filter
  const filteredFires = fires.filter((fire) => {
    const evacuations = data.evacuations.get(fire.fireNumber) ?? []

    switch (wildfireFilter) {
      case 'out-of-control':
        return fire.status.toLowerCase() === 'out of control'
      case 'under-control':
        return fire.status.toLowerCase() === 'under control'
      case 'being-held':
        return fire.status.toLowerCase() === 'being held'
      case 'evacuation-order':
        return evacuations.some((notice) => notice.status === 'Order')
      case 'evacuation-alert':
        return evacuations.some((notice) => notice.status === 'Alert')
      default:
        return true
    }
  })

  //visibleFires slices filtered results for guests or shows all when showAllWildfires is true
  const visibleFires = showAllWildfires && token
    ? filteredFires
    : filteredFires.slice(0, safeCardCount)
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
        <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-4">
          <h2 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white">{wildfireTitle}</h2>

          {/*Wildfire count input, show all toggle, and status filter dropdown*/}
          <div className="flex flex-wrap items-end gap-3">
            <label className="flex flex-col gap-1.5 text-sm font-semibold text-gray-700 dark:text-gray-200">
              Cards to show
              <div className="flex overflow-hidden rounded-lg border border-gray-300 bg-white dark:border-gray-600 dark:bg-gray-900">
                <input
                  type="number"
                  min="1"
                  max={Math.max(inputMaximumCardCount, 1)}
                  value={safeCardCount}
                  disabled={showAllWildfires && Boolean(token)}
                  onChange={(event) => {
                    setShowAllWildfires(false)
                    setCardCount(Number(event.target.value) || 1)
                  }}
                  className="w-20 px-3 py-2 text-sm font-medium text-gray-900 outline-none disabled:bg-gray-100 disabled:text-gray-400 dark:bg-gray-900 dark:text-white dark:disabled:bg-gray-800 dark:disabled:text-gray-500"
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
              Filter wildfires
              <select
                value={wildfireFilter}
                onChange={(event) => setWildfireFilter(event.target.value as WildfireFilter)}
                className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-900 outline-none transition focus:border-hub-navy focus:ring-2 focus:ring-hub-navy/15 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
              >
                {WILDFIRE_FILTERS.map((filter) => (
                  <option key={filter.value} value={filter.value}>{filter.label}</option>
                ))}
              </select>
            </label>

            <p className="pb-2 text-sm text-gray-500 dark:text-gray-400">
              Showing <strong className="font-bold text-gray-700 dark:text-gray-200">{visibleFires.length}</strong> of{' '}
              <strong className="font-bold text-gray-700 dark:text-gray-200">{fires.length}</strong> wildfires
            </p>
          </div>
        </div>

        {/*Color and icon legend for wildfire status and evacuation levels*/}
        <div
          className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm font-semibold text-gray-700 dark:text-gray-200"
          aria-label="Wildfire status legend"
        >
          <span className="inline-flex items-center gap-2">
            <span className="h-3.5 w-3.5 rounded-full bg-lime-400" aria-hidden />
            Under Control
          </span>
          <span className="inline-flex items-center gap-2">
            <span className="h-3.5 w-3.5 rounded-full bg-yellow-300" aria-hidden />
            Being Held
          </span>
          <span className="inline-flex items-center gap-2">
            <span className="h-3.5 w-3.5 rounded-full bg-red-600" aria-hidden />
            Out of Control
          </span>
          <span className="inline-flex items-center gap-2">
            <span className="h-3.5 w-3.5 rounded-full bg-gray-400" aria-hidden />
            Unknown
          </span>
          <span className="inline-flex items-center gap-2">
            <EvacuationAlertIcon className="h-5 w-5 text-[11px]" />
            Evacuation Alert
          </span>
          <span className="inline-flex items-center gap-2">
            <EvacuationOrderIcon className="h-5 w-5 [&_span]:text-[10px]" />
            Evacuation Order
          </span>
          <span className="inline-flex items-center gap-2">
            <span className="text-base leading-none" aria-hidden>🔥</span>
            Noteworthy
          </span>
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
