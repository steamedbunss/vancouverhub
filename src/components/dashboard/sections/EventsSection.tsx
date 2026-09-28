import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeft, ChevronRight, Shuffle } from 'lucide-react'
import { RainbowText } from '../../RainbowText'
import { useAuth } from '../../../context/AuthContext'
import { getUpcomingEvents } from '../../../lib/api/events'
import type { ApiEvent } from '../../../types/backend'
import { sectionBlock, sectionShell } from '../dashboardLayout'

//constant for how many event cards appear in the fan layout at once
const VISIBLE = 5

//FAN_ROTATIONS holds the rotation angle in degrees for each card slot in the fan
const FAN_ROTATIONS = [-14, -7, 0, 7, 14]

//FAN_Y holds the vertical offset in pixels for each card slot in the fan
const FAN_Y = [31, 13, 0, 13, 31]

//formatEventDate converts an ISO date string to a readable weekday and date label
function formatEventDate(dateStart: string) {
  const date = new Date(dateStart)
  if (Number.isNaN(date.getTime())) return dateStart
  return date.toLocaleDateString('en-CA', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  })
}//formatEventDate

export function EventsSection({ compact = false }: { compact?: boolean }) {
  //token from auth context; shuffle button is only shown when signed in
  const { token } = useAuth()

  //declaring state to hold all upcoming events fetched from the API
  const [events, setEvents] = useState<ApiEvent[]>([])

  //declaring state for the index of the first visible event in the fan carousel
  const [startIndex, setStartIndex] = useState(0)

  //declaring state to track whether events are loading, loaded, or failed
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')

  //This useEffect runs once when the component mounts
  //getUpcomingEvents is called to load events and status is updated on success or failure
  //The cancelled flag prevents state updates if the component unmounts mid-fetch
  useEffect(() => {
    let cancelled = false

    getUpcomingEvents()
      .then((data) => {
        if (cancelled) return
        setEvents(data)
        setStatus(data.length > 0 ? 'success' : 'error')
      })
      .catch((error) => {
        console.error(error)
        if (!cancelled) setStatus('error')
      })

    return () => { cancelled = true }
  }, [])

  //total is the number of events available for the carousel
  const total = events.length

  //cardCount is how many slots to fill in the fan; at least 1 for layout stability
  const cardCount = Math.min(VISIBLE, Math.max(total, 1))

  //visibleEvents wraps around the events array starting at startIndex
  //eg. if startIndex is 3 and cardCount is 5, events 3, 4, 0, 1, 2 are shown
  const visibleEvents = total === 0
    ? []
    : Array.from({ length: cardCount }, (_, index) => events[(startIndex + index) % total])

  //shift moves the carousel forward or backward by delta positions
  function shift(delta: number) {
    if (total > 0) setStartIndex((current) => (current + delta + total) % total)
  }//shift

  //shuffleEvents picks a random offset and advances startIndex to show a new set
  function shuffleEvents() {
    if (total < 2) return
    setStartIndex((current) => {
      const offset = 1 + Math.floor(Math.random() * (total - 1))
      return (current + offset) % total
    })
  }//shuffleEvents

  return (
    <section className={`w-full ${compact ? 'overflow-visible py-10 md:py-14' : `overflow-hidden ${sectionBlock}`}`}>
      <div className={sectionShell}>
        {/*Section header with title, subtitle, and optional shuffle button*/}
        <div className="text-center">
          <Link to="/events" className="text-base font-bold tracking-[0.2em] uppercase">
            <RainbowText>See all →</RainbowText>
          </Link>
          <h2 data-onboarding-target={compact ? 'tour-events' : undefined} className="dashboard-green-cycle mx-auto mt-5 w-fit text-center text-8xl font-black leading-[0.85] tracking-tighter md:text-[9rem]">
            Events
          </h2>
          <p className="dashboard-green-cycle mt-5 text-xl font-semibold">
            Upcoming around Vancouver
          </p>
          {/*Shuffle button is only shown for signed-in users when events loaded successfully*/}
          {token && status === 'success' && (
            <button
              type="button"
              onClick={shuffleEvents}
              disabled={total < 2}
              className="mt-5 inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-800 shadow-sm transition hover:border-gray-300 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 dark:hover:border-gray-500 dark:hover:bg-gray-800"
            >
              <Shuffle className="h-4 w-4" />
              Shuffle events
            </button>
          )}
        </div>

        {/*Loading skeleton fan with five placeholder cards*/}
        {status === 'loading' && (
          <div className="mt-14 flex items-end justify-center gap-4">
            {/*This loop renders five pulsing cards with fan rotation and offset*/}
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="h-[229px] w-[132px] animate-pulse rounded-2xl bg-gray-200 sm:w-[154px] md:h-[282px] md:w-[176px] dark:bg-gray-800" style={{ transform: `rotate(${FAN_ROTATIONS[index]}deg) translateY(${FAN_Y[index]}px)` }} />
            ))}
          </div>
        )}

        {status === 'error' && <p className="mt-14 text-center text-sm text-red-600 dark:text-red-400">Couldn&apos;t load upcoming events. Please try again shortly.</p>}

        {/*Success state shows the fan carousel with prev/next navigation*/}
        {status === 'success' && (
          <div className="relative mt-[53px] flex items-center justify-center gap-2 md:mt-[62px] md:gap-[18px]">
            <button type="button" aria-label="Previous events" onClick={() => shift(-1)} disabled={total < 2} className="z-20 shrink-0 rounded-full p-2 text-gray-900 transition hover:bg-gray-100 disabled:opacity-40 dark:text-white dark:hover:bg-gray-800">
              <ChevronLeft className="h-9 w-9" strokeWidth={1.5} />
            </button>
            <div className="flex items-end justify-center gap-[13px] sm:gap-[18px] md:gap-[22px]">
              {/*This map iterates through each visible event and renders a fan card*/}
              {visibleEvents.map((event, index) => {
                const card = (
                  <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-gray-900 shadow-[0_18px_40px_-12px_rgba(0,0,0,0.28)] ring-2 ring-white">
                    {event.imageUrl ? <img src={event.imageUrl} alt={event.title} className="h-full w-full object-cover" /> : <div className="h-full w-full bg-slate-700" />}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-transparent" />
                    {/*Center card in the fan is labeled Featured*/}
                    {index === 2 && <span className="absolute top-2.5 left-2.5 rounded bg-white px-1.5 py-0.5 text-[9px] font-bold tracking-wider text-gray-900 uppercase">Featured</span>}
                    <div className="absolute right-0 bottom-0 left-0 p-3">
                      <h3 className="line-clamp-2 text-[13px] leading-snug font-bold text-white sm:text-[15px]">{event.title}</h3>
                      <p className="mt-1 text-[11px] leading-relaxed text-white/75">{formatEventDate(event.dateStart)}<br />{event.provider ?? 'Vancouver Hub'}</p>
                    </div>
                  </div>
                )

                return event.externalUrl ? (
                  <a key={`${event.id}-${startIndex}-${index}`} href={event.externalUrl} target="_blank" rel="noopener noreferrer" className="w-[143px] shrink-0 transition duration-300 hover:z-10 hover:scale-[1.2] sm:w-[171px] md:w-[209px]" style={{ transform: `rotate(${FAN_ROTATIONS[index] ?? 0}deg) translateY(${FAN_Y[index] ?? 0}px)` }}>{card}</a>
                ) : (
                  <div key={`${event.id}-${startIndex}-${index}`} className="w-[143px] shrink-0 sm:w-[171px] md:w-[209px]" style={{ transform: `rotate(${FAN_ROTATIONS[index] ?? 0}deg) translateY(${FAN_Y[index] ?? 0}px)` }}>{card}</div>
                )
              })}
            </div>
            <button type="button" aria-label="Next events" onClick={() => shift(1)} disabled={total < 2} className="z-20 shrink-0 rounded-full p-2 text-gray-900 transition hover:bg-gray-100 disabled:opacity-40 dark:text-white dark:hover:bg-gray-800">
              <ChevronRight className="h-9 w-9" strokeWidth={1.5} />
            </button>
          </div>
        )}
      </div>
    </section>
  )
}//EventsSection
