//declaring manual location shape with coordinates and label
export interface ManualLocation {
  latitude: number
  longitude: number
  label: string
}

//declaring sessionStorage key for guest manual location override
const STORAGE_KEY = 'vancouverhub-manual-location'

//This function loads a manually entered guest location from sessionStorage
export function loadManualLocation(): ManualLocation | null {
  try {
    const stored = sessionStorage.getItem(STORAGE_KEY)
    if (!stored) return null
    const location = JSON.parse(stored) as ManualLocation
    return Number.isFinite(location.latitude) && Number.isFinite(location.longitude) && location.label
      ? location
      : null
  } catch {
    return null
  }
}//loadManualLocation

//This function saves a manually entered guest location to sessionStorage
export function storeManualLocation(location: ManualLocation) {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(location))
}//storeManualLocation

//This function removes the guest manual location override from sessionStorage
export function clearManualLocation() {
  sessionStorage.removeItem(STORAGE_KEY)
}//clearManualLocation
