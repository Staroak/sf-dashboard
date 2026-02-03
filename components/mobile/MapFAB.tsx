"use client"

import { Map } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface MapFABProps {
  onClick: () => void
  className?: string
}

export function MapFAB({ onClick, className }: MapFABProps) {
  return (
    <Button
      onClick={onClick}
      className={cn(
        "fixed bottom-20 right-4 z-40",
        "w-14 h-14 rounded-full",
        "bg-[#0a5694] hover:bg-[#0a5694]/80",
        "shadow-lg shadow-[#0a5694]/30",
        "text-white",
        "active:scale-95 transition-transform",
        className
      )}
      size="icon"
    >
      <Map className="w-6 h-6" />
      <span className="sr-only">Open map</span>
    </Button>
  )
}
