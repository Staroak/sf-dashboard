"use client"

import { useState } from 'react'
import dynamic from 'next/dynamic'
import { AlertTriangle, WifiOff, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { MobileNav, MobileHeader } from '@/components/mobile'
import { MapFilters } from '@/components/mobile/MapFilters'
import { MapLoadingSkeleton } from '@/components/mobile/MapLoadingSkeleton'
import { useMapData } from '@/hooks/useMapData'
import { useOnlineStatus } from '@/hooks/useOnlineStatus'
import type { Neighborhood } from '@/lib/map-config'

const MapView = dynamic(
  () => import('@/components/mobile/MapView').then((mod) => mod.MapView),
  { ssr: false, loading: () => <MapLoadingSkeleton /> }
)

export default function MapPage() {
  const [province, setProvince] = useState<number | null>(null)
  const [status, setStatus] = useState<number | null>(null)

  const isOnline = useOnlineStatus()
  const { data, isLoading, error, refetch } = useMapData({
    province,
    status,
    enabled: isOnline,
  })

  const handleNeighborhoodClick = (neighborhood: Neighborhood) => {
    console.log('View deals for:', neighborhood.fsa, neighborhood.name)
  }

  return (
    <div className="flex flex-col h-screen bg-pearl-950">
      <MobileHeader />

      <MapFilters
        province={province}
        status={status}
        onProvinceChange={setProvince}
        onStatusChange={setStatus}
        totalDeals={data?.totalDeals ?? 0}
        isLoading={isLoading}
      />

      <div className="flex-1 p-2 pb-20">
        <div className="h-full rounded-lg border border-[#0a5694]/40 overflow-hidden">
          {!isOnline ? (
            <div className="flex flex-col items-center justify-center h-full text-center px-6 bg-pearl-900">
              <WifiOff className="w-12 h-12 text-white/40 mb-3" />
              <p className="text-white font-medium mb-1">No Internet Connection</p>
              <p className="text-white/60 text-sm">
                Map requires an internet connection to load.
              </p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-full text-center px-6 bg-pearl-900">
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
      </div>

      <MobileNav />
    </div>
  )
}
