import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Shuffle } from 'lucide-react'
import { RainbowText } from '../../RainbowText'
import {
  fetchFourWayTrafficCameraLocations,
  type TrafficCameraLocation,
} from '../../../lib/api/vancouverOpenData'
import {
  fetchIntersectionCameraViews,
  type IntersectionCameraPage,
} from '../../../lib/api/vancouverTrafficCams'
import { sectionBlock, sectionShell, sectionTitle } from '../dashboardLayout'

//FALLBACK_PAGE is used when no four-way camera locations load from open data
const FALLBACK_PAGE =
  'https://trafficcams.vancouver.ca/grandview4.htm'

//pickRandomLocation returns a random location from the pool, optionally excluding one id
function pickRandomLocation(
  locations: TrafficCameraLocation[],
  excludeId?: string,
): TrafficCameraLocation | null {
  const pool = excludeId
    ? locations.filter((item) => item.id !== excludeId)
    : locations
  if (pool.length === 0) return locations[0] ?? null
  return pool[Math.floor(Math.random() * pool.length)]
}//pickRandomLocation

export function TrafficSection({ compact = false }: { compact?: boolean }) {
  //declaring state to hold all four-way traffic camera locations
  const [locations, setLocations] = useState<TrafficCameraLocation[]>([])

  //declaring state for the currently displayed intersection location
  const [current, setCurrent] = useState<TrafficCameraLocation | null>(null)

  //declaring state for the camera views page fetched for the current intersection
  const [page, setPage] = useState<IntersectionCameraPage | null>(null)

  //declaring state to track initial bootstrap loading
  const [loading, setLoading] = useState(true)

  //declaring state to track whether a shuffle request is in progress
  const [shuffling, setShuffling] = useState(false)

  //declaring state for error messages shown to the user
  const [error, setError] = useState<string | null>(null)

  //loadIntersection fetches camera views for a location and updates current and page state
  const loadIntersection = useCallback(async (location: TrafficCameraLocation) => {
    setError(null)
    const views = await fetchIntersectionCameraViews(location.pageUrl)
    setCurrent(location)
    setPage(views)
  }, [])

  //This useEffect runs once on mount to load camera locations and the default intersection
  //It prefers the Grandview Hwy intersection when available, otherwise uses the first location
  //The cancelled flag prevents state updates if the component unmounts mid-fetch
  useEffect(() => {
    let cancelled = false

    async function bootstrap() {
      setLoading(true)
      setError(null)
      try {
        const fourWay = await fetchFourWayTrafficCameraLocations()
        if (cancelled) return

        setLocations(fourWay)

        const preferred =
          fourWay.find((item) =>
            item.pageUrl.toLowerCase().includes('grandview4'),
          ) ??
          fourWay[0] ?? {
            id: 'grandview4',
            name: 'Rupert St and Grandview Hwy',
            pageUrl: FALLBACK_PAGE,
            neighbourhood: 'Renfrew-Collingwood',
            lat: 49.25815,
            lon: -123.03376,
          }

        await loadIntersection(preferred)
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : 'Could not load traffic cameras',
          )
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void bootstrap()
    return () => {
      cancelled = true
    }
  }, [loadIntersection])

  //handleShuffle picks a random intersection and loads its camera views
  async function handleShuffle() {
    if (locations.length === 0 || shuffling) return
    setShuffling(true)
    setError(null)
    try {
      const next = pickRandomLocation(locations, current?.id)
      if (!next) return
      await loadIntersection(next)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Could not shuffle cameras',
      )
    } finally {
      setShuffling(false)
    }
  }//handleShuffle

  //views holds up to four camera directions for the current intersection
  const views = page?.views.slice(0, 4) ?? []

  return (
    <section className={compact ? 'py-4' : sectionBlock}>
      <div className={compact ? '' : sectionShell}>
        <div className={`flex flex-col gap-8 md:flex-row md:items-start ${compact ? 'md:gap-20' : 'md:gap-10'}`}>
          {/*Left column with section title and current intersection details*/}
          <div className={`${compact ? 'max-w-lg' : 'max-w-sm'} shrink-0`}>
            <Link
              to="/traffic"
              className="text-[11px] font-semibold tracking-[0.2em] uppercase"
            >
              <RainbowText>See all →</RainbowText>
            </Link>
            <h2 className={`dashboard-blue-cycle ${compact ? 'mt-3 text-8xl font-black tracking-tighter md:text-9xl md:leading-[0.9]' : `mt-3 ${sectionTitle}`}`}>
              Traffic
            </h2>
            <p className={`dashboard-blue-cycle mt-5 ${compact ? 'text-base md:text-lg' : 'text-sm'}`}>
              {current?.name ?? 'Loading intersection…'}
            </p>
            <p className={`dashboard-blue-cycle mt-1 ${compact ? 'text-sm' : 'text-xs'}`}>
              {current?.neighbourhood ?? ''}
              {page
                ? ` · ${page.views.length} live views · updates ~10-15 min`
                : ''}
            </p>
          </div>

          {/*Right column with shuffle button and four camera view tiles*/}
          <div className={`relative w-full ${compact ? 'max-w-2xl' : 'max-w-md'}`}>
            <button
              type="button"
              onClick={() => void handleShuffle()}
              disabled={shuffling || loading || locations.length < 2}
              aria-label="Shuffle traffic cameras"
              className="absolute top-1/2 left-1/2 z-20 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-hub-navy text-white shadow-lg transition hover:bg-hub-navy-light disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Shuffle
                className={`h-4 w-4 ${shuffling ? 'animate-spin' : ''}`}
                strokeWidth={2}
              />
            </button>

            {error && (
              <p className="mb-3 text-sm text-red-600">{error}</p>
            )}

            <div className={`grid grid-cols-2 ${compact ? 'gap-4 sm:gap-5' : 'gap-3 sm:gap-4'}`}>
              {/*This map renders four camera tiles or direction placeholders while loading*/}
              {(loading && views.length === 0
                ? ['North', 'East', 'South', 'West']
                : views
              ).map((item, index) => {
                const isPlaceholder = typeof item === 'string'
                const direction = isPlaceholder ? item : item.direction
                const imageUrl = isPlaceholder ? null : item.imageUrl
                const alt = isPlaceholder
                  ? direction
                  : item.alt

                return (
                  <div
                    key={`${direction}-${index}`}
                    className="relative overflow-hidden rounded-2xl bg-gray-800 shadow-[0_12px_30px_-10px_rgba(0,0,0,0.25)]"
                  >
                    <div className={`relative bg-gradient-to-b from-slate-600 to-slate-900 ${compact ? 'aspect-[4/3]' : 'aspect-[16/11]'}`}>
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={alt}
                          className="h-full w-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <div className="absolute inset-0 animate-pulse bg-slate-700/80" />
                      )}
                      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,transparent_45%,rgba(0,0,0,0.65)_100%)]" />
                    </div>
                    <p className={`absolute bottom-2.5 left-2.5 font-semibold tracking-wide text-white/90 uppercase ${compact ? 'text-[11px]' : 'text-[9px]'}`}>
                      {direction}
                    </p>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}//TrafficSection
