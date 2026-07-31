//declaring api base URL from env and session token storage key
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '')
const TOKEN_STORAGE_KEY = 'around-van-token'
const REQUEST_TIMEOUT_MS = 60000

//declaring custom error class for API failures with HTTP status
export class ApiError extends Error {
  public readonly status?: number

  constructor(
    message: string,
    status?: number,
  ) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}//ApiError

//This function reads the JWT token from sessionStorage
export function getStoredToken() {
  return sessionStorage.getItem(TOKEN_STORAGE_KEY)
}//getStoredToken

//This function persists the JWT token to sessionStorage after login
export function storeToken(token: string) {
  sessionStorage.setItem(TOKEN_STORAGE_KEY, token)
}//storeToken

//This function removes the JWT token from sessionStorage on logout
export function clearStoredToken() {
  sessionStorage.removeItem(TOKEN_STORAGE_KEY)
}//clearStoredToken

//This function returns a user-friendly message for common HTTP status codes
function fallbackErrorMessage(status: number) {
  if (status === 401) return 'Your session has expired. Please sign in again.'
  if (status === 403) return 'You do not have permission to perform that action.'
  if (status === 404) return 'That service endpoint was not found.'
  if (status >= 500) return 'The server is unavailable. Please try again shortly.'
  return 'The request could not be completed.'
}//fallbackErrorMessage

//This function extracts an error message string from a JSON error payload
function messageFromPayload(payload: unknown, fallback: string) {
  if (!payload || typeof payload !== 'object') return fallback
  const candidate = (payload as Record<string, unknown>).message
  return typeof candidate === 'string' && candidate.trim() ? candidate : fallback
}//messageFromPayload

//This function sends an authenticated fetch to the backend API with timeout handling
export async function apiRequest<T>(
  path: string,
  init: RequestInit = {},
  token = getStoredToken(),
): Promise<T> {
  if (!API_BASE_URL) {
    throw new ApiError('VITE_API_BASE_URL is not configured.')
  }

  const headers = new Headers(init.headers)
  headers.set('Accept', 'application/json')
  if (init.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }
  if (token) headers.set('Authorization', `Bearer ${token}`)

  let response: Response
  const controller = new AbortController()
  const timeoutId = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)
  try {
    response = await fetch(`${API_BASE_URL}${path}`, { ...init, headers, signal: controller.signal })
  } catch {
    if (controller.signal.aborted) {
      throw new ApiError('The server took too long to respond. Please try again.')
    }
    throw new ApiError('Could not reach the server. It may be waking up or temporarily unavailable.')
  } finally {
    window.clearTimeout(timeoutId)
  }

  const isJson = response.headers.get('content-type')?.includes('application/json')
  const payload: unknown = isJson ? await response.json().catch(() => null) : null

  if (!response.ok) {
    throw new ApiError(
      messageFromPayload(payload, fallbackErrorMessage(response.status)),
      response.status,
    )
  }

  return payload as T
}//apiRequest
