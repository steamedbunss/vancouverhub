//declaring react context hooks, environment API, and alert evaluation
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { getActiveWildfires, getCurrentAqhi, getNearbyFireWeather } from '../lib/api/environment'
import { evaluateAlerts } from '../lib/alerts/evaluateAlerts'
import type { AlertItem, AlertPreferences, AlertThresholds } from '../types'
import type { ApiAqhi, ApiFireWeather, ApiWildfire } from '../types/backend'
import { useAuth } from './AuthContext'
import { useResolvedLocation } from './LocationContext'
import { useUserConfig } from './UserConfigContext'

//declaring alerts context value shape exposed to consuming components
interface AlertsContextValue {
  activeAlerts: AlertItem[]
  loading: boolean
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
  const { token } = useAuth()
  const location = useResolvedLocation()
  const { config } = useUserConfig()
  const [wildfires, setWildfires] = useState<ApiWildfire[]>([])
  const [aqhi, setAqhi] = useState<ApiAqhi | null>(null)
  const [fireWeather, setFireWeather] = useState<ApiFireWeather | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!location) {
      setWildfires([])
      setAqhi(null)
      setFireWeather(null)
      setLoading(false)
      return
    }

    let cancelled = false
    setLoading(true)

    const requests = token
      ? Promise.all([
          getActiveWildfires().catch(() => [] as ApiWildfire[]),
          getCurrentAqhi(token).catch(() => null),
          getNearbyFireWeather(token).then((items) => items[0] ?? null).catch(() => null),
        ])
      : Promise.all([
          getActiveWildfires().catch(() => [] as ApiWildfire[]),
          Promise.resolve(null),
          Promise.resolve(null),
        ])

    void requests.then(([nextWildfires, nextAqhi, nextFireWeather]) => {
      if (cancelled) return
      setWildfires(nextWildfires)
      setAqhi(nextAqhi)
      setFireWeather(nextFireWeather)
      setLoading(false)
    })

    return () => {
      cancelled = true
    }
  }, [location?.lat, location?.lon, token])

  const activeAlerts = useMemo(
    () => {
      if (!location) return []

      return evaluateAlerts({
        preferences: token ? config.alertPreferences : GUEST_ALERT_PREFERENCES,
        thresholds: token ? config.alertThresholds : GUEST_ALERT_THRESHOLDS,
        weather: location.weather,
        aqhi,
        fireWeather,
        wildfires,
        latitude: location.lat,
        longitude: location.lon,
      })
    },
    [aqhi, config.alertPreferences, config.alertThresholds, fireWeather, location, token, wildfires],
  )

  const value = useMemo(() => ({ activeAlerts, loading }), [activeAlerts, loading])

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
