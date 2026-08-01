//AuthPage.tsx handles login, registration, and guest access for Vancouver Hub
import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { LockKeyhole, Mail, UserRound } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { GUEST_ACCESS_STORAGE_KEY } from '../components/auth/LandingRedirect'
import { resendConfirmation } from '../lib/api/auth'
import { ApiError } from '../lib/api/client'

//props for AuthPage; mode switches between login and register layouts
interface AuthPageProps {
  mode: 'login' | 'register'
}

export function AuthPage({ mode }: AuthPageProps) {
  const { loginWithCredentials, registerWithCredentials } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [registrationSubmitted, setRegistrationSubmitted] = useState(false)
  const [registrationMessage, setRegistrationMessage] = useState<string | null>(null)
  const [resendMessage, setResendMessage] = useState<string | null>(null)
  const [isResending, setIsResending] = useState(false)
  const [showResendLink, setShowResendLink] = useState(false)
  const isLogin = mode === 'login'
  const destination = (location.state as { from?: string } | null)?.from ?? '/dashboard'

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setShowResendLink(false)
    setIsSubmitting(true)
    try {
      if (isLogin) {
        await loginWithCredentials({ username, password })
        navigate(destination, { replace: true })
      } else {
        const response = await registerWithCredentials({ username, email, password })
        setRegistrationMessage(response.message)
        setRegistrationSubmitted(true)
      }
    } catch (caughtError) {
      if (isLogin && caughtError instanceof ApiError && caughtError.status === 403) {
        setError('Please confirm your email before signing in.')
        setShowResendLink(true)
      } else {
        setError(caughtError instanceof Error ? caughtError.message : 'Unable to continue. Please try again.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }//handleSubmit

  async function handleResendConfirmation() {
    setResendMessage(null)
    setIsResending(true)
    try {
      await resendConfirmation(email)
      setResendMessage('If an account requires email confirmation, check your inbox.')
    } catch (caughtError) {
      setResendMessage(caughtError instanceof Error ? caughtError.message : 'Unable to resend confirmation email.')
    } finally {
      setIsResending(false)
    }
  }//handleResendConfirmation

  function continueAsGuest() {
    localStorage.setItem(GUEST_ACCESS_STORAGE_KEY, 'true')
    navigate('/dashboard', { replace: true })
  }//continueAsGuest

  if (!isLogin && registrationSubmitted) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-white px-6 py-12">
        <div className="auth-card auth-card-register flex min-h-[620px] w-full max-w-md flex-col rounded-2xl border border-slate-900 bg-white p-8 shadow-[0_16px_40px_rgba(15,23,42,0.10)] sm:p-10">
          <Link to="/dashboard" className="text-sm font-semibold text-slate-800 hover:underline">
            Vancouver Hub
          </Link>
          <h1 className="mt-8 text-center text-4xl font-bold tracking-tight text-slate-950">
            Check your email
          </h1>
          <p className="mt-3 text-center text-sm leading-6 text-slate-600">
            Check your email to activate your account.
          </p>
          {registrationMessage && (
            <p className="mt-4 text-center text-sm text-slate-700">{registrationMessage}</p>
          )}
          <p className="mt-4 text-center text-sm text-slate-700">
            We sent a confirmation link to <span className="font-semibold">{email}</span>.
          </p>
          <button
            type="button"
            disabled={isResending}
            onClick={() => void handleResendConfirmation()}
            className="mt-7 w-full rounded-lg bg-slate-950 px-4 py-3 text-base font-semibold text-white transition hover:bg-slate-800 disabled:cursor-wait disabled:opacity-60"
          >
            {isResending ? 'Sending…' : 'Resend confirmation email'}
          </button>
          {resendMessage && (
            <p role="status" className="mt-4 rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-700">
              {resendMessage}
            </p>
          )}
          <p className="mt-7 text-center text-sm text-slate-700">
            Already confirmed?{' '}
            <Link to="/login" className="font-semibold text-hub-navy hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </main>
    )
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-white px-6 py-12">
      <div className={`auth-card auth-card-${mode} flex min-h-[620px] w-full max-w-md flex-col rounded-2xl border border-slate-900 bg-white p-8 shadow-[0_16px_40px_rgba(15,23,42,0.10)] sm:p-10`}>
        <Link to="/dashboard" className="text-sm font-semibold text-slate-800 hover:underline">
          Vancouver Hub
        </Link>
        <h1 className="mt-8 text-center text-4xl font-bold tracking-tight text-slate-950">
          {isLogin ? 'Login' : 'Register'}
        </h1>
        <p className="mt-3 text-center text-sm leading-6 text-slate-600">
          {isLogin ? 'Sign in to personalize your Vancouver Hub.' : 'Create an account to personalize your Vancouver Hub.'}
        </p>

        <form className="mt-7 space-y-4" onSubmit={handleSubmit}>
          <div className="min-h-[164px] space-y-4">
            <label className="relative block border-b-2 border-slate-900 pb-2 text-sm font-medium text-slate-800">
              <span className="sr-only">Username</span>
              <input
                required
                type="text"
                autoComplete="username"
                placeholder="Username"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                className="w-full pr-8 text-base outline-none placeholder:text-slate-500"
              />
              <UserRound aria-hidden="true" className="absolute right-0 bottom-2 h-5 w-5 text-slate-800" />
            </label>
            {!isLogin && (
              <label className="relative block border-b-2 border-slate-900 pb-2 text-sm font-medium text-slate-800">
                <span className="sr-only">Email</span>
                <input
                  required
                  type="email"
                  autoComplete="email"
                  placeholder="Email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="w-full pr-8 text-base outline-none placeholder:text-slate-500"
                />
                <Mail aria-hidden="true" className="absolute right-0 bottom-2 h-5 w-5 text-slate-800" />
              </label>
            )}
            <label className="relative block border-b-2 border-slate-900 pb-2 text-sm font-medium text-slate-800">
              <span className="sr-only">Password</span>
              <input
                required
                {...(!isLogin ? { minLength: 8 } : {})}
                type="password"
                autoComplete={isLogin ? 'current-password' : 'new-password'}
                placeholder="Password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full pr-8 text-base outline-none placeholder:text-slate-500"
              />
              <LockKeyhole aria-hidden="true" className="absolute right-0 bottom-2 h-5 w-5 text-slate-800" />
            </label>
          </div>

          {error && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

          {showResendLink && (
            <p className="text-center text-sm text-slate-700">
              <Link to="/resend-confirmation" className="font-semibold text-hub-navy hover:underline">
                Resend confirmation email
              </Link>
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-lg bg-slate-950 px-4 py-3 text-base font-semibold text-white transition hover:bg-slate-800 disabled:cursor-wait disabled:opacity-60"
          >
            {isSubmitting ? 'Connecting…' : isLogin ? 'Sign in' : 'Create account'}
          </button>

        </form>

        <p className="mt-7 text-center text-sm text-slate-700">
          {isLogin ? 'Register to start your journey.' : 'Already have an account?'}{' '}
          <Link to={isLogin ? '/register' : '/login'} className="font-semibold text-hub-navy hover:underline">
            {isLogin ? 'Register' : 'Sign in'}
          </Link>
        </p>
        {isLogin && (
          <p className="mt-3 text-center text-sm text-slate-700">
            <Link to="/forgot-password" className="font-semibold text-hub-navy hover:underline">
              Forgot password?
            </Link>
          </p>
        )}
        <button
          type="button"
          onClick={continueAsGuest}
          className="mt-5 w-full text-center text-sm font-medium text-slate-600 underline decoration-slate-400 underline-offset-4 transition hover:text-slate-950"
        >
          Continue as guest
        </button>
      </div>
    </main>
  )
}//AuthPage
