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
  /** Transparent surface with white neon border (311 page). */
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
      ? 'relative border-white/50 bg-gray-950 text-white/70 shadow-[0_0_14px_rgba(255,255,255,0.28)]'
      : 'relative border-white bg-gray-950 text-white shadow-[0_0_18px_rgba(255,255,255,0.45)]'
    : seen
      ? 'border-gray-400 bg-gradient-to-br from-gray-200 via-gray-100 to-gray-300 text-gray-700 opacity-90 dark:border-gray-600 dark:from-gray-800 dark:via-gray-900 dark:to-gray-800 dark:text-gray-300'
      : 'border-black bg-white text-black'

  return (
    <article className={`rounded-xl border p-5 text-left shadow-sm ${surfaceStyle} ${className}`}>
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
                  ? 'rounded-full border border-white/40 bg-white/10 px-2.5 py-1 text-[11px] font-semibold text-white'
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
      <p className="mt-3 text-sm opacity-90">{request.address}</p>
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
          className={
            isNeon
              ? 'mt-4 text-sm font-semibold text-white underline-offset-4 hover:underline disabled:cursor-not-allowed disabled:opacity-50'
              : 'mt-4 text-sm font-semibold text-red-800 underline-offset-4 hover:text-red-950 hover:underline disabled:cursor-not-allowed disabled:opacity-50'
          }
        >
          {markingSeen ? 'Marking seen…' : 'Mark as seen'}
        </button>
      )}
    </article>
  )
}//ServiceRequestCard
