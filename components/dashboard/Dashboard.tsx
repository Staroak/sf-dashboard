"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
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
import { WeekendSummaryPage } from "./WeekendSummaryPage";
import { WeekendWrappedIntro } from "./WeekendWrappedIntro";
import { ThemeToggle } from "./ThemeToggle";
import { GoalCelebration, BrokerCelebration } from "./GoalCelebration";
import { isRealBroker } from "@/lib/brokers";
import { getDayContext, mondayKey, type DayContext } from "@/lib/day-context";
import type { TeamConfig } from "@/lib/teams";

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
type CelebrationVariant = 'daily' | 'weekend';

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
  weekend?: PeriodData; // Sat+Sun production, surfaced on Mondays only
  leaderboard: BrokerStats[];
  teams?: TeamConfig[];
}

// Merge two per-broker lists into one, summing every metric by userId (falling back to
// userName). Used for the Monday Sat–Mon roll-up so a broker's weekend + Monday numbers
// combine into a single row.
function mergeBrokerLists(a: BrokerStats[], b: BrokerStats[]): BrokerStats[] {
  const map = new Map<string, BrokerStats>();
  for (const list of [a, b]) {
    for (const broker of list) {
      const key = broker.userId || broker.userName;
      const existing = map.get(key);
      if (existing) {
        existing.contactsMade += broker.contactsMade;
        existing.closedWon += broker.closedWon;
        existing.applicationsTaken += broker.applicationsTaken;
        existing.appraisalsOrdered += broker.appraisalsOrdered;
        existing.submissions += broker.submissions;
      } else {
        map.set(key, { ...broker });
      }
    }
  }
  return Array.from(map.values());
}

// The 10am catch-up reel announces every weekend achievement: one card per
// (broker, metric) where the broker logged at least this many of that metric.
const WEEKEND_CELEBRATE_THRESHOLD = 1;
// Safety cap on total reel cards (a pathological guard, not normally reached).
const WEEKEND_REEL_MAX = 120;
// Each reel card auto-advances after this long — kept short since the reel can be long.
const WEEKEND_REEL_CARD_MS = 5000;
// Metrics announced in the reel, in per-broker order.
const WEEKEND_REEL_METRICS = [
  { type: 'applications', field: 'applicationsTaken', goal: BROKER_DAILY_GOALS.applications },
  { type: 'appraisals', field: 'appraisalsOrdered', goal: BROKER_DAILY_GOALS.appraisals },
  { type: 'submissions', field: 'submissions', goal: BROKER_DAILY_GOALS.submissions },
] as const;

const REFRESH_INTERVAL = 10000; // 10 seconds

const BASE_PAGES = ["applications", "appraisals", "submissions", "funded", "teamleads", "summary"] as const; // "quotes" temporarily hidden
// "weekend" is not in BASE_PAGES — it's injected into the rotation on Mondays only.
type PageType = typeof BASE_PAGES[number] | "weekend";

const PAGE_LABELS: Record<PageType, string> = {
  applications: "Applications",
  appraisals: "Appraisals",
  submissions: "Submissions",
  funded: "Funded",
  teamleads: "Team Leads",
  // weeklyteam: "Weekly Team",  // hidden - add back to PAGES to re-enable
  summary: "Summary",
  weekend: "Weekend",
  // quotes: "Quotes", // temporarily hidden
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
  weekend: 30000, // 30 secs for the Monday weekend wrap-up
  // quotes: 20000, // temporarily hidden
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

  // Day/time context — drives all Monday-only weekend behavior. Computed after mount
  // (and re-checked each minute) to avoid SSR/hydration mismatch and to catch the 10am
  // crossover. See lib/day-context.ts (supports ?day=mon&hour=10 dev overrides).
  const [dayContext, setDayContext] = useState<DayContext>({
    isMonday: false,
    isWeekendCatchUpTime: false,
    forced: false,
  });
  useEffect(() => {
    const update = () => setDayContext(getDayContext());
    update();
    const interval = setInterval(update, 60000);
    return () => clearInterval(interval);
  }, []);

  // Only light up the weekend feature when the CRM actually returns a weekend bucket.
  // (Boolean, not the object, so refetches every 10s don't churn activePages identity.)
  const hasWeekendData = !!data?.weekend;

  // On Mondays the weekend wrap-up is featured first; the rest of the week it's absent.
  // Absent entirely until the CRM provides `weekend` — feature stays dormant otherwise.
  const activePages: PageType[] = useMemo(
    () => (dayContext.isMonday && hasWeekendData ? ["weekend", ...BASE_PAGES] : [...BASE_PAGES]),
    [dayContext.isMonday, hasWeekendData]
  );

  // Tracks whether we've already jumped to the weekend page / fired the catch-up reel.
  const jumpedToWeekend = useRef(false);
  const weekendCatchUpRan = useRef(false);

  // Goal celebration state
  const [celebratedGoals, setCelebratedGoals] = useState<Set<GoalType>>(new Set());
  const [celebration, setCelebration] = useState<{
    show: boolean;
    type: GoalType;
    value: number;
  } | null>(null);

  // Broker celebration state - tracks the last celebrated value for each broker+metric
  const [celebratedBrokers, setCelebratedBrokers] = useState<Map<string, number>>(new Map());
  const [brokerCelebration, setBrokerCelebration] = useState<{
    show: boolean;
    brokerName: string;
    metricType: BrokerMetricType;
    value: number;
    goal: number;
    variant?: CelebrationVariant;
  } | null>(null);
  const [brokerCelebrationQueue, setBrokerCelebrationQueue] = useState<Array<{
    brokerName: string;
    metricType: BrokerMetricType;
    value: number;
    goal: number;
    variant?: CelebrationVariant;
  }>>([]);

  // Weekend Wrapped intro splash — plays once at 10am Monday, before the reels.
  const [weekendWrapped, setWeekendWrapped] = useState(false);

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
      // Forward ?mock=1 from the page URL so the demo payload (with the weekend
      // bucket) can be previewed without changing .env.local.
      const mockParam =
        typeof window !== 'undefined' &&
        new URLSearchParams(window.location.search).get('mock') === '1'
          ? '&mock=1'
          : '';
      const response = await fetch(`/api/dashboard?t=${Date.now()}${mockParam}`, {
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

    const duration = PAGE_DURATIONS[currentPage] ?? 11000;
    const timeout = setTimeout(() => {
      setCurrentPage((prev) => {
        const currentIndex = activePages.indexOf(prev);
        const nextIndex = (currentIndex + 1) % activePages.length;
        return activePages[nextIndex];
      });
    }, duration);

    return () => clearTimeout(timeout);
  }, [isPaused, currentPage, activePages]);

  // On Monday, open on the weekend wrap-up (once). If we leave Monday, reset so the
  // current page falls back into the normal rotation.
  useEffect(() => {
    if (dayContext.isMonday && hasWeekendData) {
      if (!jumpedToWeekend.current) {
        setCurrentPage("weekend");
        jumpedToWeekend.current = true;
      }
    } else {
      jumpedToWeekend.current = false;
      setCurrentPage((prev) => (prev === "weekend" ? "applications" : prev));
    }
  }, [dayContext.isMonday, hasWeekendData]);

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

    // Only celebrate real brokers - filter out admin/system users
    const brokers = data.daily.salesMetrics.byBroker.filter((b: BrokerStats) => isRealBroker(b.userName));
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

      // Check applications goal - celebrate when hitting OR exceeding goal
      const appKey = `${broker.userId}-applications`;
      const lastAppCelebrated = celebratedBrokers.get(appKey) || 0;
      if (broker.applicationsTaken >= appGoal && broker.applicationsTaken > lastAppCelebrated) {
        newCelebrations.push({
          brokerName: broker.userName,
          metricType: 'applications',
          value: broker.applicationsTaken,
          goal: appGoal,
        });
        setCelebratedBrokers(prev => new Map([...prev, [appKey, broker.applicationsTaken]]));
      }

      // Check appraisals goal - celebrate when hitting OR exceeding goal
      const apprKey = `${broker.userId}-appraisals`;
      const lastApprCelebrated = celebratedBrokers.get(apprKey) || 0;
      if (broker.appraisalsOrdered >= apprGoal && broker.appraisalsOrdered > lastApprCelebrated) {
        newCelebrations.push({
          brokerName: broker.userName,
          metricType: 'appraisals',
          value: broker.appraisalsOrdered,
          goal: apprGoal,
        });
        setCelebratedBrokers(prev => new Map([...prev, [apprKey, broker.appraisalsOrdered]]));
      }

      // Check submissions goal - celebrate when hitting OR exceeding goal
      const subKey = `${broker.userId}-submissions`;
      const lastSubCelebrated = celebratedBrokers.get(subKey) || 0;
      if (broker.submissions >= subGoal && broker.submissions > lastSubCelebrated) {
        newCelebrations.push({
          brokerName: broker.userName,
          metricType: 'submissions',
          value: broker.submissions,
          goal: subGoal,
        });
        setCelebratedBrokers(prev => new Map([...prev, [subKey, broker.submissions]]));
      }
    }

    // Add new celebrations to queue
    if (newCelebrations.length > 0) {
      setBrokerCelebrationQueue(prev => [...prev, ...newCelebrations]);
    }
  }, [data, celebratedBrokers]);

  // Process broker celebration queue - show one at a time.
  // Held while the Weekend Wrapped intro is up so the splash plays first.
  useEffect(() => {
    if (brokerCelebrationQueue.length > 0 && !brokerCelebration && !celebration && !weekendWrapped) {
      const [next, ...rest] = brokerCelebrationQueue;
      setBrokerCelebration({ show: true, ...next });
      setBrokerCelebrationQueue(rest);
      playCelebrationSound();
    }
  }, [brokerCelebrationQueue, brokerCelebration, celebration, weekendWrapped, playCelebrationSound]);

  const handleCloseBrokerCelebration = () => {
    stopCelebrationSound();
    setBrokerCelebration(null);
  };

  // Weekend catch-up reel — at 10am Monday, replay the weekend's wins for the office.
  // Weekend apps live in data.weekend (not data.daily), so they never trip the normal
  // daily celebrations; they're held and fired here once per Monday.
  useEffect(() => {
    const weekendBrokers = data?.weekend?.salesMetrics?.byBroker;
    if (!weekendBrokers || !dayContext.isWeekendCatchUpTime || weekendCatchUpRan.current) return;

    // Once per Monday per device — unless a dev override (?day/?hour) is active, so the
    // demo is repeatable.
    const storageKey = `weekendCatchUp:${mondayKey()}`;
    if (!dayContext.forced && typeof window !== "undefined" && localStorage.getItem(storageKey)) {
      weekendCatchUpRan.current = true;
      return;
    }

    // One announcement per achievement: walk brokers (most active first), and for each,
    // emit a card for every metric they logged this weekend.
    const announcements = weekendBrokers
      .filter(b => isRealBroker(b.userName))
      .sort((a, b) =>
        (b.applicationsTaken + b.appraisalsOrdered + b.submissions) -
        (a.applicationsTaken + a.appraisalsOrdered + a.submissions)
      )
      .flatMap(b =>
        WEEKEND_REEL_METRICS
          .filter(m => b[m.field] >= WEEKEND_CELEBRATE_THRESHOLD)
          .map(m => ({
            brokerName: b.userName,
            metricType: m.type as BrokerMetricType,
            value: b[m.field],
            goal: m.goal,
            variant: "weekend" as CelebrationVariant,
          }))
      )
      .slice(0, WEEKEND_REEL_MAX);

    if (announcements.length > 0) {
      // Lead with the "Weekend Wrapped" splash; the reel is gated until it closes.
      setWeekendWrapped(true);
      setBrokerCelebrationQueue(prev => [...prev, ...announcements]);
    }
    weekendCatchUpRan.current = true;
    if (!dayContext.forced && typeof window !== "undefined") {
      localStorage.setItem(storageKey, "1");
    }
  }, [data, dayContext.isWeekendCatchUpTime, dayContext.forced]);

  const goToPrevPage = () => {
    const currentIndex = activePages.indexOf(currentPage);
    const prevIndex = (currentIndex - 1 + activePages.length) % activePages.length;
    setCurrentPage(activePages[prevIndex]);
    setIsPaused(true);
  };

  const goToNextPage = () => {
    const currentIndex = activePages.indexOf(currentPage);
    const nextIndex = (currentIndex + 1) % activePages.length;
    setCurrentPage(activePages[nextIndex]);
    setIsPaused(true);
  };

  // Get broker stats for leaderboards
  const dailyBrokers: BrokerStats[] = data?.daily.salesMetrics?.byBroker || [];
  const yesterdayBrokers: BrokerStats[] = data?.yesterday?.salesMetrics?.byBroker || [];
  const weeklyBrokers: BrokerStats[] = data?.weekly?.salesMetrics?.byBroker || [];
  const monthlyBrokers: BrokerStats[] = data?.monthly.salesMetrics?.byBroker || data?.leaderboard || [];
  const weekendBrokers: BrokerStats[] = data?.weekend?.salesMetrics?.byBroker || [];
  const teams: TeamConfig[] = data?.teams ?? [];

  // Weekend sideline values — only meaningful on Mondays.
  const weekend = data?.weekend;
  const showWeekendSideline = dayContext.isMonday && !!weekend;

  // Monday roll-up: on Mondays the "today" view (Applications / Appraisals / Submissions
  // pages + the Summary's Today's Performance) shows a Sat–Mon total — i.e. the weekend
  // bucket folded into the live daily numbers, both the headline stats and the per-broker
  // leaderboards. The dedicated Weekend page still shows Sat+Sun on its own, and the
  // celebrations + 10am catch-up reel keep reading raw daily/weekend so weekend wins
  // aren't double-counted. Yesterday deltas are suppressed here since a 3-day total vs a
  // single Sunday isn't a meaningful comparison.
  const rollupActive = showWeekendSideline;
  const baseDaily = {
    contactsMade: data?.daily.contactsMade || 0,
    applicationsTaken: data?.daily.applicationsTaken || 0,
    appraisalsOrdered: data?.daily.appraisalsOrdered || 0,
    submissions: data?.daily.submissions || 0,
  };
  const displayDaily = rollupActive
    ? {
        contactsMade: baseDaily.contactsMade + (weekend?.contactsMade || 0),
        applicationsTaken: baseDaily.applicationsTaken + (weekend?.applicationsTaken || 0),
        appraisalsOrdered: baseDaily.appraisalsOrdered + (weekend?.appraisalsOrdered || 0),
        submissions: baseDaily.submissions + (weekend?.submissions || 0),
      }
    : baseDaily;
  const displayDailyBrokers = rollupActive
    ? mergeBrokerLists(dailyBrokers, weekendBrokers)
    : dailyBrokers;

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
            dailyContacts={displayDaily.contactsMade}
            dailyApplications={displayDaily.applicationsTaken}
            monthlyApplications={data?.monthly.applicationsTaken || 0}
            brokers={displayDailyBrokers}
            yesterdayContacts={rollupActive ? undefined : data?.yesterday?.contactsMade}
            yesterdayApplications={rollupActive ? undefined : data?.yesterday?.applicationsTaken}
            yesterdayBrokers={rollupActive ? undefined : yesterdayBrokers}
            weekendApplications={showWeekendSideline ? weekend?.applicationsTaken : undefined}
          />
        );
      case "appraisals":
        return (
          <AppraisalsPage
            dailyContacts={displayDaily.contactsMade}
            dailyAppraisals={displayDaily.appraisalsOrdered}
            monthlyAppraisals={data?.monthly.appraisalsOrdered || 0}
            brokers={displayDailyBrokers}
            yesterdayContacts={rollupActive ? undefined : data?.yesterday?.contactsMade}
            yesterdayAppraisals={rollupActive ? undefined : data?.yesterday?.appraisalsOrdered}
            yesterdayBrokers={rollupActive ? undefined : yesterdayBrokers}
            weekendAppraisals={showWeekendSideline ? weekend?.appraisalsOrdered : undefined}
          />
        );
      case "submissions":
        return (
          <SubmissionsPage
            dailyContacts={displayDaily.contactsMade}
            dailySubmissions={displayDaily.submissions}
            monthlySubmissions={data?.monthly.submissions || 0}
            brokers={displayDailyBrokers}
            yesterdayContacts={rollupActive ? undefined : data?.yesterday?.contactsMade}
            yesterdaySubmissions={rollupActive ? undefined : data?.yesterday?.submissions}
            yesterdayBrokers={rollupActive ? undefined : yesterdayBrokers}
            weekendSubmissions={showWeekendSideline ? weekend?.submissions : undefined}
          />
        );
      case "weekend":
        return (
          <WeekendSummaryPage
            weekendContacts={weekend?.contactsMade || 0}
            weekendApplications={weekend?.applicationsTaken || 0}
            weekendAppraisals={weekend?.appraisalsOrdered || 0}
            weekendSubmissions={weekend?.submissions || 0}
            brokers={weekendBrokers}
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
        return <TeamLeadsPage brokers={dailyBrokers} yesterdayBrokers={yesterdayBrokers} teams={teams} />;
      // case "weeklyteam":
      //   return <WeeklyTeamPage brokers={weeklyBrokers} teams={teams} />;
       case "summary":
         return (
           <SummaryPage
             daily={{
               contactsMade: displayDaily.contactsMade,
               applicationsTaken: displayDaily.applicationsTaken,
               appraisalsOrdered: displayDaily.appraisalsOrdered,
               submissions: displayDaily.submissions,
             }}
             monthly={{
               contactsMade: data?.monthly.contactsMade || 0,
               applicationsTaken: data?.monthly.applicationsTaken || 0,
               appraisalsOrdered: data?.monthly.appraisalsOrdered || 0,
               submissions: data?.monthly.submissions || 0,
             }}
             yesterday={rollupActive ? undefined : {
               contactsMade: data?.yesterday?.contactsMade || 0,
               applicationsTaken: data?.yesterday?.applicationsTaken || 0,
               appraisalsOrdered: data?.yesterday?.appraisalsOrdered || 0,
               submissions: data?.yesterday?.submissions || 0,
             }}
             brokers={monthlyBrokers}
           />
         );
       // case "quotes":
       //   return <QuotesPage />; // temporarily hidden
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
                {activePages.map((page) => (
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
          variant={brokerCelebration.variant}
          durationMs={brokerCelebration.variant === "weekend" ? WEEKEND_REEL_CARD_MS : undefined}
          onClose={handleCloseBrokerCelebration}
        />
      )}

      {/* Weekend Wrapped intro splash (Monday 10am, before the reels) */}
      {weekendWrapped && (
        <WeekendWrappedIntro
          show={weekendWrapped}
          applications={weekend?.applicationsTaken || 0}
          appraisals={weekend?.appraisalsOrdered || 0}
          submissions={weekend?.submissions || 0}
          contributors={weekendBrokers.filter(b => isRealBroker(b.userName) && (b.applicationsTaken > 0 || b.appraisalsOrdered > 0 || b.submissions > 0)).length}
          onClose={() => setWeekendWrapped(false)}
        />
      )}
    </div>
  );
}
