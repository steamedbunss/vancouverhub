import { useEffect, useMemo, useState } from 'react'
import { Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import {
  getCascadeGatewayBorderWaits,
  type BorderLaneCategory,
  type BorderLaneWait,
} from '../../lib/api/cascadeGateway'

//CROSSINGS lists the four BC border crossings with their map coordinates
const CROSSINGS = [
  { name: 'Peace Arch', lat: 49.0024, lon: -122.7567 },
  { name: 'Pacific Highway', lat: 49.0026, lon: -122.7374 },
  { name: 'Lynden/Aldergrove', lat: 49.0028, lon: -122.4855 },
  { name: 'Sumas/Huntingdon', lat: 49.0027, lon: -122.2658 },
]

//CATEGORY_ORDER defines the display order for lane categories in the popup
const CATEGORY_ORDER: BorderLaneCategory[] = ['Passenger', 'NEXUS', 'FAST', 'Truck']
//DIRECTION_ORDER defines the display order for travel directions
const DIRECTION_ORDER = ['Southbound', 'Northbound']

//markerIcon returns a Leaflet divIcon for a border crossing marker
//active is true when this crossing is currently selected/clicked
function markerIcon(active: boolean) {
  const background = active ? '#1e3a5f' : '#eff6ff'
  const color = active ? '#ffffff' : '#1d4e89'
  return L.divIcon({
    className: '',
    html: `<span style="display:flex;height:30px;width:30px;align-items:center;justify-content:center;border:2px solid #1d4e89;border-radius:5px;background:${background};color:${color};font-size:19px;font-weight:700;box-shadow:0 1px 3px rgba(0,0,0,.25)">⇄</span>`,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    popupAnchor: [0, -16],
  })
}//markerIcon

//formatWait converts a wait time in minutes into a human-readable label
//eg. null becomes No data, 0 becomes No delays, 15 becomes 15 minutes
function formatWait(minutes: number | null) {
  if (minutes === null) return 'No data'
  if (minutes <= 0) return 'No delays'
  return `${Math.round(minutes)} minutes`
}//formatWait

//formatUpdated converts an ISO timestamp into a short readable update time
function formatUpdated(value: string | null) {
  if (!value) return 'Update time unavailable'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return `Updated ${value}`
  return `Updated ${date.toLocaleString('en-CA', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}`
}//formatUpdated

//WaitValue renders a wait time with green text for no delay or amber for active waits
function WaitValue({ minutes }: { minutes: number | null }) {
  return (
    <strong className={minutes && minutes > 0 ? 'text-amber-700' : 'text-green-700'}>
      {formatWait(minutes)}
    </strong>
  )
}//WaitValue

export function CascadeGatewayMarkers() {
  //declaring state to hold border lane wait times fetched from the API
  const [waits, setWaits] = useState<BorderLaneWait[]>([])
  //declaring state to track whether data is loading, loaded, or failed
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  //declaring state for which crossing marker is currently selected
  const [selectedCrossing, setSelectedCrossing] = useState<string | null>(null)

  //This useEffect runs once on mount to fetch live border wait times
  //The cancelled flag prevents state updates if the component unmounts mid-fetch
  useEffect(() => {
    let cancelled = false
    getCascadeGatewayBorderWaits()
      .then((data) => {
        if (!cancelled) {
          setWaits(data)
          setStatus('success')
        }
      })
      .catch((error) => {
        console.error('Could not load Cascade Gateway border waits', error)
        if (!cancelled) setStatus('error')
      })
    return () => { cancelled = true }
  }, [])

  //useMemo groups wait records by crossing name for quick lookup per marker
  const waitsByCrossing = useMemo(() => {
    const groups = new Map<string, BorderLaneWait[]>()
    waits.forEach((wait) => groups.set(wait.crossing, [...(groups.get(wait.crossing) ?? []), wait]))
    return groups
  }, [waits])

  return (
    <>
      {/*This map renders a marker and popup for each border crossing*/}
      {CROSSINGS.map((crossing) => {
        //lanes holds wait records for this crossing, filtered and sorted for display
        const lanes = [...(waitsByCrossing.get(crossing.name) ?? [])]
          .filter((lane) => CATEGORY_ORDER.includes(lane.category))
          .sort((a, b) => {
            const byCategory = CATEGORY_ORDER.indexOf(a.category) - CATEGORY_ORDER.indexOf(b.category)
            if (byCategory !== 0) return byCategory
            const aDirection = DIRECTION_ORDER.indexOf(a.direction)
            const bDirection = DIRECTION_ORDER.indexOf(b.direction)
            return (aDirection === -1 ? 99 : aDirection) - (bDirection === -1 ? 99 : bDirection)
          })
        //latest is the most recent update timestamp among this crossing's lanes
        const latest = lanes.map((lane) => lane.updatedAt).find(Boolean) ?? null
        return (
          <Marker
            key={crossing.name}
            position={[crossing.lat, crossing.lon]}
            icon={markerIcon(selectedCrossing === crossing.name)}
            eventHandlers={{ click: () => setSelectedCrossing(crossing.name) }}
          >
            {/*Popup shows crossing name, update time, and a grid of lane wait times*/}
            <Popup minWidth={280}>
              <div>
                <p className="mb-1 font-bold text-slate-900">{crossing.name}</p>
                <p className="mb-3 text-xs text-slate-500">{status === 'success' ? formatUpdated(latest) : status === 'loading' ? 'Loading wait times...' : 'Couldn\'t load live wait times.'}</p>
                {status === 'success' && (lanes.length === 0 ? (
                  //If no lanes are reported, show an empty state message
                  <p className="text-sm">No current lanes reported.</p>
                ) : (
                  //Grid layout: category, direction, and wait time per lane
                  <div className="grid grid-cols-[minmax(4.75rem,auto)_5.75rem_minmax(4.5rem,1fr)] items-baseline gap-x-3 gap-y-2 text-sm">
                    {/*This map renders one row per lane with category, direction, and wait*/}
                    {lanes.map((lane) => (
                      <div key={`${lane.category}-${lane.direction}`} className="contents">
                        <span className="text-slate-800">{lane.category}</span>
                        <span className="text-slate-600">{lane.direction}</span>
                        <span className="justify-self-end text-right">
                          <WaitValue minutes={lane.waitMinutes} />
                        </span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </Popup>
          </Marker>
        )
      })}
    </>
  )
}//CascadeGatewayMarkers
