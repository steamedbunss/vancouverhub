//declaring rotating dashboard greeting phrases
export const DASHBOARD_GREETINGS = [
  'Howdy',
  'Hello',
  'Hi',
  'Welcome',
  'Hey',
  'Good day',
  "What's up",
  'Greetings',
  'Nice to see you',
  'Welcome back',
] as const

//declaring localStorage key for greeting rotation index
const STORAGE_KEY = 'vancouverhub-greeting-index'

//declaring module-level cache to dedupe Strict Mode double-init calls
let lastPickAt = 0
let lastGreeting = ''

//This function advances and returns the next greeting each time the dashboard is landed on
export function nextDashboardGreeting(): string {
  const now = Date.now()
  //Same greeting if called again within 500ms (Strict Mode double-init).
  if (lastGreeting && now - lastPickAt < 500) {
    return lastGreeting
  }

  const total = DASHBOARD_GREETINGS.length
  let index = 0

  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    index = stored ? Number.parseInt(stored, 10) : 0
    if (Number.isNaN(index) || index < 0 || index >= total) {
      index = 0
    }
  } catch {
    index = 0
  }

  const greeting = DASHBOARD_GREETINGS[index]
  const nextIndex = (index + 1) % total

  try {
    localStorage.setItem(STORAGE_KEY, String(nextIndex))
  } catch {
    // ignore storage failures
  }

  lastPickAt = now
  lastGreeting = greeting
  return greeting
}//nextDashboardGreeting

//This function extracts the first name from a display name string, eg. "Alex K." -> "Alex"
export function firstNameFromDisplayName(displayName: string): string {
  const first = displayName.trim().split(/\s+/)[0]
  return first.replace(/\.$/, '') || 'friend'
}//firstNameFromDisplayName
