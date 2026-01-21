"use client"

import { AppRefreshHandler } from './AppRefreshHandler'

export function MobileLayoutClient({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AppRefreshHandler />
      <div className="min-h-screen bg-pearl-950 text-white overflow-x-hidden">
        {children}
      </div>
    </>
  )
}
