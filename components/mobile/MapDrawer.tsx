"use client"

import { useState, useCallback } from 'react'
import dynamic from 'next/dynamic'
import { X, AlertTriangle, WifiOff, RefreshCw } from 'lucide-react'
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer'
import { Button } from '@/components/ui/button'
import { MapFilters } from './MapFilters'
import { MapLoadingSkeleton } from './MapLoadingSkeleton'
import { useMapData } from '@/hooks/useMapData'
import { useOnlineStatus } from '@/hooks/useOnlineStatus'
import type { Neighborhood } from '@/lib/map-config'

// Dynamic import for Leaflet (SSR-safe)
const MapView = dynamic(
  () => import('./MapView').then((mod) => mod.MapView),
  { ssr: false, loading: () => <MapLoadingSkeleton /> }
)

interface MapDrawerProps {
  isOpen: boolean
  onClose: () => void
}

export function MapDrawer({ isOpen, onClose }: MapDrawerProps) {
  const [province, setProvince] = useState<number | null>(null)
  const [status, setStatus] = useState<number | null>(null)

  const isOnline = useOnlineStatus()
  const { data, isLoading, error, refetch } = useMapData({
    province,
    status,
    enabled: isOpen && isOnline,
  })

  const handleNeighborhoodClick = useCallback((neighborhood: Neighborhood) => {
    // For now, just log the click - could navigate to deals list later
    console.log('View deals for:', neighborhood.fsa, neighborhood.name)
  }, [])

  return (
    <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DrawerContent className="h-[85vh] bg-pearl-950 border-t border-[#1a6aa8]/40">
        <DrawerHeader className="flex flex-row items-center justify-between px-4 py-3 border-b border-white/10">
          <DrawerTitle className="text-white font-semibold">
            Deal Map
          </DrawerTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-white/70 hover:text-white hover:bg-white/10 h-8 w-8"
          >
            <X className="w-5 h-5" />
          </Button>
        </DrawerHeader>

        <MapFilters
          province={province}
          status={status}
          onProvinceChange={setProvince}
          onStatusChange={setStatus}
          totalDeals={data?.totalDeals ?? 0}
          isLoading={isLoading}
        />

        <div className="flex-1 relative">
          {!isOnline ? (
            <div className="flex flex-col items-center justify-center h-full text-center px-6">
              <WifiOff className="w-12 h-12 text-white/40 mb-3" />
              <p className="text-white font-medium mb-1">No Internet Connection</p>
              <p className="text-white/60 text-sm">
                Map requires an internet connection to load.
              </p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-full text-center px-6">
              <AlertTriangle className="w-12 h-12 text-amber-500 mb-3" />
              <p className="text-white font-medium mb-1">Unable to load map data</p>
              <p className="text-white/60 text-sm mb-4">{error.message}</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetch()}
                className="border-[#0a5694] text-white hover:bg-[#0a5694]/20"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
            </div>
          ) : isLoading && !data ? (
            <MapLoadingSkeleton />
          ) : data ? (
            <MapView
              districts={data.districts}
              neighborhoods={data.neighborhoods}
              onNeighborhoodClick={handleNeighborhoodClick}
            />
          ) : null}
        </div>
      </DrawerContent>
    </Drawer>
  )
}
