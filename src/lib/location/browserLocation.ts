//declaring browser geolocation coordinates
export interface BrowserLocation {
  latitude: number
  longitude: number
}

//declaring guest location with source tracking (device or fallback)
export interface GuestLocation extends BrowserLocation {
  source: 'device' | 'fallback'
}

//declaring Vancouver fallback coordinates when geolocation is denied or unavailable
export const VANCOUVER_FALLBACK_LOCATION: BrowserLocation = {
  latitude: 49.251265724210164,
  longitude: -123.10342656521827,
}

//declaring geolocation request timeout in milliseconds
const LOCATION_TIMEOUT_MS = 7000

//This function requests the browser's current GPS coordinates via the Geolocation API
export function requestBrowserLocation(): Promise<BrowserLocation> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by this browser.'))
      return
    }

    navigator.geolocation.getCurrentPosition(
      ({ coords }) => resolve({ latitude: coords.latitude, longitude: coords.longitude }),
      reject,
      { enableHighAccuracy: false, timeout: LOCATION_TIMEOUT_MS, maximumAge: 300000 },
    )
  })
}//requestBrowserLocation

//This function uses browser location when allowed, otherwise falls back to Vancouver
export async function getGuestWeatherLocation(): Promise<BrowserLocation> {
  try {
    return await requestBrowserLocation()
  } catch {
    return VANCOUVER_FALLBACK_LOCATION
  }
}//getGuestWeatherLocation

//declaring module-level cache for guest location to avoid duplicate prompts
let cachedGuestLocation: GuestLocation | null = null
let inFlightGuestRequest: Promise<GuestLocation> | null = null

//This function shares one browser location prompt between concurrent guest consumers
export async function getCachedGuestWeatherLocation(): Promise<GuestLocation> {
  if (cachedGuestLocation) return cachedGuestLocation

  if (!inFlightGuestRequest) {
    inFlightGuestRequest = (async () => {
      try {
        const location = await requestBrowserLocation()
        return { ...location, source: 'device' as const }
      } catch {
        return { ...VANCOUVER_FALLBACK_LOCATION, source: 'fallback' as const }
      }
    })()
  }

  try {
    const location = await inFlightGuestRequest
    cachedGuestLocation = location
    return location
  } finally {
    inFlightGuestRequest = null
  }
}//getCachedGuestWeatherLocation

//This function clears the guest location cache after a real authentication transition
export function resetGuestLocationCache() {
  cachedGuestLocation = null
  inFlightGuestRequest = null
}//resetGuestLocationCache
