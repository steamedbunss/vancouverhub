import { Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { DashboardPage } from '../../pages/DashboardPage'

//constant localStorage key used when a guest chooses to browse without signing in
export const GUEST_ACCESS_STORAGE_KEY = 'vancouver-hub-guest-access'

//LandingRedirect sends new visitors to registration and renders the dashboard after access is chosen
export function LandingRedirect() {
  const { token, isLoading } = useAuth()
  const hasChosenGuestAccess = localStorage.getItem(GUEST_ACCESS_STORAGE_KEY) === 'true'

  //If auth is still loading, show a short loading message
  if (isLoading) {
    return <p className="px-6 py-16 text-center text-sm text-gray-500">Loading Vancouver Hub…</p>
  }

  //If signed in or guest access was chosen, render the dashboard; otherwise send visitors to registration
  return token || hasChosenGuestAccess
    ? <DashboardPage />
    : <Navigate to="/register" replace />
}//LandingRedirect
