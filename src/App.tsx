//App.tsx defines the root component with routing and global context providers
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { UserConfigProvider } from './context/UserConfigContext'
import { Layout } from './components/layout/Layout'
import { DashboardPage } from './pages/DashboardPage'
import { SettingsPage } from './pages/SettingsPage'
import { TrafficPage } from './pages/TrafficPage'
import { AuthProvider } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import { AuthPage } from './pages/AuthPage'
import { EventsPage } from './pages/EventsPage'
import { LandingRedirect } from './components/auth/LandingRedirect'
import { EnvironmentPage } from './pages/EnvironmentPage'
import { Safety311Page } from './pages/Safety311Page'

//App wraps the entire application in auth, theme, and user config providers
//BrowserRouter enables client-side navigation between pages
export default function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <UserConfigProvider>
          <BrowserRouter>
            <Routes>
              {/*Public auth routes outside the main layout shell*/}
              <Route path="login" element={<AuthPage mode="login" />} />
              <Route path="register" element={<AuthPage mode="register" />} />
              {/*Layout wraps all authenticated and guest app pages with shared navigation*/}
              <Route element={<Layout />}>
                <Route index element={<LandingRedirect />} />
                <Route path="dashboard" element={<DashboardPage />} />
                <Route path="settings" element={<SettingsPage />} />
                <Route path="events" element={<EventsPage />} />
                <Route path="environment" element={<EnvironmentPage />} />
                <Route path="traffic" element={<TrafficPage />} />
                {/*Temporarily disabled product areas; source pages are preserved.*/}
                <Route path="housing" element={<Navigate to="/dashboard" replace />} />
                <Route path="gas" element={<Navigate to="/dashboard" replace />} />
                <Route path="gov-programs" element={<Navigate to="/dashboard" replace />} />
                <Route
                  path="safety-311"
                  element={<Safety311Page />}
                />
                {/*Catch-all route sends unknown paths back to the landing redirect*/}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </UserConfigProvider>
      </ThemeProvider>
    </AuthProvider>
  )
}//App
