//declaring hub navigation category id union type
export type CategoryId =
  | 'local-events'
  | 'environment'
  | 'traffic'
  | 'housing'
  | 'gas-prices'
  | 'gov-programs'
  | 'safety-311'

//declaring alert delivery channel type
export type DeliveryMethod = 'email' | 'sms'

//declaring gradient preset names for appearance customization
export type GradientPreset =
  | 'category'
  | 'rainbow'
  | 'green'
  | 'blue'
  | 'yellow'
  | 'purple'
  | 'sunset'
  | 'monochrome'
  | 'custom'

//declaring user appearance preferences for gradients, borders, and weather overlay
export interface AppearancePreferences {
  gradientsEnabled: boolean
  gradientPreset: GradientPreset
  gradientColors: [string, string, string]
  gradientDirection: number
  gradientSpeed: number
  neonBordersEnabled: boolean
  /** Weather card animated-background overlay darkness, 0–80 percent. */
  weatherOverlayOpacity: number
}

export type GreetingAnimationTrigger = 'view' | 'hover' | 'click'
export type GreetingAnimationClickMode = 'once' | 'toggle'
export type GreetingAnimationDirection = 'start' | 'end' | 'center'

//declaring the animation settings for the signed-in dashboard greeting
export interface GreetingAnimationPreferences {
  animateOn: GreetingAnimationTrigger
  clickMode: GreetingAnimationClickMode
  speed: number
  maxIterations: number
  repeatIntervalSeconds: number
  revealDirection: GreetingAnimationDirection
  sequential: boolean
  useOriginalCharsOnly: boolean
}

//declaring which alert categories the user wants to receive
export interface AlertPreferences {
  airQuality: boolean
  wildfire: boolean
  weatherAdvisories: boolean
  fireDanger: boolean
}

//declaring numeric thresholds that trigger each alert category
export interface AlertThresholds {
  temperatureC: number
  aqhi: number
  wildfireDistanceKm: number
  fireDangerRating: number
}

//declaring full user configuration persisted in localStorage
export interface UserConfig {
  location: string
  neighborhood: string
  displayName: string
  alertPreferences: AlertPreferences
  alertThresholds: AlertThresholds
  deliveryMethod: DeliveryMethod
  appearance: AppearancePreferences
  greetingAnimation: GreetingAnimationPreferences
  navVisible: Record<CategoryId, boolean>
  dashboardVisible: Record<CategoryId, boolean>
}

//declaring metadata for a hub category section
export interface CategoryDefinition {
  id: CategoryId
  label: string
  shortLabel: string
  path: string
  description: string
}

//declaring a single evaluated alert shown in the alerts UI
export interface AlertItem {
  id: string
  type: 'air-quality' | 'wildfire' | 'weather' | 'fire-weather'
  severity: 'info' | 'warning' | 'critical'
  title: string
  message: string
  issuedAt: string
  wildfireFireNumbers?: string[]
  dismissible?: boolean
  wildfireAlertKind?: 'new' | 'missed'
}
