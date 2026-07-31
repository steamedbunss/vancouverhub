import { Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

//constant localStorage key used when a guest chooses to browse without signing in
export const GUEST_ACCESS_STORAGE_KEY = 'vancouver-hub-guest-access'

//LandingRedirect sends users to dashboard, login, or waits while auth loads
export function LandingRedirect() {
  const { token, isLoading } = useAuth()
  const hasChosenGuestAccess = localStorage.getItem(GUEST_ACCESS_STORAGE_KEY) === 'true'

  //If auth is still loading, show a short loading message
  if (isLoading) {
    return <p className="px-6 py-16 text-center text-sm text-gray-500">Loading Vancouver Hub…</p>
  }

  //If signed in or guest access was chosen, go to dashboard; otherwise go to login
  return <Navigate to={token || hasChosenGuestAccess ? '/dashboard' : '/login'} replace />
}//LandingRedirect
