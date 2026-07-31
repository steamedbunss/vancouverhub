//declaring react context hooks, 311 preferences API, and backend category types
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { useAuth } from './AuthContext'
import {
  getServiceRequestPreferences,
  saveServiceRequestPreferences,
} from '../lib/api/serviceRequests'
import {
  SERVICE_REQUEST_CATEGORIES,
  type ApiServiceRequestCategory,
} from '../types/backend'

//declaring 311 preferences context value shape exposed to consuming components
interface ServiceRequestPreferencesContextValue {
  categories: ApiServiceRequestCategory[]
  isLoading: boolean
  error: string | null
  version: number
  saveCategories: (categories: ApiServiceRequestCategory[]) => Promise<void>
}

//declaring 311 preferences context instance
const ServiceRequestPreferencesContext = createContext<ServiceRequestPreferencesContextValue | null>(null)

//This function provides 311 category filter preferences for signed-in users
export function ServiceRequestPreferencesProvider({ children }: { children: ReactNode }) {
  const { token } = useAuth()
  const [categories, setCategories] = useState<ApiServiceRequestCategory[]>([...SERVICE_REQUEST_CATEGORIES])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [version, setVersion] = useState(0)

  useEffect(() => {
    if (!token) {
      setCategories([...SERVICE_REQUEST_CATEGORIES])
      setError(null)
      setIsLoading(false)
      setVersion((current) => current + 1)
      return
    }

    let cancelled = false
    setIsLoading(true)
    setError(null)
    void getServiceRequestPreferences(token)
      .then((preferences) => {
        if (!cancelled) {
          setCategories(preferences.categories)
          setVersion((current) => current + 1)
        }
      })
      .catch((reason: unknown) => {
        if (!cancelled) {
          setError(reason instanceof Error ? reason.message : 'Could not load 311 preferences.')
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [token])

  const value = useMemo<ServiceRequestPreferencesContextValue>(() => ({
    categories,
    isLoading,
    error,
    version,
    async saveCategories(nextCategories) {
      if (!token) throw new Error('Please sign in to save 311 preferences.')
      const preferences = await saveServiceRequestPreferences(nextCategories, token)
      setCategories(preferences.categories)
      setError(null)
      setVersion((current) => current + 1)
    },
  }), [categories, error, isLoading, token, version])

  return (
    <ServiceRequestPreferencesContext.Provider value={value}>
      {children}
    </ServiceRequestPreferencesContext.Provider>
  )
}//ServiceRequestPreferencesProvider

//This function returns 311 preferences context; throws if used outside provider
export function useServiceRequestPreferences() {
  const value = useContext(ServiceRequestPreferencesContext)
  if (!value) throw new Error('useServiceRequestPreferences must be used within its provider.')
  return value
}//useServiceRequestPreferences
