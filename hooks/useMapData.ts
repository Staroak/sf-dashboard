"use client"

import { useState, useEffect, useCallback } from 'react'
import type { MapDataResponse } from '@/lib/map-config'
import { getCached, setCache } from '@/lib/prefetch'

interface UseMapDataParams {
  province?: number | null
  status?: number | null
  enabled?: boolean
}

interface UseMapDataResult {
  data: MapDataResponse | null
  isLoading: boolean
  error: Error | null
  refetch: () => Promise<void>
}

const API_URL = process.env.NEXT_PUBLIC_MAP_API_URL || 'https://www.bpportal.ca/api/mobile/map-data'
const API_KEY = process.env.NEXT_PUBLIC_MAP_API_KEY || ''

// Special status value for combined Funded + Complete
const FUNDED_COMBINED = -1
const STATUS_FUNDED = 6
const STATUS_COMPLETE = 7

// Helper to fetch a single status
async function fetchSingleStatus(province: number | null | undefined, status: number | null | undefined): Promise<MapDataResponse> {
  const queryParams = new URLSearchParams()
  if (province != null) queryParams.set('province', String(province))
  if (status != null) queryParams.set('status', String(status))
  queryParams.set('t', String(Date.now()))

  const url = `${API_URL}?${queryParams.toString()}`
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${API_KEY}` },
    cache: 'no-store',
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch map data: ${response.status}`)
  }

  return response.json()
}

// Merge two MapDataResponse objects
function mergeMapData(a: MapDataResponse, b: MapDataResponse): MapDataResponse {
  return {
    districts: [...a.districts, ...b.districts],
    neighborhoods: [...a.neighborhoods, ...b.neighborhoods],
    totalDeals: a.totalDeals + b.totalDeals,
  }
}

export function useMapData({
  province,
  status,
  enabled = true,
}: UseMapDataParams = {}): UseMapDataResult {
  const [data, setData] = useState<MapDataResponse | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const fetchData = useCallback(async () => {
    if (!API_KEY) {
      setError(new Error('Map API key not configured'))
      return
    }

    // Check cache first for default params (no filters)
    const isDefaultParams = province == null && status == null
    if (isDefaultParams) {
      const cached = getCached<MapDataResponse>('mapData')
      if (cached) {
        setData(cached)
        setIsLoading(false)
        return
      }
    }

    setIsLoading(true)
    setError(null)

    try {
      let result: MapDataResponse

      // Handle combined Funded status (-1) by fetching both Funded (6) and Complete (7)
      if (status === FUNDED_COMBINED) {
        const [fundedData, completeData] = await Promise.all([
          fetchSingleStatus(province, STATUS_FUNDED),
          fetchSingleStatus(province, STATUS_COMPLETE),
        ])
        result = mergeMapData(fundedData, completeData)
      } else {
        result = await fetchSingleStatus(province, status)
      }

      setData(result)

      // Cache result for default params
      if (isDefaultParams) {
        setCache('mapData', result)
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'))
    } finally {
      setIsLoading(false)
    }
  }, [province, status])

  useEffect(() => {
    if (enabled) {
      fetchData()
    }
  }, [enabled, province, status, fetchData])

  return { data, isLoading, error, refetch: fetchData }
}
