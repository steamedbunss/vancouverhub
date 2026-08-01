//declaring a number input with custom increment and decrement controls
import type { ChangeEventHandler, InputHTMLAttributes } from 'react'

//declaring number stepper props while preserving standard number input behavior
interface NumberStepperProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'type' | 'value' | 'onChange' | 'className'
> {
  value: string | number
  onChange: ChangeEventHandler<HTMLInputElement>
  onIncrement: () => void
  onDecrement: () => void
  inputClassName?: string
}

//This function renders the upward SVG arrow supplied for increment controls
function IncrementArrow() {
  return (
    <svg viewBox="0 0 292.362 292.362" className="h-2.5 w-2.5" aria-hidden="true">
      <path
        fill="currentColor"
        d="M286.935 197.287L159.028 69.381c-3.613-3.617-7.895-5.424-12.847-5.424s-9.233 1.807-12.85 5.424L5.424 197.287C1.807 200.904 0 205.186 0 210.134s1.807 9.233 5.424 12.847c3.621 3.617 7.902 5.425 12.85 5.425h255.813c4.949 0 9.233-1.808 12.848-5.425 3.613-3.613 5.427-7.898 5.427-12.847s-1.814-9.23-5.427-12.847z"
      />
    </svg>
  )
}//IncrementArrow

//This function renders the downward SVG arrow supplied for decrement controls
function DecrementArrow() {
  return (
    <svg viewBox="0 0 292.362 292.362" className="h-2.5 w-2.5" aria-hidden="true">
      <path
        fill="currentColor"
        d="M286.935 69.377c-3.614-3.617-7.898-5.424-12.848-5.424H18.274c-4.952 0-9.233 1.807-12.85 5.424C1.807 72.998 0 77.279 0 82.228c0 4.948 1.807 9.229 5.424 12.847l127.907 127.907c3.621 3.617 7.902 5.428 12.85 5.428s9.233-1.811 12.847-5.428L286.935 95.074c3.613-3.617 5.427-7.898 5.427-12.847 0-4.948-1.814-9.229-5.427-12.85z"
      />
    </svg>
  )
}//DecrementArrow

//This function renders a number input with both custom arrows inside its bounds
export function NumberStepper({
  value,
  onChange,
  onIncrement,
  onDecrement,
  inputClassName = '',
  disabled = false,
  ...inputProps
}: NumberStepperProps) {
  return (
    <div className="relative inline-flex min-w-0 overflow-hidden">
      <input
        {...inputProps}
        type="number"
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={`number-stepper__input ${inputClassName}`}
      />
      <div className="absolute top-0 right-0 bottom-0 flex w-5 flex-col border-0 bg-transparent">
        <button
          type="button"
          aria-label="Increase value"
          disabled={disabled}
          onClick={onIncrement}
          className="flex min-h-0 flex-1 items-center justify-center border-0 bg-transparent text-gray-500 transition hover:bg-gray-100 hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-40 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white"
        >
          <IncrementArrow />
        </button>
        <button
          type="button"
          aria-label="Decrease value"
          disabled={disabled}
          onClick={onDecrement}
          className="flex min-h-0 flex-1 items-center justify-center border-0 bg-transparent text-gray-500 transition hover:bg-gray-100 hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-40 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white"
        >
          <DecrementArrow />
        </button>
      </div>
    </div>
  )
}//NumberStepper
