//declaring backend event type and shared api client
import type { ApiEvent } from '../../types/backend'
import { apiRequest } from './client'

//This function fetches upcoming events, optionally authenticated
export function getUpcomingEvents(token: string | null = null) {
  return apiRequest<ApiEvent[]>('/api/events/upcoming', {}, token)
}//getUpcomingEvents

//This function fetches past events, optionally authenticated
export function getPastEvents(token: string | null = null) {
  return apiRequest<ApiEvent[]>('/api/events/past', {}, token)
}//getPastEvents

//This function fetches upcoming events near the signed-in user's home location
export function getUpcomingEventsNearUser(token: string) {
  return apiRequest<ApiEvent[]>('/api/events/upcoming/near', {}, token)
}//getUpcomingEventsNearUser
