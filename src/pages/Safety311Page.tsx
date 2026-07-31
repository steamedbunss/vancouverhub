//Safety311Page.tsx shows nearby city service requests filtered by category
import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useServiceRequestPreferences } from '../context/ServiceRequestPreferencesContext'
import {
  getNearbyServiceRequests,
} from '../lib/api/serviceRequests'
import type { ApiServiceRequest, ApiServiceRequestCategory } from '../types/backend'
import { ServiceRequestCard } from '../components/safety/ServiceRequestCard'
import { RainbowText } from '../components/RainbowText'
import { getServiceRequestCategoryColor } from '../constants/serviceRequestCategories'

//CATEGORY_FILTERS lists the pill buttons for filtering 311 requests by category
const CATEGORY_FILTERS: Array<{
  id: ApiServiceRequestCategory
  label: string
}> = [
  { id: 'ROAD', label: 'Roads' },
  { id: 'GARBAGE', label: 'Garbage' },
  { id: 'WATER', label: 'Water' },
  { id: 'GRAFFITI', label: 'Graffiti' },
  { id: 'NOISE', label: 'Noise' },
  { id: 'SAFETY', label: 'Safety' },
]

export function Safety311Page() {
  const { token, user, isLoading: authLoading } = useAuth()
  //version increments when service request preferences change and triggers a refetch
  const { version } = useServiceRequestPreferences()
  //declaring state to hold nearby service requests from the API
  const [requests, setRequests] = useState<ApiServiceRequest[]>([])
  //declaring state to track whether requests are currently loading
  const [loading, setLoading] = useState(false)
  //declaring state to hold fetch error messages
  const [error, setError] = useState<string | null>(null)
  //declaring state to hold the selected category filter ids; empty means show all
  const [selectedCategories, setSelectedCategories] = useState<ApiServiceRequestCategory[]>([])
  //locationId comes from the signed in user saved home location
  const locationId = user?.location?.id
  //filteredRequests applies category filters and keeps seen reports at the bottom
  const filteredRequests = useMemo(() => {
    const list = selectedCategories.length === 0
      ? requests
      : requests.filter((request) => selectedCategories.includes(request.category))

    return [...list].sort((first, second) => Number(first.seen) - Number(second.seen))
  }, [requests, selectedCategories])

  //This useEffect runs when auth, location, token, or preferences version changes
  //It fetches nearby requests for signed in users with a saved location
  //The cleanup function sets cancelled to true to ignore stale responses
  useEffect(() => {
    if (authLoading) return
    if (!token || locationId === undefined) {
      setRequests([])
      setLoading(false)
      setError(null)
      return
    }

    let cancelled = false
    setLoading(true)
    setError(null)

    void getNearbyServiceRequests(token, { limit: 100 })
      .then((items) => {
        if (!cancelled) setRequests(items)
      })
      .catch(() => {
        if (!cancelled) setError('Could not load nearby 311 requests.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [authLoading, locationId, token, version])

  //guest is true when auth finished loading and no token exists
  const guest = !authLoading && !token
  //missingLocation is true when signed in but the user has no saved home location
  const missingLocation = !authLoading && Boolean(token) && !user?.location

  //toggleCategory adds or removes a category from selectedCategories
  const toggleCategory = (category: ApiServiceRequestCategory) => {
    setSelectedCategories((current) =>
      current.includes(category)
        ? current.filter((item) => item !== category)
        : [...current, category],
    )
  }//toggleCategory

  return (
    <div className="mx-auto max-w-7xl px-6 py-10 dark:text-gray-100">
      {/*Page header with title and description*/}
      <header className="max-w-3xl">
        <h1 className="text-4xl font-black tracking-tight text-gray-900 md:text-5xl dark:text-white">
          <RainbowText>Happening Around You</RainbowText>
        </h1>
        <p className="mt-3 text-gray-600 dark:text-gray-300">
          Track open city service requests around your saved home location.
        </p>
      </header>

      {/*Guest prompt when the user is not signed in*/}
      {guest && (
        <div className="mt-10 rounded-2xl border border-gray-200 bg-gray-50 p-6 dark:border-gray-700 dark:bg-gray-900">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Sign in to see nearby 311 requests</h2>
          <p className="mt-2 text-gray-500 dark:text-gray-400">Requests are tailored to your saved home location and category preferences.</p>
          <Link to="/login" className="mt-5 inline-flex rounded-lg bg-hub-navy px-4 py-2.5 text-sm font-semibold text-white hover:bg-hub-navy-light">Sign in</Link>
        </div>
      )}

      {/*Missing location prompt when signed in without a saved home address*/}
      {missingLocation && (
        <div className="mt-10 rounded-2xl border border-gray-200 bg-gray-50 p-6 dark:border-gray-700 dark:bg-gray-900">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Save a home location first</h2>
          <p className="mt-2 text-gray-500 dark:text-gray-400">Your saved location is required to find nearby open 311 requests.</p>
          <Link to="/settings" className="mt-5 inline-flex rounded-lg bg-hub-navy px-4 py-2.5 text-sm font-semibold text-white hover:bg-hub-navy-light">Open settings</Link>
        </div>
      )}

      {!guest && !missingLocation && (
        <>
          {/*Category filter pills and result count*/}
          <div className="sticky top-[6.1rem] z-30 -mx-2 mt-8 flex flex-nowrap items-center gap-2 overflow-x-auto border-b border-gray-200 bg-white/95 px-2 py-3 shadow-sm backdrop-blur-sm lg:top-16 dark:border-gray-700 dark:bg-gray-950/95">
            <button
              type="button"
              onClick={() => setSelectedCategories([])}
              aria-pressed={selectedCategories.length === 0}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                selectedCategories.length === 0
                  ? 'bg-hub-navy text-white'
                  : 'border border-gray-500 text-black hover:border-black dark:text-white dark:hover:border-white'
              }`}
            >
              All
            </button>
            {CATEGORY_FILTERS.map((category) => {
              const selected = selectedCategories.includes(category.id)
              const colors = getServiceRequestCategoryColor(category.id)

              return (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => toggleCategory(category.id)}
                  aria-pressed={selected}
                  className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                    selected ? colors.pillSelected : colors.pillIdle
                  }`}
                >
                  {category.label}
                </button>
              )
            })}
            <button
              type="button"
              onClick={() => setSelectedCategories([])}
              disabled={selectedCategories.length === 0}
              className="rounded-full border border-gray-400 bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-800 transition hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-40 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700"
            >
              Clear
            </button>
            <p
              className="ml-auto shrink-0 self-center whitespace-nowrap pl-4 text-sm text-gray-600 dark:text-gray-300"
              aria-live="polite"
            >
              Showing <strong className="font-bold text-gray-900 dark:text-white">{filteredRequests.length}</strong> of{' '}
              <strong className="font-bold text-gray-900 dark:text-white">{requests.length}</strong>
            </p>
          </div>

          {loading && <p className="mt-8 text-gray-500 dark:text-gray-400">Loading nearby requests...</p>}
          {error && <p className="mt-8 text-red-600 dark:text-red-400">{error}</p>}
          {!loading && !error && requests.length === 0 && (
            <div className="mt-8 text-gray-500 dark:text-gray-400">
              <p>No nearby requests.</p>
            </div>
          )}

          {!loading && !error && requests.length > 0 && filteredRequests.length === 0 && (
            <div className="mt-8 text-gray-500 dark:text-gray-400">
              <p>No requests match the selected categories.</p>
            </div>
          )}

          {/*This map iterates through filtered requests and renders animated cards*/}
          {!loading && !error && filteredRequests.length > 0 && (
            <div className="mt-8 grid auto-rows-fr gap-5 md:grid-cols-2 xl:grid-cols-3">
              {filteredRequests.map((request, index) => (
                <AnimatedServiceRequestCard
                  key={request.id}
                  request={request}
                  index={index}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}//Safety311Page

//TWO_COLUMN_HIDDEN_TRANSFORMS holds off screen translate classes for two column grid positions
const TWO_COLUMN_HIDDEN_TRANSFORMS = [
  'md:-translate-x-16 md:translate-y-6',
  'md:translate-x-16 md:translate-y-6',
]

//THREE_COLUMN_HIDDEN_TRANSFORMS holds off screen translate classes for three column grid positions
const THREE_COLUMN_HIDDEN_TRANSFORMS = [
  'xl:-translate-x-20 xl:translate-y-6',
  'xl:translate-x-0 xl:translate-y-14',
  'xl:translate-x-20 xl:translate-y-6',
]

//AnimatedServiceRequestCard wraps ServiceRequestCard with scroll triggered entrance animation
function AnimatedServiceRequestCard({
  request,
  index,
}: {
  request: ApiServiceRequest
  index: number
}) {
  const cardRef = useRef<HTMLDivElement>(null)
  //declaring state to track whether the card is visible in the viewport
  const [isVisible, setIsVisible] = useState(false)
  //wavePosition cycles animation offsets across three column layouts
  const wavePosition = index % THREE_COLUMN_HIDDEN_TRANSFORMS.length
  //transitionDelay staggers visible and hidden transitions based on grid position
  const transitionDelay = isVisible
    ? `${wavePosition * 110}ms`
    : `${(THREE_COLUMN_HIDDEN_TRANSFORMS.length - 1 - wavePosition) * 70}ms`
  //hiddenTransform combines base and responsive off screen transforms before the card enters
  const hiddenTransform = [
    'translate-x-0 translate-y-12 scale-[0.97]',
    TWO_COLUMN_HIDDEN_TRANSFORMS[index % TWO_COLUMN_HIDDEN_TRANSFORMS.length],
    THREE_COLUMN_HIDDEN_TRANSFORMS[wavePosition],
  ].join(' ')

  //This useEffect runs once when the component mounts
  //IntersectionObserver toggles isVisible when the card crosses the viewport threshold
  useEffect(() => {
    const card = cardRef.current
    if (!card) return

    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      {
        threshold: 0.15,
        rootMargin: '-8% 0px -8% 0px',
      },
    )

    observer.observe(card)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={cardRef}
      style={{ transitionDelay }}
      className={`h-full transition-all duration-700 ease-out motion-reduce:translate-x-0 motion-reduce:translate-y-0 motion-reduce:rotate-0 motion-reduce:scale-100 motion-reduce:opacity-100 motion-reduce:transition-none ${
        isVisible
          ? 'translate-x-0 translate-y-0 rotate-0 scale-100 opacity-100'
          : `${hiddenTransform} opacity-0`
      }`}
    >
      <ServiceRequestCard
        request={request}
        showSeenStatus
        hideCategory
        variant="neon"
        className="h-full"
      />
    </div>
  )
}//AnimatedServiceRequestCard
