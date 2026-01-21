"use client"

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/providers/AuthProvider'

export function AppRefreshHandler() {
  const lastHiddenTime = useRef<number | null>(null)
  const { signOut } = useAuth()
  const router = useRouter()
  
  useEffect(() => {
    // Thresholds
    const REFRESH_THRESHOLD_MS = 30 * 1000      // 30 seconds - just reload
    const RELOGIN_THRESHOLD_MS = 10 * 60 * 1000 // 10 minutes - force re-login
    
    const handleVisibilityChange = async () => {
      if (document.hidden) {
        // App going to background - record the time
        lastHiddenTime.current = Date.now()
      } else {
        // App coming back to foreground
        if (lastHiddenTime.current) {
          const timeInBackground = Date.now() - lastHiddenTime.current
          
          if (timeInBackground >= RELOGIN_THRESHOLD_MS) {
            // Been away for 10+ minutes - sign out and redirect to login
            await signOut()
            router.push('/mobile/login')
          } else if (timeInBackground >= REFRESH_THRESHOLD_MS) {
            // Been away for 30s+ but less than 10 min - just reload
            window.location.reload()
          }
          // Less than 30 seconds - do nothing
        }
        lastHiddenTime.current = null
      }
    }
    
    document.addEventListener('visibilitychange', handleVisibilityChange)
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [signOut, router])
  
  return null
}
