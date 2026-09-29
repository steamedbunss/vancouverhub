//declaring user config type from shared types module
import type { UserConfig } from '../types'

//declaring localStorage key for persisted user settings
const STORAGE_KEY = 'vancouverhub-user-config'

//declaring default user config used when no saved settings exist
export const DEFAULT_USER_CONFIG: UserConfig = {
  location: '2690 Larch St, Vancouver',
  neighborhood: 'Kitsilano',
  displayName: 'Alex K.',
  alertPreferences: {
    airQuality: true,
    wildfire: true,
    weatherAdvisories: false,
    fireDanger: false,
  },
  alertThresholds: {
    temperatureC: 25,
    aqhi: 3,
    wildfireDistanceKm: 20,
    fireDangerRating: 4,
  },
  deliveryMethod: 'email',
  appearance: {
    gradientsEnabled: true,
    gradientPreset: 'category',
    gradientColors: ['#ff3d81', '#3dcfff', '#a83dff'],
    gradientDirection: 90,
    gradientSpeed: 2,
    neonBordersEnabled: true,
    weatherOverlayOpacity: 55,
  },
  greetingAnimation: {
    animateOn: 'view',
    clickMode: 'once',
    speed: 60,
    maxIterations: 10,
    repeatIntervalSeconds: 5,
    revealDirection: 'start',
    sequential: true,
    useOriginalCharsOnly: false,
  },
  navVisible: {
    'local-events': true,
    environment: true,
    traffic: true,
    housing: false,
    'gas-prices': true,
    'gov-programs': false,
    'safety-311': false,
  },
  dashboardVisible: {
    'local-events': true,
    environment: true,
    traffic: true,
    housing: true,
    'gas-prices': true,
    'gov-programs': true,
    'safety-311': true,
  },
}

//This function loads user config from localStorage, merging with defaults
export function loadUserConfig(): UserConfig {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return DEFAULT_USER_CONFIG

    const parsed = JSON.parse(stored) as Partial<UserConfig> & {
      dashboardOrder?: unknown
    }

    return {
      ...DEFAULT_USER_CONFIG,
      ...parsed,
      alertPreferences: {
        ...DEFAULT_USER_CONFIG.alertPreferences,
        ...parsed.alertPreferences,
      },
      alertThresholds: {
        ...DEFAULT_USER_CONFIG.alertThresholds,
        ...parsed.alertThresholds,
      },
      appearance: {
        ...DEFAULT_USER_CONFIG.appearance,
        ...parsed.appearance,
      },
      greetingAnimation: {
        ...DEFAULT_USER_CONFIG.greetingAnimation,
        ...parsed.greetingAnimation,
      },
      navVisible: {
        ...DEFAULT_USER_CONFIG.navVisible,
        ...parsed.navVisible,
      },
      dashboardVisible: {
        ...DEFAULT_USER_CONFIG.dashboardVisible,
        ...parsed.dashboardVisible,
      },
    }
  } catch {
    return DEFAULT_USER_CONFIG
  }
}//loadUserConfig

//This function persists the full user config object to localStorage
export function saveUserConfig(config: UserConfig) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config))
}//saveUserConfig
