"use client"

import Image from 'next/image'
import { cn } from '@/lib/utils'

interface MobileHeaderProps {
  title?: string
  userName?: string
  className?: string
}

export function MobileHeader({ title, userName, className }: MobileHeaderProps) {
  const initial = userName?.charAt(0).toUpperCase() || 'U'

  return (
    <header className={cn(
      "sticky top-0 z-40 bg-black/95 backdrop-blur-xl border-b border-[#0a5694]/40 shadow-lg shadow-black/20",
      className
    )}>
      <div className="flex items-center justify-between px-4 py-3.5">
        {/* Logo and Title */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 relative ring-1 ring-[#0a5694]/50 rounded-lg overflow-hidden shadow-[0_0_8px_rgba(10,86,148,0.4)]">
            <Image
              src="/BP-Logo.png"
              alt="Blue Pearl"
              fill
              className="object-contain"
            />
          </div>
          <div>
            <h1 className="text-base font-semibold text-white tracking-tight [text-shadow:0_0_10px_rgba(10,86,148,0.8),0_0_20px_rgba(10,86,148,0.5)]">
              {title || 'Blue Pearl'}
            </h1>
            <p className="text-[11px] text-[#4da6db] font-medium [text-shadow:0_0_8px_rgba(77,166,219,0.5)]">Executive Dashboard</p>
          </div>
        </div>

        {/* User Avatar */}
        {userName && (
          <div className="flex items-center gap-2.5">
            <span className="text-sm text-white/80 hidden sm:block font-medium [text-shadow:0_0_8px_rgba(10,86,148,0.5)]">
              {userName.split(' ')[0]}
            </span>
            <div className="w-9 h-9 rounded-full bg-[#0a5694]/30 flex items-center justify-center ring-2 ring-[#0a5694]/50 shadow-[0_0_10px_rgba(10,86,148,0.4)]">
              <span className="text-sm font-semibold text-white [text-shadow:0_0_6px_rgba(10,86,148,0.6)]">{initial}</span>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
