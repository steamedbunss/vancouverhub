import type { ApiWeather } from '../../types/backend'
import { useAuth } from '../../context/AuthContext'
import { useUserConfig } from '../../context/UserConfigContext'
import {
  resolveWeatherScene,
  weatherSummaryEmoji,
} from '../../lib/weather/weatherScene'
import {
  themedCard,
  themedCardDivider,
  themedCardMuted,
  themedCardSubtle,
} from '../ui/themedCard'
import { WeatherSceneBackground } from './WeatherSceneBackground'

//declaring props for the current weather conditions card
interface CurrentConditionsCardProps {
  weather: ApiWeather
}

//formatUpdateTime shows only the time portion of the last fetch timestamp
function formatUpdateTime(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Update time unavailable'
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(date)
}//formatUpdateTime

//formatPrecipitation builds a readable precipitation amount and type string
function formatPrecipitation(weather: ApiWeather) {
  const amount = weather.precipitation ?? 0
  const type = weather.precipitationType?.trim()
  if (amount <= 0 && (!type || /none/i.test(type))) return '0 mm · None'
  if (type) return `${amount} mm · ${type}`
  return `${amount} mm`
}//formatPrecipitation

//CurrentConditionsCard shows temperature, summary, and detail stats for the user's area
export function CurrentConditionsCard({ weather }: CurrentConditionsCardProps) {
  const { token } = useAuth()
  const { config } = useUserConfig()
  const scene = resolveWeatherScene(weather.summary)
  //showAnimatedBackground is true when signed in and the summary maps to a scene
  const showAnimatedBackground = Boolean(token) && scene !== null
  const emoji = weatherSummaryEmoji(weather.summary)
  //overlayOpacity darkens the animated background so white text stays readable
  const overlayOpacity = Math.min(
    80,
    Math.max(0, config.appearance.weatherOverlayOpacity ?? 55),
  )
  //When the animated background is active, use white-tinted text classes instead of themed card muted
  const muted = showAnimatedBackground ? 'text-white/75' : themedCardMuted
  const subtle = showAnimatedBackground ? 'text-white/55' : themedCardSubtle
  const divider = showAnimatedBackground ? 'border-white/20' : themedCardDivider

  return (
    <section
      className={`relative h-fit overflow-hidden rounded-3xl ${
        showAnimatedBackground
          ? 'border border-white/25 text-white shadow-[0_0_18px_rgba(255,255,255,0.25)]'
          : themedCard
      }`}
    >
      {/*Animated weather background and dark overlay for signed-in users*/}
      {showAnimatedBackground && scene && (
        <>
          <WeatherSceneBackground scene={scene} />
          <div
            className="weather-bg-overlay"
            style={{ background: `rgba(0, 0, 0, ${overlayOpacity / 100})` }}
            aria-hidden
          />
        </>
      )}

      <div className="relative z-[2] p-6 md:p-8">
        <h2 className="text-3xl font-black tracking-tight">
          {weather.neighbourhood ?? 'Location unavailable'}
        </h2>
        <p className={`mt-1 text-base ${muted}`}>{weather.summary}</p>

        {/*Large temperature display with unit and summary emoji*/}
        <div className="mt-6 flex items-end gap-2">
          <span className="text-6xl font-black tracking-tighter md:text-7xl">
            {Math.round(weather.temperature)}°
          </span>
          <span className={`mb-2 text-xl font-semibold ${subtle}`}>C</span>
          <span className="mb-2 ml-1 text-2xl leading-none" aria-hidden>
            {emoji}
          </span>
        </div>

        <p className={`mt-3 text-xs ${subtle}`}>
          Updated {formatUpdateTime(weather.fetchedAt)}
        </p>

        {/*Wind, precipitation, and cloud cover detail grid*/}
        <div className={`mt-5 grid grid-cols-2 gap-x-6 gap-y-4 border-t pt-4 text-sm ${divider}`}>
          <div>
            <p className={`text-xs ${muted}`}>Wind</p>
            <p className="mt-0.5 font-bold">
              {weather.windSpeed != null ? `${weather.windSpeed} km/h` : '—'}
              {weather.windDirection ? ` ${weather.windDirection}` : ''}
            </p>
          </div>
          <div>
            <p className={`text-xs ${muted}`}>Precipitation</p>
            <p className="mt-0.5 font-bold">{formatPrecipitation(weather)}</p>
          </div>
          <div>
            <p className={`text-xs ${muted}`}>Cloud cover</p>
            <p className="mt-0.5 font-bold">
              {weather.cloudCoverPercent != null ? `${weather.cloudCoverPercent}%` : '—'}
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}//CurrentConditionsCard
