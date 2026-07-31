//City of Vancouver Open Data Portal client
//https://opendata.vancouver.ca/
//Serves multiple hub sections from one provider:
//- Traffic cameras (web-cam-url-links)
//- Later: road closures, amenities, 311 service requests, etc.

//declaring Open Data base URL, using Vite proxy in dev to avoid CORS
const OPEN_DATA_BASE =
  import.meta.env.DEV
    ? '/proxy/opendata'
    : 'https://opendata.vancouver.ca'

//declaring normalized traffic camera location from Open Data records
export interface TrafficCameraLocation {
  id: string
  name: string
  pageUrl: string
  neighbourhood: string
  lat: number
  lon: number
}

//declaring raw webcam record shape from Open Data API
interface OpenDataWebcamRecord {
  mapid: string
  name: string
  url: string
  geo_local_area: string | null
  geo_point_2d: { lat: number; lon: number } | null
}

//declaring paginated Open Data records response wrapper
interface OpenDataRecordsResponse {
  total_count: number
  results: OpenDataWebcamRecord[]
}

//This function checks whether a camera page URL is a four-way intersection, eg. ends in 4.htm
export function isFourWayCameraPage(pageUrl: string): boolean {
  return /4\.htm$/i.test(pageUrl)
}//isFourWayCameraPage

//This function fetches all traffic camera locations from the Open Data web-cam-url-links dataset
export async function fetchTrafficCameraLocations(): Promise<
  TrafficCameraLocation[]
> {
  const endpoint = `${OPEN_DATA_BASE}/api/explore/v2.1/catalog/datasets/web-cam-url-links/records?limit=100`
  const response = await fetch(endpoint)

  if (!response.ok) {
    throw new Error(`Open Data webcams failed (${response.status})`)
  }

  const data = (await response.json()) as OpenDataRecordsResponse

  return data.results
    .filter((record) => Boolean(record.url && record.name))
    .map((record) => ({
      id: record.mapid,
      name: record.name,
      pageUrl: record.url,
      neighbourhood: record.geo_local_area ?? 'Vancouver',
      lat: record.geo_point_2d?.lat ?? 0,
      lon: record.geo_point_2d?.lon ?? 0,
    }))
}//fetchTrafficCameraLocations

//This function fetches only four-way intersection camera locations
export async function fetchFourWayTrafficCameraLocations(): Promise<
  TrafficCameraLocation[]
> {
  const all = await fetchTrafficCameraLocations()
  return all.filter((camera) => isFourWayCameraPage(camera.pageUrl))
}//fetchFourWayTrafficCameraLocations

//declaring normalized 311 service request from Open Data records
export interface ServiceRequest {
  id: string
  type: string
  status: string
  address: string
  localArea: string | null
  openTimestamp: string
  duration: string
}

//declaring raw 311 service request record from Open Data API
interface OpenDataServiceRequestRecord {
  service_request_type: string
  status: string
  local_area: string | null
  address: string
  service_request_open_timestamp: string
  service_request_close_date: string | null
}

//declaring paginated 311 service request response wrapper
interface OpenDataServiceRequestResponse {
  total_count: number
  results: OpenDataServiceRequestRecord[]
}

//This function computes human-readable open duration from timestamps and status
function getOpenDuration(
  openTimestamp: string,
  closeDate: string | null,
  status: string
): string {
  const start = new Date(openTimestamp)
  const end = status === 'Closed' && closeDate ? new Date(closeDate) : new Date()
  const days = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
  return status === 'Closed' ? 'Closed' : `${days}d open`
}//getOpenDuration

//This function fetches recent 311 service requests for a given local area
export async function fetchRecentServiceRequests(
  localArea: string,
  limit = 3
): Promise<ServiceRequest[]> {
  const endpoint =
    `${OPEN_DATA_BASE}/api/explore/v2.1/catalog/datasets/3-1-1-service-requests/records` +
    `?limit=${limit}` +
    `&order_by=service_request_open_timestamp%20desc` +
    `&where=local_area=%27${encodeURIComponent(localArea)}%27`

  const response = await fetch(endpoint)

  if (!response.ok) {
    throw new Error(`Open Data 311 requests failed (${response.status})`)
  }

  const data = (await response.json()) as OpenDataServiceRequestResponse

  return data.results
    .filter((record) => Boolean(record.service_request_type && record.status))
    .map((record) => ({
      id: `${record.address}-${record.service_request_open_timestamp}`,
      type: record.service_request_type,
      status: record.status,
      address: record.address,
      localArea: record.local_area ?? null,
      openTimestamp: record.service_request_open_timestamp,
      duration: getOpenDuration(
        record.service_request_open_timestamp,
        record.service_request_close_date,
        record.status
      ),
    }))
}//fetchRecentServiceRequests
