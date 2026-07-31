import type { ApiEvent } from '../../types/backend'
import { themedCard, themedCardAccent, themedCardMuted } from '../ui/themedCard'

//formatTime converts an ISO date string to a readable time label
function formatTime(dateStart: string) {
  const date = new Date(dateStart)
  return Number.isNaN(date.getTime())
    ? dateStart
    : date.toLocaleTimeString('en-CA', { hour: 'numeric', minute: '2-digit' })
}//formatTime

export function EventListCard({ event, variant = 'list' }: { event: ApiEvent; variant?: 'list' | 'timeline' }) {
  //isTimelineCard is true when the card should use the tall timeline layout
  const isTimelineCard = variant === 'timeline'

  if (isTimelineCard) {
    return (
      //Timeline variant: full-height image card with overlay text
      <article className={`group relative aspect-[4/5] overflow-hidden rounded-2xl bg-slate-900 shadow-md transition duration-300 ease-out hover:z-20 hover:scale-[1.045] hover:shadow-2xl dark:border dark:border-white dark:shadow-[0_0_18px_rgba(255,255,255,0.45)]`}>
        {event.imageUrl ? (
          <img
            src={event.imageUrl}
            alt=""
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-slate-700 to-slate-950" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
        {/*Event title, time, description, and external link overlay*/}
        <div className="absolute right-0 bottom-0 left-0 p-5 text-white">
          <h2 className="break-words text-lg leading-6 font-bold">{event.title}</h2>
          <p className="mt-2 text-sm font-semibold text-white/90">{formatTime(event.dateStart)}</p>
          {event.description && <p className="mt-2 line-clamp-2 text-sm leading-5 text-white/80">{event.description}</p>}
          {event.externalUrl && (
            <a
              href={event.externalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-block text-sm font-semibold text-white underline underline-offset-4 transition hover:text-white/75"
            >
              See more →
            </a>
          )}
        </div>
      </article>
    )
  }

  return (
    //List variant: horizontal card with thumbnail on the left
    <article className={`flex h-full min-h-36 overflow-hidden rounded-xl ${themedCard}`}>
      {/*Thumbnail column with image or placeholder*/}
      <div className="h-36 w-32 shrink-0 bg-slate-100 dark:bg-gray-900 sm:w-44">
        {event.imageUrl ? (
          <img src={event.imageUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className={`flex h-full items-center justify-center px-3 text-center text-xs font-medium ${themedCardMuted}`}>
            Event image unavailable
          </div>
        )}
      </div>
      {/*Text column with title, time, description, and external link*/}
      <div className="flex min-w-0 flex-1 flex-col justify-between p-4">
        <div>
          <h2 className="font-bold">{event.title}</h2>
          <p className={`mt-1 text-sm font-medium ${themedCardAccent}`}>{formatTime(event.dateStart)}</p>
          {event.description && (
            <p className={`mt-2 line-clamp-2 text-sm leading-5 ${themedCardMuted}`}>{event.description}</p>
          )}
        </div>
        {event.externalUrl && (
          <a
            href={event.externalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`mt-3 self-start text-sm font-semibold hover:underline ${themedCardAccent}`}
          >
            See more →
          </a>
        )}
      </div>
    </article>
  )
}//EventListCard
