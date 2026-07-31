//declaring props for the reusable on/off switch control
interface ToggleProps {
  checked: boolean
  onChange: (checked: boolean) => void
  label: string
  id?: string
  hideLabel?: boolean
  disabled?: boolean
}

//Toggle renders an accessible switch button with an optional visible label
export function Toggle({
  checked,
  onChange,
  label,
  id,
  hideLabel = false,
  disabled = false,
}: ToggleProps) {
  //toggleId defaults to a slug derived from the label when id is not provided
  const toggleId = id ?? label.toLowerCase().replace(/\s+/g, '-')

  return (
    <label
      htmlFor={toggleId}
      className={`flex items-center justify-between gap-4 py-2 ${
        disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'
      }`}
    >
      {!hideLabel && (
        <span className="text-sm text-gray-800 dark:text-gray-200">{label}</span>
      )}
      <button
        id={toggleId}
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={hideLabel ? label : undefined}
        aria-disabled={disabled}
        disabled={disabled}
        onClick={() => {
          if (disabled) return
          onChange(!checked)
        }}
        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors duration-200 disabled:cursor-not-allowed ${
          checked ? 'bg-hub-navy' : 'bg-gray-200 dark:bg-gray-600'
        }`}
      >
        {/*Knob slides right when checked is true*/}
        <span
          className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform duration-200 ${
            checked ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
    </label>
  )
}//Toggle
