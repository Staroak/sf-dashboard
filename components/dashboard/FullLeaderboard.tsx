"use client";

import { cn } from "@/lib/utils";
import { isRealBroker } from "@/lib/brokers";
import { Trophy, Medal, Award, Star, TrendingUp, TrendingDown, type LucideIcon } from "lucide-react";

interface BrokerStats {
  userId: string;
  userName: string;
  contactsMade: number;
  closedWon: number;
  applicationsTaken: number;
  appraisalsOrdered: number;
  submissions: number;
}

type MetricKey = "applicationsTaken" | "appraisalsOrdered" | "submissions" | "contactsMade" | "closedWon" | "activity";

// "activity" = applications + appraisals + submissions (combined weekend score).
function metricValue(broker: BrokerStats, metric: MetricKey): number {
  if (metric === "activity") {
    return broker.applicationsTaken + broker.appraisalsOrdered + broker.submissions;
  }
  return broker[metric];
}

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
  /** Title icon (defaults to Trophy) — e.g. Flame for the Weekend page. */
  titleIcon?: LucideIcon;
  /** Classes for the title icon (defaults to yellow). */
  titleIconClassName?: string;
  /** Extra classes for the title text (e.g. a gradient). */
  titleClassName?: string;
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
  titleIcon,
  titleIconClassName,
  titleClassName,
}: FullLeaderboardProps) {
  const TitleIcon = titleIcon ?? Trophy;
  // Create lookup map for yesterday's broker data
  const yesterdayLookup = new Map<string, number>();
  if (yesterdayBrokers) {
    for (const broker of yesterdayBrokers) {
      yesterdayLookup.set(broker.userId, metricValue(broker, metric));
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
    if (!existing || metricValue(broker, metric) > metricValue(existing, metric)) {
      brokerMap.set(broker.userName, broker);
    }
  }

  // Sort by metric value descending
  const sortedBrokers = Array.from(brokerMap.values())
    .sort((a, b) => metricValue(b, metric) - metricValue(a, metric));

  // Group by tiers: 7, 9, 9, 9 = 34 total
  const tiers = [
    { brokers: sortedBrokers.slice(0, 7), startRank: 1, tier: 0 },
    { brokers: sortedBrokers.slice(7, 16), startRank: 8, tier: 1 },
    { brokers: sortedBrokers.slice(16, 25), startRank: 17, tier: 2 },
    { brokers: sortedBrokers.slice(25, 34), startRank: 26, tier: 3 },
  ];

  return (
    <div className={cn("h-full flex flex-col", className)}>
      {/* Header - Horizontal layout with title left, goal right.
          All sizes are vh-capped so the header shrinks on short/zoomed screens
          instead of stealing height from the name grid below. */}
      <div className="flex items-center justify-between flex-shrink-0" style={{ marginBottom: 'min(0.5rem, 0.8vh)' }}>
        <div className="flex items-center gap-3">
          <TitleIcon
            className={cn(titleIconClassName ?? "text-yellow-500")}
            style={{ width: 'min(2rem, 3.6vh)', height: 'min(2rem, 3.6vh)' }}
          />
          <h1
            className={cn("font-black whitespace-nowrap", titleClassName ?? "text-foreground")}
            style={{ fontSize: 'min(2.25rem, 4vh)', lineHeight: 1.15 }}
          >{title}</h1>
        </div>

        {/* Compact horizontal goal display */}
        {goalLabel && goalCurrent !== undefined && (
          <div className="flex items-center gap-3 bg-blue-500/10 rounded-xl px-4 border border-blue-500/30" style={{ paddingTop: 'min(0.375rem, 0.7vh)', paddingBottom: 'min(0.375rem, 0.7vh)' }}>
            <div className="flex flex-col items-end">
              <span className="font-medium text-blue-400 uppercase tracking-wide" style={{ fontSize: 'min(0.75rem, 1.5vh)' }}>{goalLabel}</span>
              <div className="flex items-baseline gap-1">
                <span className="font-black text-blue-500" style={{ fontSize: 'min(1.75rem, 3.2vh)', lineHeight: 1.1 }}>{goalCurrent}</span>
                <span className="text-blue-400/70" style={{ fontSize: 'min(1rem, 2vh)' }}>/ {dailyGoal}</span>
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
            <div className="relative" style={{ width: 'min(2.75rem, 5.2vh)', height: 'min(2.75rem, 5.2vh)' }}>
              <svg className="w-full h-full -rotate-90" viewBox="0 0 56 56">
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
                "absolute inset-0 flex items-center justify-center font-bold",
                goalCurrent >= dailyGoal ? "text-green-500" : "text-blue-400"
              )} style={{ fontSize: 'min(0.75rem, 1.4vh)' }}>
                {Math.round((goalCurrent / dailyGoal) * 100)}%
              </span>
            </div>
          </div>
        )}
      </div>

      {/* 4 Column Grid - Equal Width. The explicit minmax(0,1fr) row keeps the
          single grid row from growing past the available height, so tier columns
          are hard-bounded no matter how big their content wants to be. */}
      <div className="flex-1 grid grid-cols-4 gap-4 min-h-0" style={{ gridTemplateRows: 'minmax(0, 1fr)' }}>
        {tiers.map((tier, tierIndex) => {
          const config = tierConfig[tierIndex];

          return (
            <div key={tierIndex} className={cn("flex flex-col rounded-2xl h-full min-h-0", config.bg)} style={{ padding: 'min(0.625rem, 1.1vh)' }}>
              {/* Tier Header */}
              <div className="text-center flex-shrink-0" style={{ marginBottom: 'min(0.375rem, 0.7vh)' }}>
                <h2 className={cn("font-black", config.labelColor)} style={{ fontSize: 'min(1.5rem, 2.8vh)', lineHeight: 1.2 }}>
                  {config.label}
                </h2>
              </div>

              {/* Names List - a grid of equal minmax(0,1fr) tracks partitions the
                  column height exactly, so rows can never spill off screen. Each
                  card is a size container: the cqh/cqw units inside scale text to
                  the card's own height/width — fit at any screen size or zoom. */}
              <div
                className="flex-1 min-h-0 grid"
                style={{
                  gridTemplateRows: `repeat(${tier.brokers.length || 1}, minmax(0, 1fr))`,
                  gap: 'min(0.25rem, 0.5vh)',
                }}
              >
                {tier.brokers.map((broker, idx) => {
                  const score = metricValue(broker, metric);
                  const rank = tier.startRank + idx;
                  const percentage = Math.min((score / dailyGoal) * 100, 100);
                  const yesterdayScore = yesterdayLookup.get(broker.userId);
                  const delta = yesterdayScore !== undefined ? score - yesterdayScore : null;

                  return (
                    <div
                      key={broker.userId}
                      className={cn(
                        "flex flex-col rounded-lg border min-h-0 overflow-hidden",
                        config.cardBg,
                        config.cardBorder
                      )}
                      style={{
                        containerType: 'size',
                        padding: 'min(0.375rem, 6cqh) min(0.625rem, 2.5cqw)',
                      }}
                    >
                      {/* Name row - flex-1 to take available space */}
                      <div className="flex items-center flex-1 min-h-0" style={{ gap: 'min(0.5rem, 2cqw)' }}>
                        {/* Rank number or icon */}
                        {tierIndex === 0 ? (
                          <div
                            className={cn(
                              "flex items-center justify-center rounded-full border flex-shrink-0",
                              config.badgeBg,
                              config.badgeBorder
                            )}
                            style={{ width: 'min(2.5rem, 72cqh)', height: 'min(2.5rem, 72cqh)' }}
                          >
                            {(() => {
                              const IconConfig = tier1Icons[idx];
                              const Icon = IconConfig.icon;
                              return <Icon className={IconConfig.color} style={{ width: 'min(1.125rem, 36cqh)', height: 'min(1.125rem, 36cqh)' }} />;
                            })()}
                          </div>
                        ) : (
                          <span
                            className={cn(
                              "font-bold flex-shrink-0",
                              config.nameColor
                            )}
                            style={{
                              fontSize: 'min(2.75rem, 48cqh, 7cqw)',
                              lineHeight: 1.1,
                              marginRight: 'min(0.75rem, 1.5cqw)'
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
                            fontSize: 'min(2.75rem, 52cqh, 10cqw)',
                            lineHeight: 1.1
                          }}
                        >
                          {broker.userName.split(' ')[0]}
                        </span>
                        <div className="flex items-center flex-shrink-0" style={{ gap: 'min(0.25rem, 1cqw)' }}>
                          <span
                            className={cn(
                              "font-black tabular-nums",
                              config.nameColor
                            )}
                            style={{
                              fontSize: 'min(3.25rem, 62cqh, 11cqw)',
                              lineHeight: 1
                            }}
                          >
                            {score}
                          </span>
                          {delta !== null && delta !== 0 && (
                            <span
                              className={cn(
                                "flex items-center font-bold",
                                delta > 0 ? "text-green-500" : "text-red-500"
                              )}
                              style={{ fontSize: 'min(0.75rem, 24cqh)' }}
                            >
                              {delta > 0 ? <TrendingUp style={{ width: '1em', height: '1em' }} /> : <TrendingDown style={{ width: '1em', height: '1em' }} />}
                              {delta > 0 ? "+" : ""}{delta}
                            </span>
                          )}
                        </div>
                      </div>
                      {/* Progress bar - pushed to bottom with mt-auto */}
                      <div
                        className="rounded-full bg-muted/50 mt-auto overflow-hidden flex-shrink-0"
                        style={{ height: 'min(0.375rem, 6cqh)', marginTop: 'min(0.2rem, 2cqh)' }}
                      >
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
