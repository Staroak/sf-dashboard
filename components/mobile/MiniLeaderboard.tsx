"use client"

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { ChevronRight, ChevronDown, Trophy, Medal, Award } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Broker {
  userName: string
  value: number
}

interface MiniLeaderboardProps {
  brokers: Broker[]
  metric: string
  limit?: number
  className?: string
  onMetricChange?: (metric: string) => void
  availableMetrics?: string[]
  selectedMetric?: string
}

const getRankIcon = (rank: number) => {
  if (rank === 1) {
    return <Trophy className="w-3.5 h-3.5 text-amber-400" strokeWidth={2.5} />
  }
  if (rank === 2) {
    return <Medal className="w-3.5 h-3.5 text-slate-300" strokeWidth={2.5} />
  }
  if (rank === 3) {
    return <Award className="w-3.5 h-3.5 text-orange-500" strokeWidth={2.5} />
  }
  return <span className="text-white/50 text-xs font-semibold w-3.5 text-center">{rank}</span>
}

const metricLabels: Record<string, string> = {
  applications: 'Applications',
  appraisals: 'Appraisals',
  submissions: 'Submissions',
}

export function MiniLeaderboard({ 
  brokers, 
  metric, 
  limit = 3, 
  className,
  onMetricChange,
  availableMetrics,
  selectedMetric,
}: MiniLeaderboardProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const topBrokers = brokers.slice(0, limit)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  if (topBrokers.length === 0) {
    return (
      <div className={cn("bg-[#0a5694] border border-[#1a6aa8]/40 rounded-2xl p-4 shadow-md shadow-black/20", className)}>
        <h3 className="text-[11px] font-bold text-white/80 mb-2 uppercase tracking-wider">Top Performers</h3>
        <p className="text-white/50 text-xs text-center py-4">No data yet</p>
      </div>
    )
  }

  return (
    <div className={cn("bg-[#0a5694] border border-[#1a6aa8]/40 rounded-2xl p-4 shadow-md shadow-black/20", className)}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-[11px] font-bold text-white/80 uppercase tracking-wider">Top Performers</h3>
        
        {/* Metric Dropdown */}
        {onMetricChange && availableMetrics ? (
          <div ref={dropdownRef} className="relative">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="flex items-center gap-1.5 text-[11px] text-white/70 hover:text-white transition-all duration-200 font-semibold px-2 py-1 rounded-lg hover:bg-white/10"
            >
              <span>{metricLabels[selectedMetric || ''] || metric}</span>
              <ChevronDown className={cn(
                "w-3.5 h-3.5 transition-transform duration-300",
                isOpen && "rotate-180"
              )} />
            </button>

            {isOpen && (
              <div className="absolute top-full right-0 mt-2 w-36 bg-[#084a7a]/95 backdrop-blur-xl border border-[#1a6aa8]/40 rounded-xl shadow-2xl overflow-hidden z-50 animate-fadeIn">
                {availableMetrics.map((m) => (
                  <button
                    key={m}
                    onClick={() => {
                      onMetricChange(m)
                      setIsOpen(false)
                    }}
                    className={cn(
                      "w-full px-3.5 py-2.5 text-left text-xs font-semibold transition-all duration-200",
                      selectedMetric === m
                        ? "bg-white/15 text-white shadow-sm"
                        : "text-white/70 hover:bg-white/10 hover:text-white"
                    )}
                  >
                    {metricLabels[m] || m}
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <span className="text-[11px] text-white/60 font-medium">{metric}</span>
        )}
      </div>

      <div className="space-y-1.5">
        {topBrokers.map((broker, index) => (
          <div
            key={broker.userName}
            className={cn(
              "flex items-center justify-between py-1.5 px-2.5 rounded-lg transition-all duration-200",
              index < 3 ? "bg-white/10 border border-white/10" : "bg-white/5"
            )}
          >
            <div className="flex items-center gap-2.5">
              <div className="w-6 flex items-center justify-center">
                {getRankIcon(index + 1)}
              </div>
              <span className="text-white font-semibold text-[13px] truncate max-w-[140px]">
                {broker.userName}
              </span>
            </div>
            <span className="text-white font-bold tabular-nums text-sm">
              {broker.value}
            </span>
          </div>
        ))}
      </div>

      <Link
        href="/mobile/leaderboard"
        className="flex items-center justify-center gap-1 mt-3 pt-3 border-t border-white/10 text-white/70 text-xs font-semibold hover:text-white active:text-white/90 transition-all duration-200 group"
      >
        See all
        <ChevronRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5" />
      </Link>
    </div>
  )
}
