export type BorderLaneCategory =
  | 'Passenger'
  | 'NEXUS'
  | 'FAST'
  | 'Truck'
  | 'Other'

export interface BorderLaneWait {
  crossing: string
  category: BorderLaneCategory
  direction: string
  waitMinutes: number | null
  updatedAt: string | null
}

function isNullableNumber(value: unknown): value is number | null {
  return (
    value === null ||
    (typeof value === 'number' && Number.isFinite(value))
  )
}

function isNullableString(value: unknown): value is string | null {
  return value === null || typeof value === 'string'
}

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
}

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
}

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
}