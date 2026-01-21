"use client"

import { useState, useEffect, useCallback, useMemo } from 'react'
import { FileText, ClipboardCheck, Send, Phone } from 'lucide-react'
import { useAuth } from '@/providers/AuthProvider'
import { useOnlineStatus } from '@/hooks/useOnlineStatus'
import { MobileNav, MobileHeader, MetricCard, TimePeriodSelect, MiniLeaderboard, OfflineNotice, ActivityChart } from '@/components/mobile'

type Period = 'today' | 'week' | 'month'
type LeaderboardMetric = 'applications' | 'appraisals' | 'submissions'

// Hardcoded list of valid broker names (from Salesforce) - same as web dashboard
const VALID_BROKERS = [
  'Alice Nabi', 'Alika Walia', 'Baldip Nijjar', 'Bowie Nan', 'Brandon Viaje-Roque', 'Brendan Wilson',
  'Charlene Smith', 'Doyle Minhas', 'Garry Singh', 'Gaurav Dadral', 'Gurjit Sandhu',
  'Gurpreet Kaur', 'Harick Brar', 'Jaslene Perhar', 'Jennifer Souvanvong', 'Karny Mehat',
  'Lesly Camaclang', 'Megan Robertson', 'Mindy Basran', 'Natalie Pacheco', 'Nav Cheema', 'Olaf Durkowski',
  'Parmeet Singh', 'Rahul Narula', 'Ranier Manding', 'Renzo Mesia', 'Saihaj Cheema',
  'Salil Singla', 'Savraj Cheema', 'Serg Martires', 'Shaneen Mohammed', 'Shiela Jamero', 'Stephanie Viaje',
  'Sunny Dhillon'
]

// Check if broker name is in the valid list
function isRealBroker(name: string): boolean {
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
  contactsMade: number
  applicationsTaken: number
  appraisalsOrdered: number
  submissions: number
  salesMetrics?: {
    byBroker: BrokerStats[]
  }
}

interface DashboardData {
  timestamp: string
  daily: PeriodData
  yesterday: PeriodData
  weekly: PeriodData
  monthly: PeriodData
  leaderboard: BrokerStats[]
}

// Daily goals
const DAILY_GOALS = {
  applications: 33,
  appraisals: 10,
  submissions: 8,
}

export default function MobileDashboardPage() {
  const { user, isLoading: authLoading } = useAuth()
  const isOnline = useOnlineStatus()
  
  const [data, setData] = useState<DashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [period, setPeriod] = useState<Period>('today')
  const [leaderboardMetric, setLeaderboardMetric] = useState<LeaderboardMetric>('applications')

  const fetchData = useCallback(async () => {
    if (!isOnline) return
    
    try {
      const response = await fetch(`/api/dashboard?t=${Date.now()}`, {
        cache: 'no-store',
      })
      if (!response.ok) throw new Error('Failed to fetch')
      const dashboardData = await response.json()
      setData(dashboardData)
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }, [isOnline])

  useEffect(() => {
    fetchData()
    // Refresh every 30 seconds
    const interval = setInterval(fetchData, 30000)
    return () => clearInterval(interval)
  }, [fetchData])

  // Get data for the selected period
  const getPeriodData = () => {
    if (!data) return null
    switch (period) {
      case 'today':
        return data.daily
      case 'week':
        return data.weekly
      case 'month':
        return data.monthly
    }
  }

  // Get metric value for a broker based on current metric selection
  const getMetricValue = useCallback((broker: BrokerStats): number => {
    switch (leaderboardMetric) {
      case 'applications':
        return broker.applicationsTaken
      case 'appraisals':
        return broker.appraisalsOrdered
      case 'submissions':
        return broker.submissions
      default:
        return 0
    }
  }, [leaderboardMetric])

  // Deduplicate and sort leaderboard data
  const getLeaderboardData = useMemo(() => {
    if (!data) return []
    const periodData = getPeriodData()
    const allBrokers = periodData?.salesMetrics?.byBroker || data.leaderboard || []

    // Filter to only include valid brokers from our hardcoded list
    const validBrokers = allBrokers.filter(broker => isRealBroker(broker.userName))

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
  }, [data, period, getMetricValue])

  const getLeaderboardValue = (broker: BrokerStats) => {
    switch (leaderboardMetric) {
      case 'applications':
        return broker.applicationsTaken
      case 'appraisals':
        return broker.appraisalsOrdered
      case 'submissions':
        return broker.submissions
    }
  }

  // Show offline notice
  if (!isOnline) {
    return <OfflineNotice onRetry={() => window.location.reload()} />
  }

  // Show loading skeleton
  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-pearl-950 mobile-grid-dots">
        <MobileHeader />
        <main className="px-4 py-4 pb-20">
          <div className="space-y-3">
            <div className="h-8 w-48 bg-gradient-to-r from-pearl-800/40 to-pearl-800/20 rounded-xl animate-pulse" />
            <div className="grid grid-cols-2 gap-2">
              {[1, 2, 3, 4].map((i) => (
                <div 
                  key={i} 
                  className="h-[120px] bg-gradient-to-br from-pearl-800/30 to-pearl-800/10 rounded-2xl animate-pulse border border-pearl-700/10"
                  style={{ animationDelay: `${i * 75}ms` }}
                />
              ))}
            </div>
            <div className="h-32 bg-gradient-to-br from-pearl-800/30 to-pearl-800/10 rounded-2xl animate-pulse border border-pearl-700/10" />
            <div className="h-56 bg-gradient-to-br from-pearl-800/30 to-pearl-800/10 rounded-2xl animate-pulse border border-pearl-700/10" />
          </div>
        </main>
        <MobileNav />
      </div>
    )
  }

  const periodData = getPeriodData()
  const leaderboardBrokers = getLeaderboardData
  const userName = user?.email?.split('@')[0] || 'User'

  const metricLabels: Record<LeaderboardMetric, string> = {
    applications: 'Applications',
    appraisals: 'Appraisals',
    submissions: 'Submissions',
  }

  return (
    <div className="h-screen bg-pearl-950 mobile-grid-dots flex flex-col overflow-hidden">
      <MobileHeader userName={userName} />
      
      <main className="flex-1 px-4 py-3 pb-24 overflow-y-auto flex flex-col min-h-0">
        {/* Pull to refresh indicator */}
        {isRefreshing && (
          <div className="flex justify-center mb-2">
            <div className="w-5 h-5 border-2 border-pearl-500/30 border-t-pearl-500 rounded-full animate-spin" />
          </div>
        )}

        {/* Time Period Selector */}
        <div className="mb-3">
          <TimePeriodSelect value={period} onChange={setPeriod} />
        </div>

        {/* Metric Cards Grid - Compact */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          <MetricCard
            title="Applications"
            value={periodData?.applicationsTaken || 0}
            goal={period === 'today' ? DAILY_GOALS.applications : undefined}
            icon={FileText}
            compact
          />
          <MetricCard
            title="Appraisals"
            value={periodData?.appraisalsOrdered || 0}
            goal={period === 'today' ? DAILY_GOALS.appraisals : undefined}
            icon={ClipboardCheck}
            compact
          />
          <MetricCard
            title="Submissions"
            value={periodData?.submissions || 0}
            goal={period === 'today' ? DAILY_GOALS.submissions : undefined}
            icon={Send}
            compact
          />
          <MetricCard
            title="Contacts"
            value={periodData?.contactsMade || 0}
            icon={Phone}
            compact
          />
        </div>

        {/* Activity Summary Chart */}
        <ActivityChart
          data={{
            applications: periodData?.applicationsTaken || 0,
            appraisals: periodData?.appraisalsOrdered || 0,
            submissions: periodData?.submissions || 0,
            contacts: periodData?.contactsMade || 0,
          }}
          className="mb-2"
        />

        {/* Mini Leaderboard with metric selector */}
        <MiniLeaderboard
          brokers={leaderboardBrokers.map(b => ({
            userName: b.userName,
            value: getLeaderboardValue(b),
          }))}
          metric={metricLabels[leaderboardMetric]}
          limit={5}
          onMetricChange={(metric) => setLeaderboardMetric(metric as LeaderboardMetric)}
          availableMetrics={['applications', 'appraisals', 'submissions']}
          selectedMetric={leaderboardMetric}
        />

        {/* Last updated - smaller */}
        {data?.timestamp && (
          <p className="text-center text-pearl-600 text-[10px] mt-auto pt-2">
            Updated {new Date(data.timestamp).toLocaleTimeString()}
          </p>
        )}
      </main>

      <MobileNav />
    </div>
  )
}
