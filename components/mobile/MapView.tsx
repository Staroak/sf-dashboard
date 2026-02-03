"use client"

import { useEffect, useState, useCallback } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet'
import MarkerClusterGroup from 'react-leaflet-cluster'
import L from 'leaflet'
import { MAP_CONFIG, getMarkerColor, type District, type Neighborhood } from '@/lib/map-config'
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

// Create custom circle icon with count
function createCustomIcon(count: number) {
  const color = getMarkerColor(count)
  const size = Math.min(44, 24 + Math.log(count + 1) * 5)

  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="
      width: ${size}px;
      height: ${size}px;
      background: ${color};
      border: 2px solid white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: bold;
      font-size: ${size > 32 ? '12px' : '10px'};
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
    ">${count}</div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2],
  })
}

// Create custom cluster icon
function createClusterIcon(cluster: { getChildCount: () => number }) {
  const count = cluster.getChildCount()
  const size = Math.min(50, 30 + Math.log(count + 1) * 6)

  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="
      width: ${size}px;
      height: ${size}px;
      background: #0a5694;
      border: 3px solid white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: bold;
      font-size: ${size > 40 ? '14px' : '12px'};
      box-shadow: 0 3px 10px rgba(0,0,0,0.4);
    ">${count}</div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
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
            >
              <Popup>
                <MapPopup
                  item={neighborhood}
                  type="neighborhood"
                  onViewDeals={() => handleNeighborhoodClick(neighborhood)}
                />
              </Popup>
            </Marker>
          ))}
      </MarkerClusterGroup>
    </MapContainer>
  )
}
