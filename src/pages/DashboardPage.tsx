//DashboardPage.tsx is the main landing page with greeting, weather, gas, and dashboard sections
import { useState } from 'react'
import { DashboardRenderer } from '../components/dashboard/DashboardRenderer'
import { CompactWeather } from '../components/dashboard/CompactWeather'
import { GasSection } from '../components/dashboard/sections/GasSection'
import { useAuth } from '../context/AuthContext'
import { useResolvedLocation } from '../context/LocationContext'
import { useUserConfig } from '../context/UserConfigContext'
import { useElasticSectionSnap } from '../hooks/useElasticSectionSnap'
import { nextDashboardGreeting } from '../lib/greetings'
import { RainbowText } from '../components/RainbowText'

//capitalizeWords uppercases the first letter of each word in a string
//eg. "good morning" becomes "Good Morning"
function capitalizeWords(value: string) {
  return value.replace(/(^|\s)(\p{L})/gu, (_, prefix: string, letter: string) => `${prefix}${letter.toUpperCase()}`)
}//capitalizeWords

//formatLandingDate returns a human readable date and time string for the dashboard header
function formatLandingDate(date: Date) {
  return date.toLocaleString('en-CA', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZoneName: 'short',
  })
}//formatLandingDate

export function DashboardPage() {
  //config holds user dashboard visibility preferences from UserConfigContext
  const { config } = useUserConfig()
  //token and user come from AuthContext; token is null for guest users
  const { token, user } = useAuth()
  //location is the resolved GPS or saved home location with neighbourhood label
  const location = useResolvedLocation()
  //declaring state to hold a random greeting chosen once on mount
  const [greeting] = useState(() => capitalizeWords(nextDashboardGreeting()))
  //declaring state to hold the formatted date label chosen once on mount
  const [dateLabel] = useState(() => formatLandingDate(new Date()))
  //displayName shows the signed in username or Guest when no token exists
  const displayName = token && user?.username
    ? capitalizeWords(user.username)
    : 'Guest'
  //headingGreeting uses the random greeting for signed in users and a static label for guests
  const headingGreeting = token ? greeting : 'Greetings'
  //showWeather and showGas read dashboard section visibility from user config
  const showWeather = config.dashboardVisible.environment
  const showGas = config.dashboardVisible['gas-prices']
  //dashboardRef attaches elastic scroll snap behavior to the page container
  const dashboardRef = useElasticSectionSnap()
  //locationLabel shows neighbourhood name, a loading message, or unavailable text
  const locationLabel = !location
    ? 'Locating…'
    : location.neighbourhood ?? 'Location unavailable'

  return (
    <div ref={dashboardRef} data-dashboard-scroll-container className="h-full overflow-y-auto overscroll-contain bg-white dark:bg-gray-950">
      {/*Hero header with greeting, location, date, and optional weather and gas widgets*/}
      <header data-elastic-snap className="flex min-h-full flex-col items-center justify-center px-6 py-16 md:py-24">
        <div className="-translate-y-8 text-center md:-translate-y-12">
          <h1 data-onboarding-target="tour-greeting" className="text-6xl font-black tracking-tighter sm:text-7xl md:text-9xl md:leading-[0.9]">
          <RainbowText>{headingGreeting}, {displayName}</RainbowText>
          </h1>
          <p data-onboarding-target="tour-location" className="mt-5 text-base text-gray-500 sm:text-lg md:mt-6 md:text-xl dark:text-gray-300">
            {locationLabel} · {dateLabel}
          </p>
          {/*Weather and gas sections appear when enabled in user settings*/}
          {(showWeather || showGas) && (
            <div className={`mx-auto mt-24 grid w-full max-w-[90rem] items-start gap-16 text-left md:mt-32 ${showWeather && showGas ? 'md:grid-cols-2 md:gap-32' : 'md:grid-cols-1'}`}>
              {showWeather && (
                <div data-onboarding-target="tour-weather" className={showGas ? 'w-full max-w-lg md:justify-self-start' : 'justify-self-center'}>
                  <CompactWeather />
                </div>
              )}
              {showGas && (
                <div className={showWeather ? 'w-full max-w-2xl min-w-0 md:justify-self-end' : 'justify-self-center'}>
                  <GasSection compact />
                </div>
              )}
            </div>
          )}
        </div>
      </header>

      {/*DashboardRenderer renders the remaining configurable dashboard sections below the hero*/}
      <DashboardRenderer />
    </div>
  )
}//DashboardPage
