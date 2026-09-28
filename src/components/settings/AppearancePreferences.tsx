import { useUserConfig } from '../../context/UserConfigContext'
import type { GradientPreset } from '../../types'
import { RainbowText } from '../RainbowText'
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

//AppearancePreferences controls gradient, neon border, and weather overlay settings
export function AppearancePreferences() {
  const { draft, updateDraft } = useUserConfig()
  const appearance = draft.appearance

  //updateAppearance merges partial appearance changes into the draft config
  const updateAppearance = (updates: Partial<typeof appearance>) => {
    updateDraft({ appearance: { ...appearance, ...updates } })
  }//updateAppearance

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
    </section>
  )
}//AppearancePreferences
