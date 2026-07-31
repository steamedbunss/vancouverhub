import type { DriveBCEvent } from '../../types/drivebc'
import { resolveIncidentHeadline } from '../../utils/incidentHeadline'
import {
  themedCard,
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
  //severitySymbol shows a diamond for MAJOR and a triangle for MINOR delays
  const severitySymbol =
    event.severity === 'MAJOR' ? '◇' : event.severity === 'MINOR' ? '▽' : null
  //isClosure is true when the event has at least one closed road name
  const isClosure = event.closedRoadNames.length > 0
  //title is a human-readable headline derived from the event data
  const title = resolveIncidentHeadline(event)

  return (
    <div className="flex w-full flex-col items-center gap-3">
      {/*Compact card showing severity badge, title, area, and last updated time*/}
      <article className={`relative flex w-52 shrink-0 flex-col gap-2 rounded-xl p-3 ${themedCard}`}>
        {/*Top row with severity/closure badges and expand/collapse button*/}
        <div className="flex items-start justify-between gap-2">
          <div className="flex min-w-0 flex-wrap items-center gap-1.5">
            {/*Closure badge appears when the event closes one or more roads*/}
            {isClosure && (
              <span className="inline-flex items-center gap-1 rounded border border-red-400 bg-red-700 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white shadow-[0_0_8px_rgba(239,68,68,0.55)]">
                <span aria-hidden="true">⛔</span> Closure
              </span>
            )}
            {/*Severity badge with optional symbol and severity label*/}
            <span
              className={`inline-flex items-center gap-1 rounded border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${severityColors[event.severity]}`}
            >
              {severitySymbol && (
                <span aria-hidden="true" className="text-sm leading-none">
                  {severitySymbol}
                </span>
              )}
              {event.severity}
            </span>
          </div>
          {/*Toggle button expands or collapses the full description panel*/}
          <button
            type="button"
            onClick={onToggleExpanded}
            aria-expanded={expanded}
            aria-label={expanded ? 'Hide description' : 'Show description'}
            className="inline-flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-md border border-black text-sm font-bold leading-none transition hover:bg-black hover:text-white dark:border-white dark:hover:bg-white dark:hover:text-black"
          >
            {expanded ? '−' : '+'}
          </button>
        </div>

        {/*Event headline clamped to three lines*/}
        <p className="line-clamp-3 text-base font-bold leading-tight">{title}</p>

        {/*Area name and formatted last-updated timestamp*/}
        <div className={`space-y-0.5 text-[11px] ${themedCardMuted}`}>
          <p className="line-clamp-2 font-medium text-inherit opacity-100">{event.areaName}</p>
          <p>Updated {formatUpdatedAt(event.updated)}</p>
        </div>
      </article>

      {/*Expanded description panel with keyword-highlighted incident text*/}
      {expanded && (
        <div
          className={`w-full rounded-xl p-4 ${themedCard}`}
          role="region"
          aria-label={`${title} description`}
        >
          <p className="text-xs leading-relaxed opacity-90">{renderIncidentDescription(event)}</p>
        </div>
      )}
    </div>
  )
}//EventCard
