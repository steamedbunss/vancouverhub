import { ExternalLink } from 'lucide-react'
import type { ApiWildfire } from '../../types/backend'
import type { EvacuationNotice } from '../../lib/api/evacuation'
import { themedCard, themedCardAccent, themedCardMuted } from '../ui/themedCard'

//declaring props for a single wildfire incident card
interface WildfireCardProps {
  fire: ApiWildfire
  evacuations?: EvacuationNotice[]
}

//statusDotClass maps BC wildfire status text to a Tailwind background color class
function statusDotClass(status: string) {
  switch (status.toLowerCase()) {
    case 'out of control':
      return 'bg-red-600'
    case 'being held':
      return 'bg-yellow-300'
    case 'under control':
      return 'bg-lime-400'
    default:
      return 'bg-gray-400'
  }
}//statusDotClass

//statusLabel returns a title-case label for the status dot tooltip
function statusLabel(status: string) {
  switch (status.toLowerCase()) {
    case 'out of control':
      return 'Out of Control'
    case 'being held':
      return 'Being Held'
    case 'under control':
      return 'Under Control'
    default:
      return 'Unknown'
  }
}//statusLabel

//formatUpdatedAt turns the API sync timestamp into a readable local date and time
function formatUpdatedAt(value: string | null | undefined) {
  if (!value) return 'Unavailable'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Unavailable'

  return new Intl.DateTimeFormat('en-CA', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date)
}//formatUpdatedAt

//EvacuationAlertIcon is a yellow circle with white exclamation for Evacuation Alert
export function EvacuationAlertIcon({ className = '' }: { className?: string }) {
  return (
    <span
      className={`inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-yellow-400 text-[10px] font-black text-white ${className}`}
      title="Evacuation Alert"
      aria-label="Evacuation Alert"
    >
      !
    </span>
  )
}//EvacuationAlertIcon

//EvacuationOrderIcon is a red triangle with white exclamation for Evacuation Order
export function EvacuationOrderIcon({ className = '' }: { className?: string }) {
  return (
    <span
      className={`relative inline-flex h-4 w-4 shrink-0 items-center justify-center ${className}`}
      title="Evacuation Order"
      aria-label="Evacuation Order"
    >
      <span
        className="absolute inset-0 bg-red-600"
        style={{ clipPath: 'polygon(50% 4%, 100% 96%, 0 96%)' }}
        aria-hidden
      />
      <span className="relative z-[1] mt-0.5 text-[9px] font-black leading-none text-white" aria-hidden>
        !
      </span>
    </span>
  )
}//EvacuationOrderIcon

//WildfireCard displays one nearby wildfire with status, evacuation icons, and size details
export function WildfireCard({ fire, evacuations = [] }: WildfireCardProps) {
  const hasOrder = evacuations.some((notice) => notice.status === 'Order')
  const hasAlert = evacuations.some((notice) => notice.status === 'Alert')
  const sqMeters = fire.sizeHectares !== null ? Math.round(fire.sizeHectares * 10000) : null
  const label = statusLabel(fire.status)
  //Resolve nullable API text once so incomplete wildfire records still render safely
  const incidentName = fire.incidentName?.trim() ?? ''
  const fireNumber = fire.fireNumber?.trim() ?? ''
  const geographicDescription = fire.geographicDescription?.trim() ?? ''
  const title = incidentName || geographicDescription || fireNumber || 'Unnamed wildfire'
  const subtitle = geographicDescription || fireNumber
  //showSubtitle hides redundant subtitle when it matches the resolved card title
  const showSubtitle =
    Boolean(subtitle) &&
    subtitle.toLowerCase() !== title.toLowerCase()

  return (
    <article className={`rounded-2xl p-5 transition-all duration-300 ease-in-out hover:scale-120 hover:shadow-xl ${themedCard}`}>
      {/*Header with incident name, status dot, evacuation icons, and distance*/}
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-lg font-bold">{title}</h3>
            <span
              className={`inline-block h-3.5 w-3.5 shrink-0 rounded-full border border-black/40 dark:border-white/40 ${statusDotClass(fire.status)}`}
              title={label}
              aria-label={label}
            />
            {hasAlert && <EvacuationAlertIcon />}
            {hasOrder && <EvacuationOrderIcon />}
            {fire.fireOfNote && (
              <span title="Noteworthy" aria-label="Noteworthy" className="text-sm leading-none">
                🔥
              </span>
            )}
          </div>
          {showSubtitle && (
            <p className={`mt-1 text-sm ${themedCardMuted}`}>{subtitle}</p>
          )}
        </div>
        {fire.distanceKm !== null && (
          <span className="shrink-0 text-sm font-bold">{fire.distanceKm.toFixed(1)} km</span>
        )}
      </div>
      {/*Uniform metadata rows keep long size values from moving the cause*/}
      <div className={`mt-4 space-y-2 text-sm ${themedCardMuted}`}>
        {fire.sizeHectares !== null && sqMeters !== null && (
          <p>
            {fire.sizeHectares.toLocaleString()} hectares ({sqMeters.toLocaleString()} m²)
          </p>
        )}
        {fire.cause && (
          <p className="font-semibold text-gray-900 dark:text-white">Cause: {fire.cause}</p>
        )}
        <p>Updated: {formatUpdatedAt(fire.lastSyncedAt)}</p>
      </div>
      {fire.fireUrl && (
        <a
          href={fire.fireUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={`mt-4 inline-flex items-center gap-1 text-sm font-semibold hover:underline ${themedCardAccent}`}
        >
          Official incident details <ExternalLink className="h-3.5 w-3.5" />
        </a>
      )}
    </article>
  )
}//WildfireCard
