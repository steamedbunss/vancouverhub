//declaring alert and backend wildfire types with distance helper
import type { AlertItem } from '../../types'
import type { ApiWildfire } from '../../types/backend'
import { distanceBetweenKm } from '../location/distance'

//declaring evaluated wildfire details used to build aggregated alerts
interface EvaluatedWildfire {
  fireNumber: string
  status: string
  ignitionTime: number | null
  distanceKm: number
}

//declaring input shape for unseen nearby wildfire evaluation
interface EvaluateNewWildfireAlertsInput {
  wildfires: ApiWildfire[]
  latitude: number
  longitude: number
  radiusKm: number
  seenFireNumbers: Set<string>
  now?: Date
}

//declaring five-minute clock skew allowed for slightly future ignition timestamps
const FUTURE_CLOCK_SKEW_MS = 5 * 60 * 1000
//declaring twenty-four-hour boundary for new wildfire reports
const NEW_WILDFIRE_WINDOW_MS = 24 * 60 * 60 * 1000

//This function checks whether any evaluated fire is currently out of control
function hasOutOfControlFire(fires: EvaluatedWildfire[]) {
  return fires.some((fire) => fire.status.toLowerCase().includes('out of control'))
}//hasOutOfControlFire

//This function formats one wildfire report date for missed-alert copy
function formatReportedDate(ignitionTime: number | null) {
  if (ignitionTime == null) return 'date unknown'
  return new Intl.DateTimeFormat('en-CA', { month: 'short', day: 'numeric' }).format(ignitionTime)
}//formatReportedDate

//This function returns the latest valid ignition timestamp or the evaluation time
function latestIssuedAt(fires: EvaluatedWildfire[], now: Date) {
  const latestIgnitionTime = fires.reduce<number | null>(
    (latest, fire) => fire.ignitionTime != null && (latest == null || fire.ignitionTime > latest)
      ? fire.ignitionTime
      : latest,
    null,
  )
  return new Date(latestIgnitionTime ?? now.getTime()).toISOString()
}//latestIssuedAt

//This function builds the aggregated alert for new nearby wildfire reports
function buildNewWildfiresAlert(fires: EvaluatedWildfire[], now: Date): AlertItem {
  const count = fires.length
  return {
    id: 'wildfire-new',
    type: 'wildfire',
    severity: hasOutOfControlFire(fires) ? 'critical' : 'warning',
    title: count === 1 ? '1 new wildfire nearby' : `${count} new wildfires nearby`,
    message: fires
      .map((fire) => `${fire.fireNumber} \u00b7 ${fire.distanceKm.toFixed(1)} km away \u00b7 ${fire.status}`)
      .join('\n'),
    issuedAt: latestIssuedAt(fires, now),
    wildfireFireNumbers: fires.map((fire) => fire.fireNumber),
    dismissible: true,
    wildfireAlertKind: 'new',
  }
}//buildNewWildfiresAlert

//This function builds the aggregated alert for older or undated wildfire reports
function buildMissedWildfiresAlert(fires: EvaluatedWildfire[], now: Date): AlertItem {
  const count = fires.length
  return {
    id: 'wildfire-missed',
    type: 'wildfire',
    severity: hasOutOfControlFire(fires) ? 'warning' : 'info',
    title: count === 1
      ? '1 wildfire you may have missed'
      : `${count} wildfires you may have missed`,
    message: fires
      .map((fire) => `${fire.fireNumber} \u00b7 reported ${formatReportedDate(fire.ignitionTime)} \u00b7 ${fire.distanceKm.toFixed(1)} km away \u00b7 ${fire.status}`)
      .join('\n'),
    issuedAt: latestIssuedAt(fires, now),
    wildfireFireNumbers: fires.map((fire) => fire.fireNumber),
    dismissible: true,
    wildfireAlertKind: 'missed',
  }
}//buildMissedWildfiresAlert

//This function evaluates unseen in-range fires and returns up to two persistent alert blocks
export function evaluateNewWildfireAlerts({
  wildfires,
  latitude,
  longitude,
  radiusKm,
  seenFireNumbers,
  now = new Date(),
}: EvaluateNewWildfireAlertsInput): AlertItem[] {
  const newFires: EvaluatedWildfire[] = []
  const missedFires: EvaluatedWildfire[] = []

  wildfires.forEach((fire) => {
    const fireNumber = fire.fireNumber.trim()
    if (!fireNumber || seenFireNumbers.has(fireNumber)) return
    if (!Number.isFinite(fire.latitude) || !Number.isFinite(fire.longitude)) return

    const distanceKm = distanceBetweenKm(latitude, longitude, fire.latitude, fire.longitude)
    if (distanceKm > radiusKm) return

    const parsedIgnitionTime = fire.ignitionDate == null ? Number.NaN : Date.parse(fire.ignitionDate)
    const ignitionTime = Number.isFinite(parsedIgnitionTime) ? parsedIgnitionTime : null
    const ageMs = ignitionTime == null ? null : now.getTime() - ignitionTime
    const evaluatedFire = {
      fireNumber,
      status: fire.status,
      ignitionTime,
      distanceKm,
    }

    if (ageMs != null && ageMs >= -FUTURE_CLOCK_SKEW_MS && ageMs <= NEW_WILDFIRE_WINDOW_MS) {
      newFires.push(evaluatedFire)
    } else {
      missedFires.push(evaluatedFire)
    }
  })

  newFires.sort((first, second) => first.distanceKm - second.distanceKm)
  missedFires.sort((first, second) => first.distanceKm - second.distanceKm)

  const alerts: AlertItem[] = []
  if (newFires.length > 0) alerts.push(buildNewWildfiresAlert(newFires, now))
  if (missedFires.length > 0) alerts.push(buildMissedWildfiresAlert(missedFires, now))
  return alerts
}//evaluateNewWildfireAlerts
