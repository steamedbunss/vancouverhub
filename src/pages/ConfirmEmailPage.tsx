import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { AuthCard } from '../components/auth/AuthCard'
import { useAuth } from '../context/AuthContext'

type ConfirmStatus = 'missing-token' | 'loading' | 'error'

//ConfirmEmailPage confirms an email address from the link token and signs the user in
export function ConfirmEmailPage() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const navigate = useNavigate()
  const { confirmEmailAndSignIn } = useAuth()
  const attemptedRef = useRef(false)
  const [status, setStatus] = useState<ConfirmStatus>(() => (
    token ? 'loading' : 'missing-token'
  ))

  useEffect(() => {
    if (!token || attemptedRef.current) return

    attemptedRef.current = true

    void confirmEmailAndSignIn(token)
      .then(() => {
        navigate('/dashboard', { replace: true })
      })
      .catch(() => {
        setStatus('error')
      })
  }, [confirmEmailAndSignIn, navigate, token])

  if (status === 'missing-token') {
    return (
      <AuthCard
        title="Invalid link"
        subtitle="This confirmation link is invalid or incomplete."
      >
        <p className="mt-7 text-center text-sm text-slate-700">
          <Link to="/resend-confirmation" className="font-semibold text-hub-navy hover:underline">
            Resend confirmation email
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

  if (status === 'loading') {
    return (
      <AuthCard title="Confirming email" subtitle="Confirming your email…">
        <p className="mt-7 text-center text-sm text-slate-600">Please wait while we activate your account.</p>
      </AuthCard>
    )
  }

  return (
    <AuthCard
      title="Link expired"
      subtitle="This confirmation link is invalid or has expired."
    >
      <p className="mt-7 text-center text-sm text-slate-700">
        <Link to="/resend-confirmation" className="font-semibold text-hub-navy hover:underline">
          Resend confirmation email
        </Link>
      </p>
      <p className="mt-5 text-center text-sm text-slate-700">
        <Link to="/login" className="font-semibold text-hub-navy hover:underline">
          Back to sign in
        </Link>
      </p>
    </AuthCard>
  )
}//ConfirmEmailPage
