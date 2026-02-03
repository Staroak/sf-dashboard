"use client"

import { useEffect, useState, useCallback } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet'
import MarkerClusterGroup from 'react-leaflet-cluster'
import L from 'leaflet'
import { MAP_CONFIG, type District, type Neighborhood } from '@/lib/map-config'
import { MapPopup } from './MapPopup'

interface MapViewProps {
  districts: District[]
  neighborhoods: Neighborhood[]
  onNeighborhoodClick?: (neighborhood: Neighborhood) => void
}

// Fix for default marker icons in Leaflet with webpack
function fixLeafletIcons() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  delete (L.Icon.Default.prototype as any)._getIconUrl
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  })
}

// Create custom pin icon with count
function createCustomIcon(count: number) {
  const width = 32
  const height = 44

  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="position: relative; width: ${width}px; height: ${height}px;">
      <svg viewBox="0 0 32 44" width="${width}" height="${height}" style="filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));">
        <path d="M16 0C7.163 0 0 7.163 0 16c0 12 16 28 16 28s16-16 16-28C32 7.163 24.837 0 16 0z" fill="#0a5694"/>
        <circle cx="16" cy="16" r="12" fill="#4da6db"/>
      </svg>
      <span style="
        position: absolute;
        top: 8px;
        left: 0;
        right: 0;
        text-align: center;
        color: white;
        font-weight: bold;
        font-size: ${count > 99 ? '9px' : '11px'};
      ">${count}</span>
    </div>`,
    iconSize: [width, height],
    iconAnchor: [width / 2, height],
    popupAnchor: [0, -height + 8],
  })
}

// Create custom cluster icon - sums deal counts from all markers
function createClusterIcon(cluster: { getAllChildMarkers: () => L.Marker[] }) {
  // Sum the actual deal counts from all child markers
  const markers = cluster.getAllChildMarkers()
  const totalCount = markers.reduce((sum, marker) => {
    const count = (marker.options as { count?: number }).count || 0
    return sum + count
  }, 0)

  const width = 40
  const height = 52

  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="position: relative; width: ${width}px; height: ${height}px;">
      <svg viewBox="0 0 32 44" width="${width}" height="${height}" style="filter: drop-shadow(0 3px 6px rgba(0,0,0,0.4));">
        <path d="M16 0C7.163 0 0 7.163 0 16c0 12 16 28 16 28s16-16 16-28C32 7.163 24.837 0 16 0z" fill="#0a5694"/>
        <circle cx="16" cy="16" r="12" fill="#4da6db"/>
      </svg>
      <span style="
        position: absolute;
        top: 10px;
        left: 0;
        right: 0;
        text-align: center;
        color: white;
        font-weight: bold;
        font-size: ${totalCount > 999 ? '9px' : totalCount > 99 ? '10px' : '12px'};
      ">${totalCount}</span>
    </div>`,
    iconSize: [width, height],
    iconAnchor: [width / 2, height],
  })
}

// Component to handle map events and zoom-based switching
function MapEventHandler({
  onZoomChange,
}: {
  onZoomChange: (zoom: number) => void
}) {
  const map = useMap()

  useMapEvents({
    zoomend: () => {
      onZoomChange(map.getZoom())
    },
  })

  // Expose map instance for zooming to district
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(window as any).__mapZoomTo = (lat: number, lng: number, zoom: number) => {
      map.setView([lat, lng], zoom, { animate: true, duration: 0.5 })
    }
    return () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (window as any).__mapZoomTo
    }
  }, [map])

  return null
}

export function MapView({ districts, neighborhoods, onNeighborhoodClick }: MapViewProps) {
  const [viewLevel, setViewLevel] = useState<'districts' | 'neighborhoods'>('districts')

  useEffect(() => {
    fixLeafletIcons()
  }, [])

  const handleZoomChange = useCallback((zoom: number) => {
    const newLevel = zoom >= MAP_CONFIG.neighborhoodZoomMin ? 'neighborhoods' : 'districts'
    setViewLevel(newLevel)
  }, [])

  const handleDistrictClick = useCallback((district: District) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const zoomTo = (window as any).__mapZoomTo
    if (zoomTo) {
      zoomTo(district.lat, district.lng, MAP_CONFIG.neighborhoodZoomMin)
    }
  }, [])

  const handleNeighborhoodClick = useCallback((neighborhood: Neighborhood) => {
    onNeighborhoodClick?.(neighborhood)
  }, [onNeighborhoodClick])

  return (
    <MapContainer
      center={MAP_CONFIG.defaultCenter}
      zoom={MAP_CONFIG.defaultZoom}
      className="w-full h-full"
      zoomControl={true}
      attributionControl={false}
    >
      <TileLayer
        url={MAP_CONFIG.tileUrl}
        attribution={MAP_CONFIG.attribution}
      />
      <MapEventHandler onZoomChange={handleZoomChange} />

      <MarkerClusterGroup
        chunkedLoading
        iconCreateFunction={createClusterIcon}
        maxClusterRadius={60}
        spiderfyOnMaxZoom={true}
        showCoverageOnHover={false}
        zoomToBoundsOnClick={true}
      >
        {viewLevel === 'districts' &&
          districts.map((district, index) => (
            <Marker
              key={`district-${index}`}
              position={[district.lat, district.lng]}
              icon={createCustomIcon(district.count)}
              // @ts-expect-error - custom option for cluster summing
              count={district.count}
              eventHandlers={{
                click: () => handleDistrictClick(district),
              }}
            >
              <Popup>
                <MapPopup item={district} type="district" />
              </Popup>
            </Marker>
          ))}

        {viewLevel === 'neighborhoods' &&
          neighborhoods.map((neighborhood, index) => (
            <Marker
              key={`neighborhood-${index}`}
              position={[neighborhood.lat, neighborhood.lng]}
              icon={createCustomIcon(neighborhood.count)}
              // @ts-expect-error - custom option for cluster summing
              count={neighborhood.count}
            >
              <Popup>
                <MapPopup
                  item={neighborhood}
                  type="neighborhood"
                />
              </Popup>
            </Marker>
          ))}
      </MarkerClusterGroup>
    </MapContainer>
  )
}
