//declaring alert types from shared types and backend environment types
import type { AlertItem, AlertPreferences, AlertThresholds } from '../../types'
import type { ApiAqhi, ApiFireWeather, ApiWeather, ApiWildfire } from '../../types/backend'
import { distanceBetweenKm } from '../location/distance'

//declaring input shape for alert evaluation with all environment data sources
interface EvaluateAlertsInput {
  preferences: AlertPreferences
  thresholds: AlertThresholds
  weather: ApiWeather | null
  aqhi: ApiAqhi | null
  fireWeather: ApiFireWeather | null
  wildfires: ApiWildfire[]
  latitude: number | null
  longitude: number | null
}

//This function maps threshold overrun amount to warning or critical severity
function severityForDifference(difference: number): AlertItem['severity'] {
  return difference >= 5 ? 'critical' : 'warning'
}//severityForDifference

//This function evaluates user alert preferences against live environment data
export function evaluateAlerts({
  preferences,
  thresholds,
  weather,
  aqhi,
  fireWeather,
  wildfires,
  latitude,
  longitude,
}: EvaluateAlertsInput): AlertItem[] {
  const alerts: AlertItem[] = []

  if (preferences.weatherAdvisories && weather && weather.temperature >= thresholds.temperatureC) {
    alerts.push({
      id: 'temperature-threshold',
      type: 'weather',
      severity: severityForDifference(weather.temperature - thresholds.temperatureC),
      title: 'Temperature threshold reached',
      message: `${weather.temperature.toFixed(1)}°C is at or above your ${thresholds.temperatureC}°C alert threshold.`,
      issuedAt: weather.fetchedAt,
    })
  }

  if (preferences.airQuality && aqhi && aqhi.value >= thresholds.aqhi) {
    alerts.push({
      id: 'aqhi-threshold',
      type: 'air-quality',
      severity: severityForDifference(aqhi.value - thresholds.aqhi),
      title: 'AQHI threshold reached',
      message: `AQHI ${aqhi.value.toFixed(1)} is at or above your ${thresholds.aqhi} alert threshold.`,
      issuedAt: aqhi.observedAt,
    })
  }

  if (
    preferences.fireDanger &&
    fireWeather?.dangerRating != null &&
    fireWeather.dangerRating >= thresholds.fireDangerRating
  ) {
    alerts.push({
      id: 'fire-danger-threshold',
      type: 'fire-weather',
      severity: severityForDifference(fireWeather.dangerRating - thresholds.fireDangerRating),
      title: 'Fire danger threshold reached',
      message: `${fireWeather.stationName}: danger rating ${fireWeather.dangerRating}/5 (${fireWeather.dangerLabel}) meets your ${thresholds.fireDangerRating}/5 threshold.`,
      issuedAt: fireWeather.observedAt,
    })
  }

  if (preferences.wildfire && latitude != null && longitude != null) {
    const nearest = wildfires
      .filter((fire) => fire.latitude != null && fire.longitude != null)
      .map((fire) => ({
        fire,
        distanceKm: distanceBetweenKm(latitude, longitude, fire.latitude!, fire.longitude!),
      }))
      .sort((a, b) => a.distanceKm - b.distanceKm)[0]

    if (nearest && nearest.distanceKm <= thresholds.wildfireDistanceKm) {
      const isOutOfControl = nearest.fire.status.toLowerCase().includes('out of control')
      alerts.push({
        id: `wildfire-${nearest.fire.id}`,
        type: 'wildfire',
        severity: isOutOfControl ? 'critical' : 'warning',
        title: 'Nearby wildfire threshold reached',
        message: `${nearest.fire.incidentName} is ${nearest.distanceKm.toFixed(1)} km away, within your ${thresholds.wildfireDistanceKm} km alert threshold.`,
        issuedAt: nearest.fire.lastSyncedAt,
      })
    }
  }

  return alerts
}//evaluateAlerts
