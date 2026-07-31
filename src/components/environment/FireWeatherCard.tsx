import { useState } from 'react'
import { Info } from 'lucide-react'
import { formatUpdateDateTime } from '../../lib/formatters/dateTime'
import type { ApiFireWeather } from '../../types/backend'
import {
  themedCard,
  themedCardAccent,
  themedCardMuted,
  themedCardSubtle,
} from '../ui/themedCard'

//declaring props for the nearby fire weather station card
interface FireWeatherCardProps {
  weather: ApiFireWeather
}

//constant colors for each segment of the 5-step danger rating bar
const DANGER_SEGMENT_COLORS = [
  '#14b8a6',
  '#eab308',
  '#f97316',
  '#ef4444',
  '#991b1b',
]

//FireWeatherCard shows FWI, danger rating, and a colored segment bar for a station
export function FireWeatherCard({ weather }: FireWeatherCardProps) {
  const [showFwiTooltip, setShowFwiTooltip] = useState(false)
  const rating = weather.dangerRating
  //filledCount is how many bar segments to highlight, clamped between 0 and 5
  const filledCount =
    rating != null && Number.isFinite(rating)
      ? Math.min(Math.max(Math.round(rating), 0), 5)
      : 0
  const fwiValue =
    weather.fireWeatherIndex != null ? weather.fireWeatherIndex.toFixed(1) : '—'

  return (
    <section className={`rounded-3xl p-6 md:p-8 ${themedCard}`}>
      {/*Header with station name, info tooltip, and last updated time*/}
      <div className="flex flex-wrap items-start gap-3">
        <div className="min-w-0 shrink-0">
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-black tracking-tight">
              Fire Containment Difficulty
            </h2>
            <button
              type="button"
              className={`inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-current ${themedCardAccent} hover:opacity-80 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-400`}
              aria-label="Fire Weather Index details"
              aria-describedby="fire-weather-index-tooltip"
              onMouseEnter={() => setShowFwiTooltip(true)}
              onMouseLeave={() => setShowFwiTooltip(false)}
              onFocus={() => setShowFwiTooltip(true)}
              onBlur={() => setShowFwiTooltip(false)}
            >
              <Info className="h-3.5 w-3.5" aria-hidden />
            </button>
          </div>
          <p className={`mt-1 text-sm ${themedCardMuted}`}>
            {weather.stationName} · {weather.distanceKm.toFixed(1)} km away
          </p>
        </div>

        <div className="flex min-w-0 flex-1 items-start justify-end gap-3">
          {/*FWI tooltip toggles on info button mouse enter/leave and focus/blur*/}
          <div className="relative min-h-[3.25rem] min-w-0 flex-1">
            <div
              id="fire-weather-index-tooltip"
              role="tooltip"
              aria-hidden={!showFwiTooltip}
              className={`absolute inset-x-0 top-0 flex items-center gap-3 rounded-lg border border-black/15 bg-gray-50 px-3 py-1.5 transition-opacity duration-150 dark:border-white/25 dark:bg-white/5 ${
                showFwiTooltip ? 'opacity-100' : 'pointer-events-none opacity-0'
              }`}
            >
              <div className="shrink-0 leading-none">
                <p className={`text-[10px] font-semibold uppercase ${themedCardMuted}`}>FWI</p>
                <p className="text-3xl font-black tracking-tight">{fwiValue}</p>
              </div>
              <p className={`min-w-0 text-xs leading-snug ${themedCardMuted}`}>
                Fire Weather Index is a broader intensity score for Canada&apos;s forests. Danger
                rating below is the simpler version.
              </p>
            </div>
          </div>
          <p className={`shrink-0 pt-1 text-xs ${themedCardSubtle}`}>
            Updated {formatUpdateDateTime(weather.observedAt)}
          </p>
        </div>
      </div>

      {/*Danger rating stats and colored segment bar*/}
      <div className="mt-6 flex flex-col gap-5 md:flex-row md:items-center md:gap-6">
        <div className="grid shrink-0 grid-cols-2 gap-6">
          <div>
            <p className={`text-xs ${themedCardMuted}`}>Danger rating</p>
            <p className="mt-0.5 text-2xl font-black tracking-tight">
              {rating != null ? `${rating} / 5` : '—'}
            </p>
          </div>
          <div>
            <p className={`text-xs ${themedCardMuted}`}>Danger label</p>
            <p className="mt-0.5 text-2xl font-black tracking-tight">
              {weather.dangerLabel || '—'}
            </p>
          </div>
        </div>

        <div className="hidden h-14 w-px shrink-0 bg-gray-200 dark:bg-white/25 md:block" aria-hidden />

        <div className="min-w-0 flex-1">
          {/*This map renders one segment per danger level; filled segments use DANGER_SEGMENT_COLORS*/}
          <div className="flex h-3 max-w-xs gap-1 overflow-hidden">
            {DANGER_SEGMENT_COLORS.map((color, index) => {
              const filled = index < filledCount
              return (
                <div
                  key={color}
                  className={`h-full flex-1 rounded-sm ${filled ? '' : 'bg-gray-200 dark:bg-gray-700'}`}
                  style={filled ? { backgroundColor: color } : undefined}
                />
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}//FireWeatherCard
