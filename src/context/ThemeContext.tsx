//declaring react context hooks and theme storage helpers
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { useAuth } from './AuthContext'

//declaring light or dark theme mode
export type ThemeMode = 'light' | 'dark'

//declaring theme context value shape exposed to consuming components
interface ThemeContextValue {
  theme: ThemeMode
  isDark: boolean
  canChangeTheme: boolean
  setTheme: (theme: ThemeMode) => void
  toggleTheme: () => void
}

//declaring localStorage key for persisted theme preference
const STORAGE_KEY = 'around-van-theme'

//declaring theme context instance
const ThemeContext = createContext<ThemeContextValue | null>(null)

//This function reads the saved theme from localStorage, defaulting to light
function readStoredTheme(): ThemeMode {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored === 'dark' ? 'dark' : 'light'
  } catch {
    return 'light'
  }
}//readStoredTheme

//This function toggles the dark class on the document root element
function applyThemeClass(theme: ThemeMode) {
  document.documentElement.classList.toggle('dark', theme === 'dark')
}//applyThemeClass

//This function provides theme state; guests are locked to light mode
export function ThemeProvider({ children }: { children: ReactNode }) {
  const { token } = useAuth()
  const canChangeTheme = Boolean(token)
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    if (typeof window === 'undefined') return 'light'
    //Guests always start light; signed-in users may restore preference.
    return getStoredTokenPresent() ? readStoredTheme() : 'light'
  })

  useEffect(() => {
    if (!canChangeTheme) {
      setThemeState('light')
      applyThemeClass('light')
      return
    }

    const preferred = readStoredTheme()
    setThemeState(preferred)
    applyThemeClass(preferred)
  }, [canChangeTheme])

  useEffect(() => {
    applyThemeClass(theme)
  }, [theme])

  const setTheme = useCallback(
    (next: ThemeMode) => {
      if (!canChangeTheme) return
      setThemeState(next)
      try {
        localStorage.setItem(STORAGE_KEY, next)
      } catch {
        // ignore storage failures
      }
      applyThemeClass(next)
    },
    [canChangeTheme],
  )//setTheme

  const toggleTheme = useCallback(() => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }, [setTheme, theme])//toggleTheme

  const value = useMemo(
    () => ({
      theme,
      isDark: theme === 'dark',
      canChangeTheme,
      setTheme,
      toggleTheme,
    }),
    [theme, canChangeTheme, setTheme, toggleTheme],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}//ThemeProvider

//This function checks sessionStorage for an auth token without importing AuthContext
function getStoredTokenPresent() {
  try {
    return Boolean(sessionStorage.getItem('around-van-token'))
  } catch {
    return false
  }
}//getStoredTokenPresent

//This function returns theme context; throws if used outside ThemeProvider
export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider')
  }
  return context
}//useTheme
