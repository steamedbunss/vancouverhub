import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { LockKeyhole } from 'lucide-react'
import { AuthCard } from '../components/auth/AuthCard'
import { resetPassword } from '../lib/api/auth'
import { ApiError } from '../lib/api/client'

//ResetPasswordPage sets a new password using the token from the reset email
export function ResetPasswordPage() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const navigate = useNavigate()
  const redirectTimerRef = useRef<number | null>(null)
  const [password, setPassword] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => () => {
    if (redirectTimerRef.current !== null) {
      window.clearTimeout(redirectTimerRef.current)
    }
  }, [])

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!token) return

    setError(null)

    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }

    if (password !== confirmation) {
      setError('Passwords do not match.')
      return
    }

    setIsSubmitting(true)
    try {
      await resetPassword({ token, password })
      setSubmitted(true)
      redirectTimerRef.current = window.setTimeout(() => {
        navigate('/login', { replace: true })
      }, 1500)
    } catch (caughtError) {
      if (caughtError instanceof ApiError) {
        setError(caughtError.message || 'This reset link is invalid or has expired.')
      } else {
        setError('This reset link is invalid or has expired.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }//handleSubmit

  if (!token) {
    return (
      <AuthCard
        title="Invalid link"
        subtitle="This password reset link is invalid or incomplete."
      >
        <p className="mt-7 text-center text-sm text-slate-700">
          <Link to="/forgot-password" className="font-semibold text-hub-navy hover:underline">
            Request a new reset link
          </Link>
        </p>
        <p className="mt-5 text-center text-sm text-slate-700">
          <Link to="/login" className="font-semibold text-hub-navy hover:underline">
            Back to sign in
          </Link>
        </p>
      </AuthCard>
    )
  }

  if (submitted) {
    return (
      <AuthCard title="Password reset" subtitle="Password reset successfully.">
        <p className="mt-7 text-center text-sm text-slate-600">Redirecting you to sign in…</p>
      </AuthCard>
    )
  }

  return (
    <AuthCard
      title="Reset password"
      subtitle="Choose a new password for your account."
    >
      <form className="mt-7 space-y-4" onSubmit={handleSubmit}>
        <label className="relative block border-b-2 border-slate-900 pb-2 text-sm font-medium text-slate-800">
          <span className="sr-only">New password</span>
          <input
            required
            minLength={8}
            type="password"
            autoComplete="new-password"
            placeholder="New password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="w-full pr-8 text-base outline-none placeholder:text-slate-500"
          />
          <LockKeyhole aria-hidden="true" className="absolute right-0 bottom-2 h-5 w-5 text-slate-800" />
        </label>
        <label className="relative block border-b-2 border-slate-900 pb-2 text-sm font-medium text-slate-800">
          <span className="sr-only">Confirm new password</span>
          <input
            required
            minLength={8}
            type="password"
            autoComplete="new-password"
            placeholder="Confirm new password"
            value={confirmation}
            onChange={(event) => setConfirmation(event.target.value)}
            className="w-full pr-8 text-base outline-none placeholder:text-slate-500"
          />
          <LockKeyhole aria-hidden="true" className="absolute right-0 bottom-2 h-5 w-5 text-slate-800" />
        </label>

        {error && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-lg bg-slate-950 px-4 py-3 text-base font-semibold text-white transition hover:bg-slate-800 disabled:cursor-wait disabled:opacity-60"
        >
          {isSubmitting ? 'Saving…' : 'Reset password'}
        </button>
      </form>

      <p className="mt-7 text-center text-sm text-slate-700">
        <Link to="/forgot-password" className="font-semibold text-hub-navy hover:underline">
          Request a new reset link
        </Link>
      </p>
    </AuthCard>
  )
}//ResetPasswordPage
