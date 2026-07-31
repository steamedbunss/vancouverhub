import { Outlet, useLocation } from 'react-router-dom'
import { AlertsProvider } from '../../context/AlertsContext'
import { LocationProvider } from '../../context/LocationContext'
import { ServiceRequestPreferencesProvider } from '../../context/ServiceRequestPreferencesContext'
import { Navbar } from './Navbar'

//Layout wraps every page with providers, the navbar, and the routed main content
export function Layout() {
  const { pathname } = useLocation()
  //isDashboard is true on the dashboard route which uses a fixed viewport height
  const isDashboard = pathname === '/dashboard'

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
