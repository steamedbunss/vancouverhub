import { useEffect, useMemo, useState } from 'react'
import type { ApiEvent } from '../../types/backend'
import { EventListCard } from './EventListCard'

//Timeframe controls whether the calendar shows upcoming or past days
type Timeframe = 'upcoming' | 'past'

//dateKey converts a Date object to a YYYY-MM-DD string for comparison
function dateKey(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}//dateKey

//datesFor returns five consecutive dates starting from today or ending at yesterday
function datesFor(timeframe: Timeframe) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const offsets = timeframe === 'upcoming' ? [0, 1, 2, 3, 4] : [-5, -4, -3, -2, -1]
  return offsets.map((offset) => {
    const date = new Date(today)
    date.setDate(today.getDate() + offset)
    return date
  })
}//datesFor

export function EventDateCalendar({ events, timeframe }: { events: ApiEvent[]; timeframe: Timeframe }) {
  //dates holds the five day buttons shown in the strip calendar
  const dates = useMemo(() => datesFor(timeframe), [timeframe])

  //declaring state for the currently selected date key
  const [selectedDate, setSelectedDate] = useState(() => dateKey(dates[0]))

  //This useEffect resets selectedDate to the first date when timeframe changes
  useEffect(() => {
    setSelectedDate(dateKey(dates[0]))
  }, [dates])

  //visibleEvents filters and sorts events that fall on the selected date
  const visibleEvents = events
    .filter((event) => dateKey(new Date(event.dateStart)) === selectedDate)
    .sort((first, second) => new Date(first.dateStart).getTime() - new Date(second.dateStart).getTime())

  //selectedDateLabel is the readable label for the selected date button
  const selectedDateLabel = dates.find((date) => dateKey(date) === selectedDate)?.toLocaleDateString('en-CA', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })

  return (
    <div>
      {/*Five-day date strip with event counts per day*/}
      <div className="grid grid-cols-5 gap-2 sm:gap-3">
        {/*This map renders a selectable date button for each day in the strip*/}
        {dates.map((date) => {
          const key = dateKey(date)
          const isSelected = selectedDate === key
          const eventCount = events.filter((event) => dateKey(new Date(event.dateStart)) === key).length
          return (
            <button
              key={key}
              type="button"
              onClick={() => setSelectedDate(key)}
              aria-pressed={isSelected}
              className={`rounded-xl border px-2 py-3 text-center transition ${isSelected ? 'border-hub-navy bg-hub-navy text-white' : 'border-gray-200 bg-white text-gray-700 hover:border-hub-navy dark:border-gray-600 dark:bg-gray-900 dark:text-gray-200 dark:hover:border-sky-400'}`}
            >
              <span className="block text-[11px] font-semibold uppercase sm:text-xs">{date.toLocaleDateString('en-CA', { weekday: 'short' })}</span>
              <span className="mt-1 block text-lg font-bold">{date.getDate()}</span>
              <span className="block text-[11px] opacity-75">{date.toLocaleDateString('en-CA', { month: 'short' })}</span>
              <span className="mt-1 block text-[10px] opacity-75">{eventCount} {eventCount === 1 ? 'event' : 'events'}</span>
            </button>
          )
        })}
      </div>

      <h2 className="mt-7 text-lg font-bold text-gray-900 dark:text-white">{selectedDateLabel}</h2>
      {/*Event cards grid or empty state for the selected date*/}
      <div className="mt-3 grid items-stretch gap-4 lg:grid-cols-3">
        {visibleEvents.length > 0 ? (
          //This map renders an EventListCard for each event on the selected date
          visibleEvents.map((event) => <EventListCard key={event.id} event={event} />)
        ) : (
          <p className="col-span-full rounded-xl border border-dashed border-gray-300 p-6 text-sm text-gray-500 dark:border-gray-600 dark:text-gray-400">No events were recorded for this day.</p>
        )}
      </div>
    </div>
  )
}//EventDateCalendar
