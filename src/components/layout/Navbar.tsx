import { useRef, useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { Bell, ChevronDown, LogOut, MapPin, Settings } from 'lucide-react'
import { useUserConfig } from '../../context/UserConfigContext'
import { useAuth } from '../../context/AuthContext'
import { useResolvedLocation } from '../../context/LocationContext'
import { useAlerts } from '../../context/AlertsContext'
import { ALL_CATEGORY_IDS, CATEGORIES } from '../../constants/categories'
import type { CategoryId } from '../../types'
import { ThemeToggle } from '../ui/ThemeToggle'
import { AlertsPanel } from './AlertsPanel'

//desktopNavLabel shortens the local-events label for the desktop navbar
function desktopNavLabel(categoryId: CategoryId) {
  return categoryId === 'local-events' ? 'Events' : CATEGORIES[categoryId].label
}//desktopNavLabel

//Navbar is the sticky site header with category tabs, location, alerts, and account menu
export function Navbar() {
  const { visibleNavCategories } = useUserConfig()
  const { token, user, logout } = useAuth()
  const resolvedLocation = useResolvedLocation()
  const { activeAlerts } = useAlerts()
  //declaring state for whether the alerts dropdown is open
  const [alertsOpen, setAlertsOpen] = useState(false)
  //declaring state for whether the account dropdown is open
  const [accountOpen, setAccountOpen] = useState(false)
  //alertsCloseTimer delays closing the alerts panel so the user can move the mouse into it
  const alertsCloseTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  //accountCloseTimer delays closing the account menu on mouse leave
  const accountCloseTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const accountName = token ? user?.username ?? 'Account' : 'Guest'
  //accountInitials builds up to two initials from the display name, or G for guest
  const accountInitials = token
    ? accountName
        .split(' ')
        .map((part) => part[0])
        .join('')
        .slice(0, 2)
    : 'G'

  const hasActiveAlerts = activeAlerts.length > 0

  const neighbourhoodLabel = !resolvedLocation
    ? 'Locating…'
    : resolvedLocation.neighbourhood ?? 'Location unavailable'

  return (
    <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/95 backdrop-blur-sm dark:border-gray-800 dark:bg-gray-950/95">
      <div data-onboarding-target="tour-navigation" className="flex h-16 w-full items-center justify-center px-4 sm:px-6">
        <div className="flex w-fit max-w-full items-center gap-3 sm:gap-5 lg:gap-8">
          {/*Logo link back to the home page*/}
          <Link to="/" className="flex shrink-0 items-center gap-2 sm:gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-hub-navy text-sm font-bold text-white">
              VH
            </div>
            <span className="hidden text-lg font-bold tracking-tight text-gray-900 sm:inline dark:text-white">
              Vancouver Hub
            </span>
          </Link>

          {/*Desktop category navigation with invisible width anchor for stable layout*/}
          <nav
            className="hidden lg:block"
            aria-label="Category navigation"
          >
            {/*Invisible full set keeps min width equal to all 7 categories enabled.*/}
            <div className="relative w-max max-w-[min(52vw,40rem)] xl:max-w-[min(58vw,48rem)]">
              <div
                className="invisible flex gap-4 xl:gap-5"
                aria-hidden="true"
              >
                {ALL_CATEGORY_IDS.map((categoryId) => (
                  <span
                    key={categoryId}
                    className="shrink-0 whitespace-nowrap text-sm font-medium"
                  >
                    {desktopNavLabel(categoryId)}
                  </span>
                ))}
              </div>
              <div className="nav-tabs-scroll absolute inset-0 flex items-center justify-center gap-4 overflow-x-auto xl:gap-5">
                {visibleNavCategories.map((categoryId) => (
                  <NavLink
                    key={categoryId}
                    to={CATEGORIES[categoryId].path}
                    className={({ isActive }) =>
                      `shrink-0 whitespace-nowrap text-sm font-medium transition-colors ${
                        isActive
                          ? 'text-hub-navy dark:text-white'
                          : 'text-gray-600 hover:text-gray-900 dark:text-gray-200 dark:hover:text-white'
                      }`
                    }
                  >
                    {desktopNavLabel(categoryId)}
                  </NavLink>
                ))}
              </div>
            </div>
          </nav>

          {/*Right-side controls: location pill, theme, alerts, and account menu*/}
          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <div className="hidden w-[11rem] items-center gap-1.5 rounded-full border border-gray-200 bg-gray-50 px-3 py-1.5 md:flex dark:border-gray-700 dark:bg-gray-900">
              <MapPin className="h-3.5 w-3.5 shrink-0 text-gray-500 dark:text-gray-400" />
              <span className="min-w-0 flex-1 truncate text-xs font-medium text-gray-700 dark:text-gray-300">
                {neighbourhoodLabel}
              </span>
            </div>

            <ThemeToggle variant="navbar" />

            {/*Alerts bell with hover-delayed dropdown panel*/}
            <div
              className="relative"
              onMouseEnter={() => {
                if (alertsCloseTimer.current) {
                  clearTimeout(alertsCloseTimer.current)
                  alertsCloseTimer.current = null
                }
              }}
              onMouseLeave={() => {
                if (alertsCloseTimer.current) clearTimeout(alertsCloseTimer.current)
                alertsCloseTimer.current = setTimeout(() => {
                  setAlertsOpen(false)
                  alertsCloseTimer.current = null
                }, 1000)
              }}
            >
              <button
                type="button"
                aria-label="View alerts"
                aria-expanded={alertsOpen}
                onClick={() => {
                  if (alertsCloseTimer.current) {
                    clearTimeout(alertsCloseTimer.current)
                    alertsCloseTimer.current = null
                  }
                  setAlertsOpen((open) => !open)
                }}
                className="relative rounded-lg p-2 text-gray-600 transition hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white"
              >
                <Bell className="h-5 w-5" />
                {hasActiveAlerts && (
                  <span className="animate-bell-pulse absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500" />
                )}
              </button>
              {alertsOpen && (
                <AlertsPanel
                  onClose={() => {
                    if (alertsCloseTimer.current) {
                      clearTimeout(alertsCloseTimer.current)
                      alertsCloseTimer.current = null
                    }
                    setAlertsOpen(false)
                  }}
                />
              )}
            </div>

            {/*Account menu with settings, sign out, or login/register links*/}
            <div
              className="relative"
              onMouseEnter={() => {
                if (accountCloseTimer.current) {
                  clearTimeout(accountCloseTimer.current)
                  accountCloseTimer.current = null
                }
              }}
              onMouseLeave={() => {
                accountCloseTimer.current = setTimeout(() => {
                  setAccountOpen(false)
                  accountCloseTimer.current = null
                }, 1000)
              }}
            >
              <button
                type="button"
                onClick={() => setAccountOpen((open) => !open)}
                aria-expanded={accountOpen}
                aria-haspopup="menu"
                className="flex w-[7.25rem] items-center gap-2 rounded-lg px-2 py-1.5 transition hover:bg-gray-100 sm:w-[8.5rem] dark:hover:bg-gray-800"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-200 text-xs font-semibold text-gray-700 dark:bg-gray-700 dark:text-gray-200">
                  {accountInitials}
                </span>
                <span className="hidden min-w-0 flex-1 truncate text-left text-sm font-medium text-gray-800 sm:inline dark:text-gray-200">
                  {accountName}
                </span>
                <ChevronDown
                  className={`hidden h-4 w-4 shrink-0 text-gray-500 transition sm:block dark:text-gray-400 ${
                    accountOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {accountOpen && (
                <div
                  role="menu"
                  className="absolute right-0 mt-2 w-48 rounded-xl border border-gray-200 bg-white p-1.5 shadow-lg dark:border-gray-700 dark:bg-gray-900"
                >
                  <Link
                    to="/settings"
                    role="menuitem"
                    onClick={() => setAccountOpen(false)}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800"
                  >
                    <Settings className="h-4 w-4" />
                    Settings
                  </Link>
                  {token ? (
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        logout()
                        setAccountOpen(false)
                      }}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium text-gray-700 transition hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign out
                    </button>
                  ) : (
                    <>
                      <p className="px-3 py-2 text-xs text-gray-500 dark:text-gray-400">
                        Sign in to personalize Vancouver Hub.
                      </p>
                      <Link
                        to="/login"
                        role="menuitem"
                        onClick={() => setAccountOpen(false)}
                        className="block rounded-lg px-3 py-2 text-sm font-semibold text-hub-navy transition hover:bg-gray-100 dark:text-sky-300 dark:hover:bg-gray-800"
                      >
                        Log in
                      </Link>
                      <Link
                        to="/register"
                        role="menuitem"
                        onClick={() => setAccountOpen(false)}
                        className="block rounded-lg px-3 py-2 text-sm font-semibold text-hub-navy transition hover:bg-gray-100 dark:text-sky-300 dark:hover:bg-gray-800"
                      >
                        Register
                      </Link>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/*Mobile category navigation below the main header row*/}
      <nav
        className="flex justify-center border-t border-gray-100 px-4 py-2 sm:px-6 lg:hidden dark:border-gray-800"
        aria-label="Category navigation mobile"
      >
        <div className="relative w-max max-w-full">
          <div className="invisible flex gap-4" aria-hidden="true">
            {ALL_CATEGORY_IDS.map((categoryId) => (
              <span
                key={categoryId}
                className="shrink-0 whitespace-nowrap text-xs font-medium"
              >
                {CATEGORIES[categoryId].shortLabel}
              </span>
            ))}
          </div>
          <div className="nav-tabs-scroll absolute inset-0 flex items-center justify-center gap-4 overflow-x-auto">
            {visibleNavCategories.map((categoryId) => (
              <NavLink
                key={categoryId}
                to={CATEGORIES[categoryId].path}
                className={({ isActive }) =>
                  `shrink-0 whitespace-nowrap text-xs font-medium ${
                    isActive
                      ? 'text-hub-navy dark:text-white'
                      : 'text-gray-600 dark:text-gray-200'
                  }`
                }
              >
                {CATEGORIES[categoryId].shortLabel}
              </NavLink>
            ))}
          </div>
        </div>
      </nav>
    </header>
  )
}//Navbar
