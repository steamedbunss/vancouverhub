//declaring persisted seen wildfire state shape
export interface SeenWildfiresState {
  baselineEstablished: boolean
  seenFireNumbers: string[]
}

//declaring localStorage key prefix for guest and signed-in wildfire scopes
const STORAGE_KEY_PREFIX = 'vancouverhub_seen_wildfires_v1'

//declaring empty state used when a scope has not established its first baseline
const EMPTY_SEEN_WILDFIRES_STATE: SeenWildfiresState = {
  baselineEstablished: false,
  seenFireNumbers: [],
}

//This function returns the storage scope for a guest or signed-in user
export function getSeenWildfiresScopeKey(userId: number | null | undefined) {
  return userId != null ? `user:${userId}` : 'guest'
}//getSeenWildfiresScopeKey

//This function builds the complete localStorage key for one wildfire scope
function storageKey(scopeKey: string) {
  return `${STORAGE_KEY_PREFIX}:${scopeKey}`
}//storageKey

//This function normalizes fire numbers and removes duplicates while preserving order
function normalizeFireNumbers(fireNumbers: string[]) {
  return Array.from(new Set(fireNumbers.map((fireNumber) => fireNumber.trim()).filter(Boolean)))
}//normalizeFireNumbers

//This function loads persisted wildfire history for one browser scope
export function loadSeenWildfires(scopeKey: string): SeenWildfiresState {
  try {
    const stored = localStorage.getItem(storageKey(scopeKey))
    if (!stored) return { ...EMPTY_SEEN_WILDFIRES_STATE }

    const parsed = JSON.parse(stored) as Partial<SeenWildfiresState>
    return {
      baselineEstablished: parsed.baselineEstablished === true,
      seenFireNumbers: Array.isArray(parsed.seenFireNumbers)
        ? normalizeFireNumbers(parsed.seenFireNumbers.filter((value): value is string => typeof value === 'string'))
        : [],
    }
  } catch {
    return { ...EMPTY_SEEN_WILDFIRES_STATE }
  }
}//loadSeenWildfires

//This function persists wildfire history for one browser scope
function saveSeenWildfires(scopeKey: string, state: SeenWildfiresState) {
  localStorage.setItem(storageKey(scopeKey), JSON.stringify(state))
  return state
}//saveSeenWildfires

//This function establishes the first successful active-fire baseline for a scope
export function establishBaseline(scopeKey: string, fireNumbers: string[]) {
  return saveSeenWildfires(scopeKey, {
    baselineEstablished: true,
    seenFireNumbers: normalizeFireNumbers(fireNumbers),
  })
}//establishBaseline

//This function adds fire numbers to a scope without creating visible alerts
export function silentBaselineExtend(
  scopeKey: string,
  state: SeenWildfiresState,
  fireNumbers: string[],
) {
  const seenFireNumbers = normalizeFireNumbers([...state.seenFireNumbers, ...fireNumbers])
  if (seenFireNumbers.length === state.seenFireNumbers.length) return state

  return saveSeenWildfires(scopeKey, { baselineEstablished: true, seenFireNumbers })
}//silentBaselineExtend

//This function marks every fire in a dismissed wildfire block as seen
export function markWildfiresSeen(
  scopeKey: string,
  state: SeenWildfiresState,
  fireNumbers: string[],
) {
  const seenFireNumbers = normalizeFireNumbers([...state.seenFireNumbers, ...fireNumbers])
  if (seenFireNumbers.length === state.seenFireNumbers.length) return state

  return saveSeenWildfires(scopeKey, { baselineEstablished: true, seenFireNumbers })
}//markWildfiresSeen
