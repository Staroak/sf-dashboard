"use client"

import { Loader2 } from 'lucide-react'

export function MapLoadingSkeleton() {
  return (
    <div className="relative w-full h-full bg-pearl-900 flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="w-8 h-8 text-[#0a5694] animate-spin" />
        <span className="text-sm text-white/70">Loading map...</span>
      </div>
      <div className="absolute inset-0 opacity-20 bg-gradient-to-br from-[#0a5694]/30 to-transparent pointer-events-none" />
    </div>
  )
}
