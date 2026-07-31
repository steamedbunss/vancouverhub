import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { ApiEvent } from '../../types/backend'
import { EventListCard } from './EventListCard'

//dateKey converts a Date object to a YYYY-MM-DD string for comparison
function dateKey(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}//dateKey

//startOfMonth returns a Date set to the first day of the given month
function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}//startOfMonth

export function UpcomingEventsCalendar({ events, header }: { events: ApiEvent[]; header: ReactNode }) {
  //todayKey is based on local midnight so every earlier calendar date is disabled
  const todayKey = dateKey(new Date())

  //declaring state for the currently selected date key
  const [selectedDate, setSelectedDate] = useState(() => dateKey(new Date()))

  //declaring state for which month is shown in the calendar grid
  const [displayMonth, setDisplayMonth] = useState(() => startOfMonth(new Date()))

  //eventCounts maps each date key to how many events occur on that day
  const eventCounts = useMemo(() => {
    const counts = new Map<string, number>()
    events.forEach((event) => {
      const key = dateKey(new Date(event.dateStart))
      counts.set(key, (counts.get(key) ?? 0) + 1)
    })
    return counts
  }, [events])

  //This useEffect selects the first event date when the current selection has no events
  //It also moves displayMonth to the month containing that first event
  useEffect(() => {
    if (events.length === 0 || eventCounts.has(selectedDate)) return
    const firstEvent = [...events]
      .filter((event) => dateKey(new Date(event.dateStart)) >= todayKey)
      .sort((first, second) => new Date(first.dateStart).getTime() - new Date(second.dateStart).getTime())[0]
    if (!firstEvent) {
      setSelectedDate(todayKey)
      setDisplayMonth(startOfMonth(new Date()))
      return
    }
    const firstDate = new Date(firstEvent.dateStart)
    setSelectedDate(dateKey(firstDate))
    setDisplayMonth(startOfMonth(firstDate))
  }, [eventCounts, events, selectedDate, todayKey])

  //firstWeekday is the column index where day 1 falls in the calendar grid
  const firstWeekday = displayMonth.getDay()

  //lastDay is the number of days in the displayed month
  const lastDay = new Date(displayMonth.getFullYear(), displayMonth.getMonth() + 1, 0).getDate()

  //calendarCells is a 42-cell grid with null placeholders for empty days
  const calendarCells = Array.from({ length: 42 }, (_, index) => {
    const day = index - firstWeekday + 1
    return day >= 1 && day <= lastDay ? new Date(displayMonth.getFullYear(), displayMonth.getMonth(), day) : null
  })

  //visibleEvents filters and sorts events that fall on the selected date
  const visibleEvents = events
    .filter((event) => dateKey(new Date(event.dateStart)) === selectedDate)
    .sort((first, second) => new Date(first.dateStart).getTime() - new Date(second.dateStart).getTime())

  //selectedDateLabel is the readable label for the selected date
  const selectedDateLabel = new Date(`${selectedDate}T00:00:00`).toLocaleDateString('en-CA', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })

  return (
    <div>
      <div className="grid items-start gap-8 lg:items-stretch lg:grid-cols-[minmax(0,1fr)_24rem]">
        {/*Left column with page header and desktop date summary*/}
        <div className="flex flex-col lg:min-h-full">
          {header}
          <SelectedDateSummary label={selectedDateLabel} count={visibleEvents.length} className="mt-auto hidden pt-8 lg:block" />
        </div>
        {/*Right column month calendar with prev/next navigation*/}
        <section className="w-full max-w-sm justify-self-start rounded-xl border border-black bg-white p-3 text-gray-900 shadow-sm lg:justify-self-end dark:border-white dark:bg-gray-950 dark:text-white dark:shadow-[0_0_18px_rgba(255,255,255,0.45)]">
          <div className="flex items-center justify-between">
            <button type="button" aria-label="Previous month" onClick={() => setDisplayMonth((month) => new Date(month.getFullYear(), month.getMonth() - 1, 1))} className="rounded-md p-1.5 text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <h2 className="text-sm font-bold">{displayMonth.toLocaleDateString('en-CA', { month: 'long', year: 'numeric' })}</h2>
            <button type="button" aria-label="Next month" onClick={() => setDisplayMonth((month) => new Date(month.getFullYear(), month.getMonth() + 1, 1))} className="rounded-md p-1.5 text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
          {/*Weekday header row*/}
          <div className="mt-2 grid grid-cols-7 text-center text-[9px] font-semibold tracking-wide text-gray-400 uppercase dark:text-gray-400">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => <span key={day} className="py-0.5">{day}</span>)}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {/*This map renders each calendar cell as a day button or empty spacer*/}
            {calendarCells.map((date, index) => {
              if (!date) return <span key={`empty-${index}`} className="aspect-square" />
              const key = dateKey(date)
              const count = eventCounts.get(key) ?? 0
              const isSelected = selectedDate === key
              const isPast = key < todayKey
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setSelectedDate(key)}
                  aria-pressed={isSelected}
                  aria-disabled={isPast}
                  disabled={isPast}
                  className={`relative aspect-square rounded-md text-xs font-semibold transition ${
                    isPast
                      ? 'cursor-not-allowed text-gray-300 opacity-55 dark:text-gray-700'
                      : isSelected
                        ? 'bg-hub-navy text-white'
                        : 'text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800'
                  } ${count > 0 && !isSelected && !isPast ? 'ring-1 ring-hub-navy/30' : ''}`}
                >
                  {date.getDate()}
                </button>
              )
            })}
          </div>
        </section>
      </div>

      {/*Mobile date summary shown below the calendar on small screens*/}
      <SelectedDateSummary label={selectedDateLabel} count={visibleEvents.length} className="mt-10 lg:hidden" />
      {visibleEvents.length > 0 ? <SnakeEventTimeline events={visibleEvents} /> : <p className="mt-4 rounded-xl border border-dashed border-gray-300 p-6 text-sm text-gray-500 dark:border-gray-600 dark:text-gray-400">No events are scheduled for this date.</p>}
    </div>
  )
}//UpcomingEventsCalendar

//SelectedDateSummary shows the selected date label and event count
function SelectedDateSummary({ label, count, className }: { label: string; count: number; className: string }) {
  return (
    <div className={className}>
      <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">{label}</h2>
      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{count} {count === 1 ? 'event' : 'events'} scheduled</p>
    </div>
  )
}//SelectedDateSummary

//SnakeEventTimeline lays out events in a serpentine three-column grid with flow arrows
function SnakeEventTimeline({ events }: { events: ApiEvent[] }) {
  return (
    <div className="mt-8 overflow-visible">
      <div className="grid grid-cols-3 gap-x-20 gap-y-20 px-4 py-3">
        {/*This map places each event in a snake pattern across three columns*/}
        {events.map((event, index) => {
          const row = Math.floor(index / 3)
          const positionInRow = index % 3
          const isReverseRow = row % 2 === 1
          const column = isReverseRow ? 3 - positionInRow : positionInRow + 1
          const isLastEvent = index === events.length - 1
          const isRowEnd = positionInRow === 2
          const direction = isRowEnd ? 'down' : isReverseRow ? 'left' : 'right'

          return (
            <div key={event.id} className="relative" style={{ gridColumn: column, gridRow: row + 1 }}>
              <EventListCard event={event} variant="timeline" />
              {!isLastEvent && (
                <FlowIndicator
                  direction={direction}
                  className={isRowEnd ? 'absolute bottom-[-4rem] left-1/2 z-10 -translate-x-1/2' : `absolute top-1/2 z-10 -translate-y-1/2 ${isReverseRow ? '-left-16' : '-right-16'}`}
                />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}//SnakeEventTimeline

//FlowIndicator renders an arrow SVG between timeline cards
function FlowIndicator({ direction, className }: { direction: 'left' | 'right' | 'down'; className: string }) {
  const source = direction === 'left'
    ? '/event-flow-left.svg'
    : direction === 'right'
      ? '/event-flow-right.svg'
      : '/event-flow-down.svg'
  return (
    <img aria-hidden="true" src={source} alt="" className={`${className} h-12 w-12 opacity-85 dark:brightness-0 dark:invert`} />
  )
}//FlowIndicator
