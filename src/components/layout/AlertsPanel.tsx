import { Link } from 'react-router-dom'
import { useAlerts } from '../../context/AlertsContext'
import { useAuth } from '../../context/AuthContext'

//formatAlertTime turns an ISO timestamp into a short readable date and time
function formatAlertTime(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Updated recently'

  return new Intl.DateTimeFormat('en-CA', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date)
}//formatAlertTime

//AlertsPanel is the dropdown list of active threshold alerts from the bell icon
export function AlertsPanel({ onClose }: { onClose: () => void }) {
  const { activeAlerts, loading } = useAlerts()
  const { token } = useAuth()

  return (
    <div className="absolute top-full right-0 z-50 mt-2 w-80 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl">
      {/*Panel header with title and close button*/}
      <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
        <h3 className="text-sm font-semibold text-gray-900">Alerts</h3>
        <button
          type="button"
          onClick={onClose}
          className="text-xs text-gray-500 hover:text-gray-800"
        >
          Close
        </button>
      </div>

      <div className="max-h-80 overflow-y-auto">
        {!token && (
          <p className="border-b border-gray-100 bg-gray-50 px-4 py-3 text-xs leading-relaxed text-gray-600">
            Using guest defaults: temperature at 25°C or higher, and wildfires within 20 km.
          </p>
        )}

        {loading ? (
          <p className="px-4 py-6 text-sm text-gray-500">Checking your alert thresholds...</p>
        ) : activeAlerts.length === 0 ? (
          <p className="px-4 py-6 text-sm text-gray-500">
            {token
              ? 'No enabled alert thresholds have been reached.'
              : 'No guest alert thresholds have been reached.'}
          </p>
        ) : (
          activeAlerts.map((alert) => (
            <div
              key={alert.id}
              className="border-b border-gray-50 px-4 py-3 last:border-0"
            >
              <p className="text-sm font-medium text-gray-900">{alert.title}</p>
              <p className="mt-1 text-xs leading-relaxed text-gray-600">{alert.message}</p>
              <p className="mt-2 text-[11px] text-gray-400">{formatAlertTime(alert.issuedAt)}</p>
            </div>
          ))
        )}
      </div>

      {/*Footer link to settings or login depending on auth state*/}
      <div className="border-t border-gray-100 px-4 py-3">
        <Link
          to={token ? '/settings' : '/login'}
          onClick={onClose}
          className="text-xs font-medium text-hub-navy hover:underline"
        >
          {token ? 'Manage alert preferences →' : 'Sign in to customize alerts →'}
        </Link>
      </div>
    </div>
  )
}//AlertsPanel
