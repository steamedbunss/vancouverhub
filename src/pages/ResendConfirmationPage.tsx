import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Mail } from 'lucide-react'
import { AuthCard } from '../components/auth/AuthCard'
import { resendConfirmation } from '../lib/api/auth'

//ResendConfirmationPage requests a fresh email confirmation link
export function ResendConfirmationPage() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setIsSubmitting(true)
    try {
      await resendConfirmation(email)
      setSubmitted(true)
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Unable to send confirmation email.')
    } finally {
      setIsSubmitting(false)
    }
  }//handleSubmit

  if (submitted) {
    return (
      <AuthCard
        title="Check your inbox"
        subtitle="If an account requires email confirmation, check your inbox."
      >
        <p className="mt-7 text-center text-sm text-slate-700">
          <Link to="/login" className="font-semibold text-hub-navy hover:underline">
            Back to sign in
          </Link>
        </p>
      </AuthCard>
    )
  }

  return (
    <AuthCard
      title="Resend confirmation"
      subtitle="Enter the email address you used to register."
    >
      <form className="mt-7 space-y-4" onSubmit={handleSubmit}>
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

        {error && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-lg bg-slate-950 px-4 py-3 text-base font-semibold text-white transition hover:bg-slate-800 disabled:cursor-wait disabled:opacity-60"
        >
          {isSubmitting ? 'Sending…' : 'Resend confirmation email'}
        </button>
      </form>

      <p className="mt-7 text-center text-sm text-slate-700">
        <Link to="/login" className="font-semibold text-hub-navy hover:underline">
          Back to sign in
        </Link>
      </p>
    </AuthCard>
  )
}//ResendConfirmationPage
