import type { DriveBCEvent } from '../../types/drivebc'
import { resolveIncidentHeadline } from '../../utils/incidentHeadline'
import {
  themedCardMuted,
} from '../ui/themedCard'

//formatUpdatedAt converts an ISO date string into a readable date and time
//If the value is not a valid date, the original string is returned unchanged
function formatUpdatedAt(value: string) {
  const date = new Date(value)
  //If parsing fails, return the raw value rather than showing Invalid Date
  if (Number.isNaN(date.getTime())) return value

  const day = date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
  const time = date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  })

  return `${day}, ${time}`
}//formatUpdatedAt

//renderIncidentDescription bolds important keywords in incident descriptions
//Non-incident events return the plain description string without highlighting
function renderIncidentDescription(event: DriveBCEvent) {
  //Only incident events get keyword highlighting; other types show plain text
  if (event.eventType !== 'INCIDENT') return event.description

  //keywordSource matches road-related terms eg. crash, closure, flood, hazard
  const keywordSource =
    '\\b(crash(?:es|ed|ing)?|collision(?:s)?|accident(?:s)?|washout(?:s)?|flood(?:ing|ed|s)?|wildfire(?:s)?|road closed|closure(?:s)?|closed|hazard(?:s)?|landslide(?:s)?|rockfall|debris|bridge)\\b'
  const parts = event.description.split(new RegExp(keywordSource, 'gi'))
  const isKeyword = new RegExp(`^${keywordSource}$`, 'i')

  //This map splits the description into text and keyword segments
  //Matching keywords are wrapped in a bold strong element
  return parts.map((part, index) =>
    isKeyword.test(part) ? (
      <strong key={index} className="font-bold">
        {part}
      </strong>
    ) : (
      part
    ),
  )
}//renderIncidentDescription

export function EventCard({
  event,
  expanded,
  onToggleExpanded,
}: {
  event: DriveBCEvent
  expanded: boolean
  onToggleExpanded: () => void
}) {
  //severityColors maps each severity level to badge styling classes
  const severityColors = {
    MAJOR: 'bg-red-600 text-white border-red-400 shadow-[0_0_8px_rgba(239,68,68,0.55)]',
    MODERATE: 'bg-amber-500 text-gray-950 border-amber-300 shadow-[0_0_8px_rgba(245,158,11,0.45)]',
    MINOR: 'bg-slate-500 text-white border-slate-300 shadow-[0_0_6px_rgba(148,163,184,0.4)]',
    UNKNOWN: 'bg-slate-600 text-white border-slate-400',
  }
  //severitySymbol shows a diamond for MAJOR and a triangle for MINOR severity
  const severitySymbol =
    event.severity === 'MAJOR' ? '◇' : event.severity === 'MINOR' ? '▽' : null
  //isClosure is true when the event has at least one closed road name
  const isClosure = event.closedRoadNames.length > 0
  //title is a human-readable headline derived from the event data
  const title = resolveIncidentHeadline(event)

  const summaryHeaderSurface =
    'border border-gray-300 bg-gray-100 text-gray-900 dark:border-white dark:bg-gray-950 dark:text-white'
  const collapsedHeaderShadow =
    'shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.14)]'
  const expandedHeaderShadow =
    'shadow-[inset_0_1px_0_rgba(255,255,255,0.8),inset_0_-8px_12px_-6px_rgba(255,255,255,0.75)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.14),inset_0_-8px_12px_-6px_rgba(255,255,255,0.28)]'
  const expandedBodySurface =
    'border border-gray-300 bg-white text-gray-900 shadow-none dark:border-white dark:bg-black dark:text-white dark:shadow-none'
  const expandedCardOuterGlow =
    'rounded-xl shadow-[0_0_16px_rgba(15,23,42,0.08)] dark:shadow-[0_0_18px_rgba(255,255,255,0.35)]'

  return (
    <div
      className={`col-span-3 grid grid-cols-subgrid gap-x-3 ${expanded ? expandedCardOuterGlow : ''}`}
    >
      <article
        className={`col-span-3 grid grid-cols-subgrid items-center gap-x-3 px-3 py-2.5 ${summaryHeaderSurface} ${expanded ? expandedHeaderShadow : collapsedHeaderShadow} ${expanded ? 'rounded-t-xl rounded-b-none border-b-0' : 'rounded-xl'}`}
      >
        {/*Left cluster: badges and headline*/}
        <div className="flex min-w-0 items-center gap-2">
          {isClosure && (
            <span className="inline-flex shrink-0 items-center gap-1 rounded border border-red-400 bg-red-700 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white shadow-[0_0_8px_rgba(239,68,68,0.55)]">
              <span aria-hidden="true">⛔</span> Closure
            </span>
          )}
          <span
            className={`inline-flex shrink-0 items-center gap-1 rounded border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${severityColors[event.severity]}`}
          >
            {severitySymbol && (
              <span aria-hidden="true" className="text-sm leading-none">
                {severitySymbol}
              </span>
            )}
            {event.severity}
          </span>
          <p className="min-w-0 truncate text-sm font-bold leading-tight">{title}</p>
        </div>

        {/*Expand control; column width is shared across all cards via subgrid*/}
        <button
          type="button"
          onClick={onToggleExpanded}
          aria-expanded={expanded}
          aria-label={expanded ? 'Hide description' : 'Show description'}
          className="inline-flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-md border border-black text-sm font-bold leading-none transition hover:bg-black hover:text-white dark:border-white dark:hover:bg-white dark:hover:text-black"
        >
          {expanded ? '−' : '+'}
        </button>

        {/*Meta column sizes to the widest district name or updated time in the list*/}
        <div className={`text-right text-[11px] leading-tight ${themedCardMuted}`}>
          <p className="whitespace-nowrap font-medium text-inherit opacity-100">{event.areaName}</p>
          <p className="whitespace-nowrap">Updated {formatUpdatedAt(event.updated)}</p>
        </div>
      </article>

      {/*Expanded description panel sits below the summary row, sharing its border*/}
      {expanded && (
        <div
          className={`col-span-3 rounded-b-xl rounded-t-none border-t-0 px-3 pb-3 pt-2 ${expandedBodySurface}`}
          role="region"
          aria-label={`${title} description`}
        >
          <p className="text-xs leading-relaxed opacity-90">{renderIncidentDescription(event)}</p>
        </div>
      )}
    </div>
  )
}//EventCard
