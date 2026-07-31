import { useEffect, useState } from 'react'
import { Sun } from 'lucide-react'
import { Link } from 'react-router-dom'
import { RainbowText } from '../RainbowText'
import { useAuth } from '../../context/AuthContext'
import { useResolvedLocation } from '../../context/LocationContext'
import { getCurrentAqhi } from '../../lib/api/environment'
import type { ApiAqhi } from '../../types/backend'

//interface for optional weather extras fetched separately from the location weather
interface WeatherExtras {
  aqhi: ApiAqhi | null
}

export function CompactWeather() {
  //token from auth context; needed to fetch AQHI when the user is signed in
  const { token } = useAuth()

  //location holds resolved coordinates and current weather from LocationContext
  const location = useResolvedLocation()

  //declaring state to hold AQHI and other extras loaded from the backend
  const [extras, setExtras] = useState<WeatherExtras | null>(null)

  //declaring state to track whether extras are loading, loaded, or failed
  const [extrasStatus, setExtrasStatus] = useState<'loading' | 'success' | 'error'>('loading')

  //This useEffect runs when location coordinates or auth token change
  //It loads AQHI data in parallel and updates extras when the request completes
  //The cancelled flag prevents state updates if the component unmounts mid-fetch
  useEffect(() => {
    let cancelled = false

    async function loadExtras() {
      setExtrasStatus('loading')
      const [aqhiResult] = await Promise.allSettled([
        token ? getCurrentAqhi(token) : Promise.resolve(null),
      ])

      if (cancelled) return

      setExtras({
        aqhi: aqhiResult.status === 'fulfilled' ? aqhiResult.value : null,
      })
      setExtrasStatus('success')
    }

    void loadExtras().catch(() => {
      if (!cancelled) setExtrasStatus('error')
    })

    return () => { cancelled = true }
  }, [location?.lat, location?.lon, token])

  //If location is missing or extras are still loading, show a skeleton placeholder
  if (!location || extrasStatus === 'loading') {
    return <div className="mx-auto mt-10 max-w-md animate-pulse text-center md:mt-12"><div className="mx-auto h-3 w-16 rounded bg-gray-200" /><div className="mx-auto mt-4 h-12 w-56 rounded bg-gray-200" /><div className="mx-auto mt-3 h-4 w-40 rounded bg-gray-200" /></div>
  }

  //If location resolution failed or weather is unavailable, show an error message
  if (location.error || !location.weather) {
    return <p className="mx-auto mt-10 max-w-md text-center text-sm text-red-600 md:mt-12">Couldn&apos;t load weather right now. Please try again shortly.</p>
  }

  //If extras failed to load, show a separate error message
  if (extrasStatus === 'error' || !extras) {
    return <p className="mx-auto mt-10 max-w-md text-center text-sm text-red-600 md:mt-12">Couldn&apos;t load dashboard details right now. Please try again shortly.</p>
  }

  //weather is shorthand for the current conditions from the resolved location
  const { weather } = location

  return (
    <div className="mx-auto mt-10 max-w-lg text-center md:mt-12">
      {/*Link to the full environment page*/}
      <Link to="/environment" className="text-[10px] font-semibold tracking-[0.2em] uppercase">
        <RainbowText>See all →</RainbowText>
      </Link>
      {/*Large temperature display with Weather label*/}
<div className="mt-4 flex items-end justify-center gap-3">
  <span className="text-8xl font-black tracking-tighter text-red-400 md:text-7xl">{Math.round(weather.temperature)}<span className="text-4xl align-top md:text-4xl">°C</span></span>
  <span className="mb-1 text-5xl font-black tracking-tight text-gray-900 md:text-6xl dark:text-white">Weather</span>
</div>
      <p className="mt-2 lxt-sm text-gray-400 dark:text-gray-300">{weather.summary}</p>
      {/*AQHI block is shown only when AQHI data was returned from the API*/}
      {extras.aqhi && (
        <div className="mt-3 text-base text-gray-500 dark:text-gray-300">
          <p className="flex items-center justify-center gap-2"><Sun className="h-4 w-4 text-amber-400" strokeWidth={1.5} />{extras.aqhi.value} AQHI · {extras.aqhi.riskLabel}</p>
          <p className="mt-1 text-sm text-gray-400 dark:text-gray-400">{extras.aqhi.regionName}</p>
        </div>
      )}
    </div>
  )
}//CompactWeather
