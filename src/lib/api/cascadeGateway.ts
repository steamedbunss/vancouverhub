//Cascade Gateway border-wait client for the Vancouver Hub traffic map
//The browser calls the same-origin /api/border-waits endpoint only.
//Netlify Function border-waits.ts holds the server-only CASCADE_GATEWAY_API_KEY.

//declaring border lane category labels returned by the Netlify Function
export type BorderLaneCategory =
  | 'Passenger'
  | 'NEXUS'
  | 'FAST'
  | 'Truck'
  | 'Other'

//declaring normalized border lane wait time for a single crossing lane
export interface BorderLaneWait {
  crossing: string
  category: BorderLaneCategory
  direction: string
  waitMinutes: number | null
  updatedAt: string | null
}

//This function checks whether a value is null or a finite number
function isNullableNumber(value: unknown): value is number | null {
  return (
    value === null ||
    (typeof value === 'number' && Number.isFinite(value))
  )
}//isNullableNumber

//This function checks whether a value is null or a string
function isNullableString(value: unknown): value is string | null {
  return value === null || typeof value === 'string'
}//isNullableString

//This function checks whether a value is a valid BorderLaneCategory
function isBorderLaneCategory(
  value: unknown,
): value is BorderLaneCategory {
  return (
    value === 'Passenger' ||
    value === 'NEXUS' ||
    value === 'FAST' ||
    value === 'Truck' ||
    value === 'Other'
  )
}//isBorderLaneCategory

//This function validates a single border-wait record from the API response
function isBorderLaneWait(value: unknown): value is BorderLaneWait {
  if (!value || typeof value !== 'object') {
    return false
  }

  const record = value as Record<string, unknown>

  return (
    typeof record.crossing === 'string' &&
    isBorderLaneCategory(record.category) &&
    typeof record.direction === 'string' &&
    isNullableNumber(record.waitMinutes) &&
    isNullableString(record.updatedAt)
  )
}//isBorderLaneWait

//This function fetches current border wait times from the Netlify Function proxy
export async function getCascadeGatewayBorderWaits(): Promise<
  BorderLaneWait[]
> {
  const response = await fetch('/api/border-waits', {
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
  })

  if (!response.ok) {
    throw new Error(
      `Border wait request failed with status ${response.status}.`,
    )
  }

  const data: unknown = await response.json()

  if (!Array.isArray(data) || !data.every(isBorderLaneWait)) {
    throw new Error('Border wait response was invalid.')
  }

  return data
}//getCascadeGatewayBorderWaits
