"use client"

import { cn } from '@/lib/utils'
import { Trophy, Medal, Award } from 'lucide-react'

interface BrokerRowProps {
  rank: number
  name: string
  value: number
  metric?: string
  isHighlighted?: boolean
  className?: string
}

const getRankBadge = (rank: number) => {
  if (rank === 1) {
    return (
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-md shadow-amber-900/30 ring-2 ring-amber-300/20">
        <Trophy className="w-4 h-4 text-amber-950" strokeWidth={2.5} />
      </div>
    )
  }
  if (rank === 2) {
    return (
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-300 to-slate-400 flex items-center justify-center shadow-md shadow-slate-900/30 ring-2 ring-slate-200/20">
        <Medal className="w-4 h-4 text-slate-700" strokeWidth={2.5} />
      </div>
    )
  }
  if (rank === 3) {
    return (
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-600 to-orange-700 flex items-center justify-center shadow-md shadow-orange-900/30 ring-2 ring-orange-400/20">
        <Award className="w-4 h-4 text-orange-100" strokeWidth={2.5} />
      </div>
    )
  }
  return (
    <div className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center ring-1 ring-white/10">
      <span className="text-white/70 text-sm font-semibold">{rank}</span>
    </div>
  )
}

export function BrokerRow({ rank, name, value, metric, isHighlighted, className }: BrokerRowProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-between py-3.5 px-4 rounded-2xl transition-all duration-300",
        "border shadow-sm",
        isHighlighted
          ? "bg-[#0a5694] border-[#1a6aa8]/40 shadow-md shadow-black/20"
          : "bg-[#0a5694]/60 border-[#1a6aa8]/30 hover:bg-[#0a5694]/80",
        className
      )}
    >
      <div className="flex items-center gap-3.5">
        {getRankBadge(rank)}
        <div>
          <span className="text-white font-semibold text-[15px]">{name}</span>
          {metric && (
            <span className="text-white/50 text-[11px] block mt-0.5 font-medium">{metric}</span>
          )}
        </div>
      </div>
      <span className="text-white font-bold tabular-nums text-lg tracking-tight">
        {value}
      </span>
    </div>
  )
}
