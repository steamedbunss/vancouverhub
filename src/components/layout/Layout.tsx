import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { AlertsProvider } from '../../context/AlertsContext'
import { LocationProvider } from '../../context/LocationContext'
import { ServiceRequestPreferencesProvider } from '../../context/ServiceRequestPreferencesContext'
import { Navbar } from './Navbar'

//Layout wraps every page with providers, the navbar, and the routed main content
export function Layout() {
  const { pathname } = useLocation()
  //isDashboard is true on the root route which uses a fixed viewport height
  const isDashboard = pathname === '/'

  //Show each page or nested scrollbar only while that surface is actively scrolling.
  useEffect(() => {
    const timers = new Map<Element, number>()

    function handleScroll(event: Event) {
      const surface = event.target instanceof Element
        ? event.target
        : document.documentElement

      surface.classList.add('is-scrolling')
      const currentTimer = timers.get(surface)
      if (currentTimer !== undefined) window.clearTimeout(currentTimer)
      timers.set(
        surface,
        window.setTimeout(() => {
          surface.classList.remove('is-scrolling')
          timers.delete(surface)
        }, 700),
      )
    }

    document.addEventListener('scroll', handleScroll, { capture: true, passive: true })
    return () => {
      document.removeEventListener('scroll', handleScroll, true)
      timers.forEach((timer) => window.clearTimeout(timer))
      timers.forEach((_, surface) => surface.classList.remove('is-scrolling'))
    }
  }, [])

  return (
    <div
      className={
        isDashboard
          ? 'h-[100svh] overflow-hidden bg-white dark:bg-gray-950'
          : 'min-h-screen bg-white dark:bg-gray-950'
      }
    >
      <LocationProvider>
        <ServiceRequestPreferencesProvider>
          <AlertsProvider>
            <Navbar />
            <main className={isDashboard ? 'h-[calc(100svh-4rem)] overflow-hidden' : undefined}>
              <Outlet />
            </main>
          </AlertsProvider>
        </ServiceRequestPreferencesProvider>
      </LocationProvider>
    </div>
  )
}//Layout
