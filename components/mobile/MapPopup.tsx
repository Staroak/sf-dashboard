"use client"

import { MapPin, DollarSign, TrendingUp } from 'lucide-react'
import { formatCurrency, type Neighborhood, type District } from '@/lib/map-config'

interface MapPopupProps {
  item: Neighborhood | District
  type: 'district' | 'neighborhood'
}

export function MapPopup({ item, type }: MapPopupProps) {
  const name = type === 'district'
    ? (item as District).district
    : (item as Neighborhood).name

  const subtitle = type === 'neighborhood'
    ? (item as Neighborhood).city
    : null

  return (
    <div className="min-w-[200px] p-1">
      <div className="flex items-start gap-2 mb-3">
        <MapPin className="w-4 h-4 text-[#0a5694] mt-0.5 shrink-0" />
        <div>
          <h3 className="font-semibold text-white text-sm">{name}</h3>
          {subtitle && (
            <p className="text-xs text-white/60">{subtitle}</p>
          )}
          {type === 'neighborhood' && (
            <p className="text-xs text-white/40 mt-0.5">
              FSA: {(item as Neighborhood).fsa}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-2 mb-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-white/70">Deals</span>
          <span className="font-semibold text-white">{item.count}</span>
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-white/70 flex items-center gap-1">
            <DollarSign className="w-3 h-3" />
            Avg Mortgage
          </span>
          <span className="font-medium text-[#4da6db]">
            {formatCurrency(item.avgMortgage)}
          </span>
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-white/70 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            Avg Income
          </span>
          <span className="font-medium text-green-400">
            {formatCurrency(item.avgIncome)}
          </span>
        </div>
      </div>
    </div>
  )
}
