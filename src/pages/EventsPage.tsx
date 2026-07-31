//EventsPage.tsx loads and displays upcoming, nearby, and past Vancouver events
import { useEffect, useState } from 'react'
import { getPastEvents, getUpcomingEvents, getUpcomingEventsNearUser } from '../lib/api/events'
import { useAuth } from '../context/AuthContext'
import type { ApiEvent } from '../types/backend'
import { EventDateCalendar } from '../components/events/EventDateCalendar'
import { UpcomingEventsCalendar } from '../components/events/UpcomingEventsCalendar'
import { EventsByDateList } from '../components/events/EventsByDateList'
import { RainbowText } from '../components/RainbowText'

//EventView selects which API endpoint and display component to use
type EventView = 'upcoming' | 'nearby' | 'past'

export function EventsPage() {
  //token determines whether nearby events and authenticated endpoints are available
  const { token } = useAuth()
  //declaring state to hold the active event view tab
  const [view, setView] = useState<EventView>('upcoming')
  //declaring state to hold events returned from the current API request
  const [events, setEvents] = useState<ApiEvent[]>([])
  //declaring state to track whether events are currently loading
  const [isLoading, setIsLoading] = useState(true)
  //declaring state to hold fetch error messages
  const [error, setError] = useState<string | null>(null)
  //declaring state to force a refetch when the user clicks Try again
  const [requestVersion, setRequestVersion] = useState(0)
  //views lists the tab buttons; nearby is omitted for guest users without a token
  const views: Array<{ value: EventView; label: string }> = token
    ? [
        { value: 'upcoming', label: 'Upcoming' },
        { value: 'nearby', label: 'Near me' },
        { value: 'past', label: 'Past 5 days' },
      ]
    : [
        { value: 'upcoming', label: 'Upcoming' },
        { value: 'past', label: 'Past 5 days' },
      ]

//pageHeader is shared JSX for the title, subtitle, and view toggle buttons
const pageHeader = (
  <>
    <h1 className="text-7xl font-black tracking-tight md:text-8xl"><RainbowText>Events</RainbowText></h1>
    <p className="mt-3 text-lg text-gray-600 dark:text-gray-300">Upcoming events around Vancouver.</p>
    {/*View toggle buttons; the active view gets the navy background*/}
    <div className="mt-8 flex flex-wrap gap-3">
      {views.map(({ value, label }) => (
        <button
          key={value}
          type="button"
          onClick={() => setView(value)}
          className={`rounded-full px-5 py-2.5 text-base font-semibold transition ${view === value ? 'bg-hub-navy text-white' : 'border border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-800'}`}
        >
          {label}
        </button>
      ))}
    </div>
  </>
)

  //This useEffect runs when token or view changes
  //If a guest lands on nearby, reset the view back to upcoming
  useEffect(() => {
    if (!token && view === 'nearby') setView('upcoming')
  }, [token, view])

  //This useEffect fetches events whenever view, token, or requestVersion changes
  //It picks getUpcomingEvents, getUpcomingEventsNearUser, or getPastEvents based on view
  //The cleanup function sets cancelled to true to ignore stale responses
  useEffect(() => {
    if (view === 'nearby' && !token) return

    let cancelled = false
    setIsLoading(true)
    setError(null)
    const request = view === 'upcoming'
      ? getUpcomingEvents(token)
      : view === 'nearby'
        ? getUpcomingEventsNearUser(token as string)
        : getPastEvents(token)

    request
      .then((payload) => {
        if (!cancelled) setEvents(payload)
      })
      .catch((caughtError) => {
        if (!cancelled) setError(caughtError instanceof Error ? caughtError.message : 'Could not load events.')
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })

    return () => { cancelled = true }
  }, [requestVersion, token, view])

  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      {/*Header shown outside the calendar for past and nearby views*/}
      {view !== 'upcoming' && pageHeader}
      {/*Header shown above loading or error states in upcoming view*/}
      {view === 'upcoming' && (isLoading || error) && pageHeader}
      <div className={view === 'upcoming' ? '' : 'mt-7'}>
        {isLoading && <p className="text-sm text-gray-500 dark:text-gray-400">Loading events. Render can take a moment to wake up.</p>}
        {error && (
          <div role="alert" className="rounded-lg bg-red-50 p-4 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300">
            <p>{error}</p>
            <button type="button" onClick={() => setRequestVersion((version) => version + 1)} className="mt-3 font-semibold underline underline-offset-2">Try again</button>
          </div>
        )}
        {/*UpcomingEventsCalendar embeds the header inside the calendar layout*/}
        {!isLoading && !error && view === 'upcoming' && <UpcomingEventsCalendar events={events} header={pageHeader} />}
        {!isLoading && !error && view === 'past' && <EventDateCalendar events={events} timeframe="past" />}
        {!isLoading && !error && view === 'nearby' && events.length === 0 && <p className="rounded-lg border border-dashed border-gray-300 p-6 text-sm text-gray-500 dark:border-gray-600 dark:text-gray-400">No nearby events were returned.</p>}
        {!isLoading && !error && events.length > 0 && view === 'nearby' && (
          <EventsByDateList events={events} />
        )}
      </div>
    </div>
  )
}//EventsPage
