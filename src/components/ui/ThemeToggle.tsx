import { Moon, Sun } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useTheme } from '../../context/ThemeContext'

interface ThemeToggleProps {
  /** Compact icon control for the navbar. */
  variant?: 'navbar' | 'settings'
}

//ThemeToggle switches between light and dark mode in navbar or settings layouts
export function ThemeToggle({ variant = 'navbar' }: ThemeToggleProps) {
  const { theme, canChangeTheme, setTheme, isDark } = useTheme()

  //If variant is settings, render the full light/dark segmented control section
  if (variant === 'settings') {
    return (
      <section>
        <h3 className="text-[11px] font-semibold tracking-[0.15em] text-gray-500 uppercase dark:text-gray-300">
          Appearance
        </h3>
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          {canChangeTheme
            ? 'Choose light or dark mode for your account on this device.'
            : 'Sign in to switch between light and dark mode.'}
        </p>

        <div
          className={`mt-4 inline-flex overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700 ${
            canChangeTheme ? '' : 'opacity-60'
          }`}
          title={canChangeTheme ? undefined : 'Sign in to use dark mode'}
        >
          {(['light', 'dark'] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              disabled={!canChangeTheme}
              onClick={() => setTheme(mode)}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-bold tracking-wider uppercase transition ${
                theme === mode
                  ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900'
                  : 'bg-white text-gray-500 hover:bg-gray-50 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800'
              } disabled:cursor-not-allowed`}
            >
              {mode === 'light' ? (
                <Sun className="h-3.5 w-3.5" />
              ) : (
                <Moon className="h-3.5 w-3.5" />
              )}
              {mode}
            </button>
          ))}
        </div>

        {!canChangeTheme && (
          <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
            <Link to="/login" className="font-medium text-hub-navy underline dark:text-sky-300">
              Sign in
            </Link>{' '}
            to unlock dark mode.
          </p>
        )}
      </section>
    )
  }

  //Navbar variant renders a compact icon button that toggles light and dark
  return (
    <div className="relative group">
      <button
        type="button"
        aria-label={
          canChangeTheme
            ? isDark
              ? 'Switch to light mode'
              : 'Switch to dark mode'
            : 'Sign in to use dark mode'
        }
        aria-disabled={!canChangeTheme}
        disabled={!canChangeTheme}
        onClick={() => {
          if (!canChangeTheme) return
          setTheme(isDark ? 'light' : 'dark')
        }}
        title={canChangeTheme ? undefined : 'Sign in to use dark mode'}
        className={`rounded-lg p-2 transition ${
          canChangeTheme
            ? 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white'
            : 'cursor-not-allowed text-gray-300 dark:text-gray-600'
        }`}
      >
        {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
      </button>
      {!canChangeTheme && (
        <div className="pointer-events-none absolute top-full right-0 z-50 mt-2 hidden w-44 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs text-gray-600 shadow-lg group-hover:block group-focus-within:block dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300">
          Sign in to use dark mode
        </div>
      )}
    </div>
  )
}//ThemeToggle
