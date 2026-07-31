//declaring backend user types and shared api client
import type { ApiFuelType, ApiUser, HomeLocationInput } from '../../types/backend'
import { apiRequest } from './client'

//This function saves the user's home location coordinates to the backend
export function setHomeLocation(location: HomeLocationInput, token: string) {
  return apiRequest<ApiUser>('/api/users/me/location', {
    method: 'PUT',
    body: JSON.stringify(location),
  }, token)
}//setHomeLocation

//This function saves the user's preferred fuel type, eg. REGULAR or PREMIUM
export function setFuelPreference(fuelType: ApiFuelType, token: string) {
  return apiRequest<ApiUser>('/api/users/me/fuel-preference', {
    method: 'PUT',
    body: JSON.stringify({ fuelType }),
  }, token)
}//setFuelPreference
