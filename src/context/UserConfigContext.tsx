//declaring react context hooks, category constants, and user config storage
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  ALL_CATEGORY_IDS,
  CATEGORIES,
  TEMPORARILY_DISABLED_CATEGORY_IDS,
  TEMPORARILY_DISABLED_PAGE_IDS,
  isCategoryPageTemporarilyDisabled,
  isCategoryTemporarilyDisabled,
} from '../constants/categories'
import {
  DEFAULT_USER_CONFIG,
  loadUserConfig,
  saveUserConfig,
} from '../lib/userConfigStorage'
import { useAuth } from './AuthContext'
import type {
  AlertPreferences,
  AlertThresholds,
  CategoryId,
  DeliveryMethod,
  UserConfig,
} from '../types'

//declaring user config context value shape exposed to consuming components
interface UserConfigContextValue {
  config: UserConfig
  draft: UserConfig
  hasUnsavedChanges: boolean
  visibleNavCategories: CategoryId[]
  updateDraft: (updates: Partial<UserConfig>) => void
  setDraftLocation: (location: string) => void
  setDraftNeighborhood: (neighborhood: string) => void
  setDraftAlertPreference: (
    key: keyof AlertPreferences,
    value: boolean,
  ) => void
  setDraftAlertThreshold: (
    key: keyof AlertThresholds,
    value: number,
  ) => void
  setDraftDeliveryMethod: (method: DeliveryMethod) => void
  setDraftNavVisible: (categoryId: CategoryId, visible: boolean) => void
  setDraftDashboardVisible: (categoryId: CategoryId, visible: boolean) => void
  saveDraft: () => void
  resetDraft: () => void
}

//declaring user config context instance
const UserConfigContext = createContext<UserConfigContextValue | null>(null)

//This function hides temporarily disabled categories from nav and dashboard visibility
function enforceTemporarilyDisabledCategories(config: UserConfig): UserConfig {
  const navVisible = { ...config.navVisible }
  const dashboardVisible = { ...config.dashboardVisible }

  TEMPORARILY_DISABLED_CATEGORY_IDS.forEach((categoryId) => {
    navVisible[categoryId] = false
    dashboardVisible[categoryId] = false
  })
  TEMPORARILY_DISABLED_PAGE_IDS.forEach((categoryId) => {
    navVisible[categoryId] = false
  })

  return { ...config, navVisible, dashboardVisible }
}//enforceTemporarilyDisabledCategories

//This function provides user settings with draft/save workflow and CSS variable sync
export function UserConfigProvider({ children }: { children: ReactNode }) {
  const { token } = useAuth()
  const [config, setConfig] = useState<UserConfig>(() =>
    enforceTemporarilyDisabledCategories(loadUserConfig()),
  )
  const [draft, setDraft] = useState<UserConfig>(() =>
    enforceTemporarilyDisabledCategories(loadUserConfig()),
  )

  useEffect(() => {
    const root = document.documentElement
    const { appearance } = config
    const presetColors: Record<string, [string, string, string]> = {
      rainbow: ['#ff3d81', '#ffe93d', '#3dcfff'],
      green: ['#39ff14', '#10f981', '#86efac'],
      blue: ['#22d3ee', '#3b82f6', '#60a5fa'],
      yellow: ['#faff00', '#facc15', '#f59e0b'],
      purple: ['#c084fc', '#a855f7', '#ec4899'],
      sunset: ['#ff3d81', '#ff8a3d', '#ffe93d'],
      monochrome: ['#ffffff', '#94a3b8', '#334155'],
    }
    const colors =
      appearance.gradientPreset === 'custom'
        ? appearance.gradientColors
        : presetColors[appearance.gradientPreset] ?? appearance.gradientColors
    const gradient = `linear-gradient(${appearance.gradientDirection}deg, ${colors[0]}, ${colors[1]}, ${colors[2]}, ${colors[0]})`

    root.style.setProperty('--user-gradient', gradient)
    root.style.setProperty('--gradient-speed', `${appearance.gradientSpeed}s`)
    root.classList.toggle('gradients-disabled', !appearance.gradientsEnabled)
    root.classList.toggle('gradient-customized', appearance.gradientPreset !== 'category')
    root.classList.toggle('neon-borders-disabled', !appearance.neonBordersEnabled)
    root.classList.toggle('guest-static-colors', !token)
  }, [config.appearance, token])

  const hasUnsavedChanges = useMemo(
    () => JSON.stringify(config) !== JSON.stringify(draft),
    [config, draft],
  )

  const visibleNavCategories = useMemo(
    () =>
      ALL_CATEGORY_IDS.filter(
        (id) => !isCategoryPageTemporarilyDisabled(id) && config.navVisible[id],
      ),
    [config.navVisible],
  )

  const updateDraft = useCallback((updates: Partial<UserConfig>) => {
    setDraft((current) =>
      enforceTemporarilyDisabledCategories({ ...current, ...updates }),
    )
  }, [])//updateDraft

  const setDraftLocation = useCallback((location: string) => {
    setDraft((current) => ({ ...current, location }))
  }, [])//setDraftLocation

  const setDraftNeighborhood = useCallback((neighborhood: string) => {
    setDraft((current) => ({ ...current, neighborhood }))
  }, [])//setDraftNeighborhood

  const setDraftAlertPreference = useCallback(
    (key: keyof AlertPreferences, value: boolean) => {
      setDraft((current) => ({
        ...current,
        alertPreferences: { ...current.alertPreferences, [key]: value },
      }))
    },
    [],
  )//setDraftAlertPreference

  const setDraftAlertThreshold = useCallback(
    (key: keyof AlertThresholds, value: number) => {
      setDraft((current) => ({
        ...current,
        alertThresholds: { ...current.alertThresholds, [key]: value },
      }))
    },
    [],
  )//setDraftAlertThreshold

  const setDraftDeliveryMethod = useCallback((method: DeliveryMethod) => {
    setDraft((current) => ({ ...current, deliveryMethod: method }))
  }, [])//setDraftDeliveryMethod

  const setDraftNavVisible = useCallback(
    (categoryId: CategoryId, visible: boolean) => {
      if (isCategoryPageTemporarilyDisabled(categoryId)) return
      setDraft((current) => ({
        ...current,
        navVisible: { ...current.navVisible, [categoryId]: visible },
      }))
    },
    [],
  )//setDraftNavVisible

  const setDraftDashboardVisible = useCallback(
    (categoryId: CategoryId, visible: boolean) => {
      if (isCategoryTemporarilyDisabled(categoryId)) return
      setDraft((current) => ({
        ...current,
        dashboardVisible: {
          ...current.dashboardVisible,
          [categoryId]: visible,
        },
      }))
    },
    [],
  )//setDraftDashboardVisible

  const saveDraft = useCallback(() => {
    const normalizedDraft = enforceTemporarilyDisabledCategories(draft)
    saveUserConfig(normalizedDraft)
    setConfig(normalizedDraft)
    setDraft(normalizedDraft)
  }, [draft])//saveDraft

  const resetDraft = useCallback(() => {
    setDraft(config)
  }, [config])//resetDraft

  const value = useMemo(
    () => ({
      config,
      draft,
      hasUnsavedChanges,
      visibleNavCategories,
      updateDraft,
      setDraftLocation,
      setDraftNeighborhood,
      setDraftAlertPreference,
      setDraftAlertThreshold,
      setDraftDeliveryMethod,
      setDraftNavVisible,
      setDraftDashboardVisible,
      saveDraft,
      resetDraft,
    }),
    [
      config,
      draft,
      hasUnsavedChanges,
      visibleNavCategories,
      updateDraft,
      setDraftLocation,
      setDraftNeighborhood,
      setDraftAlertPreference,
      setDraftAlertThreshold,
      setDraftDeliveryMethod,
      setDraftNavVisible,
      setDraftDashboardVisible,
      saveDraft,
      resetDraft,
    ],
  )

  return (
    <UserConfigContext.Provider value={value}>
      {children}
    </UserConfigContext.Provider>
  )
}//UserConfigProvider

//This function returns user config context; throws if used outside UserConfigProvider
export function useUserConfig() {
  const context = useContext(UserConfigContext)
  if (!context) {
    throw new Error('useUserConfig must be used within UserConfigProvider')
  }
  return context
}//useUserConfig

//This function returns the display label for a category id
export function useCategoryLabel(categoryId: CategoryId) {
  return CATEGORIES[categoryId].label
}//useCategoryLabel

export { DEFAULT_USER_CONFIG }
