import { useCallback, useState } from 'react'
import { Crosshair } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useLocationActions } from '../../context/LocationContext'
import { useUserConfig } from '../../context/UserConfigContext'
import { RainbowText } from '../RainbowText'
import { AddressAutocomplete, type SelectedAddress } from './AddressAutocomplete'

//LocationSettings lets the user search an address or use device geolocation
export function LocationSettings() {
  const { draft, setDraftLocation, setDraftNeighborhood } = useUserConfig()
  const { token } = useAuth()
  const { setManualLocation, useCurrentLocation } = useLocationActions()
  //declaring state for the address search input value
  const [addressQuery, setAddressQuery] = useState('')
  //declaring state for success or error messages after location actions
  const [locationStatus, setLocationStatus] = useState<string | null>(null)

  //handleAddressSelect saves a picked address to location context and draft config
  const handleAddressSelect = useCallback(async (address: SelectedAddress) => {
    setLocationStatus(token ? 'Saving your selected address…' : 'Using your selected address for this session…')
    try {
      await setManualLocation(address)
      setDraftLocation(address.label)
      setDraftNeighborhood(address.label)
      setLocationStatus(token ? 'Home location saved to your account.' : 'Location set for this browser session.')
    } catch (error) {
      setLocationStatus(error instanceof Error ? error.message : 'Could not save your selected location.')
    }
  }, [setDraftLocation, setDraftNeighborhood, setManualLocation, token])

  //handleUseCurrentLocation requests browser geolocation and saves the result
  const handleUseCurrentLocation = useCallback(async () => {
    setLocationStatus(token ? 'Getting and saving your current location…' : 'Getting your current location…')
    try {
      await useCurrentLocation()
      setDraftLocation('Current location')
      setDraftNeighborhood('Current location')
      setLocationStatus(token ? 'Home location saved to your account.' : 'Current location set for this browser session.')
    } catch {
      setLocationStatus('Location permission was not granted or timed out.')
    }
  }, [setDraftLocation, setDraftNeighborhood, token, useCurrentLocation])

  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900/50">
      <h3 className="text-xl font-bold tracking-[0.12em] text-gray-500 uppercase dark:text-gray-300">
        <RainbowText>Your Location</RainbowText>
      </h3>
      <AddressAutocomplete
        value={addressQuery}
        onChange={setAddressQuery}
        onSelect={handleAddressSelect}
      />
      {draft.location && (
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
          <span className="font-medium text-gray-800 dark:text-gray-100">{token ? 'Saved location:' : 'Session location:'}</span>{' '}
          {draft.location}
        </p>
      )}
      <button
        type="button"
        onClick={handleUseCurrentLocation}
        className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-hub-navy hover:underline dark:text-sky-300"
      >
        <Crosshair className="h-4 w-4" />
        Use current location
      </button>
      {locationStatus && <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">{locationStatus}</p>}
    </section>
  )
}//LocationSettings
