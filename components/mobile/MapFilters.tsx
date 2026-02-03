"use client"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { PROVINCES, DEAL_STATUSES } from '@/lib/map-config'
import { cn } from '@/lib/utils'

interface MapFiltersProps {
  province: number | null
  status: number | null
  onProvinceChange: (value: number | null) => void
  onStatusChange: (value: number | null) => void
  totalDeals: number
  isLoading?: boolean
  className?: string
}

export function MapFilters({
  province,
  status,
  onProvinceChange,
  onStatusChange,
  totalDeals,
  isLoading,
  className,
}: MapFiltersProps) {
  return (
    <div className={cn("flex items-center gap-2 px-4 py-3 bg-black/40 border-b border-white/10", className)}>
      <Select
        value={province?.toString() ?? "all"}
        onValueChange={(v) => onProvinceChange(v === "all" ? null : parseInt(v, 10))}
      >
        <SelectTrigger
          size="sm"
          className="w-[130px] bg-[#0a5694]/30 border-[#1a6aa8]/40 text-white text-xs"
        >
          <SelectValue placeholder="Province" />
        </SelectTrigger>
        <SelectContent className="bg-pearl-900 border-[#1a6aa8]/40">
          <SelectItem value="all" className="text-white text-xs">
            All Provinces
          </SelectItem>
          {PROVINCES.map((p) => (
            <SelectItem
              key={p.value}
              value={p.value.toString()}
              className="text-white text-xs"
            >
              {p.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={status?.toString() ?? "all"}
        onValueChange={(v) => onStatusChange(v === "all" ? null : parseInt(v, 10))}
      >
        <SelectTrigger
          size="sm"
          className="w-[120px] bg-[#0a5694]/30 border-[#1a6aa8]/40 text-white text-xs"
        >
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent className="bg-pearl-900 border-[#1a6aa8]/40">
          <SelectItem value="all" className="text-white text-xs">
            All Statuses
          </SelectItem>
          {DEAL_STATUSES.map((s) => (
            <SelectItem
              key={s.value}
              value={s.value.toString()}
              className="text-white text-xs"
            >
              {s.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="ml-auto text-xs text-white/70">
        {isLoading ? (
          <span className="animate-pulse">Loading...</span>
        ) : (
          <>
            <span className="font-semibold text-white">{totalDeals.toLocaleString()}</span>
            {' '}deals
          </>
        )}
      </div>
    </div>
  )
}
