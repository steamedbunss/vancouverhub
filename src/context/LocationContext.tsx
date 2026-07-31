//declaring react context hooks, location helpers, and weather API
import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import { useAuth } from './AuthContext'
import {
  getCachedGuestWeatherLocation,
  requestBrowserLocation,
  resetGuestLocationCache,
} from '../lib/location/browserLocation'
import {
  clearManualLocation,
  loadManualLocation,
  storeManualLocation,
  type ManualLocation,
} from '../lib/location/manualLocation'
import { getWeatherAtCoordinates, getWeatherForSession } from '../lib/api/environment'
import type { ApiWeather } from '../types/backend'

//declaring resolved location with coordinates, weather, and source tracking
export interface ResolvedLocation {
  lat: number
  lon: number
  neighbourhood: string | null
  weather: ApiWeather | null
  source: 'saved' | 'device' | 'fallback' | 'manual'
  error: boolean
}

//declaring location context value shape exposed to consuming components
interface LocationContextValue {
  location: ResolvedLocation | null
  setManualLocation: (location: ManualLocation) => Promise<void>
  useCurrentLocation: () => Promise<void>
}

//declaring location context instance
const LocationContext = createContext<LocationContextValue | null>(null)

//This function resolves and provides the user's current location with weather data
export function LocationProvider({ children }: { children: ReactNode }) {
  const { token, user, isLoading, saveHomeLocation } = useAuth()
  const [location, setLocation] = useState<ResolvedLocation | null>(null)
  const [manualGuestLocation, setManualGuestLocation] = useState<ManualLocation | null>(() => loadManualLocation())
  const previousTokenRef = useRef<string | null | undefined>(undefined)
  const resolutionRef = useRef<Promise<ResolvedLocation> | null>(null)
  const requestVersionRef = useRef(0)

  //This function fetches weather at coordinates and builds a ResolvedLocation object
  const resolveAtCoordinates = useCallback(async (
    latitude: number,
    longitude: number,
    source: ResolvedLocation['source'],
    useSavedWeather = false,
  ): Promise<ResolvedLocation> => {
    try {
      const weather = useSavedWeather && token
        ? await getWeatherForSession(token)
        : await getWeatherAtCoordinates(latitude, longitude)

      return {
        lat: weather.latitude,
        lon: weather.longitude,
        neighbourhood: weather.neighbourhood,
        weather,
        source,
        error: false,
      }
    } catch {
      return { lat: latitude, lon: longitude, neighbourhood: null, weather: null, source, error: true }
    }
  }, [token])//resolveAtCoordinates

  //This function resolves location and applies it only if no newer request is pending
  const applyResolvedLocation = useCallback(async (
    latitude: number,
    longitude: number,
    source: ResolvedLocation['source'],
    useSavedWeather = false,
  ) => {
    const requestVersion = ++requestVersionRef.current
    const resolved = await resolveAtCoordinates(latitude, longitude, source, useSavedWeather)
    if (requestVersion === requestVersionRef.current) setLocation(resolved)
  }, [resolveAtCoordinates])//applyResolvedLocation

  //This function saves a manually entered address as home location or guest override
  const setManualLocation = useCallback(async (manual: ManualLocation) => {
    if (token) {
      await saveHomeLocation({ latitude: manual.latitude, longitude: manual.longitude })
      clearManualLocation()
      setManualGuestLocation(null)
      await applyResolvedLocation(manual.latitude, manual.longitude, 'saved')
      return
    }

    storeManualLocation(manual)
    setManualGuestLocation(manual)
    await applyResolvedLocation(manual.latitude, manual.longitude, 'manual')
  }, [applyResolvedLocation, saveHomeLocation, token])//setManualLocation

  //This function requests browser GPS and saves it as home or guest device location
  const useCurrentLocation = useCallback(async () => {
    const current = await requestBrowserLocation()
    resetGuestLocationCache()

    if (token) {
      await saveHomeLocation(current)
      clearManualLocation()
      setManualGuestLocation(null)
      await applyResolvedLocation(current.latitude, current.longitude, 'saved')
      return
    }

    clearManualLocation()
    setManualGuestLocation(null)
    await applyResolvedLocation(current.latitude, current.longitude, 'device')
  }, [applyResolvedLocation, saveHomeLocation, token])//useCurrentLocation

  useEffect(() => {
    if (isLoading || (token && !user)) return

    const isRealTransition = previousTokenRef.current !== undefined && previousTokenRef.current !== token
    if (isRealTransition) {
      resetGuestLocationCache()
      resolutionRef.current = null
      setLocation(null)
    }
    previousTokenRef.current = token

    let cancelled = false

    async function resolve(): Promise<ResolvedLocation> {
      if (token && user?.location) {
        return resolveAtCoordinates(user.location.latitude, user.location.longitude, 'saved', true)
      }

      if (!token && manualGuestLocation) {
        return resolveAtCoordinates(manualGuestLocation.latitude, manualGuestLocation.longitude, 'manual')
      }

      const guestLocation = await getCachedGuestWeatherLocation()
      if (token && guestLocation.source === 'device') {
        void saveHomeLocation({ latitude: guestLocation.latitude, longitude: guestLocation.longitude }).catch(() => {
          // Continue with the browser location if the background save fails.
        })
      }
      return resolveAtCoordinates(guestLocation.latitude, guestLocation.longitude, guestLocation.source)
    }//resolve

    if (!resolutionRef.current) resolutionRef.current = resolve()

    void resolutionRef.current.then((resolved) => {
      if (!cancelled) setLocation(resolved)
    })

    return () => { cancelled = true }
  }, [isLoading, manualGuestLocation, resolveAtCoordinates, saveHomeLocation, token, user])

  return (
    <LocationContext.Provider value={{ location, setManualLocation, useCurrentLocation }}>
      {children}
    </LocationContext.Provider>
  )
}//LocationProvider

//This function returns the resolved location; throws if used outside LocationProvider
export function useResolvedLocation() {
  const context = useContext(LocationContext)
  if (!context) throw new Error('useResolvedLocation must be used inside LocationProvider.')
  return context.location
}//useResolvedLocation

//This function returns location action handlers; throws if used outside LocationProvider
export function useLocationActions() {
  const context = useContext(LocationContext)
  if (!context) throw new Error('useLocationActions must be used inside LocationProvider.')
  return { setManualLocation: context.setManualLocation, useCurrentLocation: context.useCurrentLocation }
}//useLocationActions
