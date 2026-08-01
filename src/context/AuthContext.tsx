//declaring react context hooks and auth API helpers
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { confirmEmail, getCurrentUser, login, register } from '../lib/api/auth'
import { clearStoredToken, getStoredToken, storeToken } from '../lib/api/client'
import { setFuelPreference, setHomeLocation } from '../lib/api/users'
import type {
  ApiFuelType,
  ApiUser,
  HomeLocationInput,
  LoginCredentials,
  MessageResponse,
  RegisterCredentials,
} from '../types/backend'

//declaring auth context value shape exposed to consuming components
interface AuthContextValue {
  token: string | null
  user: ApiUser | null
  isLoading: boolean
  loginWithCredentials: (credentials: LoginCredentials) => Promise<void>
  registerWithCredentials: (credentials: RegisterCredentials) => Promise<MessageResponse>
  confirmEmailAndSignIn: (token: string) => Promise<void>
  refreshUser: () => Promise<void>
  saveHomeLocation: (location: HomeLocationInput) => Promise<void>
  saveFuelPreference: (fuelType: ApiFuelType) => Promise<void>
  logout: () => void
}

//declaring auth context instance
const AuthContext = createContext<AuthContextValue | null>(null)

//This function provides authentication state and actions to the app tree
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(() => getStoredToken())
  const [user, setUser] = useState<ApiUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  //This function clears the stored token and resets auth state on logout
  const logout = useCallback(() => {
    clearStoredToken()
    setToken(null)
    setUser(null)
  }, [])//logout

  //This function re-fetches the current user from the backend using the stored token
  const refreshUser = useCallback(async () => {
    const savedToken = getStoredToken()
    if (!savedToken) {
      setToken(null)
      setUser(null)
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    try {
      const currentUser = await getCurrentUser(savedToken)
      setToken(savedToken)
      setUser(currentUser)
    } catch {
      logout()
    } finally {
      setIsLoading(false)
    }
  }, [logout])//refreshUser

  useEffect(() => {
    void refreshUser()
  }, [refreshUser])

  //This function stores the token and loads the user profile after login or confirmation
  const completeAuthentication = useCallback(async (newToken: string) => {
    storeToken(newToken)
    setToken(newToken)
    const currentUser = await getCurrentUser(newToken)
    setUser(currentUser)
  }, [])//completeAuthentication

  const loginWithCredentials = useCallback(async (credentials: LoginCredentials) => {
    const response = await login(credentials)
    await completeAuthentication(response.token)
  }, [completeAuthentication])//loginWithCredentials

  const registerWithCredentials = useCallback(
    (credentials: RegisterCredentials) => register(credentials),
    [],
  )//registerWithCredentials

  const confirmEmailAndSignIn = useCallback(async (confirmationToken: string) => {
    const response = await confirmEmail(confirmationToken)
    await completeAuthentication(response.token)
  }, [completeAuthentication])//confirmEmailAndSignIn

  const saveHomeLocation = useCallback(async (location: HomeLocationInput) => {
    if (!token) throw new Error('Sign in before saving a home location.')
    const updatedUser = await setHomeLocation(location, token)
    setUser(updatedUser)
  }, [token])//saveHomeLocation

  const saveFuelPreference = useCallback(async (fuelType: ApiFuelType) => {
    if (!token) throw new Error('Sign in before saving a fuel preference.')
    const updatedUser = await setFuelPreference(fuelType, token)
    setUser(updatedUser)
  }, [token])//saveFuelPreference

  const value = useMemo(() => ({
    token,
    user,
    isLoading,
    loginWithCredentials,
    registerWithCredentials,
    confirmEmailAndSignIn,
    refreshUser,
    saveHomeLocation,
    saveFuelPreference,
    logout,
  }), [
    token,
    user,
    isLoading,
    loginWithCredentials,
    registerWithCredentials,
    confirmEmailAndSignIn,
    refreshUser,
    saveHomeLocation,
    saveFuelPreference,
    logout,
  ])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}//AuthProvider

//This function returns auth context; throws if used outside AuthProvider
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used inside AuthProvider.')
  return context
}//useAuth
