//SettingsPage.tsx collects user preferences for location, alerts, nav, and dashboard visibility
import { useRef, useState } from 'react'
import { AlertPreferences } from '../components/settings/AlertPreferences'
import { AppearancePreferences } from '../components/settings/AppearancePreferences'
import { DashboardVisibility } from '../components/settings/DashboardVisibility'
import { LocationSettings } from '../components/settings/LocationSettings'
import { NavCustomization } from '../components/settings/NavCustomization'
import {
  ServiceRequestPreferences,
  type ServiceRequestPreferencesHandle,
} from '../components/settings/ServiceRequestPreferences'
import { RainbowText } from '../components/RainbowText'
import { useAuth } from '../context/AuthContext'
import { useUserConfig } from '../context/UserConfigContext'

export function SettingsPage() {
  //token indicates whether the user is signed in; appearance settings require auth
  const { token } = useAuth()
  //hasUnsavedChanges, saveDraft, and resetDraft manage the user config draft state
  const { hasUnsavedChanges, saveDraft, resetDraft } = useUserConfig()
  //serviceRequestPreferencesRef exposes save and reset methods on the 311 preferences child
  const serviceRequestPreferencesRef = useRef<ServiceRequestPreferencesHandle>(null)
  //declaring state to track unsaved edits inside ServiceRequestPreferences separately
  const [hasUnsavedServiceRequestChanges, setHasUnsavedServiceRequestChanges] = useState(false)
  //declaring state to disable buttons while a save request is in flight
  const [isSaving, setIsSaving] = useState(false)
  //declaring state to show success or error feedback after save or discard
  const [saveMessage, setSaveMessage] = useState<string | null>(null)
  //hasChanges is true when either user config or service request prefs have pending edits
  const hasChanges = hasUnsavedChanges || hasUnsavedServiceRequestChanges

  //handleSave persists service request prefs first, then user config draft changes
  async function handleSave() {
    setIsSaving(true)
    setSaveMessage(null)

    try {
      if (hasUnsavedServiceRequestChanges) {
        await serviceRequestPreferencesRef.current?.save()
      }

      if (hasUnsavedChanges) {
        saveDraft()
      }

      setSaveMessage('Changes saved.')
    } catch (error) {
      setSaveMessage(
        error instanceof Error ? error.message : 'Could not save changes. Please try again.',
      )
    } finally {
      setIsSaving(false)
    }
  }//handleSave

  //handleDiscard resets both user config draft and service request preferences
  function handleDiscard() {
    resetDraft()
    serviceRequestPreferencesRef.current?.reset()
    setSaveMessage(null)
  }//handleDiscard

  return (
    <div
      className={`settings-page mx-auto max-w-7xl px-6 py-10 dark:text-gray-100 ${
        token ? 'settings-page--account' : 'settings-page--guest'
      }`}
    >
      {/*Page title*/}
      <div className="mb-10 flex flex-wrap items-start justify-between gap-4">
        <h1 className="text-4xl font-black tracking-tight text-gray-900 md:text-5xl dark:text-white">
          <RainbowText>Settings</RainbowText>
        </h1>
        <div className="flex flex-col items-end gap-2">
          <div className="flex flex-wrap items-center justify-end gap-4">
            <button
              type="button"
              onClick={handleSave}
              disabled={!hasChanges || isSaving}
              className="settings-save-button rounded-lg bg-hub-navy px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-hub-navy-light disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              type="button"
              onClick={handleDiscard}
              disabled={!hasChanges || isSaving}
              aria-hidden={!hasChanges}
              tabIndex={hasChanges ? 0 : -1}
              className={`settings-discard-button min-w-28 text-sm font-semibold ${
                hasChanges ? 'is-active' : ''
              }`}
            >
              Discard changes
            </button>
          </div>
          {saveMessage && (
            <p
              className={`text-sm ${
                saveMessage.startsWith('Could not')
                  ? 'text-red-600 dark:text-red-400'
                  : 'text-teal-700 dark:text-teal-300'
              }`}
            >
              {saveMessage}
            </p>
          )}
        </div>
      </div>

      {/*Three column grid of settings panels*/}
      <div className="grid gap-x-12 gap-y-10 xl:grid-cols-12">
        {/*Left column: location and alert preferences*/}
        <div className="xl:col-span-4">
          <div className="space-y-10">
            <LocationSettings />
            <AlertPreferences />
          </div>

        </div>

        {/*Middle column: navigation and 311 service request preferences*/}
        <div className="space-y-10 xl:col-span-4">
          <NavCustomization />
          <ServiceRequestPreferences
            ref={serviceRequestPreferencesRef}
            onDirtyChange={setHasUnsavedServiceRequestChanges}
          />
        </div>

        {/*Right column: dashboard visibility and appearance for signed in users*/}
        <div className="space-y-10 xl:col-span-4">
          <DashboardVisibility />
          {token && <AppearancePreferences />}
        </div>
      </div>

    </div>
  )
}//SettingsPage
