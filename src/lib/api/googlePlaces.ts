//declaring Google Places API key and nearby search endpoint
const API_KEY = import.meta.env.VITE_GOOGLE_PLACES_API_KEY
const URL = 'https://places.googleapis.com/v1/places:searchNearby'

//declaring supported fuel grade types for Google Places fuel price lookup
export type FuelType = 'regular' | 'medium' | 'premium' | 'diesel'

//declaring raw Google Place shape from searchNearby response
interface GooglePlace {
  id: string
  displayName: { text: string }
  formattedAddress: string
  location: { latitude: number; longitude: number }
  fuelOptions?: {
    fuelPrices: { type: string; price: { units: string; nanos: number } }[]
  }
}

//declaring searchNearby API response wrapper
interface SearchNearbyResponse {
  places?: GooglePlace[]
}

//declaring normalized gas station data returned to UI components
export interface GasStationData {
  id: string
  name: string
  address: string
  distanceKm: number
  prices: Record<FuelType, number | null>
}

//This function calculates haversine distance in km between two coordinates
function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}//haversineKm

//This function converts Google Places price units and nanos to a decimal dollar amount
function parseFuelPrice(price: { units: string; nanos: number }): number {
  return Number(price.units) + price.nanos / 1e9
}//parseFuelPrice

//declaring Google Places fuel type string variants mapped to our FuelType keys
const FUEL_TYPE_VARIANTS: Record<FuelType, string[]> = {
  regular: ['REGULAR_UNLEADED'],
  medium: ['MIDGRADE'],
  premium: ['PREMIUM'],
  diesel: ['DIESEL'],
}

//This function extracts a fuel price for a given grade from a Google Place record
function getFuelPrice(place: GooglePlace, fuelType: FuelType): number | null {
  const variants = FUEL_TYPE_VARIANTS[fuelType]

  const entry = place.fuelOptions?.fuelPrices.find((fuel) =>
    variants.includes(fuel.type),
  )

  if (!entry) return null
  return parseFuelPrice(entry.price)
}//getFuelPrice

//This function fetches nearest gas stations with fuel prices via Google Places searchNearby
export async function getNearestGasStations(
  latitude: number,
  longitude: number,
  limit = 3,
): Promise<GasStationData[]> {
  if (!API_KEY) {
    throw new Error('Google Places API key is missing')
  }

  const res = await fetch(URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': API_KEY,
      'X-Goog-FieldMask':
        'places.id,places.displayName,places.formattedAddress,places.location,places.fuelOptions',
    },
    body: JSON.stringify({
      includedTypes: ['gas_station'],
      maxResultCount: 10, // overfetch, since some results won't have real fuel data
      rankPreference: 'DISTANCE',
      locationRestriction: {
        circle: {
          center: { latitude, longitude },
          radius: 5000.0,
        },
      },
    }),
  })

  if (!res.ok) {
    throw new Error(`Places fetch failed: ${res.status}`)
  }

  const data: SearchNearbyResponse = await res.json()

  return (data.places ?? [])
    .filter((place) => place.fuelOptions?.fuelPrices?.length) // drop places with no real fuel data
    .slice(0, limit)
    .map((place) => ({
      id: place.id,
      name: place.displayName.text,
      address: place.formattedAddress,
      distanceKm: haversineKm(
        latitude,
        longitude,
        place.location.latitude,
        place.location.longitude,
      ),
      prices: {
        regular: getFuelPrice(place, 'regular'),
        medium: getFuelPrice(place, 'medium'),
        premium: getFuelPrice(place, 'premium'),
        diesel: getFuelPrice(place, 'diesel'),
      },
    }))
}//getNearestGasStations
