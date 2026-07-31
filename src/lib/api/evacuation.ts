//declaring evacuation notice status type from BC Wildfire Service
export type EvacuationStatus = 'Order' | 'Alert'

//declaring normalized fire evacuation notice for wildfire card badges
export interface EvacuationNotice {
  eventNumber: string
  eventName: string
  eventType: string
  status: EvacuationStatus
  issuingAgency: string
}

//declaring ArcGIS FeatureServer URL for BC evacuation orders and alerts
const URL =
  'https://services6.arcgis.com/ubm4tcTYICKBpist/arcgis/rest/services/Evacuation_Orders_and_Alerts/FeatureServer/0/query?f=json&where=1=1&outFields=*&returnGeometry=false'

//declaring localStorage cache key and 12-hour TTL for evacuation lookup
const CACHE_KEY = 'evacuation_lookup_cache_v2'
const CACHE_DURATION_MS = 12 * 60 * 60 * 1000 // 12 hours

//declaring raw ArcGIS feature attributes from evacuation API
interface RawFeature {
  attributes: {
    EVENT_NUMBER?: string | null
    EVENT_NAME?: string | null
    EVENT_TYPE?: string | null
    ORDER_ALERT_STATUS?: string | null
    ISSUING_AGENCY?: string | null
  }
}

//declaring localStorage cache payload shape
interface CachePayload {
  timestamp: number
  entries: [string, EvacuationNotice[]][]
}

//This function reads a valid evacuation lookup from localStorage cache
function readCache(): Map<string, EvacuationNotice[]> | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    if (!raw) return null
    const parsed: CachePayload = JSON.parse(raw)
    if (Date.now() - parsed.timestamp > CACHE_DURATION_MS) return null
    return new Map(parsed.entries)
  } catch {
    return null
  }
}//readCache

//This function writes the evacuation lookup to localStorage cache
function writeCache(lookup: Map<string, EvacuationNotice[]>) {
  try {
    const payload: CachePayload = {
      timestamp: Date.now(),
      entries: Array.from(lookup.entries()),
    }
    localStorage.setItem(CACHE_KEY, JSON.stringify(payload))
  } catch {
    // storage full or unavailable, not critical, just skip caching
  }
}//writeCache

//This function fetches fire evacuation orders and alerts keyed by event number
export async function getFireEvacuationLookup(): Promise<Map<string, EvacuationNotice[]>> {
  const cached = readCache()
  if (cached) return cached

  const lookup = new Map<string, EvacuationNotice[]>()
  try {
    const res = await fetch(URL)
    if (!res.ok) return lookup
    const data = (await res.json()) as { features?: RawFeature[] }
    ;(data.features ?? []).forEach((f) => {
      const a = f.attributes
      const status = a.ORDER_ALERT_STATUS
      const eventNumber = a.EVENT_NUMBER
      if (a.EVENT_TYPE !== 'Fire') return
      if (status !== 'Order' && status !== 'Alert') return
      if (!eventNumber) return

      const notice: EvacuationNotice = {
        eventNumber,
        eventName: a.EVENT_NAME ?? '',
        eventType: a.EVENT_TYPE,
        status,
        issuingAgency: a.ISSUING_AGENCY ?? 'Local Authority',
      }

      const existing = lookup.get(eventNumber) ?? []
      existing.push(notice)
      lookup.set(eventNumber, existing)
    })
    writeCache(lookup)
  } catch {
    // fail quiet: cards render without badges if this fetch fails
  }
  return lookup
}//getFireEvacuationLookup
