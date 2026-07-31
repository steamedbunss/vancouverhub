import type { Config } from '@netlify/functions'

type BorderLaneCategory =
  | 'Passenger'
  | 'NEXUS'
  | 'FAST'
  | 'Truck'
  | 'Other'

interface SupportedLane {
  id: number
  crossing: string
  category: BorderLaneCategory
  direction: string
}

interface BorderLaneWait {
  crossing: string
  category: BorderLaneCategory
  direction: string
  waitMinutes: number | null
  updatedAt: string | null
}

type RawRecord = Record<string, unknown>

const CASCADE_BASE_URL = 'https://www.cascadegatewaydata.com'
const UPSTREAM_TIMEOUT_MS = 5_000

const SUPPORTED_LANES: SupportedLane[] = [
  {
    id: 3,
    crossing: 'Pacific Highway',
    category: 'Passenger',
    direction: 'Southbound',
  },
  {
    id: 4,
    crossing: 'Peace Arch',
    category: 'Passenger',
    direction: 'Southbound',
  },
  {
    id: 5,
    crossing: 'Peace Arch',
    category: 'Passenger',
    direction: 'Northbound',
  },
  {
    id: 6,
    crossing: 'Peace Arch',
    category: 'NEXUS',
    direction: 'Northbound',
  },
  {
    id: 7,
    crossing: 'Pacific Highway',
    category: 'Other',
    direction: 'Southbound',
  },
  {
    id: 8,
    crossing: 'Pacific Highway',
    category: 'FAST',
    direction: 'Southbound',
  },
  {
    id: 9,
    crossing: 'Pacific Highway',
    category: 'NEXUS',
    direction: 'Southbound',
  },
  {
    id: 10,
    crossing: 'Pacific Highway',
    category: 'Truck',
    direction: 'Southbound',
  },
  {
    id: 11,
    crossing: 'Peace Arch',
    category: 'NEXUS',
    direction: 'Southbound',
  },
  {
    id: 12,
    crossing: 'Lynden/Aldergrove',
    category: 'Passenger',
    direction: 'Northbound',
  },
  {
    id: 13,
    crossing: 'Pacific Highway',
    category: 'Passenger',
    direction: 'Northbound',
  },
  {
    id: 14,
    crossing: 'Pacific Highway',
    category: 'NEXUS',
    direction: 'Northbound',
  },
  {
    id: 15,
    crossing: 'Sumas/Huntingdon',
    category: 'Passenger',
    direction: 'Northbound',
  },
  {
    id: 16,
    crossing: 'Pacific Highway',
    category: 'Truck',
    direction: 'Northbound',
  },
  {
    id: 17,
    crossing: 'Pacific Highway',
    category: 'FAST',
    direction: 'Northbound',
  },
  {
    id: 610,
    crossing: 'Sumas/Huntingdon',
    category: 'Passenger',
    direction: 'Southbound',
  },
  {
    id: 611,
    crossing: 'Lynden/Aldergrove',
    category: 'Passenger',
    direction: 'Southbound',
  },
  {
    id: 748,
    crossing: 'Pacific Highway',
    category: 'Other',
    direction: 'Northbound',
  },
  {
    id: 749,
    crossing: 'Lynden/Aldergrove',
    category: 'Truck',
    direction: 'Southbound',
  },
  {
    id: 753,
    crossing: 'Lynden/Aldergrove',
    category: 'Truck',
    direction: 'Northbound',
  },
  {
    id: 754,
    crossing: 'Sumas/Huntingdon',
    category: 'Truck',
    direction: 'Northbound',
  },
  {
    id: 756,
    crossing: 'Sumas/Huntingdon',
    category: 'NEXUS',
    direction: 'Northbound',
  },
  {
    id: 758,
    crossing: 'Lynden/Aldergrove',
    category: 'NEXUS',
    direction: 'Northbound',
  },
]

class UpstreamTimeoutError extends Error {
  constructor() {
    super('Cascade Gateway request timed out.')
    this.name = 'UpstreamTimeoutError'
  }
}

class UpstreamResponseError extends Error {
  constructor(public readonly status: number) {
    super(`Cascade Gateway returned status ${status}.`)
    this.name = 'UpstreamResponseError'
  }
}

function cascadeUrl(path: string, apiKey: string) {
  const separator = path.includes('?') ? '&' : '?'

  return (
    `${CASCADE_BASE_URL}${path}${separator}` +
    `format=json&key=${encodeURIComponent(apiKey)}`
  )
}

async function fetchCascadeJson<T>(
  path: string,
  apiKey: string,
): Promise<T> {
  const controller = new AbortController()

  const timeout = setTimeout(
    () => controller.abort(),
    UPSTREAM_TIMEOUT_MS,
  )

  try {
    const response = await fetch(cascadeUrl(path, apiKey), {
      method: 'GET',
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
      },
    })

    if (!response.ok) {
      throw new UpstreamResponseError(response.status)
    }

    return (await response.json()) as T
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new UpstreamTimeoutError()
    }

    throw error
  } finally {
    clearTimeout(timeout)
  }
}

function normalizedKey(value: string) {
  return value.toLowerCase().replace(/[^a-z]/g, '')
}

function firstValue(record: RawRecord, possibleKeys: string[]) {
  const normalizedPossibleKeys = possibleKeys.map(normalizedKey)

  const match = Object.entries(record).find(([key]) =>
    normalizedPossibleKeys.includes(normalizedKey(key)),
  )

  return match?.[1]
}

function finiteNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value
  }

  if (typeof value === 'string' && value.trim()) {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : null
  }

  return null
}

function latestNumber(value: unknown): number | null {
  const direct = finiteNumber(value)

  if (direct !== null) {
    return direct
  }

  if (!Array.isArray(value)) {
    return null
  }

  for (let index = value.length - 1; index >= 0; index -= 1) {
    const found = latestNumber(value[index])

    if (found !== null) {
      return found
    }
  }

  return null
}

function latestTime(value: unknown): string | null {
  const values = Array.isArray(value) ? value : [value]
  const latest = values.at(-1)

  if (typeof latest === 'number') {
    const milliseconds =
      latest < 1_000_000_000_000 ? latest * 1_000 : latest

    const date = new Date(milliseconds)

    return Number.isNaN(date.getTime())
      ? null
      : date.toISOString()
  }

  if (typeof latest === 'string' && latest.trim()) {
    return latest
  }

  return null
}

function parseCurrentDelay(raw: unknown) {
  const directNumber = finiteNumber(raw)

  if (directNumber !== null) {
    return {
      waitMinutes: directNumber,
      updatedAt: null,
    }
  }

  if (!raw || typeof raw !== 'object') {
    return {
      waitMinutes: null,
      updatedAt: null,
    }
  }

  const record = raw as RawRecord

  const directDelay = firstValue(record, [
    'delay',
    'currentdelay',
    'wait',
    'waittime',
    'value',
  ])

  const waitMinutes =
    finiteNumber(directDelay) ??
    latestNumber(record.Values ?? record.values)

  const directTime = firstValue(record, [
    'updated',
    'updatedat',
    'time',
    'datetime',
    'timestamp',
  ])

  const updatedAt =
    latestTime(directTime) ??
    latestTime(record.GroupStarts ?? record.groupstarts)

  return {
    waitMinutes,
    updatedAt,
  }
}

export default async function handler(request: Request) {
  if (request.method !== 'GET') {
    return Response.json(
      { error: 'Method not allowed.' },
      {
        status: 405,
        headers: {
          Allow: 'GET',
        },
      },
    )
  }

  const apiKey = process.env.CASCADE_GATEWAY_API_KEY

  if (!apiKey) {
    return Response.json(
      { error: 'Cascade Gateway is not configured.' },
      { status: 500 },
    )
  }

  const settledResults = await Promise.allSettled(
    SUPPORTED_LANES.map(async (lane): Promise<BorderLaneWait> => {
      const currentDelay = await fetchCascadeJson<unknown>(
        `/CrossingLane/CurrentDelay/${lane.id}`,
        apiKey,
      )

      return {
        crossing: lane.crossing,
        category: lane.category,
        direction: lane.direction,
        ...parseCurrentDelay(currentDelay),
      }
    }),
  )

  const waits = settledResults.flatMap((result) =>
    result.status === 'fulfilled' ? [result.value] : [],
  )

  const failures = settledResults.flatMap((result, index) =>
    result.status === 'rejected'
      ? [
          {
            lane: SUPPORTED_LANES[index],
            reason: result.reason,
          },
        ]
      : [],
  )

  failures.forEach(({ lane, reason }) => {
    console.error(
      `Cascade lane ${lane.id} failed:`,
      reason instanceof Error ? reason.message : reason,
    )
  })

  if (waits.length === 0) {
    const allTimedOut = failures.every(
      ({ reason }) => reason instanceof UpstreamTimeoutError,
    )

    return Response.json(
      {
        error: allTimedOut
          ? 'Cascade Gateway timed out.'
          : 'Cascade Gateway could not provide lane delays.',
      },
      { status: allTimedOut ? 504 : 502 },
    )
  }

  return Response.json(waits, {
    status: 200,
    headers: {
      'Netlify-CDN-Cache-Control':
        'public, max-age=60, stale-while-revalidate=120',
      'Cache-Control': 'public, max-age=30',
      'X-Partial-Data':
        failures.length > 0 ? 'true' : 'false',
    },
  })
}

export const config: Config = {
  method: 'GET',
}