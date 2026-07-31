//Environment Canada / MSC GeoMET API client
//https://api.weather.gc.ca/
//AQHI observations and weather alerts (no API key).

//declaring MSC GeoMET collections API base URL
const BASE = 'https://api.weather.gc.ca/collections'

//declaring rough Metro Vancouver bounding box for spatial queries
const VANCOUVER_BBOX = '-123.27,49.20,-123.02,49.35'

//declaring normalized AQHI observation returned to UI components
export interface AQHIData {
  value: number
  station: string
}

//declaring normalized weather alert card data from MSC GeoMET
export interface AlertCardData {
  title: string
  summary: string
  riskColour: string
}

//This function maps an AQHI value to an official health risk band label
export function getAQHIRisk(value: number): string {
  if (value <= 3) return 'Low Risk'
  if (value <= 6) return 'Moderate Risk'
  if (value <= 10) return 'High Risk'
  return 'Very High Risk'
}//getAQHIRisk

//This function fetches the latest AQHI observation within Metro Vancouver bbox
export async function getAQHI(): Promise<AQHIData | null> {
  const url = `${BASE}/aqhi-observations-realtime/items?bbox=${VANCOUVER_BBOX}&limit=1&f=json`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`AQHI fetch failed: ${res.status}`)

  const data = await res.json()
  const feature = data.features?.[0]
  if (!feature) return null

  return {
    value: feature.properties.aqhi,
    station: feature.properties.location_name_en,
  }
}//getAQHI

//This function truncates alert text to a single sentence for card display
function summarize(text: string): string {
  const firstSentence = text.split('\n')[0]
  return firstSentence.length > 120
    ? `${firstSentence.slice(0, 117)}...`
    : firstSentence
}//summarize

//This function fetches the most recent weather alert for Metro Vancouver
export async function getVancouverAlert(): Promise<AlertCardData | null> {
  const url = `${BASE}/weather-alerts/items?bbox=${VANCOUVER_BBOX}&f=json`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Alerts fetch failed: ${res.status}`)

  const data = await res.json()
  const alert = data.features?.[0]
  if (!alert) return null

  return {
    title: String(alert.properties.alert_short_name_en ?? 'Alert').toUpperCase(),
    summary: summarize(String(alert.properties.alert_text_en ?? '')),
    riskColour: String(alert.properties.risk_colour_en ?? ''),
  }
}//getVancouverAlert
