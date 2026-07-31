//AuthPage.tsx handles login, registration, and guest access for Vancouver Hub
import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { LockKeyhole, Mail, UserRound } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { GUEST_ACCESS_STORAGE_KEY } from '../components/auth/LandingRedirect'

//props for AuthPage; mode switches between login and register layouts
interface AuthPageProps {
  mode: 'login' | 'register'
}

export function AuthPage({ mode }: AuthPageProps) {
  //loginWithCredentials and registerWithCredentials call the auth API through context
  const { loginWithCredentials, registerWithCredentials } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  //declaring state to hold the username input value
  const [username, setUsername] = useState('')
  //declaring state to hold the email input value; only shown on register
  const [email, setEmail] = useState('')
  //declaring state to hold the password input value
  const [password, setPassword] = useState('')
  //declaring state to display API or validation errors to the user
  const [error, setError] = useState<string | null>(null)
  //declaring state to disable the submit button while auth is in progress
  const [isSubmitting, setIsSubmitting] = useState(false)
  //isLogin is a shorthand boolean for whether the page is in login mode
  const isLogin = mode === 'login'
  //destination is the route to navigate to after success; defaults to dashboard
  //eg. a protected page may pass state.from when redirecting to login
  const destination = (location.state as { from?: string } | null)?.from ?? '/dashboard'

  //handleSubmit prevents default form behavior and calls login or register
  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setIsSubmitting(true)
    try {
      if (isLogin) {
        await loginWithCredentials({ username, password })
      } else {
        await registerWithCredentials({ username, email, password })
      }
      navigate(destination, { replace: true })
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Unable to continue. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }//handleSubmit

  //continueAsGuest sets a localStorage flag and navigates to the dashboard without auth
  function continueAsGuest() {
    localStorage.setItem(GUEST_ACCESS_STORAGE_KEY, 'true')
    navigate('/dashboard', { replace: true })
  }//continueAsGuest

  return (
    <main className="flex min-h-screen items-center justify-center bg-white px-6 py-12">
      <div className={`auth-card auth-card-${mode} flex min-h-[620px] w-full max-w-md flex-col rounded-2xl border border-slate-900 bg-white p-8 shadow-[0_16px_40px_rgba(15,23,42,0.10)] sm:p-10`}>
        {/*Branding link back to the dashboard*/}
        <Link to="/dashboard" className="text-sm font-semibold text-slate-800 hover:underline">
          Vancouver Hub
        </Link>
        {/*Page title and subtitle change based on login or register mode*/}
        <h1 className="mt-8 text-center text-4xl font-bold tracking-tight text-slate-950">
          {isLogin ? 'Login' : 'Register'}
        </h1>
        <p className="mt-3 text-center text-sm leading-6 text-slate-600">
          {isLogin ? 'Sign in to personalize your Vancouver Hub.' : 'Create an account to personalize your Vancouver Hub.'}
        </p>

        {/*Auth form with username, optional email, and password fields*/}
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
            {/*Email field is only rendered on the register form*/}
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
                minLength={6}
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

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-lg bg-slate-950 px-4 py-3 text-base font-semibold text-white transition hover:bg-slate-800 disabled:cursor-wait disabled:opacity-60"
          >
            {isSubmitting ? 'Connecting…' : isLogin ? 'Sign in' : 'Create account'}
          </button>
        </form>

        {/*Toggle link between login and register routes*/}
        <p className="mt-7 text-center text-sm text-slate-700">
          {isLogin ? 'Register to start your journey.' : 'Already have an account?'}{' '}
          <Link to={isLogin ? '/register' : '/login'} className="font-semibold text-hub-navy hover:underline">
            {isLogin ? 'Register' : 'Sign in'}
          </Link>
        </p>
        {/*Guest access bypasses authentication and stores a flag in localStorage*/}
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
