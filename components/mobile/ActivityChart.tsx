"use client"

import { useMemo } from 'react'
import { cn } from '@/lib/utils'

interface ActivityChartProps {
  data: {
    applications: number
    appraisals: number
    submissions: number
    contacts: number
  }
  className?: string
}

export function ActivityChart({ data, className }: ActivityChartProps) {
  const total = data.applications + data.appraisals + data.submissions + data.contacts
  
  const segments = useMemo(() => {
    if (total === 0) return []

    return [
      { label: 'Apps', value: data.applications, color: 'bg-[#4da6db]', percent: (data.applications / total) * 100 },
      { label: 'Appr', value: data.appraisals, color: 'bg-[#a0aec0]', percent: (data.appraisals / total) * 100 },
      { label: 'Subs', value: data.submissions, color: 'bg-[#e8edf2]', percent: (data.submissions / total) * 100 },
      { label: 'Cont', value: data.contacts, color: 'bg-[#0d6ebd]', percent: (data.contacts / total) * 100 },
    ].filter(s => s.value > 0)
  }, [data, total])

  return (
    <div className={cn("bg-[#0a5694] border border-[#1a6aa8]/40 rounded-2xl p-4 shadow-md shadow-black/20", className)}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-[11px] font-bold text-white/80 uppercase tracking-wider">Total Activity</h3>
        <span className="text-xl font-bold text-white tabular-nums tracking-tight">{total}</span>
      </div>

      {/* Progress bar showing distribution */}
      <div className="h-2.5 bg-black/20 rounded-full overflow-hidden flex shadow-inner">
        {segments.map((segment, i) => (
          <div
            key={segment.label}
            className={cn(segment.color, "transition-all duration-700 first:rounded-l-full last:rounded-r-full")}
            style={{ width: `${segment.percent}%` }}
          />
        ))}
      </div>
      
      {/* Legend */}
      <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-3">
        {segments.map((segment) => (
          <div key={segment.label} className="flex items-center gap-1.5">
            <div className={cn("w-2.5 h-2.5 rounded-full shadow-sm", segment.color)} />
            <span className="text-[11px] text-white/70 font-medium">
              {segment.label}: <span className="font-semibold text-white">{segment.value}</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
