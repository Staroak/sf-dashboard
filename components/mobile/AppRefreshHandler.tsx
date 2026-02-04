"use client"

import { useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/providers/AuthProvider'

const STORAGE_KEY = 'app_background_timestamp'
const GRACE_PERIOD_MS = 20 * 1000 // 20 seconds

export function AppRefreshHandler() {
  const { signOut } = useAuth()
  const router = useRouter()
  const signOutTimerRef = useRef<NodeJS.Timeout | null>(null)

  const recordBackgroundTime = useCallback(() => {
    localStorage.setItem(STORAGE_KEY, Date.now().toString())
  }, [])

  const clearBackgroundTime = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY)
  }, [])

  const checkAndSignOutIfNeeded = useCallback(async () => {
    const storedTime = localStorage.getItem(STORAGE_KEY)
    if (storedTime) {
      const timeAway = Date.now() - parseInt(storedTime, 10)
      if (timeAway >= GRACE_PERIOD_MS) {
        clearBackgroundTime()
        await signOut()
        router.push('/mobile/login')
        return true
      }
    }
    clearBackgroundTime()
    return false
  }, [signOut, router, clearBackgroundTime])

  useEffect(() => {
    // Check on mount - handles case where PWA was killed while backgrounded
    checkAndSignOutIfNeeded()

    const startSignOutTimer = () => {
      // Clear any existing timer
      if (signOutTimerRef.current) {
        clearTimeout(signOutTimerRef.current)
      }

      // Persist timestamp to localStorage (survives app kill)
      recordBackgroundTime()

      // Timer as backup for when app stays alive
      signOutTimerRef.current = setTimeout(async () => {
        await signOut()
        router.push('/mobile/login')
      }, GRACE_PERIOD_MS)
    }

    const cancelSignOutTimer = () => {
      if (signOutTimerRef.current) {
        clearTimeout(signOutTimerRef.current)
        signOutTimerRef.current = null
      }
    }

    const handleGoingToBackground = () => {
      startSignOutTimer()
    }

    const handleComingToForeground = async () => {
      cancelSignOutTimer()
      await checkAndSignOutIfNeeded()
    }

    // visibilitychange - standard event
    const handleVisibilityChange = () => {
      if (document.hidden) {
        handleGoingToBackground()
      } else {
        handleComingToForeground()
      }
    }

    // pagehide - fires reliably when PWA goes to background
    const handlePageHide = () => {
      handleGoingToBackground()
    }

    // pageshow - fires when PWA comes back, including from bfcache
    const handlePageShow = () => {
      handleComingToForeground()
    }

    // blur/focus - additional backup
    const handleBlur = () => {
      handleGoingToBackground()
    }

    const handleFocus = () => {
      handleComingToForeground()
    }

    // beforeunload - tab close
    const handleBeforeUnload = () => {
      signOut()
    }

    // Add all event listeners
    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('pagehide', handlePageHide)
    window.addEventListener('pageshow', handlePageShow)
    window.addEventListener('blur', handleBlur)
    window.addEventListener('focus', handleFocus)
    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('pagehide', handlePageHide)
      window.removeEventListener('pageshow', handlePageShow)
      window.removeEventListener('blur', handleBlur)
      window.removeEventListener('focus', handleFocus)
      window.removeEventListener('beforeunload', handleBeforeUnload)
      if (signOutTimerRef.current) {
        clearTimeout(signOutTimerRef.current)
      }
    }
  }, [signOut, router, recordBackgroundTime, checkAndSignOutIfNeeded])

  return null
}
