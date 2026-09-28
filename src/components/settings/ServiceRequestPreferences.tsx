import { forwardRef, useCallback, useEffect, useImperativeHandle, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useServiceRequestPreferences } from '../../context/ServiceRequestPreferencesContext'
import {
  SERVICE_REQUEST_CATEGORIES,
  type ApiServiceRequestCategory,
} from '../../types/backend'
import { RainbowText } from '../RainbowText'

//constant human-readable labels for each 311 category checkbox
const labels: Record<ApiServiceRequestCategory, string> = {
  ROAD: 'Roads',
  GARBAGE: 'Garbage',
  WATER: 'Water',
  GRAFFITI: 'Graffiti',
  NOISE: 'Noise',
  SAFETY: 'Safety',
}

//declaring the imperative handle exposed to the parent settings page
export interface ServiceRequestPreferencesHandle {
  save: () => Promise<void>
  reset: () => void
}

interface ServiceRequestPreferencesProps {
  onDirtyChange?: (isDirty: boolean) => void
}

//ServiceRequestPreferences lets signed-in users pick which 311 categories to show
export const ServiceRequestPreferences = forwardRef<
  ServiceRequestPreferencesHandle,
  ServiceRequestPreferencesProps
>(function ServiceRequestPreferences({ onDirtyChange }, ref) {
  const { token } = useAuth()
  const { categories, isLoading: loading, error, saveCategories } = useServiceRequestPreferences()
  //declaring draft state for checkbox selections before save
  const [draft, setDraft] = useState<ApiServiceRequestCategory[]>(categories)
  const [saving, setSaving] = useState(false)

  //This useEffect syncs draft when saved categories load or change from the server
  useEffect(() => {
    setDraft(categories)
  }, [categories])

  //changed is true when draft differs from the saved categories list
  const changed =
    draft.length !== categories.length ||
    draft.some((category) => !categories.includes(category))

  //This useEffect notifies the parent when unsaved changes exist
  useEffect(() => {
    onDirtyChange?.(Boolean(token) && changed)

    return () => onDirtyChange?.(false)
  }, [changed, onDirtyChange, token])

  //save persists draft categories when there are unsaved changes
  const save = useCallback(async () => {
    if (!token || !changed) return

    setSaving(true)
    try {
      await saveCategories(draft)
    } catch {
      throw new Error('Could not save 311 preferences. Please try again.')
    } finally {
      setSaving(false)
    }
  }, [changed, draft, saveCategories, token])

  //useImperativeHandle exposes save and reset to the parent via ref
  useImperativeHandle(
    ref,
    () => ({
      save,
      reset: () => setDraft(categories),
    }),
    [categories, save],
  )

  //If the user is not signed in, show a sign-in prompt instead of checkboxes
  if (!token) {
    return (
      <section data-onboarding-target="tour-settings-reports" className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900/50">
        <h2 className="text-xl font-bold tracking-[0.12em] text-gray-500 uppercase dark:text-gray-400">
          <RainbowText>311 preferences</RainbowText>
        </h2>
        <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
          <Link to="/login" className="font-semibold text-hub-navy hover:underline dark:text-teal-300">
            Sign in
          </Link>{' '}
          to choose which nearby 311 request categories you see.
        </p>
      </section>
    )
  }

  //toggleCategory adds or removes one category from the draft selection
  const toggleCategory = (category: ApiServiceRequestCategory) => {
    setDraft((current) =>
      current.includes(category)
        ? current.filter((item) => item !== category)
        : [...current, category],
    )
  }//toggleCategory

  return (
    <section data-onboarding-target="tour-settings-reports" className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900/50">
      <h2 className="text-xl font-bold tracking-[0.12em] text-gray-500 uppercase dark:text-gray-400">
        <RainbowText>311 preferences</RainbowText>
      </h2>
      {/*This map renders one toggle checkbox per 311 category*/}
      <div className="mt-4 space-y-2">
        {SERVICE_REQUEST_CATEGORIES.map((category) => (
          <label
            key={category}
            className="flex cursor-pointer items-center justify-between border-b border-gray-100 py-2 text-sm text-gray-800 dark:border-gray-800 dark:text-gray-200"
          >
            <span>{labels[category]}</span>
            <span className="relative inline-flex h-7 w-12 shrink-0 items-center">
              <input
                type="checkbox"
                checked={draft.includes(category)}
                onChange={() => toggleCategory(category)}
                disabled={loading || saving}
                className="peer sr-only"
              />
              <span className="h-7 w-12 rounded-full bg-gray-200 transition-colors peer-checked:bg-hub-navy peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-hub-teal peer-disabled:cursor-not-allowed peer-disabled:opacity-50 dark:bg-gray-700 dark:peer-checked:bg-blue-500" />
              <span className="pointer-events-none absolute left-1 h-5 w-5 rounded-full bg-white shadow-sm transition-transform peer-checked:translate-x-5" />
            </span>
          </label>
        ))}
      </div>
      {error && <p className="mt-3 text-sm text-red-600 dark:text-red-400">{error}</p>}
    </section>
  )
})
