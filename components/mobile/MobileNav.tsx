"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Trophy, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/mobile/dashboard', icon: Home, label: 'Home' },
  { href: '/mobile/leaderboard', icon: Trophy, label: 'Board' },
  { href: '/mobile/settings', icon: Settings, label: 'More' },
]

export function MobileNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-black/95 backdrop-blur-xl border-t border-[#0a5694]/40 safe-area-pb z-50 shadow-[0_-4px_16px_rgba(0,0,0,0.3)]">
      <div className="flex items-center justify-around px-2 py-2.5">
        {navItems.map((item) => {
          const isActive = pathname === item.href ||
            (item.href !== '/mobile/dashboard' && pathname.startsWith(item.href.split('/').slice(0, 3).join('/')))

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center min-w-[68px] py-2.5 px-3 rounded-xl transition-all duration-300 ease-out",
                isActive
                  ? "text-white bg-[#0a5694]/30 shadow-[0_0_12px_rgba(10,86,148,0.5)]"
                  : "text-[#4da6db]/70 hover:text-[#4da6db] active:scale-95 hover:bg-[#0a5694]/20"
              )}
            >
              <item.icon className={cn(
                "w-[22px] h-[22px] mb-1 transition-all duration-300",
                isActive && "scale-110 drop-shadow-[0_0_4px_rgba(10,86,148,0.8)]"
              )} />
              <span className={cn(
                "text-[11px] font-semibold tracking-wide",
                isActive ? "[text-shadow:0_0_8px_rgba(10,86,148,0.8)]" : ""
              )}>{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
