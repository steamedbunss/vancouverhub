import type { ApiServiceRequest, ApiServiceRequestCategory } from '../../types/backend'
import { getServiceRequestCategoryColor } from '../../constants/serviceRequestCategories'
import { resolveServiceRequestTitle } from '../../utils/serviceRequestTitle'

//declaring props for a single 311 service request card
interface ServiceRequestCardProps {
  request: ApiServiceRequest
  onMarkSeen?: (request: ApiServiceRequest) => void
  markingSeen?: boolean
  showSeenStatus?: boolean
  hideCategory?: boolean
  /** Neon variant uses gray surfaces with white border glow on dark mode (311 page). */
  variant?: 'default' | 'neon'
  className?: string
}

//constant map from category id to display emoji for the card corner
const CATEGORY_EMOJI: Record<ApiServiceRequestCategory, string> = {
  ROAD: '🛣️',
  GARBAGE: '🗑️',
  WATER: '💧',
  GRAFFITI: '🎨',
  NOISE: '🔊',
  SAFETY: '⚠️',
}

//formatOpenedSince turns an ISO date string into a readable "Opened since ..." label
function formatOpenedSince(value: string) {
  const date = new Date(value)
  //If the date is invalid, fall back to showing the raw value
  if (Number.isNaN(date.getTime())) return `Opened since ${value}`
  const formatted = new Intl.DateTimeFormat('en-CA', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date)
  return `Opened since ${formatted}`
}//formatOpenedSince

//ServiceRequestCard displays one nearby 311 request with optional mark-as-seen action
export function ServiceRequestCard({
  request,
  onMarkSeen,
  markingSeen,
  showSeenStatus = false,
  hideCategory = false,
  variant = 'default',
  className = '',
}: ServiceRequestCardProps) {
  //category is the human-readable label, eg. "Road" from "ROAD"
  const category = request.category.charAt(0) + request.category.slice(1).toLowerCase()
  const distance = request.distanceKm === null ? null : `${request.distanceKm.toFixed(1)} km away`
  const title = resolveServiceRequestTitle(request.requestType, request.id)
  const emoji = CATEGORY_EMOJI[request.category] ?? '📌'
  const isNeon = variant === 'neon'
  const seen = showSeenStatus && request.seen

  //surfaceStyle picks border and background classes based on variant and seen state
  const surfaceStyle = isNeon
    ? seen
      ? 'relative border-gray-400 bg-gray-300 text-gray-600 saturate-0 shadow-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400 dark:shadow-[0_0_12px_rgba(255,255,255,0.16)]'
      : 'relative border-gray-300 bg-gray-100 text-gray-900 shadow-sm dark:border-white dark:bg-gray-950 dark:text-white dark:shadow-[0_0_18px_rgba(255,255,255,0.45)]'
    : seen
      ? 'border-gray-400 bg-gray-300 text-gray-600 saturate-0 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400'
      : 'border-gray-300 bg-gray-100 text-gray-900 dark:border-white dark:bg-gray-950 dark:text-white'

  return (
    <article className={`flex flex-col rounded-xl border p-5 text-left shadow-sm ${surfaceStyle} ${className}`}>
      {/*Header row with category, title, seen badge, and emoji*/}
      <div className="flex items-start justify-between gap-3">
        <div>
          {!hideCategory && (
            <p className="text-[11px] font-bold tracking-[0.14em] uppercase opacity-90">
              {category}
            </p>
          )}
          <h3
            className={`${hideCategory ? '' : 'mt-2'} text-base font-bold ${getServiceRequestCategoryColor(request.category).title}`}
          >
            {title}
          </h3>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-2">
          {showSeenStatus && request.seen && (
            <span
              className={
                isNeon
                  ? 'rounded-full border border-gray-500 bg-gray-200 px-2.5 py-1 text-[11px] font-semibold text-gray-700 dark:border-gray-500 dark:bg-gray-700 dark:text-gray-200'
                  : 'rounded-full bg-teal-100 px-2.5 py-1 text-[11px] font-semibold text-teal-800 dark:bg-teal-900/50 dark:text-teal-200'
              }
            >
              Seen
            </span>
          )}
          <span
            className="text-xl leading-none"
            title={category}
            aria-label={category}
          >
            {emoji}
          </span>
        </div>
      </div>
      <p className="mt-3 text-sm opacity-90">{request.address.replace(/\bAv\b\.?/gi, 'Ave')}</p>
      {/*Distance and opened date metadata*/}
      <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-xs opacity-80">
        {distance && <span>{distance}</span>}
        <span>{formatOpenedSince(request.openedAt)}</span>
      </div>
      {/*Mark as seen button only when callback is provided and request is unseen*/}
      {onMarkSeen && !request.seen && (
        <button
          type="button"
          onClick={() => onMarkSeen(request)}
          disabled={markingSeen}
          className="mx-auto mt-auto inline-flex rounded-full border border-gray-400 bg-white/70 px-4 py-1.5 text-xs font-semibold text-gray-700 transition hover:border-gray-600 hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-500 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:border-gray-400 dark:hover:bg-gray-700"
        >
          {markingSeen ? 'Marking seen…' : 'Mark as seen'}
        </button>
      )}
    </article>
  )
}//ServiceRequestCard
