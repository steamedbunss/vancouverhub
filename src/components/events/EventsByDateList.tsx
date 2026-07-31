import type { ApiEvent } from '../../types/backend'
import { EventListCard } from './EventListCard'

//dateKey converts an ISO date string to a YYYY-MM-DD key for grouping
function dateKey(dateStart: string) {
  const date = new Date(dateStart)
  if (Number.isNaN(date.getTime())) return 'Unknown date'

  return [date.getFullYear(), String(date.getMonth() + 1).padStart(2, '0'), String(date.getDate()).padStart(2, '0')].join('-')
}//dateKey

//formatDate converts an ISO date string to a full readable date label
function formatDate(dateStart: string) {
  const date = new Date(dateStart)
  return Number.isNaN(date.getTime())
    ? 'Date unavailable'
    : date.toLocaleDateString('en-CA', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
}//formatDate

export function EventsByDateList({ events }: { events: ApiEvent[] }) {
  //groups sorts events by date and buckets them into date groups
  const groups = [...events]
    .sort((first, second) => new Date(first.dateStart).getTime() - new Date(second.dateStart).getTime())
    .reduce<Array<{ date: string; events: ApiEvent[] }>>((result, event) => {
      const key = dateKey(event.dateStart)
      const existingGroup = result.find((group) => group.date === key)

      if (existingGroup) {
        existingGroup.events.push(event)
      } else {
        result.push({ date: key, events: [event] })
      }

      return result
    }, [])

  return (
    <div className="space-y-9">
      {/*This map iterates through each date group and renders a section*/}
      {groups.map((group) => (
        <section key={group.date} aria-labelledby={`event-date-${group.date}`}>
          {/*Date heading with horizontal divider line*/}
          <div className="mb-3 flex items-center gap-4">
            <h2 id={`event-date-${group.date}`} className="shrink-0 text-lg font-bold text-gray-900 dark:text-white">
              {formatDate(group.events[0].dateStart)}
            </h2>
            <div className="h-px flex-1 bg-gray-200 dark:bg-gray-700" />
          </div>
          <div className="space-y-3">
            {/*This map renders an EventListCard for each event on this date*/}
            {group.events.map((event) => <EventListCard key={event.id} event={event} />)}
          </div>
        </section>
      ))}
    </div>
  )
}//EventsByDateList
