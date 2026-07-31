//declaring Google Places API key from environment
const API_KEY = import.meta.env.VITE_GOOGLE_PLACES_API_KEY

//declaring Vancouver municipal bounding box for location restriction
const VANCOUVER_BOUNDS = {
  low: { latitude: 49.198, longitude: -123.224 },
  high: { latitude: 49.316, longitude: -123.023 },
}

//declaring raw autocomplete response shape from Google Places API
interface AutocompleteResponse {
  suggestions?: Array<{
    placePrediction?: {
      placeId: string
      text?: { text?: string }
    }
  }>
}

//declaring raw place details response shape from Google Places API
interface PlaceDetailsResponse {
  formattedAddress?: string
  location?: {
    latitude?: number
    longitude?: number
  }
}

//declaring address suggestion returned to the location picker UI
export interface PlaceSuggestion {
  placeId: string
  label: string
}

//declaring resolved place with coordinates for saving user location
export interface SelectedPlace {
  label: string
  latitude: number
  longitude: number
}

//This function throws if the Google Places API key is not configured
function requireApiKey() {
  if (!API_KEY) throw new Error('Google Places API key is not configured.')
  return API_KEY
}//requireApiKey

//This function fetches address predictions within Vancouver bounds via Google Places autocomplete
export async function getAddressSuggestions(
  input: string,
  sessionToken: string,
  signal?: AbortSignal,
): Promise<PlaceSuggestion[]> {
  const response = await fetch('https://places.googleapis.com/v1/places:autocomplete', {
    method: 'POST',
    signal,
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': requireApiKey(),
    },
    body: JSON.stringify({
      input,
      includedRegionCodes: ['ca'],
      locationRestriction: { rectangle: VANCOUVER_BOUNDS },
      sessionToken,
    }),
  })

  if (!response.ok) throw new Error(`Address autocomplete failed: ${response.status}`)

  const data = await response.json() as AutocompleteResponse
  return (data.suggestions ?? []).flatMap((suggestion) => {
    const prediction = suggestion.placePrediction
    const label = prediction?.text?.text
    return prediction && label ? [{ placeId: prediction.placeId, label }] : []
  })
}//getAddressSuggestions

//This function resolves a selected placeId to formatted address and coordinates
export async function getPlaceLocation(
  placeId: string,
  sessionToken: string,
): Promise<SelectedPlace> {
  const search = new URLSearchParams({ sessionToken })
  const response = await fetch(
    `https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}?${search}`,
    {
      headers: {
        'X-Goog-Api-Key': requireApiKey(),
        'X-Goog-FieldMask': 'formattedAddress,location',
      },
    },
  )

  if (!response.ok) throw new Error(`Place details failed: ${response.status}`)

  const data = await response.json() as PlaceDetailsResponse
  const latitude = data.location?.latitude
  const longitude = data.location?.longitude
  if (
    !data.formattedAddress
    || typeof latitude !== 'number'
    || typeof longitude !== 'number'
    || !Number.isFinite(latitude)
    || !Number.isFinite(longitude)
  ) {
    throw new Error('The selected address did not include a location.')
  }

  return { label: data.formattedAddress, latitude, longitude }
}//getPlaceLocation
