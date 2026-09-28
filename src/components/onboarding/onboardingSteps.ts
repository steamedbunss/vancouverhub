//declaring the first onboarding step shown to new visitors on the register page
export interface OnboardingStep {
  id: string
  path: string
  target: string
  title: string
  description: string
  actionLabel: string
  placement?: 'below-left' | 'below' | 'below-center'
}

//versioned storage key lets future onboarding revisions run once for existing users
export const ONBOARDING_STORAGE_KEY = 'vancouver-hub-onboarding-v1'
export const ONBOARDING_PROGRESS_KEY = `${ONBOARDING_STORAGE_KEY}-progress`
export type OnboardingStatus = 'completed' | 'skipped'

//getOnboardingStatus returns the saved onboarding result for this browser
export function getOnboardingStatus(): OnboardingStatus | null {
  try {
    const status = localStorage.getItem(ONBOARDING_STORAGE_KEY)
    return status === 'completed' || status === 'skipped' ? status : null
  } catch {
    return null
  }
}//getOnboardingStatus

//saveOnboardingStatus prevents the same onboarding version from reopening automatically
export function saveOnboardingStatus(status: OnboardingStatus) {
  try {
    localStorage.setItem(ONBOARDING_STORAGE_KEY, status)
  } catch {
    //Ignore storage failures so onboarding remains usable in restricted browsers.
  }
}//saveOnboardingStatus

//resetOnboardingStatus allows users to start the tutorial again from Settings
export function resetOnboardingStatus() {
  try {
    localStorage.removeItem(ONBOARDING_STORAGE_KEY)
  } catch {
    //Ignore storage failures so the Settings page remains usable in restricted browsers.
  }
}//resetOnboardingStatus

export const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: 'tour-intro',
    path: '/register',
    target: '',
    title: 'Hello there!',
    description: 'Welcome to the Vancouver Hub tour. We’ll show you around the dashboard and each page in guest view. If anything goes wrong, press Esc to exit the tutorial.',
    actionLabel: 'Start tour',
  },
  {
    id: 'guest-access',
    path: '/register',
    target: 'continue-as-guest',
    title: 'Browse as a guest',
    description: 'You can explore Vancouver Hub as a guest. Some nearby and personalized features require an account, but you can keep browsing without registering.',
    actionLabel: 'Next',
  },
  {
    id: 'account-personalization',
    path: '/register',
    target: 'registration-card',
    title: 'Make Vancouver Hub more personal',
    description: 'Creating an account lets you save your location, customize your dashboard, configure alerts, and choose which features appear in your navigation.',
    actionLabel: 'Next',
  },
  { id: 'dashboard-navigation', path: '/', target: 'tour-navigation', title: 'Navigation', description: 'Use the navigation to visit Events, Environment, Traffic, Neighbourhood Reports, and Settings. Some personalized features on these pages may ask guests to sign in.', actionLabel: 'Next', placement: 'below-center' },
  { id: 'dashboard-location', path: '/', target: 'tour-location', title: 'Your location', description: 'Your selected or fallback location helps show relevant information. Saving a home location to your account makes location-based features more personal.', actionLabel: 'Next' },
  { id: 'dashboard-greeting', path: '/', target: 'tour-greeting', title: 'Dashboard greeting', description: 'Guests see a general greeting. Signed-in users see a personalized greeting with their account name.', actionLabel: 'Next' },
  { id: 'dashboard-weather', path: '/', target: 'tour-weather', title: 'Weather', description: 'See current weather for the location available to you. A saved home location can make these results more relevant.', actionLabel: 'Next' },
  { id: 'dashboard-gas', path: '/', target: 'tour-gas', title: 'Gas prices', description: 'Compare nearby gas prices. Location-based results are more useful when your location is configured; sign-in prompts explain any guest limits.', actionLabel: 'Next' },
  { id: 'dashboard-events', path: '/', target: 'tour-events', title: 'Dashboard events', description: 'Browse upcoming local events. You can choose whether this section appears in your dashboard settings.', actionLabel: 'Next' },
  { id: 'dashboard-traffic', path: '/', target: 'tour-traffic', title: 'Dashboard traffic', description: 'Review traffic conditions and camera views. Camera controls let you move through available intersections and directions.', actionLabel: 'Next', placement: 'below-left' },
  { id: 'dashboard-reports', path: '/', target: 'tour-reports', title: 'Neighbourhood Reports', description: 'This section covers local 311 activity. Nearby reports and saved-location personalization may require an account; guests can continue the tour.', actionLabel: 'Next', placement: 'below' },
  { id: 'events-overview', path: '/events', target: 'tour-events-overview', title: 'Events', description: 'The Events page provides a larger view of upcoming Vancouver events available to browse as a guest.', actionLabel: 'Next' },
  { id: 'events-filters', path: '/events', target: 'tour-events-filters', title: 'Event views and dates', description: 'Use the available views and dates to find events. Guest accounts may have fewer personalized views.', actionLabel: 'Next' },
  { id: 'events-content', path: '/events', target: 'tour-events-content', title: 'Event details and calendar', description: 'Explore event cards and the calendar to find activities by date.', actionLabel: 'Next' },
  { id: 'environment-conditions', path: '/environment', target: 'tour-environment-conditions', title: 'Current conditions', description: 'See current weather conditions for the location available to you.', actionLabel: 'Next' },
  { id: 'environment-air-quality', path: '/environment', target: 'tour-air-quality', title: 'Air quality', description: 'Air quality information helps explain current conditions and potential health impacts. Some location-specific details may require a saved account location.', actionLabel: 'Next' },
  { id: 'environment-wildfires', path: '/environment', target: 'tour-wildfires', title: 'Wildfires', description: 'Review active wildfire information, filters, and available alerts or evacuation details.', actionLabel: 'Next' },
  { id: 'traffic-overview', path: '/traffic', target: 'tour-traffic-cameras', title: 'Traffic information', description: 'Browse current road events and traffic information available to guests.', actionLabel: 'Next' },
  { id: 'traffic-views', path: '/traffic', target: 'tour-traffic-controls', title: 'Traffic views and filters', description: 'Use the available controls to switch between list and map views and focus on road events.', actionLabel: 'Next' },
  { id: 'reports-overview', path: '/safety-311', target: 'tour-reports-overview', title: 'Nearby 311 reports', description: 'This page explains neighbourhood activity. Guests see this sign-in prompt because nearby reports use a saved home location; you can continue without signing in.', actionLabel: 'Next' },
  { id: 'reports-categories', path: '/safety-311', target: 'tour-reports-overview', title: 'Report categories', description: 'Categories help focus on reports that matter to you. The category filters and saved preferences require an account, so guests can continue without changing them.', actionLabel: 'Next' },
  { id: 'settings-location', path: '/settings', target: 'tour-settings-location', title: 'Location settings', description: 'Save or update a home location to personalize information throughout Vancouver Hub. Guests can browse settings, but account preferences may not be saved.', actionLabel: 'Next' },
  { id: 'settings-alerts', path: '/settings', target: 'tour-settings-alerts', title: 'Alert preferences', description: 'Choose alerts and adjust the conditions that matter to you. Saving alert preferences requires an account.', actionLabel: 'Next' },
  { id: 'settings-dashboard', path: '/settings', target: 'tour-settings-dashboard', title: 'Dashboard visibility', description: 'Choose which sections appear on your dashboard. These preferences are saved to your account.', actionLabel: 'Next' },
  { id: 'settings-navigation', path: '/settings', target: 'tour-settings-navigation', title: 'Navigation customization', description: 'Choose which pages appear in your navigation. Saved navigation choices are account preferences.', actionLabel: 'Next' },
  { id: 'settings-appearance', path: '/settings', target: 'tour-settings-appearance', title: 'Appearance', description: 'Adjust visual preferences such as theme and weather overlays. Some appearance settings are available only when signed in.', actionLabel: 'Next' },
  { id: 'settings-reports', path: '/settings', target: 'tour-settings-reports', title: '311 preferences', description: 'Choose neighbourhood report categories that matter to you. These preferences require an account to save.', actionLabel: 'Next' },
  { id: 'tour-finish', path: '/settings', target: 'tour-finish', title: 'You’re all set', description: 'You’ve toured Vancouver Hub in guest view. You can keep exploring; signing in lets you save locations, preferences, and alerts for a more personal experience.', actionLabel: 'Finish tutorial' },
]
