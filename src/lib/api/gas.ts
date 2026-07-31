//declaring backend gas station types and shared api client
import type { ApiFuelType, ApiGasStation } from '../../types/backend'
import { apiRequest } from './client'

//This function builds a query string for gas API endpoints with fuelType and limit params
function gasPath(path: '/api/gas/near' | '/api/gas/cheapest', fuelType: ApiFuelType, limit: number) {
  const search = new URLSearchParams({
    fuelType,
    limit: String(limit),
  })

  return `${path}?${search.toString()}`
}//gasPath

//This function fetches the cheapest nearby gas stations for a given fuel type
export function getCheapestGasStations(token: string | null, fuelType: ApiFuelType, limit = 3) {
  return apiRequest<ApiGasStation[]>(gasPath('/api/gas/cheapest', fuelType, limit), {}, token)
}//getCheapestGasStations
