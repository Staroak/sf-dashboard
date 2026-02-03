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
      const queryParams = new URLSearchParams()
      if (province != null) queryParams.set('province', String(province))
      if (status != null) queryParams.set('status', String(status))
      // Add cache-busting timestamp
      queryParams.set('t', String(Date.now()))

      const url = `${API_URL}?${queryParams.toString()}`

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${API_KEY}`,
        },
        cache: 'no-store',
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch map data: ${response.status}`)
      }

      const result: MapDataResponse = await response.json()
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
