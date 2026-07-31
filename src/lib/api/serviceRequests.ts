//declaring shared api client and backend service request types
import { apiRequest } from './client'
import type {
  ApiServiceRequest,
  ApiServiceRequestImportance,
  ApiServiceRequestPreferences,
  ApiServiceRequestCategory,
} from '../../types/backend'

//This function fetches important 311 service requests near the signed-in user
export function getImportantNearbyServiceRequests(token: string) {
  return apiRequest<ApiServiceRequest[]>(
    '/api/service-requests/important/near',
    {},
    token,
  )
}//getImportantNearbyServiceRequests

//This function fetches nearby 311 requests with optional importance filter and limit
export function getNearbyServiceRequests(
  token: string,
  options: { importance?: ApiServiceRequestImportance; limit?: number } = {},
) {
  const search = new URLSearchParams()
  if (options.importance) search.set('importance', options.importance)
  if (options.limit) search.set('limit', String(Math.min(Math.max(options.limit, 1), 100)))
  const query = search.toString()
  return apiRequest<ApiServiceRequest[]>(
    `/api/service-requests/near${query ? `?${query}` : ''}`,
    {},
    token,
  )
}//getNearbyServiceRequests

//This function marks a service request as seen by the user
export function markServiceRequestSeen(id: number, token: string) {
  return apiRequest<void>(
    `/api/service-requests/${id}/seen`,
    { method: 'POST' },
    token,
  )
}//markServiceRequestSeen

//This function loads the user's saved 311 category filter preferences
export function getServiceRequestPreferences(token: string) {
  return apiRequest<ApiServiceRequestPreferences>(
    '/api/users/me/service-request-preferences',
    {},
    token,
  )
}//getServiceRequestPreferences

//This function saves the user's 311 category filter preferences
export function saveServiceRequestPreferences(
  categories: ApiServiceRequestCategory[],
  token: string,
) {
  return apiRequest<ApiServiceRequestPreferences>(
    '/api/users/me/service-request-preferences',
    { method: 'PUT', body: JSON.stringify({ categories }) },
    token,
  )
}//saveServiceRequestPreferences
