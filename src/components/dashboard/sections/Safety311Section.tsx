import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { RainbowText } from '../../RainbowText'
import { useAuth } from '../../../context/AuthContext'
import { useServiceRequestPreferences } from '../../../context/ServiceRequestPreferencesContext'
import {
  getImportantNearbyServiceRequests,
  markServiceRequestSeen,
} from '../../../lib/api/serviceRequests'
import type { ApiServiceRequest } from '../../../types/backend'
import { ServiceRequestCard } from '../../safety/ServiceRequestCard'

//constant for how many 311 requests to show on the dashboard at once
const DASHBOARD_REQUEST_LIMIT = 6

export function Safety311Section() {
  //token, user, and authLoading come from AuthContext for gated API access
  const { token, user, isLoading: authLoading } = useAuth()

  //version bumps when service request preferences change and triggers a refetch
  const { version } = useServiceRequestPreferences()

  //declaring state to hold nearby 311 service requests fetched from the API
  const [requests, setRequests] = useState<ApiServiceRequest[]>([])

  //declaring state to track whether requests are being loaded
  const [loading, setLoading] = useState(false)

  //declaring state for error messages shown to the user
  const [error, setError] = useState<string | null>(null)

  //declaring state for the request id currently being marked as seen
  const [markingId, setMarkingId] = useState<number | null>(null)

  //locationId is the saved location id on the user profile; requests require it
  const locationId = user?.location?.id

  //This useEffect runs when auth, location, token, or preferences version change
  //It fetches important nearby 311 requests and limits the list to DASHBOARD_REQUEST_LIMIT
  //The cancelled flag prevents state updates if the component unmounts mid-fetch
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

    void getImportantNearbyServiceRequests(token)
      .then((items) => {
        if (!cancelled) setRequests(items.slice(0, DASHBOARD_REQUEST_LIMIT))
      })
      .catch(() => {
        if (!cancelled) setError('Could not load nearby requests.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [authLoading, locationId, token, version])

  //handleMarkSeen marks a request as seen on the server and refreshes the list
  //If marking succeeds, the request is removed locally and the next batch is loaded
  async function handleMarkSeen(request: ApiServiceRequest) {
    if (!token) return
    setMarkingId(request.id)
    try {
      await markServiceRequestSeen(request.id, token)
      setRequests((current) => current.filter((item) => item.id !== request.id))

      try {
        const items = await getImportantNearbyServiceRequests(token)
        setRequests(items.slice(0, DASHBOARD_REQUEST_LIMIT))
      } catch {
        setError('Marked as seen, but could not load the next request.')
      }
    } catch {
      setError('Could not mark that request as seen. Please try again.')
    } finally {
      setMarkingId(null)
    }
  }//handleMarkSeen

  //guest is true when auth finished loading and the user is not signed in
  const guest = !authLoading && !token

  //missingLocation is true when signed in but no saved location exists on the profile
  const missingLocation = !authLoading && Boolean(token) && !user?.location

  //renderRequestCard wraps ServiceRequestCard with dashboard-specific styling and handlers
  const renderRequestCard = (request: ApiServiceRequest) => (
    <ServiceRequestCard
      key={request.id}
      request={request}
      onMarkSeen={handleMarkSeen}
      markingSeen={markingId === request.id}
      hideCategory
      variant="neon"
      className="relative z-0 h-full min-h-44 w-full max-w-sm justify-self-center transition-all duration-300 ease-out hover:z-20 hover:-translate-y-1 hover:scale-[1.3] md:w-96"
    />
  )

  return (
    <section className="mx-auto w-full max-w-7xl py-8 text-center md:py-10">
      {/*Section header with link to the full Safety 311 page*/}
      <div>
        <Link
          to="/safety-311"
          className="text-[11px] font-semibold tracking-[0.2em] uppercase"
        >
          <RainbowText>See all →</RainbowText>
        </Link>
        <h2 className="dashboard-yellow-cycle mt-3 text-7xl font-black tracking-tighter md:text-8xl md:leading-[0.9]">
          311 Reports
        </h2>
      </div>

      <div className="mt-8 flex flex-col items-center gap-3">
        {/*Loading skeleton shown while auth or requests are loading*/}
        {authLoading || loading ? (
          <div className="w-full max-w-sm space-y-3">
            {/*This loop renders three placeholder skeleton cards*/}
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="h-20 animate-pulse rounded-xl border border-gray-200 bg-gray-100 dark:border-gray-700 dark:bg-gray-800"
              />
            ))}
          </div>
        ) : null}

        {/*Prompt for guests to sign in to see nearby 311 requests*/}
        {guest && (
          <p className="max-w-sm text-sm text-gray-500 dark:text-gray-400">
            <Link to="/login" className="font-semibold text-hub-navy hover:underline dark:text-teal-300">
              Sign in
            </Link>{' '}
            to see 311 requests near your saved location.
          </p>
        )}

        {/*Prompt for signed-in users who have not saved a location yet*/}
        {missingLocation && (
          <p className="max-w-sm text-sm text-gray-500 dark:text-gray-400">
            <Link to="/settings" className="font-semibold text-hub-navy hover:underline dark:text-teal-300">
              Save a location
            </Link>{' '}
            to see 311 requests nearby.
          </p>
        )}

        {error && <p className="max-w-sm text-sm text-red-600 dark:text-red-400">{error}</p>}

        {/*Empty state when the user is signed in with a location but no requests remain*/}
        {!authLoading && !loading && !guest && !missingLocation && !error && requests.length === 0 && (
          <p className="max-w-sm text-sm text-gray-500 dark:text-gray-400">
            Nothing to see here!
          </p>
        )}

        {/*Request cards laid out in a featured-first grid pattern*/}
        {!authLoading && !loading && !guest && !missingLocation && requests.length > 0 && (
          <div className="flex w-full flex-col gap-3">
            {/*First request is featured alone in the top row*/}
            <div className="flex justify-center">
              {requests[0] && renderRequestCard(requests[0])}
            </div>
            {/*Second and third requests appear in a two-column row on medium screens*/}
            <div className="mx-auto grid w-full justify-center gap-3 md:grid-cols-[repeat(2,24rem)]">
              {requests.slice(1, 3).map(renderRequestCard)}
            </div>
            {/*Remaining requests fill a responsive grid up to six total cards*/}
            <div className="mx-auto grid w-full justify-center gap-3 md:grid-cols-2 lg:grid-cols-[repeat(3,24rem)]">
              {requests.slice(3, 6).map(renderRequestCard)}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}//Safety311Section
