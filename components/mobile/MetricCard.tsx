"use client"

import { cn } from '@/lib/utils'
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react'

interface MetricCardProps {
  title: string
  value: number
  goal?: number
  icon?: LucideIcon
  trend?: number
  onClick?: () => void
  className?: string
  compact?: boolean
}

export function MetricCard({
  title,
  value,
  goal,
  icon: Icon,
  trend,
  onClick,
  className,
  compact = false,
}: MetricCardProps) {
  const progress = goal ? Math.min((value / goal) * 100, 100) : null
  const isGoalMet = goal ? value >= goal : false

  return (
    <button
      onClick={onClick}
      disabled={!onClick}
      className={cn(
        "w-full bg-[#0a5694] border border-[#1a6aa8]/40 rounded-2xl text-left transition-all duration-300",
        "shadow-md shadow-black/20 hover:shadow-lg",
        compact ? "p-3.5" : "p-5",
        onClick && "hover:bg-[#0c65a8] hover:border-[#2a7ab8]/50 active:scale-[0.97] cursor-pointer",
        !onClick && "cursor-default",
        className
      )}
    >
      <div className={cn("flex items-start justify-between", compact ? "mb-2" : "mb-3")}>
        <span className={cn("text-white/80 font-semibold tracking-wide", compact ? "text-[11px] uppercase" : "text-sm")}>{title}</span>
        {Icon && (
          <div className={cn(
            "bg-white/10 rounded-lg backdrop-blur-sm ring-1 ring-white/10",
            compact ? "p-1.5" : "p-2"
          )}>
            <Icon className={cn("text-white/90", compact ? "w-3.5 h-3.5" : "w-4 h-4")} />
          </div>
        )}
      </div>

      <div className="flex items-end justify-between">
        <div>
          <span className={cn(
            "font-bold tabular-nums tracking-tight",
            compact ? "text-[28px]" : "text-4xl",
            isGoalMet ? "text-emerald-400 drop-shadow-sm" : "text-white"
          )}>
            {value}
          </span>
          {goal && (
            <span className={cn("text-white/60 ml-1.5 font-medium", compact ? "text-sm" : "text-lg")}>
              /{goal}
            </span>
          )}
        </div>

        {trend !== undefined && (
          <div className={cn(
            "flex items-center gap-1 font-semibold rounded-full px-2 py-0.5",
            compact ? "text-[11px]" : "text-xs",
            trend >= 0 
              ? "text-emerald-400 bg-emerald-500/10" 
              : "text-red-400 bg-red-500/10"
          )}>
            {trend >= 0 ? (
              <TrendingUp className={cn(compact ? "w-3 h-3" : "w-3.5 h-3.5")} />
            ) : (
              <TrendingDown className={cn(compact ? "w-3 h-3" : "w-3.5 h-3.5")} />
            )}
            <span>{Math.abs(trend)}%</span>
          </div>
        )}
      </div>

      {/* Progress Bar */}
      {progress !== null && (
        <div className={cn(compact ? "mt-2.5" : "mt-4")}>
          <div className={cn(
            "bg-black/20 rounded-full overflow-hidden backdrop-blur-sm",
            compact ? "h-1.5" : "h-2"
          )}>
            <div
              className={cn(
                "h-full rounded-full transition-all duration-700 ease-out shadow-sm",
                isGoalMet
                  ? "bg-gradient-to-r from-emerald-500 to-emerald-400"
                  : "bg-gradient-to-r from-white/80 to-white/60"
              )}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}
    </button>
  )
}
