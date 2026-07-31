import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

//ProtectedRoute renders children only when the user has a valid auth token
export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { token, isLoading } = useAuth()
  const location = useLocation()

  //If auth is still loading, show a session check message
  if (isLoading) {
    return <p className="px-6 py-16 text-center text-sm text-gray-500">Checking your session…</p>
  }

  //If not signed in, redirect to login and remember the attempted path
  if (!token) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  return children
}//ProtectedRoute
