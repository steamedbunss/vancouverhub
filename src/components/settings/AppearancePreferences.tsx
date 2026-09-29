import { useUserConfig } from '../../context/UserConfigContext'
import { useAuth } from '../../context/AuthContext'
import type { GradientPreset } from '../../types'
import { RainbowText } from '../RainbowText'
import { DecryptedText } from '../DecryptedText'
import { Toggle } from '../ui/Toggle'

//constant list of gradient preset options for the appearance settings dropdown
const PRESETS: Array<{ id: GradientPreset; label: string }> = [
  { id: 'category', label: 'Category defaults' },
  { id: 'rainbow', label: 'Rainbow' },
  { id: 'green', label: 'Green' },
  { id: 'blue', label: 'Blue' },
  { id: 'yellow', label: 'Yellow' },
  { id: 'purple', label: 'Purple' },
  { id: 'sunset', label: 'Sunset' },
  { id: 'monochrome', label: 'Monochrome' },
  { id: 'custom', label: 'Custom' },
]

//constant color triplets for each built-in gradient preset used in the live preview
const PRESET_COLORS: Partial<Record<GradientPreset, [string, string, string]>> = {
  category: ['#39ff14', '#3b82f6', '#facc15'],
  rainbow: ['#ff3d81', '#ffe93d', '#3dcfff'],
  green: ['#39ff14', '#10f981', '#86efac'],
  blue: ['#22d3ee', '#3b82f6', '#60a5fa'],
  yellow: ['#faff00', '#facc15', '#f59e0b'],
  purple: ['#c084fc', '#a855f7', '#ec4899'],
  sunset: ['#ff3d81', '#ff8a3d', '#ffe93d'],
  monochrome: ['#ffffff', '#94a3b8', '#334155'],
}

//This custom menu keeps the selected value and each option readable in both themes.
interface GreetingAnimationOption {
  value: string
  label: string
}

function GreetingAnimationSelect({
  label,
  value,
  options,
  onChange,
  disabled = false,
}: {
  label: string
  value: string
  options: GreetingAnimationOption[]
  onChange: (value: string) => void
  disabled?: boolean
}) {
  const selectedOption = options.find((option) => option.value === value)

  return (
    <div className={`greeting-animation-select ${disabled ? 'opacity-50' : ''}`}>
      <span className="text-sm font-semibold">{label}</span>
      <details
        className="group relative mt-2"
        onKeyDown={(event) => {
          if (event.key === 'Escape') {
            event.currentTarget.open = false
            event.currentTarget.querySelector('summary')?.focus()
          }
        }}
      >
        <summary
          aria-label={`${label}: ${selectedOption?.label ?? value}`}
          aria-disabled={disabled}
          onClick={(event) => {
            if (disabled) event.preventDefault()
          }}
          className="flex cursor-pointer list-none items-center justify-between rounded-lg border border-gray-300 bg-white px-3 py-2 text-slate-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 dark:border-gray-600 dark:bg-gray-950 dark:text-white [&::-webkit-details-marker]:hidden"
        >
          <span>{selectedOption?.label ?? value}</span>
          <span aria-hidden="true" className="transition-transform group-open:rotate-180">⌄</span>
        </summary>
        <div role="listbox" aria-label={label} className="absolute top-full left-0 z-50 mt-1 w-full overflow-hidden rounded-lg border border-gray-300 bg-white py-1 text-slate-950 shadow-xl dark:border-gray-600 dark:bg-gray-900 dark:text-white">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              role="option"
              aria-selected={value === option.value}
              onClick={(event) => {
                onChange(option.value)
                const details = event.currentTarget.closest('details')
                if (details) details.open = false
              }}
              className={`block w-full px-3 py-2 text-left text-sm transition-colors ${
                value === option.value
                  ? 'bg-blue-100 font-semibold text-slate-950 dark:bg-blue-900 dark:text-white'
                  : 'text-slate-950 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-800'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </details>
    </div>
  )
}

//AppearancePreferences controls gradient, neon border, and weather overlay settings
export function AppearancePreferences() {
  const { draft, updateDraft } = useUserConfig()
  const { user } = useAuth()
  const appearance = draft.appearance
  const greetingAnimation = draft.greetingAnimation

  //updateAppearance merges partial appearance changes into the draft config
  const updateAppearance = (updates: Partial<typeof appearance>) => {
    updateDraft({ appearance: { ...appearance, ...updates } })
  }//updateAppearance

  //updateGreetingAnimation changes the live draft until the user saves Settings.
  const updateGreetingAnimation = (updates: Partial<typeof greetingAnimation>) => {
    updateDraft({ greetingAnimation: { ...greetingAnimation, ...updates } })
  }//updateGreetingAnimation

  //previewColors picks custom colors or the preset palette for the live preview
  const previewColors =
    appearance.gradientPreset === 'custom'
      ? appearance.gradientColors
      : PRESET_COLORS[appearance.gradientPreset] ?? appearance.gradientColors
  const previewStyle = {
    backgroundImage: `linear-gradient(${appearance.gradientDirection}deg, ${previewColors[0]}, ${previewColors[1]}, ${previewColors[2]}, ${previewColors[0]})`,
    animationDuration: `${appearance.gradientSpeed}s`,
  }

  return (
    <section data-onboarding-target="tour-settings-appearance" className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900/50">
      <h2 className="text-xl font-bold tracking-[0.12em] text-gray-500 uppercase dark:text-gray-400">
        <RainbowText>Colour effects</RainbowText>
      </h2>

      {/*Master toggles for gradients and neon card borders*/}
      <div className="mt-3 divide-y divide-gray-800">
        <Toggle
          checked={appearance.gradientsEnabled}
          onChange={(gradientsEnabled) => updateAppearance({ gradientsEnabled })}
          label="Gradient colours"
        />
        <Toggle
          checked={appearance.neonBordersEnabled}
          onChange={(neonBordersEnabled) => updateAppearance({ neonBordersEnabled })}
          label="Neon card borders"
        />
      </div>

      {/*Weather card overlay opacity slider*/}
      <div className="mt-4">
        <label className="block text-sm font-semibold" htmlFor="weather-overlay-opacity">
          Weather card overlay{' '}
          <span className="font-normal">{appearance.weatherOverlayOpacity}%</span>
        </label>
        <p className="mt-1 text-xs text-gray-400">
          Darkens the animated weather background so text stays readable.
        </p>
        <input
          id="weather-overlay-opacity"
          type="range"
          min="0"
          max="80"
          step="1"
          value={appearance.weatherOverlayOpacity}
          onChange={(event) =>
            updateAppearance({ weatherOverlayOpacity: Number(event.target.value) })
          }
          className="mt-2 w-full accent-red-500"
        />
      </div>

      {/*Gradient preset, custom colors, direction, speed, preview, and reset*/}
      <div className={appearance.gradientsEnabled ? 'mt-4' : 'mt-4 opacity-50'}>
        <label className="block text-sm font-semibold" htmlFor="gradient-preset">
          Gradient palette
        </label>
        <select
          id="gradient-preset"
          value={appearance.gradientPreset}
          disabled={!appearance.gradientsEnabled}
          onChange={(event) =>
            updateAppearance({ gradientPreset: event.target.value as GradientPreset })
          }
          className="mt-2 w-full rounded-lg border border-gray-600 bg-gray-950 px-3 py-2 text-sm text-white"
        >
          {PRESETS.map((preset) => (
            <option key={preset.id} value={preset.id}>{preset.label}</option>
          ))}
        </select>

        {appearance.gradientPreset === 'custom' && (
          <div className="mt-4">
            <span className="text-sm font-semibold">Custom colours</span>
            <div className="mt-2 flex gap-3">
              {appearance.gradientColors.map((color, index) => (
                <input
                  key={index}
                  type="color"
                  aria-label={`Gradient colour ${index + 1}`}
                  value={color}
                  disabled={!appearance.gradientsEnabled}
                  onChange={(event) => {
                    const colors = [...appearance.gradientColors] as [string, string, string]
                    colors[index] = event.target.value
                    updateAppearance({ gradientColors: colors })
                  }}
                  className="h-10 min-w-0 flex-1 cursor-pointer rounded border border-gray-600 bg-transparent p-1"
                />
              ))}
            </div>
          </div>
        )}

        <label className="mt-4 block text-sm font-semibold" htmlFor="gradient-direction">
          Direction <span className="font-normal">{appearance.gradientDirection}°</span>
        </label>
        <input
          id="gradient-direction"
          type="range"
          min="0"
          max="360"
          step="15"
          value={appearance.gradientDirection}
          disabled={!appearance.gradientsEnabled}
          onChange={(event) => updateAppearance({ gradientDirection: Number(event.target.value) })}
          className="mt-2 w-full accent-red-500"
        />

        <label className="mt-3 block text-sm font-semibold" htmlFor="gradient-speed">
          Animation speed <span className="font-normal">{appearance.gradientSpeed.toFixed(1)}s</span>
        </label>
        <input
          id="gradient-speed"
          type="range"
          min="1"
          max="10"
          step="0.5"
          value={appearance.gradientSpeed}
          disabled={!appearance.gradientsEnabled}
          onChange={(event) => updateAppearance({ gradientSpeed: Number(event.target.value) })}
          className="mt-2 w-full accent-red-500"
        />

        <div
          className="mt-4 rounded-xl border border-gray-700 bg-gray-950 p-4 text-center"
          aria-label="Gradient preview"
        >
          <span
            className="appearance-gradient-preview inline-block bg-clip-text text-2xl font-black text-transparent"
            style={previewStyle}
          >
            Gradient preview
          </span>
        </div>

        <button
          type="button"
          onClick={() =>
            updateAppearance({
              gradientsEnabled: true,
              gradientPreset: 'category',
              gradientColors: ['#ff3d81', '#3dcfff', '#a83dff'],
              gradientDirection: 90,
              gradientSpeed: 2,
            })
          }
          className="mt-3 text-sm font-semibold underline underline-offset-4 hover:opacity-75"
        >
          Reset gradient
        </button>
      </div>

      <details className="group mt-8 border-t border-gray-200 pt-6 dark:border-gray-700">
        <summary className="flex cursor-pointer list-none items-start justify-between gap-4 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-600">
          <span>
            <span className="text-lg font-bold tracking-tight">Dashboard greeting animation</span>
            <span className="mt-1 block text-sm text-gray-600 dark:text-gray-300">
              Customize how your signed-in dashboard greeting reveals itself.
            </span>
          </span>
          <span aria-hidden="true" className="mt-1 text-xl transition-transform group-open:rotate-180">⌄</span>
        </summary>
        <div className="mt-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <GreetingAnimationSelect
            label="Animate on"
            value={greetingAnimation.animateOn}
            options={[
              { value: 'view', label: 'View' },
              { value: 'hover', label: 'Hover' },
              { value: 'click', label: 'Click' },
            ]}
            onChange={(animateOn) => updateGreetingAnimation({ animateOn: animateOn as typeof greetingAnimation.animateOn })}
          />

          <GreetingAnimationSelect
            label="Click mode"
            value={greetingAnimation.clickMode}
            disabled={greetingAnimation.animateOn !== 'click'}
            options={[
              { value: 'once', label: 'Once' },
              { value: 'toggle', label: 'Toggle' },
            ]}
            onChange={(clickMode) => updateGreetingAnimation({ clickMode: clickMode as typeof greetingAnimation.clickMode })}
          />

          <GreetingAnimationSelect
            label="Direction"
            value={greetingAnimation.revealDirection}
            options={[
              { value: 'start', label: 'Start' },
              { value: 'end', label: 'End' },
              { value: 'center', label: 'Center' },
            ]}
            onChange={(revealDirection) => updateGreetingAnimation({ revealDirection: revealDirection as typeof greetingAnimation.revealDirection })}
          />

          <div>
            <label className="flex items-center justify-between text-sm font-semibold" htmlFor="greeting-speed">
              Speed <span className="font-normal">{greetingAnimation.speed} ms</span>
            </label>
            <input
              id="greeting-speed"
              type="range"
              min="20"
              max="200"
              step="10"
              value={greetingAnimation.speed}
              onChange={(event) => updateGreetingAnimation({ speed: Number(event.target.value) })}
              className="mt-3 w-full accent-red-500"
            />
          </div>

          <div>
            <label className="flex items-center justify-between text-sm font-semibold" htmlFor="greeting-iterations">
              Iterations <span className="font-normal">{greetingAnimation.maxIterations}</span>
            </label>
            <input
              id="greeting-iterations"
              type="range"
              min="1"
              max="50"
              step="1"
              value={greetingAnimation.maxIterations}
              onChange={(event) => updateGreetingAnimation({ maxIterations: Number(event.target.value) })}
              className="mt-3 w-full accent-red-500"
            />
          </div>

          {greetingAnimation.animateOn === 'view' && (
            <div>
              <label className="flex items-center justify-between text-sm font-semibold" htmlFor="greeting-repeat-interval">
                Repeat every <span className="font-normal">{greetingAnimation.repeatIntervalSeconds} sec</span>
              </label>
              <input
                id="greeting-repeat-interval"
                type="range"
                min="1"
                max="60"
                step="1"
                value={greetingAnimation.repeatIntervalSeconds}
                onChange={(event) => updateGreetingAnimation({ repeatIntervalSeconds: Number(event.target.value) })}
                className="mt-3 w-full accent-red-500"
              />
            </div>
          )}
        </div>

        <div className="mt-2 divide-y divide-gray-200 dark:divide-gray-700">
          <Toggle
            checked={greetingAnimation.sequential}
            onChange={(sequential) => updateGreetingAnimation({ sequential })}
            label="Sequential reveal"
          />
          <Toggle
            checked={greetingAnimation.useOriginalCharsOnly}
            onChange={(useOriginalCharsOnly) => updateGreetingAnimation({ useOriginalCharsOnly })}
            label="Use original characters"
          />
        </div>

        <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-center dark:border-gray-700 dark:bg-gray-950">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Live preview</p>
          <span className="rainbow-text text-2xl font-black">
            <DecryptedText
              key={JSON.stringify(greetingAnimation)}
              text={`Greetings, ${user?.username ?? 'Guest'}!`}
              {...greetingAnimation}
              className="rainbow-text-face animate-rainbow-flow"
            />
          </span>
        </div>
        </div>
      </details>
    </section>
  )
}//AppearancePreferences
