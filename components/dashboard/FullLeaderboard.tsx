"use client";

import { cn } from "@/lib/utils";
import { Trophy, Medal, Award, Star, TrendingUp, TrendingDown } from "lucide-react";

interface BrokerStats {
  userId: string;
  userName: string;
  contactsMade: number;
  closedWon: number;
  applicationsTaken: number;
  appraisalsOrdered: number;
  submissions: number;
}

type MetricKey = "applicationsTaken" | "appraisalsOrdered" | "submissions" | "contactsMade" | "closedWon";

interface FullLeaderboardProps {
  brokers: BrokerStats[];
  yesterdayBrokers?: BrokerStats[];
  metric: MetricKey;
  title: string;
  dailyGoal?: number;
  className?: string;
  goalLabel?: string;
  goalCurrent?: number;
  goalYesterday?: number;
}

const tierConfig = [
  {
    label: "Tier 1",
    labelColor: "text-yellow-400",
    nameColor: "text-yellow-400",
    bg: "bg-yellow-500/5",
    cardBg: "bg-yellow-500/10",
    cardBorder: "border-yellow-500/30",
    badgeBg: "bg-yellow-500/20",
    badgeBorder: "border-yellow-500/50",
    progressBg: "bg-gradient-to-r from-green-400 to-emerald-500",
  },
  {
    label: "Tier 2",
    labelColor: "text-gray-300",
    nameColor: "text-gray-300",
    bg: "bg-gray-500/5",
    cardBg: "bg-gray-500/10",
    cardBorder: "border-gray-500/30",
    badgeBg: "bg-gray-500/20",
    badgeBorder: "border-gray-500/50",
    progressBg: "bg-gradient-to-r from-green-400 to-emerald-500",
  },
  {
    label: "Tier 3",
    labelColor: "text-gray-300",
    nameColor: "text-gray-300",
    bg: "bg-gray-500/5",
    cardBg: "bg-gray-500/10",
    cardBorder: "border-gray-500/30",
    badgeBg: "bg-gray-500/20",
    badgeBorder: "border-gray-500/50",
    progressBg: "bg-gradient-to-r from-green-400 to-emerald-500",
  },
  {
    label: "Tier 4",
    labelColor: "text-red-500",
    nameColor: "text-red-400",
    bg: "bg-red-500/5",
    cardBg: "bg-red-500/15",
    cardBorder: "border-red-500/40",
    badgeBg: "bg-red-500/20",
    badgeBorder: "border-red-500/50",
    progressBg: "bg-gradient-to-r from-green-400 to-emerald-500",
  },
];

// Tier 1 rank icons (first 7)
const tier1Icons = [
  { icon: Trophy, color: "text-yellow-500" },
  { icon: Medal, color: "text-gray-400" },
  { icon: Award, color: "text-amber-600" },
  { icon: Star, color: "text-blue-500" },
  { icon: Star, color: "text-blue-400" },
  { icon: Star, color: "text-blue-300" },
  { icon: Star, color: "text-blue-200" },
];

// List of valid broker names (from Salesforce)
const VALID_BROKERS = [
  'Alice Nabi', 'Alika Walia', 'Baldip Nijjar', 'Bowie Nan', 'Brandon Viaje-Roque', 'Brendan Wilson',
  'Caitlyn Chretien', 'Charlene Smith', 'Doyle Minhas', 'Garry Singh', 'Gaurav Dadral', 'Gurjit Sandhu',
  'Gurpreet Kaur', 'Harick Brar', 'Jaslene Perhar', 'Jennifer Souvanvong', 'Karny Mehat',
  'Lesly Camaclang', 'Mindy Basran', 'Natalie Pacheco', 'Nav Cheema', 'Olaf Durkowski',
  'Parmeet Singh', 'Rahul Narula', 'Ranier Manding', 'Renzo Mesia', 'Saihaj Cheema',
  'Salil Singla', 'Savraj Cheema', 'Serg Martires', 'Shiela Jamero', 'Stephanie Viaje',
  'Sunny Dhillon'
];

// Filter to only include valid brokers
const isRealBroker = (name: string): boolean => {
  if (!name || name === 'Unknown') return false;
  return VALID_BROKERS.includes(name);
};

export function FullLeaderboard({
  brokers,
  yesterdayBrokers,
  metric,
  title,
  dailyGoal = 10,
  className,
  goalLabel,
  goalCurrent,
  goalYesterday,
}: FullLeaderboardProps) {
  // Create lookup map for yesterday's broker data
  const yesterdayLookup = new Map<string, number>();
  if (yesterdayBrokers) {
    for (const broker of yesterdayBrokers) {
      yesterdayLookup.set(broker.userId, broker[metric]);
    }
  }
  // Debug: Check if Alice Nabi is in the incoming brokers
  // const aliceIncoming = brokers.find(b => b.userName.includes('Alice'));
  // console.log('=== FULLLEADERBOARD DEBUG ===');
  // console.log('Alice in incoming brokers:', aliceIncoming);
  // console.log('Total incoming brokers:', brokers.length);

  // Filter to valid brokers
  const validBrokers = brokers.filter(b => isRealBroker(b.userName));

  // const aliceValid = validBrokers.find(b => b.userName.includes('Alice'));
  // console.log('Alice after VALID_BROKERS filter:', aliceValid);
  // console.log('Total valid brokers:', validBrokers.length);
  // console.log('=============================');

  // Deduplicate by name - keep the broker with the highest metric value
  const brokerMap = new Map<string, BrokerStats>();
  for (const broker of validBrokers) {
    const existing = brokerMap.get(broker.userName);
    if (!existing || broker[metric] > existing[metric]) {
      brokerMap.set(broker.userName, broker);
    }
  }

  // Sort by metric value descending
  const sortedBrokers = Array.from(brokerMap.values())
    .sort((a, b) => b[metric] - a[metric]);

  // Group by tiers: 7, 8, 9, 9 = 33 total
  const tiers = [
    { brokers: sortedBrokers.slice(0, 7), startRank: 1, tier: 0 },
    { brokers: sortedBrokers.slice(7, 15), startRank: 8, tier: 1 },
    { brokers: sortedBrokers.slice(15, 24), startRank: 16, tier: 2 },
    { brokers: sortedBrokers.slice(24, 33), startRank: 25, tier: 3 },
  ];

  return (
    <div className={cn("h-full flex flex-col", className)}>
      {/* Header - Horizontal layout with title left, goal right */}
      <div className="flex items-center justify-between mb-3 flex-shrink-0">
        <div className="flex items-center gap-3">
          <Trophy className="h-10 w-10 text-yellow-500" />
          <h1 className="font-black text-5xl text-foreground">{title}</h1>
        </div>

        {/* Compact horizontal goal display */}
        {goalLabel && goalCurrent !== undefined && (
          <div className="flex items-center gap-4 bg-blue-500/10 rounded-xl px-5 py-2 border border-blue-500/30">
            <div className="flex flex-col items-end">
              <span className="text-sm font-medium text-blue-400 uppercase tracking-wide">{goalLabel}</span>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-black text-blue-500">{goalCurrent}</span>
                <span className="text-xl text-blue-400/70">/ {dailyGoal}</span>
                {goalYesterday !== undefined && (
                  <span className={cn(
                    "flex items-center gap-0.5 text-sm font-semibold ml-2",
                    goalCurrent === goalYesterday ? "text-muted-foreground" :
                    goalCurrent > goalYesterday ? "text-green-500" : "text-red-500"
                  )}>
                    {goalCurrent !== goalYesterday && (
                      goalCurrent > goalYesterday ?
                        <TrendingUp className="h-3 w-3" /> :
                        <TrendingDown className="h-3 w-3" />
                    )}
                    {goalCurrent > goalYesterday ? "+" : ""}{goalCurrent - goalYesterday}
                  </span>
                )}
              </div>
            </div>
            {/* Mini progress circle */}
            <div className="relative w-14 h-14">
              <svg className="w-14 h-14 -rotate-90" viewBox="0 0 56 56">
                <circle
                  cx="28"
                  cy="28"
                  r="24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="4"
                  className="text-blue-900/50"
                />
                <circle
                  cx="28"
                  cy="28"
                  r="24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="4"
                  strokeLinecap="round"
                  className={goalCurrent >= dailyGoal ? "text-green-500" : "text-blue-500"}
                  strokeDasharray={`${Math.min((goalCurrent / dailyGoal) * 150.8, 150.8)} 150.8`}
                />
              </svg>
              <span className={cn(
                "absolute inset-0 flex items-center justify-center text-sm font-bold",
                goalCurrent >= dailyGoal ? "text-green-500" : "text-blue-400"
              )}>
                {Math.round((goalCurrent / dailyGoal) * 100)}%
              </span>
            </div>
          </div>
        )}
      </div>

      {/* 4 Column Grid - Equal Width */}
      <div className="flex-1 grid grid-cols-4 gap-4 min-h-0">
        {tiers.map((tier, tierIndex) => {
          const config = tierConfig[tierIndex];
          const brokerCount = tier.brokers.length || 1;

          return (
            <div key={tierIndex} className={cn("flex flex-col rounded-2xl p-3 h-full", config.bg)}>
              {/* Tier Header */}
              <div className="text-center mb-2 flex-shrink-0">
                <h2 className={cn("font-black text-3xl", config.labelColor)}>
                  {config.label}
                </h2>
              </div>

              {/* Names List - Each broker row takes equal space */}
              <div className="flex flex-col flex-1 min-h-0 gap-1">
                {tier.brokers.map((broker, idx) => {
                  const score = broker[metric];
                  const rank = tier.startRank + idx;
                  const percentage = Math.min((score / dailyGoal) * 100, 100);
                  const yesterdayScore = yesterdayLookup.get(broker.userId);
                  const delta = yesterdayScore !== undefined ? score - yesterdayScore : null;

                  // Tier 1 gets icons, others get rank numbers
                  let badgeContent;
                  if (tierIndex === 0) {
                    const IconConfig = tier1Icons[idx];
                    const Icon = IconConfig.icon;
                    badgeContent = <Icon className={cn("w-4 h-4", IconConfig.color)} />;
                  } else {
                    badgeContent = (
                      <span
                        className={cn("font-black", config.nameColor)}
                        style={{ fontSize: 'clamp(0.8rem, 2.5vw, 1.3rem)' }}
                      >
                        {rank}
                      </span>
                    );
                  }

                  return (
                    <div
                      key={broker.userId}
                      className={cn(
                        "flex flex-col rounded-lg border p-2 flex-1",
                        config.cardBg,
                        config.cardBorder
                      )}
                      style={{ minHeight: 0 }}
                    >
                      {/* Name row - flex-1 to take available space */}
                      <div className="flex items-center gap-2 flex-1">
                        {/* Rank number or icon */}
                        {tierIndex === 0 ? (
                          <div
                            className={cn(
                              "flex items-center justify-center w-9 h-9 rounded-full border flex-shrink-0",
                              config.badgeBg,
                              config.badgeBorder
                            )}
                          >
                            {badgeContent}
                          </div>
                        ) : (
                          <span
                            className={cn(
                              "font-bold flex-shrink-0",
                              config.nameColor
                            )}
                            style={{
                              fontSize: 'clamp(1.1rem, 3.5vw, 2.5rem)',
                              lineHeight: 1.2,
                              marginRight: '0.75rem'
                            }}
                          >
                            {rank}
                          </span>
                        )}
                        <span
                          className={cn(
                            "font-bold truncate flex-1",
                            config.nameColor
                          )}
                          style={{
                            fontSize: 'clamp(1.1rem, 3.5vw, 2.5rem)',
                            lineHeight: 1.2
                          }}
                        >
                          {broker.userName.split(' ')[0]}
                        </span>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <span
                            className={cn(
                              "font-black tabular-nums",
                              config.nameColor
                            )}
                            style={{
                              fontSize: 'clamp(1.2rem, 4.5vw, 3rem)',
                              lineHeight: 1.2
                            }}
                          >
                            {score}
                          </span>
                          {delta !== null && delta !== 0 && (
                            <span
                              className={cn(
                                "flex items-center text-xs font-bold",
                                delta > 0 ? "text-green-500" : "text-red-500"
                              )}
                            >
                              {delta > 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                              {delta > 0 ? "+" : ""}{delta}
                            </span>
                          )}
                        </div>
                      </div>
                      {/* Progress bar - pushed to bottom with mt-auto */}
                      <div className="h-1.5 rounded-full bg-muted/50 mt-auto overflow-hidden flex-shrink-0">
                        <div
                          className={cn(
                            "h-full rounded-full transition-all duration-500",
                            config.progressBg
                          )}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
