//declaring backend environment types, api client, and guest location helper
import type { ApiAqhi, ApiFireWeather, ApiWeather, ApiWildfire } from '../../types/backend'
import { apiRequest } from './client'
import { getCachedGuestWeatherLocation } from '../location/browserLocation'

//This function returns current weather for signed-in users or guests at browser coordinates
export async function getWeatherForSession(token: string | null) {
  if (token) {
    return apiRequest<ApiWeather>('/api/weather/current', {}, token)
  }

  const location = await getCachedGuestWeatherLocation()
  return getWeatherAtCoordinates(location.latitude, location.longitude)
}//getWeatherForSession

//This function fetches weather at explicit latitude and longitude query params
export function getWeatherAtCoordinates(latitude: number, longitude: number) {
  const search = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
  })

  return apiRequest<ApiWeather>(`/api/weather/current?${search}`, {}, null)
}//getWeatherAtCoordinates

//This function fetches the current AQHI reading for the signed-in user's region
export function getCurrentAqhi(token: string) {
  return apiRequest<ApiAqhi>('/api/aqhi/current', {}, token)
}//getCurrentAqhi

//This function fetches all active wildfires across BC (no auth required)
export function getActiveWildfires() {
  return apiRequest<ApiWildfire[]>('/api/wildfires/active', {}, null)
}//getActiveWildfires

//This function fetches wildfires near the signed-in user's home location
export function getNearbyWildfires(token: string, limit = 5) {
  return apiRequest<ApiWildfire[]>(`/api/wildfires/active/near?limit=${limit}`, {}, token)
}//getNearbyWildfires

//This function fetches fire weather station data near the user within a radius
export function getNearbyFireWeather(token: string, radiusKm = 50, limit = 1) {
  return apiRequest<ApiFireWeather[]>(
    `/api/wildfires/fire-weather/near?radiusKm=${radiusKm}&limit=${limit}`,
    {},
    token,
  )
}//getNearbyFireWeather
