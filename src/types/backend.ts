//declaring backend user home location with coordinates and postal prefix
export interface ApiUserLocation {
  id: number
  latitude: number
  longitude: number
  postalCodePrefix: string | null
}

//declaring supported fuel grade types from the backend API
export type ApiFuelType = 'REGULAR' | 'MIDGRADE' | 'PREMIUM'

//declaring authenticated user profile returned by /api/users/me
export interface ApiUser {
  id: number
  username: string
  email: string
  location: ApiUserLocation | null
  preferredFuelType: ApiFuelType
}

//declaring login request credentials
export interface LoginCredentials {
  username: string
  password: string
}

//declaring registration credentials extending login with email
export interface RegisterCredentials extends LoginCredentials {
  email: string
}

//declaring JWT token response from auth endpoints
export interface TokenResponse {
  token: string
}

//declaring message-only response from register and recovery endpoints
export interface MessageResponse {
  message: string
}

//declaring home location input for saving user coordinates
export interface HomeLocationInput {
  latitude: number
  longitude: number
  postalCodePrefix?: string
}

//declaring gas station with price and distance from backend
export interface ApiGasStation {
  id: number
  name: string
  address: string
  postalCodePrefix: string | null
  latitude: number
  longitude: number
  distanceKm: number
  fuelType: ApiFuelType
  price: number
  observedAt: string
}

//declaring local event from backend events API
export interface ApiEvent {
  id: number
  title: string
  description: string | null
  dateStart: string
  dateEnd: string | null
  externalUrl: string | null
  imageUrl: string | null
  provider: string | null
}

//declaring current weather snapshot from backend weather API
export interface ApiWeather {
  latitude: number
  longitude: number
  neighbourhood: string | null
  summary: string
  icon: string
  iconNumber: number | null
  temperature: number
  feelsLike: number | null
  humidity: number | null
  pressure: number | null
  uvIndex: number | null
  windSpeed: number | null
  windAngle: number | null
  windDirection: string | null
  precipitation: number | null
  precipitationType: string | null
  cloudCoverPercent: number | null
  units: string
  fetchedAt: string
}

//declaring air quality health index reading from backend AQHI API
export interface ApiAqhi {
  regionId: string
  regionName: string
  neighbourhood: string | null
  value: number
  riskLevel: string
  riskLabel: string
  healthMessage: string
  observedAt: string
}

//declaring active wildfire incident from backend wildfires API
export interface ApiWildfire {
  id: number
  fireNumber: string
  incidentName: string | null
  geographicDescription: string | null
  neighbourhood: string | null
  latitude: number
  longitude: number
  distanceKm: number | null
  sizeHectares: number | null
  status: string
  cause: string | null
  responseType: string | null
  fireType: string | null
  ignitionDate: string | null
  fireOfNote: boolean
  fireUrl: string | null
  lastSyncedAt: string
}

//declaring fire weather station data from backend fire-weather API
export interface ApiFireWeather {
  stationCode: string
  stationName: string
  fireCentre: string
  latitude: number
  longitude: number
  distanceKm: number
  dangerRating: number | null
  dangerClass: string
  dangerLabel: string
  temperature: number | null
  relativeHumidity: number | null
  windSpeedKmh: number | null
  windDirection: number | null
  precipitationMm: number | null
  fineFuelMoistureCode: number | null
  duffMoistureCode: number | null
  droughtCode: number | null
  initialSpreadIndex: number | null
  buildUpIndex: number | null
  fireWeatherIndex: number | null
  observedAt: string
}

//declaring all valid 311 service request category enum values
export const SERVICE_REQUEST_CATEGORIES = [
  'ROAD',
  'GARBAGE',
  'WATER',
  'GRAFFITI',
  'NOISE',
  'SAFETY',
] as const

//declaring 311 category union type derived from SERVICE_REQUEST_CATEGORIES
export type ApiServiceRequestCategory =
  (typeof SERVICE_REQUEST_CATEGORIES)[number]
//declaring importance level for 311 requests
export type ApiServiceRequestImportance = 'IMPORTANT' | 'LOW'

//declaring a single 311 service request from the backend API
export interface ApiServiceRequest {
  id: number
  requestType: string
  category: ApiServiceRequestCategory
  importance: ApiServiceRequestImportance
  status: string
  address: string
  neighbourhood: string | null
  localArea: string | null
  latitude: number
  longitude: number
  distanceKm: number | null
  openedAt: string
  seen: boolean
}

//declaring user 311 category filter preferences from backend
export interface ApiServiceRequestPreferences {
  categories: ApiServiceRequestCategory[]
}
