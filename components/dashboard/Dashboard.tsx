"use client";

import { useState, useEffect, useCallback } from "react";
import { RefreshCw, Wifi, WifiOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { StatsSection } from "./StatsSection";
import { Leaderboard, LeaderboardEntry } from "./Leaderboard";
import { BluePearl } from "./BluePearl";
import { QuoteSidebar } from "./QuoteSidebar";

interface DashboardData {
  timestamp: string;
  daily: {
    contactsMade: number;
    applicationsTaken: number;
    appraisalsOrdered: number;
    submissions: number;
  };
  monthly: {
    contactsMade: number;
    applicationsTaken: number;
    appraisalsOrdered: number;
    submissions: number;
  };
  leaderboard: Array<{
    userId: string;
    userName: string;
    appraisalsOrdered: number;
  }>;
}

const REFRESH_INTERVAL = 10000; // 10 seconds
const CONTACTS_GOAL = 100;

export function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isOnline, setIsOnline] = useState(true);

  const fetchData = useCallback(async (isManual = false) => {
    if (isManual) {
      setIsRefreshing(true);
    }

    try {
      // Add cache-busting timestamp to prevent any caching
      const response = await fetch(`/api/dashboard?t=${Date.now()}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch dashboard data');
      }
      const dashboardData = await response.json();
      setData(dashboardData);
      setLastUpdated(new Date());
      setError(null);
      setIsOnline(true);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Unable to fetch data. Will retry...');
      setIsOnline(false);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  // Initial fetch and periodic refresh
  useEffect(() => {
    fetchData();
    const interval = setInterval(() => fetchData(), REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchData]);

  // Online/offline detection
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Transform leaderboard data
  const leaderboardEntries: LeaderboardEntry[] = (data?.leaderboard || []).map((broker, index) => ({
    rank: index + 1,
    name: broker.userName,
    score: broker.appraisalsOrdered,
  }));

  // Get current time formatted
  const currentTime = new Date().toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  if (loading && !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500" />
          <p className="text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-gray-800 bg-gray-950/95 backdrop-blur supports-[backdrop-filter]:bg-gray-950/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Logo/Brand */}
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                  <span className="text-white font-bold text-lg">BP</span>
                </div>
                <div>
                  <h1 className="font-bold text-xl">Blue Pearl Mortgage</h1>
                  <p className="text-xs text-muted-foreground">Sales Dashboard</p>
                </div>
              </div>
            </div>

            {/* Status and Time */}
            <div className="flex items-center gap-4">
              {/* Connection Status */}
              <div className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-full text-sm",
                isOnline ? "bg-green-500/10 text-green-600" : "bg-red-500/10 text-red-600"
              )}>
                {isOnline ? (
                  <Wifi className="h-4 w-4" />
                ) : (
                  <WifiOff className="h-4 w-4" />
                )}
                <span>{isOnline ? "Live" : "Offline"}</span>
              </div>

              {/* Refresh Button */}
              <button
                onClick={() => fetchData(true)}
                disabled={isRefreshing}
                className={cn(
                  "p-2 rounded-lg hover:bg-accent transition-colors",
                  isRefreshing && "animate-spin"
                )}
                aria-label="Refresh data"
              >
                <RefreshCw className="h-5 w-5 text-muted-foreground" />
              </button>

              {/* Time Display */}
              <div className="text-right">
                <p className="text-2xl font-bold tabular-nums">{currentTime}</p>
                <p className="text-xs text-muted-foreground">{currentDate}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-12 gap-6">
          {/* Main Stats Area - 9 columns */}
          <div className="col-span-12 lg:col-span-9 space-y-6">
            {/* Daily Stats */}
            <StatsSection
              title="Today's Performance"
              period="Daily"
              contactsMade={data?.daily.contactsMade || 0}
              applicationsTaken={data?.daily.applicationsTaken || 0}
              appraisalsOrdered={data?.daily.appraisalsOrdered || 0}
              submissions={data?.daily.submissions || 0}
            />

            {/* Monthly Stats */}
            <StatsSection
              title="Monthly Performance"
              period="Monthly"
              contactsMade={data?.monthly.contactsMade || 0}
              applicationsTaken={data?.monthly.applicationsTaken || 0}
              appraisalsOrdered={data?.monthly.appraisalsOrdered || 0}
              submissions={data?.monthly.submissions || 0}
            />

            {/* Bottom Section: Leaderboard */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Leaderboard
                entries={leaderboardEntries}
                title="Top 5 Appraisal Leaders"
                metric="Appraisals"
              />

              {/* Blue Pearl Goal Tracker */}
              <div className="rounded-xl border border-gray-800 bg-gray-900/80 p-4 shadow-sm flex flex-col items-center justify-center">
                <BluePearl
                  current={data?.daily.contactsMade || 0}
                  goal={CONTACTS_GOAL}
                  label="Daily Contacts Goal"
                />
              </div>
            </div>
          </div>

          {/* Sidebar - 3 columns */}
          <aside className="col-span-12 lg:col-span-3">
            <div className="sticky top-24">
              <QuoteSidebar />

              {/* Last Updated */}
              {lastUpdated && (
                <p className="text-xs text-muted-foreground text-center mt-4">
                  Last updated: {lastUpdated.toLocaleTimeString()}
                </p>
              )}

              {/* Error Message */}
              {error && (
                <div className="mt-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-600 text-sm">
                  {error}
                </div>
              )}
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
