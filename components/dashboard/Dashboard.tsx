"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { RefreshCw, Wifi, WifiOff, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { ApplicationsPage } from "./ApplicationsPage";
import { AppraisalsPage } from "./AppraisalsPage";
import { SubmissionsPage } from "./SubmissionsPage";
import { TeamLeadsPage } from "./TeamLeadsPage";
import { WeeklyTeamPage } from "./WeeklyTeamPage";
import { SummaryPage } from "./SummaryPage";
import { FundedPage } from "./FundedPage";
import { QuotesPage } from "./QuotesPage";
import { ThemeToggle } from "./ThemeToggle";
import { GoalCelebration, BrokerCelebration } from "./GoalCelebration";

// Daily goals configuration
const DAILY_GOALS = {
  applications: 33,
  appraisals: 10,
  submissions: 8,
} as const;

// Per-broker daily goals (default)
const BROKER_DAILY_GOALS = {
  applications: 2,
  appraisals: 2,
  submissions: 2,
} as const;

// Nav's custom daily goals (higher targets)
const NAV_DAILY_GOALS = {
  applications: 5,
  appraisals: 5,
  submissions: 5,
} as const;

// Helper to get broker-specific goal
function getBrokerGoal(brokerName: string, metric: BrokerMetricType): number {
  // Check if this is Nav (case-insensitive first name match)
  const firstName = brokerName.toLowerCase().split(/\s+/)[0];
  if (firstName === 'nav') {
    return NAV_DAILY_GOALS[metric];
  }
  return BROKER_DAILY_GOALS[metric];
}

type GoalType = keyof typeof DAILY_GOALS;
type BrokerMetricType = 'applications' | 'appraisals' | 'submissions';

interface BrokerStats {
  userId: string;
  userName: string;
  contactsMade: number;
  closedWon: number;
  applicationsTaken: number;
  appraisalsOrdered: number;
  submissions: number;
}

interface PeriodData {
  contactsMade: number;
  closedWon: number;
  applicationsTaken: number;
  appraisalsOrdered: number;
  submissions: number;
  salesMetrics?: {
    byBroker: BrokerStats[];
  };
}

interface DashboardData {
  timestamp: string;
  daily: PeriodData;
  yesterday: PeriodData;
  weekly: PeriodData;
  monthly: PeriodData;
  leaderboard: BrokerStats[];
}

const REFRESH_INTERVAL = 10000; // 10 seconds

const PAGES = ["applications", "appraisals", "submissions", "funded", "teamleads", "summary", "quotes"] as const;
type PageType = typeof PAGES[number];

const PAGE_LABELS: Record<PageType, string> = {
  applications: "Applications",
  appraisals: "Appraisals",
  submissions: "Submissions",
  funded: "Funded",
  teamleads: "Team Leads",
  // weeklyteam: "Weekly Team",  // hidden - add back to PAGES to re-enable
  summary: "Summary",
  quotes: "Quotes",
};

// Page-specific durations in milliseconds
const PAGE_DURATIONS: Record<PageType, number> = {
  applications: 11000,
  appraisals: 11000,
  submissions: 11000,
  funded: 10000,     // 10 seconds for funded
  teamleads: 25000,  // 25 seconds for team leads
  // weeklyteam: 25000, // 25 seconds for weekly team - hidden
  summary: 40000, // 40 secs for summary page
  quotes: 20000,
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

  // Goal celebration state
  const [celebratedGoals, setCelebratedGoals] = useState<Set<GoalType>>(new Set());
  const [celebration, setCelebration] = useState<{
    show: boolean;
    type: GoalType;
    value: number;
  } | null>(null);

  // Broker celebration state - tracks which brokers have been celebrated for each metric
  const [celebratedBrokers, setCelebratedBrokers] = useState<Set<string>>(new Set());
  const [brokerCelebration, setBrokerCelebration] = useState<{
    show: boolean;
    brokerName: string;
    metricType: BrokerMetricType;
    value: number;
    goal: number;
  } | null>(null);
  const [brokerCelebrationQueue, setBrokerCelebrationQueue] = useState<Array<{
    brokerName: string;
    metricType: BrokerMetricType;
    value: number;
    goal: number;
  }>>([]);

  // Audio ref for celebration sound
  const celebrationAudioRef = useRef<HTMLAudioElement | null>(null);
  const audioTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Play celebration sound (plays for 6 seconds)
  const playCelebrationSound = useCallback(() => {
    try {
      if (!celebrationAudioRef.current) {
        celebrationAudioRef.current = new Audio('/sounds/goal-reached.mp3');
      }
      celebrationAudioRef.current.loop = false;
      celebrationAudioRef.current.currentTime = 0;
      celebrationAudioRef.current.play().catch(err => {
        console.log('Audio play failed:', err);
      });

      // Stop after 6 seconds
      if (audioTimeoutRef.current) {
        clearTimeout(audioTimeoutRef.current);
      }
      audioTimeoutRef.current = setTimeout(() => {
        if (celebrationAudioRef.current) {
          celebrationAudioRef.current.pause();
          celebrationAudioRef.current.currentTime = 0;
        }
      }, 2000); // change here to change sound timeout
    } catch (err) {
      console.log('Audio error:', err);
    }
  }, []);

  // Stop celebration sound
  const stopCelebrationSound = useCallback(() => {
    try {
      if (audioTimeoutRef.current) {
        clearTimeout(audioTimeoutRef.current);
      }
      if (celebrationAudioRef.current) {
        celebrationAudioRef.current.pause();
        celebrationAudioRef.current.currentTime = 0;
      }
    } catch (err) {
      console.log('Audio stop error:', err);
    }
  }, []);

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

  // Page rotation with page-specific durations
  useEffect(() => {
    if (isPaused) return;

    const duration = PAGE_DURATIONS[currentPage];
    const timeout = setTimeout(() => {
      setCurrentPage((prev) => {
        const currentIndex = PAGES.indexOf(prev);
        const nextIndex = (currentIndex + 1) % PAGES.length;
        return PAGES[nextIndex];
      });
    }, duration);

    return () => clearTimeout(timeout);
  }, [isPaused, currentPage]);

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

  // Check for goal completion and trigger celebration
  useEffect(() => {
    if (!data) return;

    const metrics: Array<{ type: GoalType; value: number; goal: number }> = [
      { type: 'applications', value: data.daily.applicationsTaken, goal: DAILY_GOALS.applications },
      { type: 'appraisals', value: data.daily.appraisalsOrdered, goal: DAILY_GOALS.appraisals },
      { type: 'submissions', value: data.daily.submissions, goal: DAILY_GOALS.submissions },
    ];

    for (const metric of metrics) {
      if (metric.value >= metric.goal && !celebratedGoals.has(metric.type)) {
        // Trigger celebration for this goal
        setCelebration({ show: true, type: metric.type, value: metric.value });
        setCelebratedGoals(prev => new Set([...prev, metric.type]));
        playCelebrationSound();
        break; // Only celebrate one goal at a time
      }
    }
  }, [data, celebratedGoals, playCelebrationSound]);

  const handleCloseCelebration = () => {
    stopCelebrationSound();
    setCelebration(null);
  };

  // Check for broker goal completions (applications, appraisals, submissions)
  useEffect(() => {
    if (!data?.daily.salesMetrics?.byBroker) return;

    const brokers = data.daily.salesMetrics.byBroker;
    const newCelebrations: Array<{
      brokerName: string;
      metricType: BrokerMetricType;
      value: number;
      goal: number;
    }> = [];

    for (const broker of brokers) {
      // Get broker-specific goals (Nav has higher targets)
      const appGoal = getBrokerGoal(broker.userName, 'applications');
      const apprGoal = getBrokerGoal(broker.userName, 'appraisals');
      const subGoal = getBrokerGoal(broker.userName, 'submissions');

      // Check applications goal
      const appKey = `${broker.userId}-applications`;
      if (broker.applicationsTaken >= appGoal && !celebratedBrokers.has(appKey)) {
        newCelebrations.push({
          brokerName: broker.userName,
          metricType: 'applications',
          value: broker.applicationsTaken,
          goal: appGoal,
        });
        setCelebratedBrokers(prev => new Set([...prev, appKey]));
      }

      // Check appraisals goal
      const apprKey = `${broker.userId}-appraisals`;
      if (broker.appraisalsOrdered >= apprGoal && !celebratedBrokers.has(apprKey)) {
        newCelebrations.push({
          brokerName: broker.userName,
          metricType: 'appraisals',
          value: broker.appraisalsOrdered,
          goal: apprGoal,
        });
        setCelebratedBrokers(prev => new Set([...prev, apprKey]));
      }

      // Check submissions goal
      const subKey = `${broker.userId}-submissions`;
      if (broker.submissions >= subGoal && !celebratedBrokers.has(subKey)) {
        newCelebrations.push({
          brokerName: broker.userName,
          metricType: 'submissions',
          value: broker.submissions,
          goal: subGoal,
        });
        setCelebratedBrokers(prev => new Set([...prev, subKey]));
      }
    }

    // Add new celebrations to queue
    if (newCelebrations.length > 0) {
      setBrokerCelebrationQueue(prev => [...prev, ...newCelebrations]);
    }
  }, [data, celebratedBrokers]);

  // Process broker celebration queue - show one at a time
  useEffect(() => {
    if (brokerCelebrationQueue.length > 0 && !brokerCelebration && !celebration) {
      const [next, ...rest] = brokerCelebrationQueue;
      setBrokerCelebration({ show: true, ...next });
      setBrokerCelebrationQueue(rest);
      playCelebrationSound();
    }
  }, [brokerCelebrationQueue, brokerCelebration, celebration, playCelebrationSound]);

  const handleCloseBrokerCelebration = () => {
    stopCelebrationSound();
    setBrokerCelebration(null);
  };

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

  // Get broker stats for leaderboards
  const dailyBrokers: BrokerStats[] = data?.daily.salesMetrics?.byBroker || [];
  const yesterdayBrokers: BrokerStats[] = data?.yesterday?.salesMetrics?.byBroker || [];
  const weeklyBrokers: BrokerStats[] = data?.weekly?.salesMetrics?.byBroker || [];
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
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary" />
          <p className="text-muted-foreground">Loading dashboard...</p>
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
            brokers={dailyBrokers}
            yesterdayContacts={data?.yesterday?.contactsMade}
            yesterdayApplications={data?.yesterday?.applicationsTaken}
            yesterdayBrokers={yesterdayBrokers}
          />
        );
      case "appraisals":
        return (
          <AppraisalsPage
            dailyContacts={data?.daily.contactsMade || 0}
            dailyAppraisals={data?.daily.appraisalsOrdered || 0}
            monthlyAppraisals={data?.monthly.appraisalsOrdered || 0}
            brokers={dailyBrokers}
            yesterdayContacts={data?.yesterday?.contactsMade}
            yesterdayAppraisals={data?.yesterday?.appraisalsOrdered}
            yesterdayBrokers={yesterdayBrokers}
          />
        );
      case "submissions":
        return (
          <SubmissionsPage
            dailyContacts={data?.daily.contactsMade || 0}
            dailySubmissions={data?.daily.submissions || 0}
            monthlySubmissions={data?.monthly.submissions || 0}
            brokers={dailyBrokers}
            yesterdayContacts={data?.yesterday?.contactsMade}
            yesterdaySubmissions={data?.yesterday?.submissions}
            yesterdayBrokers={yesterdayBrokers}
          />
        );
      case "funded":
        // Use dailyBrokers (all 33) but get closedWon from monthly data
        const fundedBrokers = dailyBrokers.map(broker => {
          const monthlyBroker = monthlyBrokers.find(m => m.userId === broker.userId);
          return {
            ...broker,
            closedWon: monthlyBroker?.closedWon ?? 0,
          };
        });
        return (
          <FundedPage
            monthlyFunded={data?.monthly.closedWon || 0}
            brokers={fundedBrokers}
          />
        );
      case "teamleads":
        return <TeamLeadsPage brokers={dailyBrokers} yesterdayBrokers={yesterdayBrokers} />;
      case "weeklyteam":
        return <WeeklyTeamPage brokers={weeklyBrokers} />;
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
             yesterday={{
               contactsMade: data?.yesterday?.contactsMade || 0,
               applicationsTaken: data?.yesterday?.applicationsTaken || 0,
               appraisalsOrdered: data?.yesterday?.appraisalsOrdered || 0,
               submissions: data?.yesterday?.submissions || 0,
             }}
             brokers={monthlyBrokers}
           />
         );
       case "quotes":
         return <QuotesPage />;
     }
   };

  return (
    <div className="h-screen max-h-screen bg-background text-foreground flex flex-col overflow-hidden">
      {/* Header */}
      <header className="flex-shrink-0 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
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
                  <h1 className="font-bold text-lg text-foreground">Blue Pearl Mortgage</h1>
                  <p className="text-xs text-muted-foreground">Sales Dashboard</p>
                </div>
              </div>
            </div>

            {/* Page Navigation */}
            <div className="flex items-center gap-2">
              <button
                onClick={goToPrevPage}
                className="p-2 rounded-lg hover:bg-accent transition-colors"
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
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-secondary-foreground hover:bg-accent"
                    )}
                  >
                    {PAGE_LABELS[page]}
                  </button>
                ))}
              </div>

              <button
                onClick={goToNextPage}
                className="p-2 rounded-lg hover:bg-accent transition-colors"
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
                    : "bg-secondary text-secondary-foreground"
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

      {/* Goal Celebration Popup */}
      {celebration && (
        <GoalCelebration
          show={celebration.show}
          goalType={celebration.type}
          value={celebration.value}
          onClose={handleCloseCelebration}
        />
      )}

      {/* Broker Celebration Popup */}
      {brokerCelebration && (
        <BrokerCelebration
          show={brokerCelebration.show}
          brokerName={brokerCelebration.brokerName}
          metricType={brokerCelebration.metricType}
          value={brokerCelebration.value}
          goal={brokerCelebration.goal}
          onClose={handleCloseBrokerCelebration}
        />
      )}
    </div>
  );
}
