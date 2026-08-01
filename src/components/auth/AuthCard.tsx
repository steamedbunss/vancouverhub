import { Link } from 'react-router-dom'

//props for AuthCard; wraps auth recovery pages in the shared login/register shell
interface AuthCardProps {
  title: string
  subtitle?: string
  children: React.ReactNode
  mode?: string
}

//AuthCard renders the centered auth card used across login, register, and recovery pages
export function AuthCard({ title, subtitle, children, mode = 'auth' }: AuthCardProps) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-white px-6 py-12">
      <div className={`auth-card auth-card-${mode} flex min-h-[620px] w-full max-w-md flex-col rounded-2xl border border-slate-900 bg-white p-8 shadow-[0_16px_40px_rgba(15,23,42,0.10)] sm:p-10`}>
        <Link to="/dashboard" className="text-sm font-semibold text-slate-800 hover:underline">
          Vancouver Hub
        </Link>
        <h1 className="mt-8 text-center text-4xl font-bold tracking-tight text-slate-950">{title}</h1>
        {subtitle && (
          <p className="mt-3 text-center text-sm leading-6 text-slate-600">{subtitle}</p>
        )}
        {children}
      </div>
    </main>
  )
}//AuthCard
