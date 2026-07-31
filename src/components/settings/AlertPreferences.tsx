import { Link } from 'react-router-dom'
import { Lock } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useUserConfig } from '../../context/UserConfigContext'
import { RainbowText } from '../RainbowText'
import { Toggle } from '../ui/Toggle'

//AlertPreferences lets signed-in users configure alert thresholds and delivery method
export function AlertPreferences() {
  const {
    draft,
    setDraftAlertPreference,
    setDraftAlertThreshold,
    setDraftDeliveryMethod,
  } = useUserConfig()
  const { token } = useAuth()

  //If the user is not signed in, show a callout instead of alert controls
  if (!token) {
    return (
      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900/50">
        <h3 className="text-xl font-bold tracking-[0.12em] text-gray-500 uppercase dark:text-gray-300">
          <RainbowText>Notifications</RainbowText>
        </h3>
        <div className="guest-notifications-callout mt-3 rounded-xl border border-gray-600 bg-gray-950 p-4">
          <Lock className="h-5 w-5 text-gray-500 dark:text-gray-400" aria-hidden="true" />
          <p className="mt-2 text-sm font-medium text-gray-800 dark:text-gray-100">Notifications require an account</p>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
            Sign in to set your personal weather, air-quality, wildfire, and fire-danger alerts.
          </p>
          <Link to="/login" className="mt-3 inline-block text-sm font-medium text-hub-navy hover:underline dark:text-sky-300">
            Sign in to manage alerts →
          </Link>
        </div>
      </section>
    )
  }

  return (
    <>
      {/*Alert threshold rules for temperature, AQHI, wildfire distance, and fire danger*/}
      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900/50">
        <h3 className="text-xl font-bold tracking-[0.12em] text-gray-500 uppercase dark:text-gray-300">
          <RainbowText>Notify Me About</RainbowText>
        </h3>
        <div className="mt-2 divide-y divide-gray-100 dark:divide-gray-800">
          <AlertRule
            label="Temperature"
            suffix="°C or higher"
            value={draft.alertThresholds.temperatureC}
            checked={draft.alertPreferences.weatherAdvisories}
            onCheckedChange={(value) => setDraftAlertPreference('weatherAdvisories', value)}
            onValueChange={(value) => setDraftAlertThreshold('temperatureC', value)}
          />
          <AlertRule
            label="Air quality health index"
            suffix="AQHI or higher"
            value={draft.alertThresholds.aqhi}
            checked={draft.alertPreferences.airQuality}
            onCheckedChange={(value) => setDraftAlertPreference('airQuality', value)}
            onValueChange={(value) => setDraftAlertThreshold('aqhi', value)}
          />
          <AlertRule
            label="Nearby wildfire"
            suffix="km or closer"
            value={draft.alertThresholds.wildfireDistanceKm}
            min={1}
            checked={draft.alertPreferences.wildfire}
            onCheckedChange={(value) => setDraftAlertPreference('wildfire', value)}
            onValueChange={(value) => setDraftAlertThreshold('wildfireDistanceKm', value)}
          />
          <AlertRule
            label="Nearby fire weather danger"
            suffix="rating or higher"
            value={draft.alertThresholds.fireDangerRating}
            min={1}
            max={5}
            checked={draft.alertPreferences.fireDanger}
            onCheckedChange={(value) => setDraftAlertPreference('fireDanger', value)}
            onValueChange={(value) => setDraftAlertThreshold('fireDangerRating', value)}
          />
        </div>
      </section>

      {/*Email or SMS delivery method toggle buttons*/}
      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900/50">
        <h3 className="text-xl font-bold tracking-[0.12em] text-gray-500 uppercase dark:text-gray-300">
          <RainbowText>Delivery Method</RainbowText>
        </h3>
        <div className="mt-3 inline-flex overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
          {(['email', 'sms'] as const).map((method) => (
            <button
              key={method}
              type="button"
              onClick={() => setDraftDeliveryMethod(method)}
              aria-pressed={draft.deliveryMethod === method}
              className={`px-5 py-2 text-xs font-bold tracking-wider uppercase transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white ${
                draft.deliveryMethod === method
                  ? 'settings-delivery-option--active'
                  : 'settings-delivery-option--inactive'
              }`}
            >
              {method}
            </button>
          ))}
        </div>
      </section>
    </>
  )
}//AlertPreferences

//AlertRule is one row with a threshold number input and enable toggle
function AlertRule({
  label,
  suffix,
  value,
  checked,
  min = 0,
  max,
  onCheckedChange,
  onValueChange,
}: {
  label: string
  suffix: string
  value: number
  checked: boolean
  min?: number
  max?: number
  onCheckedChange: (value: boolean) => void
  onValueChange: (value: number) => void
}) {
  return (
    <div className="flex items-center gap-3 py-2.5">
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-gray-800 dark:text-gray-100">{label}</p>
        <label className="mt-1 flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
          Alert at
          <input
            type="number"
            min={min}
            max={max}
            value={value}
            onChange={(event) => {
              const nextValue = Number(event.target.value)
              if (!Number.isFinite(nextValue)) return

              const constrainedValue = Math.max(
                min,
                max === undefined ? nextValue : Math.min(max, nextValue),
              )
              onValueChange(constrainedValue)
            }}
            className="w-14 rounded border border-gray-300 px-1.5 py-1 text-center text-xs text-gray-800 outline-none focus:border-hub-navy dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
          />
          {suffix}
        </label>
      </div>
      <Toggle label={label} hideLabel checked={checked} onChange={onCheckedChange} />
    </div>
  )
}//AlertRule
