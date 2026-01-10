"use client";

import { useState, useEffect, useCallback } from "react";
import { RefreshCw, Wifi, WifiOff, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { ApplicationsPage } from "./ApplicationsPage";
import { AppraisalsPage } from "./AppraisalsPage";
import { SubmissionsPage } from "./SubmissionsPage";
import { SummaryPage } from "./SummaryPage";
import { ThemeToggle } from "./ThemeToggle";

interface BrokerStats {
  userId: string;
  userName: string;
  contactsMade: number;
  applicationsTaken: number;
  appraisalsOrdered: number;
  submissions: number;
}

interface DashboardData {
  timestamp: string;
  daily: {
    contactsMade: number;
    applicationsTaken: number;
    appraisalsOrdered: number;
    submissions: number;
    salesMetrics?: {
      byBroker: BrokerStats[];
    };
  };
  monthly: {
    contactsMade: number;
    applicationsTaken: number;
    appraisalsOrdered: number;
    submissions: number;
    salesMetrics?: {
      byBroker: BrokerStats[];
    };
  };
  leaderboard: BrokerStats[];
}

const REFRESH_INTERVAL = 10000; // 10 seconds
const PAGE_ROTATION_INTERVAL = 90000; // 1.5 minutes per page

const PAGES = ["applications", "appraisals", "submissions", "summary"] as const;
type PageType = typeof PAGES[number];

const PAGE_LABELS: Record<PageType, string> = {
  applications: "Applications",
  appraisals: "Appraisals",
  submissions: "Submissions",
  summary: "Summary",
};

export function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [currentPage, setCurrentPage] = useState<PageType>("applications");
  const [isPaused, setIsPaused] = useState(false);

  const fetchData = useCallback(async (isManual = false) => {
    if (isManual) {
      setIsRefreshing(true);
    }

    try {
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

  // Page rotation
  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      setCurrentPage((prev) => {
        const currentIndex = PAGES.indexOf(prev);
        const nextIndex = (currentIndex + 1) % PAGES.length;
        return PAGES[nextIndex];
      });
    }, PAGE_ROTATION_INTERVAL);

    return () => clearInterval(interval);
  }, [isPaused]);

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

  const goToPrevPage = () => {
    const currentIndex = PAGES.indexOf(currentPage);
    const prevIndex = (currentIndex - 1 + PAGES.length) % PAGES.length;
    setCurrentPage(PAGES[prevIndex]);
    setIsPaused(true);
  };

  const goToNextPage = () => {
    const currentIndex = PAGES.indexOf(currentPage);
    const nextIndex = (currentIndex + 1) % PAGES.length;
    setCurrentPage(PAGES[nextIndex]);
    setIsPaused(true);
  };

  // Get broker stats from monthly data for leaderboards
  const monthlyBrokers: BrokerStats[] = data?.monthly.salesMetrics?.byBroker || data?.leaderboard || [];

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
      <div className="min-h-screen flex items-center justify-center bg-black dark:bg-black">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500" />
          <p className="text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const renderCurrentPage = () => {
    switch (currentPage) {
      case "applications":
        return (
          <ApplicationsPage
            dailyContacts={data?.daily.contactsMade || 0}
            dailyApplications={data?.daily.applicationsTaken || 0}
            monthlyApplications={data?.monthly.applicationsTaken || 0}
            brokers={monthlyBrokers}
          />
        );
      case "appraisals":
        return (
          <AppraisalsPage
            dailyContacts={data?.daily.contactsMade || 0}
            dailyAppraisals={data?.daily.appraisalsOrdered || 0}
            monthlyAppraisals={data?.monthly.appraisalsOrdered || 0}
            brokers={monthlyBrokers}
          />
        );
      case "submissions":
        return (
          <SubmissionsPage
            dailyContacts={data?.daily.contactsMade || 0}
            dailySubmissions={data?.daily.submissions || 0}
            monthlySubmissions={data?.monthly.submissions || 0}
            brokers={monthlyBrokers}
          />
        );
      case "summary":
        return (
          <SummaryPage
            daily={{
              contactsMade: data?.daily.contactsMade || 0,
              applicationsTaken: data?.daily.applicationsTaken || 0,
              appraisalsOrdered: data?.daily.appraisalsOrdered || 0,
              submissions: data?.daily.submissions || 0,
            }}
            monthly={{
              contactsMade: data?.monthly.contactsMade || 0,
              applicationsTaken: data?.monthly.applicationsTaken || 0,
              appraisalsOrdered: data?.monthly.appraisalsOrdered || 0,
              submissions: data?.monthly.submissions || 0,
            }}
            brokers={monthlyBrokers}
          />
        );
    }
  };

  return (
    <div className="h-screen max-h-screen bg-black dark:bg-black text-white dark:text-white flex flex-col overflow-hidden">
      {/* Header */}
      <header className="flex-shrink-0 border-b border-gray-800 bg-gray-950/95 backdrop-blur supports-[backdrop-filter]:bg-gray-950/60">
        <div className="container mx-auto px-4 py-1.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Logo/Brand */}
              <div className="flex items-center gap-2">
                <img
                  src="/BP-Logo.webp"
                  alt="Blue Pearl Mortgage"
                  className="w-8 h-8 rounded-lg object-contain"
                />
                <div>
                  <h1 className="font-bold text-lg">Blue Pearl Mortgage</h1>
                  <p className="text-xs text-muted-foreground">Sales Dashboard</p>
                </div>
              </div>
            </div>

            {/* Page Navigation */}
            <div className="flex items-center gap-2">
              <button
                onClick={goToPrevPage}
                className="p-2 rounded-lg hover:bg-gray-800 transition-colors"
                aria-label="Previous page"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>

              {/* Page Indicators */}
              <div className="flex items-center gap-2">
                {PAGES.map((page) => (
                  <button
                    key={page}
                    onClick={() => {
                      setCurrentPage(page);
                      setIsPaused(true);
                    }}
                    className={cn(
                      "px-3 py-1 rounded-full text-sm font-medium transition-all",
                      currentPage === page
                        ? "bg-blue-600 text-white"
                        : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                    )}
                  >
                    {PAGE_LABELS[page]}
                  </button>
                ))}
              </div>

              <button
                onClick={goToNextPage}
                className="p-2 rounded-lg hover:bg-gray-800 transition-colors"
                aria-label="Next page"
              >
                <ChevronRight className="h-5 w-5" />
              </button>

              {/* Pause/Resume Button */}
              <button
                onClick={() => setIsPaused(!isPaused)}
                className={cn(
                  "px-3 py-1 rounded-full text-sm font-medium transition-all ml-2",
                  isPaused
                    ? "bg-green-600 text-white"
                    : "bg-gray-800 text-gray-400"
                )}
              >
                {isPaused ? "Resume" : "Auto"}
              </button>
            </div>

            {/* Status and Time */}
            <div className="flex items-center gap-3">
              {/* Connection Status */}
              <div className={cn(
                "flex items-center gap-1.5 px-2 py-1 rounded-full text-xs",
                isOnline ? "bg-green-500/10 text-green-600" : "bg-red-500/10 text-red-600"
              )}>
                {isOnline ? (
                  <Wifi className="h-3 w-3" />
                ) : (
                  <WifiOff className="h-3 w-3" />
                )}
                <span>{isOnline ? "Live" : "Offline"}</span>
              </div>

              {/* Refresh Button */}
              <button
                onClick={() => fetchData(true)}
                disabled={isRefreshing}
                className={cn(
                  "p-1.5 rounded-lg hover:bg-accent transition-colors",
                  isRefreshing && "animate-spin"
                )}
                aria-label="Refresh data"
              >
                <RefreshCw className="h-4 w-4 text-muted-foreground" />
              </button>

              {/* Time Display */}
              <div className="text-right">
                <p className="text-xl font-bold tabular-nums">{currentTime}</p>
                <p className="text-xs text-muted-foreground">{currentDate}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 min-h-0 overflow-hidden">
        <div
          key={currentPage}
          className="h-full animate-fadeIn"
        >
          {renderCurrentPage()}
        </div>
      </main>

      {/* Error Message */}
      {error && (
        <div className="fixed bottom-16 left-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-600 text-sm">
          {error}
        </div>
      )}

      {/* Last Updated */}
      {lastUpdated && (
        <div className="fixed bottom-4 left-4 text-xs text-muted-foreground">
          Last updated: {lastUpdated.toLocaleTimeString()}
        </div>
      )}

      {/* Theme Toggle */}
      <ThemeToggle />
    </div>
  );
}
