"use client"

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useOnlineStatus } from '@/hooks/useOnlineStatus'
import { getCached, setCache } from '@/lib/prefetch'
import { MobileNav, MobileHeader, TimePeriodSelect, OfflineNotice } from '@/components/mobile'
import { BrokerRow } from '@/components/mobile/BrokerRow'
import { cn } from '@/lib/utils'

type Period = 'today' | 'week' | 'month'
type Metric = 'applications' | 'appraisals' | 'submissions' | 'contacts'

// Hardcoded list of valid broker names (from Salesforce) - same as web dashboard
const VALID_BROKERS = [
  'Alice Nabi', 'Alika Walia', 'Baldip Nijjar', 'Bowie Nan', 'Brandon Viaje-Roque',
  'Charlene Smith', 'Doyle Minhas', 'Garry Singh', 'Gaurav Dadral', 'Gurjit Sandhu',
  'Gurpreet Kaur', 'Harick Brar', 'Harry Dhunna', 'Jennifer Souvanvong', 'Karny Mehat',
  'Lesly Camaclang', 'Madhur Kapoor', 'Megan Robertson', 'Mindy Basran', 'Natalie Pacheco', 'Nav Cheema', 'Olaf Durkowski',
   'Rahul Narula', 'Ranier Manding', 'Renzo Mesia', 'Saihaj Cheema',
  'Salil Singla', 'Savraj Cheema', 'Serg Martires', 'Shaneen Mohammed', 'Shaad bakhtyar','Shiela Jamero', 'Stephanie Viaje',
  'Sunny Dhillon'
]

// Check if broker name is in the valid list
const isRealBroker = (name: string): boolean => {
  if (!name || name === 'Unknown') return false
  return VALID_BROKERS.includes(name)
}

interface BrokerStats {
  userId: string
  userName: string
  contactsMade: number
  applicationsTaken: number
  appraisalsOrdered: number
  submissions: number
}

interface PeriodData {
  salesMetrics?: {
    byBroker: BrokerStats[]
  }
}

interface DashboardData {
  daily: PeriodData
  weekly: PeriodData
  monthly: PeriodData
  leaderboard: BrokerStats[]
}

const metricLabels: Record<Metric, string> = {
  applications: 'Applications',
  appraisals: 'Appraisals',
  submissions: 'Submissions',
  contacts: 'Contacts',
}

export default function LeaderboardPage() {
  const isOnline = useOnlineStatus()
  const [data, setData] = useState<DashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [period, setPeriod] = useState<Period>('today')
  const [metric, setMetric] = useState<Metric>('applications')

  const fetchData = useCallback(async () => {
    if (!isOnline) return

    // Check cache first for instant display
    if (isLoading) {
      const cached = getCached<DashboardData>('dashboard')
      if (cached) {
        setData(cached)
        setIsLoading(false)
        return // Use cached data, no need to refetch
      }
    }

    try {
      const response = await fetch(`/api/dashboard?t=${Date.now()}`, {
        cache: 'no-store',
      })
      if (!response.ok) throw new Error('Failed to fetch')
      const dashboardData = await response.json()
      setData(dashboardData)
      setCache('dashboard', dashboardData)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setIsLoading(false)
    }
  }, [isOnline, isLoading])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  if (!isOnline) {
    return <OfflineNotice onRetry={() => window.location.reload()} />
  }

  const getBrokers = useCallback((): BrokerStats[] => {
    if (!data) return []
    let periodData: PeriodData | undefined
    switch (period) {
      case 'today':
        periodData = data.daily
        break
      case 'week':
        periodData = data.weekly
        break
      case 'month':
        periodData = data.monthly
        break
    }
    const allBrokers = periodData?.salesMetrics?.byBroker || data.leaderboard || []
    // Filter to only include valid brokers from our hardcoded list
    return allBrokers.filter(broker => isRealBroker(broker.userName))
  }, [data, period])

  // Get metric value for a broker based on current metric selection
  const getMetricValue = useCallback((broker: BrokerStats): number => {
    switch (metric) {
      case 'applications':
        return broker.applicationsTaken
      case 'appraisals':
        return broker.appraisalsOrdered
      case 'submissions':
        return broker.submissions
      case 'contacts':
        return broker.contactsMade
      default:
        return 0
    }
  }, [metric])

  // Deduplicate and sort brokers - keep broker with highest metric value for duplicates
  const sortedBrokers = useMemo(() => {
    const validBrokers = getBrokers()

    // Deduplicate by name - keep broker with highest metric value
    const brokerMap = new Map<string, BrokerStats>()
    for (const broker of validBrokers) {
      const existing = brokerMap.get(broker.userName)
      if (!existing || getMetricValue(broker) > getMetricValue(existing)) {
        brokerMap.set(broker.userName, broker)
      }
    }

    // Convert back to array and sort by selected metric
    return Array.from(brokerMap.values()).sort((a, b) => {
      return getMetricValue(b) - getMetricValue(a)
    })
  }, [getBrokers, getMetricValue])

  const getValue = (broker: BrokerStats) => getMetricValue(broker)

  return (
    <div className="h-screen bg-pearl-950 mobile-grid-dots flex flex-col overflow-hidden">
      <MobileHeader title="Leaderboard" />
      
      <main className="flex-1 flex flex-col overflow-hidden px-4 py-4">
        {/* Period Selector */}
        <div className="mb-3 flex-shrink-0">
          <TimePeriodSelect value={period} onChange={setPeriod} />
        </div>

        {/* Metric Filter */}
        <div className="flex gap-2 overflow-x-auto pb-3 mb-3 flex-shrink-0 hide-scrollbar">
          {(Object.keys(metricLabels) as Metric[]).map((m) => (
            <button
              key={m}
              onClick={() => setMetric(m)}
              className={cn(
                "px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-300 border shadow-sm",
                metric === m
                  ? 'bg-[#0a5694] text-white border-[#1a6aa8]/40 shadow-lg shadow-black/20'
                  : 'bg-[#0a5694]/40 text-white/70 border-[#1a6aa8]/20 hover:bg-[#0a5694]/60 hover:text-white hover:border-[#1a6aa8]/30 active:scale-95'
              )}
            >
              {metricLabels[m]}
            </button>
          ))}
        </div>

        {/* Leaderboard List - Scrollable */}
        <div className="flex-1 overflow-y-auto pb-20">
          {isLoading ? (
            <div className="space-y-2.5">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div 
                  key={i} 
                  className="h-[60px] bg-gradient-to-br from-pearl-800/30 to-pearl-800/10 rounded-2xl animate-pulse border border-pearl-700/10"
                  style={{ animationDelay: `${i * 50}ms` }}
                />
              ))}
            </div>
          ) : sortedBrokers.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-pearl-400 text-sm">No data available</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {sortedBrokers.map((broker, index) => (
                <BrokerRow
                  key={broker.userId}
                  rank={index + 1}
                  name={broker.userName}
                  value={getValue(broker)}
                  isHighlighted={index < 3}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      <MobileNav />
    </div>
  )
}
