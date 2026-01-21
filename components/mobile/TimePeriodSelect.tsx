"use client"

import { useState, useRef, useEffect } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

type Period = 'today' | 'week' | 'month'

interface TimePeriodSelectProps {
  value: Period
  onChange: (value: Period) => void
  className?: string
}

const periodLabels: Record<Period, string> = {
  today: "Today",
  week: "Weekly",
  month: "Monthly",
}

export function TimePeriodSelect({ value, onChange, className }: TimePeriodSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div ref={dropdownRef} className={cn("relative", className)}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 text-xl font-bold text-white active:opacity-80 transition-all duration-200 hover:text-white/90 group"
      >
        <span className="tracking-tight">{periodLabels[value]} Performance</span>
        <ChevronDown className={cn(
          "w-5 h-5 text-white/70 transition-all duration-300 group-hover:text-white/90",
          isOpen && "rotate-180"
        )} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-3 w-52 bg-[#084a7a]/95 backdrop-blur-xl border border-[#1a6aa8]/40 rounded-2xl shadow-2xl overflow-hidden z-50 animate-fadeIn">
          {(Object.keys(periodLabels) as Period[]).map((period) => (
            <button
              key={period}
              onClick={() => {
                onChange(period)
                setIsOpen(false)
              }}
              className={cn(
                "w-full px-5 py-3.5 text-left text-sm font-semibold transition-all duration-200",
                value === period
                  ? "bg-white/15 text-white shadow-sm"
                  : "text-white/70 hover:bg-white/10 hover:text-white"
              )}
            >
              {periodLabels[period]}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
