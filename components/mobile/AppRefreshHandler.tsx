"use client"

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/providers/AuthProvider'

export function AppRefreshHandler() {
  const { signOut } = useAuth()
  const router = useRouter()
  const signOutTimerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const GRACE_PERIOD_MS = 20 * 1000 // 20 seconds

    const handleVisibilityChange = async () => {
      if (document.hidden) {
        // App going to background - start grace period timer
        signOutTimerRef.current = setTimeout(async () => {
          // Only sign out if still hidden after grace period
          if (document.hidden) {
            await signOut()
          }
        }, GRACE_PERIOD_MS)
      } else {
        // App coming back - cancel the sign out timer if it exists
        if (signOutTimerRef.current) {
          clearTimeout(signOutTimerRef.current)
          signOutTimerRef.current = null
        }
      }
    }

    // Also handle page unload for when user navigates away or closes tab
    const handleBeforeUnload = () => {
      signOut()
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('beforeunload', handleBeforeUnload)
      if (signOutTimerRef.current) {
        clearTimeout(signOutTimerRef.current)
      }
    }
  }, [signOut, router])

  return null
}
