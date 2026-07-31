import { formatUpdateDateTime } from '../../lib/formatters/dateTime'
import type { ApiAqhi } from '../../types/backend'
import {
  themedCard,
  themedCardAccent,
  themedCardDivider,
  themedCardMuted,
  themedCardSubtle,
} from '../ui/themedCard'

//declaring props for the Air Quality Health Index card
interface AirQualityCardProps {
  aqhi: ApiAqhi
}

//constant Tailwind classes for each AQHI risk level badge
const RISK_STYLES: Record<string, string> = {
  LOW: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
  MODERATE: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
  HIGH: 'bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300',
  VERY_HIGH: 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300',
}

//constant official AQHI palette for levels 1 through 10 and the final plus band
const AQHI_SEGMENT_COLORS = [
  '#00CCFF',
  '#0099FF',
  '#0066FF',
  '#FFFF00',
  '#FFCC00',
  '#FF9933',
  '#FF6666',
  '#FF0000',
  '#CC0000',
  '#990000',
  '#660000',
]

//constant tick labels shown under the color scale bar
const TICKS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '+'] as const

//markerPercent converts an AQHI value to a horizontal position on the scale bar
function markerPercent(value: number) {
  const clamped = Math.min(Math.max(value, 0.5), 11)
  return (clamped / 11) * 100
}//markerPercent

//AirQualityCard shows the current AQHI value, risk badge, scale bar, and health message
export function AirQualityCard({ aqhi }: AirQualityCardProps) {
  const locationLabel = [aqhi.regionName, aqhi.neighbourhood].filter(Boolean).join(' · ')
  const riskClass = RISK_STYLES[aqhi.riskLevel] ?? 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-200'
  const riskText = /risk$/i.test(aqhi.riskLabel) ? aqhi.riskLabel : `${aqhi.riskLabel} risk`

  return (
    <section className={`flex h-fit flex-col rounded-3xl p-6 md:p-8 ${themedCard}`}>
      <h2 className={`text-lg font-black tracking-tight ${themedCardAccent}`}>
        Air Quality Health Index
      </h2>
      <p className={`mt-1 text-sm ${themedCardMuted}`}>
        {locationLabel || 'Region unavailable'}
      </p>

      {/*Large AQHI value and colored risk badge*/}
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <span className="text-6xl font-black tracking-tighter">
          {aqhi.value.toFixed(1)}
        </span>
        <span className={`inline-flex rounded-full px-3 py-1 text-sm font-bold ${riskClass}`}>
          {riskText}
        </span>
      </div>

      {/*Color scale bar with marker, tick labels, and risk band labels*/}
      <div className="mt-6">
        <div className="relative">
          <div className="flex h-3 overflow-hidden rounded-sm">
            {AQHI_SEGMENT_COLORS.map((color, index) => (
              <div
                key={TICKS[index]}
                className="h-full flex-1"
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
          <div
            className="pointer-events-none absolute top-1/2 h-5 w-0.5 -translate-x-1/2 -translate-y-1/2 bg-gray-900 dark:bg-white"
            style={{ left: `${markerPercent(aqhi.value)}%` }}
            aria-hidden
          />
        </div>

        <div className={`mt-1.5 grid grid-cols-11 text-center text-[10px] font-medium ${themedCardMuted}`}>
          {TICKS.map((tick) => (
            <span key={tick}>{tick}</span>
          ))}
        </div>

        <div className={`mt-1 grid grid-cols-11 text-center text-[10px] font-semibold tracking-wide uppercase ${themedCardMuted}`}>
          <span className="col-span-3">Low</span>
          <span className="col-span-3">Moderate</span>
          <span className="col-span-3">High</span>
          <span className="col-span-2">V. High</span>
        </div>
      </div>

      <div className={`mt-5 border-t pt-4 ${themedCardDivider}`}>
        <p className="text-sm leading-relaxed">{aqhi.healthMessage}</p>
      </div>

      <p className={`mt-5 text-xs ${themedCardSubtle}`}>
        Updated {formatUpdateDateTime(aqhi.observedAt)}
      </p>
    </section>
  )
}//AirQualityCard
