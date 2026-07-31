import { useMemo } from 'react'
import { GeoJSON, MapContainer, TileLayer } from 'react-leaflet'
import L from 'leaflet'
import type { Feature, FeatureCollection, Geometry } from 'geojson'
import type { DriveBCEvent, Severity } from '../../types/drivebc'
import { resolveIncidentHeadline } from '../../utils/incidentHeadline'
import { CascadeGatewayMarkers } from './CascadeGatewayMarkers'
import 'leaflet/dist/leaflet.css'

//BC_CENTER is the default map center point over British Columbia
const BC_CENTER: [number, number] = [53.7, -126.7]
//BC_ZOOM is the initial zoom level showing most of the province
const BC_ZOOM = 5

//severityStyles maps each severity level to stroke and fill colors for map features
const severityStyles: Record<Severity, { color: string; fillColor: string }> = {
  MAJOR: { color: '#b91c1c', fillColor: '#ef4444' },
  MODERATE: { color: '#b45309', fillColor: '#f59e0b' },
  MINOR: { color: '#475569', fillColor: '#64748b' },
  UNKNOWN: { color: '#64748b', fillColor: '#94a3b8' },
}

//escapeHtml sanitizes text before inserting it into Leaflet popup HTML
function escapeHtml(value: string) {
  return value.replace(/[&<>'"]/g, (character) => {
    const entities: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;',
    }
    return entities[character]
  })
}//escapeHtml

//toFeature converts a DriveBCEvent into a GeoJSON Feature for the map layer
//Returns null when the event has no valid geography geometry
function toFeature(event: DriveBCEvent): Feature<Geometry, DriveBCEvent> | null {
  const geometry = event.geography as Geometry
  //If geometry is missing or has no type, skip this event on the map
  if (!geometry || !geometry.type) return null

  return {
    type: 'Feature',
    properties: event,
    geometry,
  }
}//toFeature

export function DriveBCMap({
  events,
  showNexusWaits = false,
}: {
  events: DriveBCEvent[]
  showNexusWaits?: boolean
}) {
  //useMemo builds a GeoJSON FeatureCollection from the filtered events array
  //Events without valid geometry are filtered out
  const data = useMemo<FeatureCollection<Geometry, DriveBCEvent>>(
    () => ({
      type: 'FeatureCollection',
      features: events
        .map(toFeature)
        .filter((feature): feature is Feature<Geometry, DriveBCEvent> => feature !== null),
    }),
    [events],
  )
  //dataKey forces GeoJSON to re-render when the set of event ids changes
  const dataKey = data.features.map((feature) => feature.properties.id).join('|')

  return (
    <>
    {/*Map container with OpenStreetMap tiles and event overlays*/}
    <div className="relative h-[520px] overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
      <MapContainer
        center={BC_CENTER}
        zoom={BC_ZOOM}
        className="h-full w-full"
        scrollWheelZoom
      >
        {/*Base map tile layer from OpenStreetMap*/}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {/*GeoJSON layer draws road event geometries when features exist*/}
        {data.features.length > 0 && (
          <GeoJSON
            key={dataKey}
            data={data}
            style={(feature) => {
              const severity = (feature?.properties.severity ?? 'UNKNOWN') as Severity
              const colors = severityStyles[severity]
              return { color: colors.color, fillColor: colors.fillColor, weight: 4, fillOpacity: 0.3 }
            }}
            pointToLayer={(feature, latlng) => {
              const colors = severityStyles[feature.properties.severity as Severity]
              return L.circleMarker(latlng, {
                radius: 8,
                color: colors.color,
                fillColor: colors.fillColor,
                fillOpacity: 0.9,
                weight: 2,
              })
            }}
            onEachFeature={(feature, layer) => {
              const event = feature.properties
              const title = resolveIncidentHeadline(event)
              layer.bindTooltip(title)
              layer.bindPopup(
                `<strong>${escapeHtml(title)}</strong><br />` +
                  `<span>${escapeHtml(event.severity)} delay &middot; ${escapeHtml(event.areaName)}</span><br />` +
                  `<p>${escapeHtml(event.description)}</p>`,
              )
            }}
          />
        )}
        {/*CascadeGatewayMarkers shows NEXUS border wait times when enabled*/}
        {showNexusWaits && <CascadeGatewayMarkers />}
      </MapContainer>
      {/*Empty state overlay when no events are selected and NEXUS is off*/}
      {data.features.length === 0 && !showNexusWaits && (
        <div className="pointer-events-none absolute top-4 right-4 left-14 z-[400] rounded-lg border border-slate-200 bg-white/95 px-4 py-3 text-center text-sm text-slate-600 shadow-sm dark:border-gray-600 dark:bg-gray-900/95 dark:text-slate-200">
          Select one or more checkbox filters to display road events.
        </div>
      )}
    </div>
    {/*Legend below the map explaining severity color coding*/}
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 px-1 pt-3 text-xs text-slate-600 dark:text-slate-300" aria-label="Map legend">
      <span className="font-semibold text-slate-700 dark:text-slate-100">Legend</span>
      <span className="inline-flex items-center gap-1.5"><span className="h-3 w-3 rounded-full bg-red-500 ring-2 ring-red-700" />Major delay</span>
      <span className="inline-flex items-center gap-1.5"><span className="h-3 w-3 rounded-full bg-amber-500 ring-2 ring-amber-700" />Moderate delay</span>
      <span className="inline-flex items-center gap-1.5"><span className="h-3 w-3 rounded-full bg-slate-500 ring-2 ring-slate-700" />Minor delay</span>
    </div>
    </>
  )
}//DriveBCMap
