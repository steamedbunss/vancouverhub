import { LockKeyhole, LogIn } from 'lucide-react'
import { Link } from 'react-router-dom'
import { themedCard, themedCardAccent, themedCardMuted } from '../ui/themedCard'

//AirQualityLoginPrompt tells guests to sign in before AQHI data can load
export function AirQualityLoginPrompt() {
  return (
    <section className={`rounded-3xl p-6 md:p-8 ${themedCard}`}>
      <LockKeyhole className={`h-8 w-8 ${themedCardMuted}`} strokeWidth={1.5} />
      <p className={`mt-5 text-xs font-semibold tracking-[0.16em] uppercase ${themedCardAccent}`}>
        Air quality
      </p>
      <h2 className="mt-3 text-2xl font-black tracking-tight">AQHI needs your saved location</h2>
      <p className={`mt-3 text-sm leading-relaxed ${themedCardMuted}`}>
        Sign in and save a home location to view air-quality guidance tailored to your area.
      </p>
      {/*Link to the login page for guests who want AQHI data*/}
      <Link
        to="/login"
        className={`mt-6 inline-flex items-center gap-2 text-sm font-semibold hover:underline ${themedCardAccent}`}
      >
        Sign in to view AQHI <LogIn className="h-4 w-4" />
      </Link>
    </section>
  )
}//AirQualityLoginPrompt
