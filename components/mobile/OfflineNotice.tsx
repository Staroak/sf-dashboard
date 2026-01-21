"use client"

import { WifiOff, RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'

interface OfflineNoticeProps {
  onRetry?: () => void
  className?: string
}

export function OfflineNotice({ onRetry, className }: OfflineNoticeProps) {
  return (
    <div className={cn(
      "fixed inset-0 bg-pearl-950 z-[100] flex flex-col items-center justify-center px-6",
      className
    )}>
      <div className="flex flex-col items-center text-center max-w-sm">
        {/* Icon */}
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-pearl-900/60 to-pearl-900/30 flex items-center justify-center mb-8 border border-pearl-800/30 shadow-xl">
          <WifiOff className="w-11 h-11 text-pearl-400" strokeWidth={1.5} />
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-white mb-3 tracking-tight">
          No Connection
        </h2>

        {/* Description */}
        <p className="text-pearl-400/90 text-sm leading-relaxed mb-10 max-w-xs">
          Please reconnect to the internet to view your dashboard.
        </p>

        {/* Retry Button */}
        {onRetry && (
          <button
            onClick={onRetry}
            className="flex items-center gap-2.5 px-7 py-3.5 bg-gradient-to-br from-pearl-700 to-pearl-800 hover:from-pearl-600 hover:to-pearl-700 active:from-pearl-800 active:to-pearl-900 text-white font-semibold rounded-xl transition-all duration-200 active:scale-95 shadow-lg shadow-pearl-900/50"
          >
            <RefreshCw className="w-5 h-5" />
            Try Again
          </button>
        )}
      </div>
    </div>
  )
}
