//BC Wildfire Service ArcGIS public FeatureServer client
//Active fire points across British Columbia.

//declaring ArcGIS GeoJSON query URL for active BC wildfires
const URL =
  'https://services6.arcgis.com/ubm4tcTYICKBpist/arcgis/rest/services/BCWS_ActiveFires_PublicView/FeatureServer/0/query?f=geojson&where=1=1&outFields=*'

//declaring default search centre coordinates: downtown Vancouver
export const VANCOUVER_LAT = 49.2827
export const VANCOUVER_LON = -123.1207

//declaring default dashboard radius for nearby fires in kilometres
export const DEFAULT_WILDFIRE_RADIUS_KM = 100

//declaring normalized wildfire data returned to UI components
export interface WildfireData {
  id: string
  stage: string
  sizeHa: number | null
  lat: number
  lon: number
}

//declaring raw GeoJSON feature shape from ArcGIS response
interface GeoJsonFeature {
  geometry?: {
    type: string
    coordinates?: number[]
  }
  properties?: {
    FIRE_NUMBER?: string
    FIRE_STATUS?: string
    CURRENT_SIZE?: number | null
  }
}

//This function calculates haversine distance in km between two lat/lon points
function haversineKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2
  return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}//haversineKm

//This function fetches all active BC wildfires from the ArcGIS FeatureServer
export async function getActiveWildfires(): Promise<WildfireData[]> {
  const res = await fetch(URL)
  if (!res.ok) throw new Error(`Wildfire fetch failed: ${res.status}`)

  const data = (await res.json()) as { features?: GeoJsonFeature[] }

  return (data.features ?? [])
    .map((f) => {
      const coords = f.geometry?.coordinates
      if (!coords || coords.length < 2) return null
      const [lon, lat] = coords
      return {
        id: String(f.properties?.FIRE_NUMBER ?? ''),
        stage: String(f.properties?.FIRE_STATUS ?? 'Unknown'),
        sizeHa: f.properties?.CURRENT_SIZE ?? null,
        lat,
        lon,
      }
    })
    .filter((fire): fire is WildfireData => Boolean(fire?.id))
}//getActiveWildfires

//This function checks whether a fire stage is still active, eg. excludes "Out"
export function isActiveFireStage(stage: string): boolean {
  return !/^out$/i.test(stage.trim())
}//isActiveFireStage

//This function counts active fires within a radius of a given coordinate
export function countWildfiresWithinRadius(
  fires: WildfireData[],
  lat: number,
  lon: number,
  radiusKm: number,
): number {
  return fires.filter((fire) => {
    if (!isActiveFireStage(fire.stage)) return false
    return haversineKm(lat, lon, fire.lat, fire.lon) <= radiusKm
  }).length
}//countWildfiresWithinRadius

//This function fetches wildfires and returns count within radius of Vancouver
export async function getNearbyWildfireCount(
  lat = VANCOUVER_LAT,
  lon = VANCOUVER_LON,
  radiusKm = DEFAULT_WILDFIRE_RADIUS_KM,
): Promise<number> {
  const fires = await getActiveWildfires()
  return countWildfiresWithinRadius(fires, lat, lon, radiusKm)
}//getNearbyWildfireCount
