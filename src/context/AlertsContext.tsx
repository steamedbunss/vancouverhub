//declaring react context hooks, environment API, and alert evaluation
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { getActiveWildfires, getCurrentAqhi, getNearbyFireWeather } from '../lib/api/environment'
import { evaluateAlerts } from '../lib/alerts/evaluateAlerts'
import { evaluateNewWildfireAlerts } from '../lib/alerts/evaluateNewWildfireAlerts'
import {
  establishBaseline,
  getSeenWildfiresScopeKey,
  loadSeenWildfires,
  markWildfiresSeen,
  silentBaselineExtend,
  type SeenWildfiresState,
} from '../lib/alerts/seenWildfiresStorage'
import type { AlertItem, AlertPreferences, AlertThresholds } from '../types'
import type { ApiAqhi, ApiFireWeather, ApiWildfire } from '../types/backend'
import { useAuth } from './AuthContext'
import { useResolvedLocation } from './LocationContext'
import { useUserConfig } from './UserConfigContext'

//declaring alerts context value shape exposed to consuming components
interface AlertsContextValue {
  activeAlerts: AlertItem[]
  loading: boolean
  dismissWildfireAlert: (fireNumbers: string[]) => void
}

//declaring wildfire request states so failed requests never establish a baseline
type WildfireFetchStatus = 'idle' | 'loading' | 'success' | 'error'

//declaring seen wildfire state together with the browser scope it belongs to
interface ScopedSeenWildfiresState extends SeenWildfiresState {
  scopeKey: string
}

//declaring alerts context instance
const AlertsContext = createContext<AlertsContextValue | null>(null)

//declaring default alert preferences for guest users
const GUEST_ALERT_PREFERENCES: AlertPreferences = {
  airQuality: false,
  wildfire: true,
  weatherAdvisories: true,
  fireDanger: false,
}

//declaring default alert thresholds for guest users
const GUEST_ALERT_THRESHOLDS: AlertThresholds = {
  temperatureC: 25,
  aqhi: 3,
  wildfireDistanceKm: 20,
  fireDangerRating: 4,
}

//This function provides evaluated environment alerts based on user location and preferences
export function AlertsProvider({ children }: { children: ReactNode }) {
  const { token, user, isLoading: authLoading } = useAuth()
  const location = useResolvedLocation()
  const { config } = useUserConfig()
  const [wildfires, setWildfires] = useState<ApiWildfire[]>([])
  const [wildfireFetchStatus, setWildfireFetchStatus] = useState<WildfireFetchStatus>('idle')
  const [aqhi, setAqhi] = useState<ApiAqhi | null>(null)
  const [fireWeather, setFireWeather] = useState<ApiFireWeather | null>(null)
  const [loading, setLoading] = useState(false)
  const [seenWildfires, setSeenWildfires] = useState<ScopedSeenWildfiresState | null>(null)
  const latitude = location?.lat
  const longitude = location?.lon

  //authScopeReady prevents an authenticated session from reading or writing guest history
  const authScopeReady = !authLoading && (!token || user != null)
  const scopeKey = authScopeReady
    ? getSeenWildfiresScopeKey(token ? user?.id : null)
    : null
  const preferences = token ? config.alertPreferences : GUEST_ALERT_PREFERENCES
  const thresholds = token ? config.alertThresholds : GUEST_ALERT_THRESHOLDS

  useEffect(() => {
    if (!scopeKey) {
      setSeenWildfires(null)
      return
    }

    setSeenWildfires({ scopeKey, ...loadSeenWildfires(scopeKey) })
  }, [scopeKey])

  useEffect(() => {
    if (latitude == null || longitude == null || !authScopeReady) {
      setWildfires([])
      setWildfireFetchStatus('idle')
      setAqhi(null)
      setFireWeather(null)
      setLoading(false)
      return
    }

    let cancelled = false
    setLoading(true)
    setWildfireFetchStatus('loading')

    const wildfireRequest = getActiveWildfires()
      .then((items) => ({ status: 'success' as const, items }))
      .catch(() => ({ status: 'error' as const, items: [] as ApiWildfire[] }))
    const aqhiRequest = token ? getCurrentAqhi(token).catch(() => null) : Promise.resolve(null)
    const fireWeatherRequest = token
      ? getNearbyFireWeather(token).then((items) => items[0] ?? null).catch(() => null)
      : Promise.resolve(null)

    void Promise.all([wildfireRequest, aqhiRequest, fireWeatherRequest])
      .then(([wildfireResult, nextAqhi, nextFireWeather]) => {
        if (cancelled) return

        setWildfires(wildfireResult.items)
        setWildfireFetchStatus(wildfireResult.status)
        setAqhi(nextAqhi)
        setFireWeather(nextFireWeather)
        setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [authScopeReady, latitude, longitude, token])

  useEffect(() => {
    if (
      wildfireFetchStatus !== 'success' ||
      !scopeKey ||
      seenWildfires?.scopeKey !== scopeKey
    ) return

    const activeFireNumbers = wildfires.map((fire) => fire.fireNumber)
    if (!seenWildfires.baselineEstablished) {
      const baseline = establishBaseline(scopeKey, activeFireNumbers)
      setSeenWildfires({ scopeKey, ...baseline })
      return
    }

    if (!preferences.wildfire) {
      const extended = silentBaselineExtend(scopeKey, seenWildfires, activeFireNumbers)
      if (extended !== seenWildfires) setSeenWildfires({ scopeKey, ...extended })
    }
  }, [preferences.wildfire, scopeKey, seenWildfires, wildfireFetchStatus, wildfires])

  //This function persists all fires in one dismissed block and updates the panel immediately
  const dismissWildfireAlert = useCallback((fireNumbers: string[]) => {
    if (!scopeKey || seenWildfires?.scopeKey !== scopeKey) return
    const updated = markWildfiresSeen(scopeKey, seenWildfires, fireNumbers)
    setSeenWildfires({ scopeKey, ...updated })
  }, [scopeKey, seenWildfires])//dismissWildfireAlert

  const activeAlerts = useMemo(() => {
    if (!location) return []

    const thresholdAlerts = evaluateAlerts({
      preferences,
      thresholds,
      weather: location.weather,
      aqhi,
      fireWeather,
    })

    if (
      !preferences.wildfire ||
      wildfireFetchStatus !== 'success' ||
      !scopeKey ||
      seenWildfires?.scopeKey !== scopeKey ||
      !seenWildfires.baselineEstablished
    ) return thresholdAlerts

    const wildfireAlerts = evaluateNewWildfireAlerts({
      wildfires,
      latitude: location.lat,
      longitude: location.lon,
      radiusKm: thresholds.wildfireDistanceKm,
      seenFireNumbers: new Set(seenWildfires.seenFireNumbers),
    })

    return [...thresholdAlerts, ...wildfireAlerts]
  }, [
    aqhi,
    fireWeather,
    location,
    preferences,
    scopeKey,
    seenWildfires,
    thresholds,
    wildfireFetchStatus,
    wildfires,
  ])

  const value = useMemo(
    () => ({ activeAlerts, loading, dismissWildfireAlert }),
    [activeAlerts, dismissWildfireAlert, loading],
  )

  return <AlertsContext.Provider value={value}>{children}</AlertsContext.Provider>
}//AlertsProvider

//This function returns alerts context; throws if used outside AlertsProvider
export function useAlerts() {
  const context = useContext(AlertsContext)
  if (!context) {
    throw new Error('useAlerts must be used within AlertsProvider')
  }
  return context
}//useAlerts
