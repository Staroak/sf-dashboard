"use client";

import { cn } from "@/lib/utils";
import { Trophy, Medal, Award, Star } from "lucide-react";
import { BluePearl } from "./BluePearl";

interface BrokerStats {
  userId: string;
  userName: string;
  contactsMade: number;
  applicationsTaken: number;
  appraisalsOrdered: number;
  submissions: number;
}

type MetricKey = "applicationsTaken" | "appraisalsOrdered" | "submissions" | "contactsMade";

interface FullLeaderboardProps {
  brokers: BrokerStats[];
  metric: MetricKey;
  title: string;
  dailyGoal: number;
  currentValue: number;
  goalLabel: string;
  className?: string;
}

const tierConfig = [
  {
    label: "Tier 1",
    sublabel: "Top Performers",
    labelColor: "text-yellow-500",
    headerBg: "bg-yellow-500/10",
    headerBorder: "border-yellow-500/30",
  },
  {
    label: "Tier 2",
    sublabel: "Strong Performers",
    labelColor: "text-gray-400",
    headerBg: "bg-gray-400/10",
    headerBorder: "border-gray-400/30",
  },
  {
    label: "Tier 3",
    sublabel: "Rising Stars",
    labelColor: "text-amber-600",
    headerBg: "bg-amber-600/10",
    headerBorder: "border-amber-600/30",
  },
  {
    label: "Tier 4",
    sublabel: "Needs Improvement",
    labelColor: "text-gray-500",
    headerBg: "bg-gray-500/10",
    headerBorder: "border-gray-500/30",
  },
];

const rankIcons = [
  { icon: Trophy, color: "text-yellow-500", bg: "bg-yellow-500/10", border: "border-yellow-500/30" },
  { icon: Medal, color: "text-gray-400", bg: "bg-gray-400/10", border: "border-gray-400/30" },
  { icon: Award, color: "text-amber-600", bg: "bg-amber-600/10", border: "border-amber-600/30" },
  { icon: Star, color: "text-blue-500", bg: "bg-blue-500/10", border: "border-blue-500/30" },
  { icon: Star, color: "text-blue-400", bg: "bg-blue-400/10", border: "border-blue-400/30" },
  { icon: Star, color: "text-blue-300", bg: "bg-blue-300/10", border: "border-blue-300/30" },
];

// List of valid broker names (from Salesforce)
const VALID_BROKERS = [
  'Alika Walia', 'Baldip Nijjar', 'Bowie Nan', 'Brandon Viaje-Roque', 'Brendan Wilson',
  'Charlene Smith', 'Doyle Minhas', 'Garry Singh', 'Gaurav Dadral', 'Gurjit Sandhu',
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
  metric,
  title,
  dailyGoal,
  currentValue,
  goalLabel,
  className,
}: FullLeaderboardProps) {
  // Filter to valid brokers
  const validBrokers = brokers.filter(b => isRealBroker(b.userName));

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

  // Group by tiers: 6, 8, 8, 9 = 31 total
  const tiers = [
    { brokers: sortedBrokers.slice(0, 6), offset: 0, tier: 1 },
    { brokers: sortedBrokers.slice(6, 14), offset: 6, tier: 2 },
    { brokers: sortedBrokers.slice(14, 22), offset: 14, tier: 3 },
    { brokers: sortedBrokers.slice(22, 31), offset: 22, tier: 4 },
  ];

  // Render broker for Tier 1 (larger)
  const renderTier1Broker = (broker: BrokerStats, globalRank: number) => {
    const score = broker[metric];
    const percentage = Math.min((score / dailyGoal) * 100, 100);

    const rankStyle = rankIcons[globalRank];
    const RankIcon = rankStyle.icon;

    const rowStyle = globalRank === 0
      ? "bg-gradient-to-r from-yellow-500/10 to-amber-500/10 border-yellow-500/30"
      : globalRank === 1
      ? "bg-gradient-to-r from-gray-400/10 to-slate-400/10 border-gray-400/30"
      : "bg-gradient-to-r from-amber-600/10 to-orange-600/10 border-amber-600/30";

    const progressStyle = percentage >= 100
      ? "bg-gradient-to-r from-green-400 to-emerald-500"
      : globalRank === 0
      ? "bg-gradient-to-r from-yellow-400 to-amber-500"
      : globalRank === 1
      ? "bg-gradient-to-r from-gray-300 to-gray-400"
      : "bg-gradient-to-r from-amber-500 to-orange-500";

    return (
      <div
        key={broker.userId}
        className={cn(
          "flex items-center gap-3 p-3 rounded-xl border transition-all hover:shadow-md",
          rowStyle
        )}
      >
        {/* Rank badge */}
        <div
          className={cn(
            "flex items-center justify-center w-14 h-14 rounded-full border-2 flex-shrink-0",
            rankStyle.bg,
            rankStyle.border
          )}
        >
          <RankIcon className={cn("h-7 w-7", rankStyle.color)} />
        </div>

        {/* Name and score */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-3">
            <span className={cn(
              "font-black truncate text-4xl text-foreground",
              globalRank === 0 && "text-yellow-500 dark:text-yellow-400"
            )}>
              {broker.userName}
            </span>
            <span className="font-black text-4xl text-foreground tabular-nums flex-shrink-0">{score}</span>
          </div>

          {/* Progress bar */}
          <div className="h-2.5 rounded-full bg-muted overflow-hidden mt-2">
            <div
              className={cn("h-full rounded-full transition-all duration-500", progressStyle)}
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>
      </div>
    );
  };

  // Render broker for Tier 2-4 (medium size, readable)
  const renderOtherTierBroker = (broker: BrokerStats, globalRank: number, tierNum: number) => {
    const rank = globalRank + 1;
    const score = broker[metric];
    const percentage = Math.min((score / dailyGoal) * 100, 100);

    const rowStyle = tierNum === 4
      ? "bg-muted/30 border-border/50"
      : "bg-muted/50 border-border";

    const progressStyle = percentage >= 100
      ? "bg-gradient-to-r from-green-400 to-emerald-500"
      : tierNum === 4
      ? "bg-gradient-to-r from-gray-500 to-gray-600"
      : "bg-gradient-to-r from-blue-500 to-blue-600";

    return (
      <div
        key={broker.userId}
        className={cn(
          "flex items-center gap-4 p-4 rounded-lg border transition-all hover:shadow-sm",
          rowStyle
        )}
      >
        {/* Rank badge */}
        <div className="flex items-center justify-center w-14 h-14 rounded-full border bg-muted flex-shrink-0">
          {tierNum === 4 ? (
            <span className="text-3xl">💩</span>
          ) : (
            <span className="font-bold text-2xl text-muted-foreground">{rank}</span>
          )}
        </div>

        {/* Name and score */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-3">
            <span className="font-black truncate text-4xl text-foreground">
              {broker.userName.split(' ')[0]}
            </span>
            <span className="font-black text-4xl text-foreground tabular-nums flex-shrink-0">{score}</span>
          </div>

          {/* Progress bar */}
          <div className="h-3 rounded-full bg-muted overflow-hidden mt-2">
            <div
              className={cn("h-full rounded-full transition-all duration-500", progressStyle)}
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={cn("h-full flex flex-col", className)}>
      {/* Header */}
      <div className="flex items-center gap-4 mb-4 flex-shrink-0">
        <Trophy className="h-10 w-10 text-yellow-500" />
        <h3 className="font-bold text-4xl text-foreground">{title}</h3>
      </div>

      {/* Main Layout: Tier 1 (35%) | Tiers 2-4 (65%) */}
      <div className="flex-1 flex gap-4 min-h-0">
        {/* Tier 1 Section - 35% width */}
        <div className="w-[35%] flex flex-col min-h-0">
          {/* Tier 1 Header */}
          <div className={cn(
            "rounded-xl border px-4 py-3 mb-3 flex-shrink-0",
            tierConfig[0].headerBg,
            tierConfig[0].headerBorder
          )}>
            <h4 className={cn("font-bold text-2xl", tierConfig[0].labelColor)}>
              {tierConfig[0].label}
            </h4>
            <p className="text-base text-muted-foreground">{tierConfig[0].sublabel}</p>
          </div>

          {/* Tier 1 Brokers */}
          <div className="flex flex-col gap-1.5 flex-shrink-0">
            {tiers[0].brokers.map((broker, idx) =>
              renderTier1Broker(broker, idx)
            )}
          </div>

          {/* Daily Goal */}
          <div className="mt-3 flex-1 min-h-0 overflow-hidden">
            <div className="rounded-xl border border-border bg-card/80 p-3 flex items-center justify-center h-full overflow-hidden">
              <BluePearl
                current={currentValue}
                goal={dailyGoal}
                label={goalLabel}
                size="large"
              />
            </div>
          </div>
        </div>

        {/* Tiers 2-4 Section - 65% width */}
        <div className="w-[65%] grid grid-cols-3 gap-3 min-h-0">
          {tiers.slice(1).map((tier, tierIndex) => {
            const config = tierConfig[tierIndex + 1];

            return (
              <div key={tierIndex + 1} className="flex flex-col min-h-0">
                {/* Tier Header */}
                <div className={cn(
                  "rounded-lg border px-4 py-3 mb-3 flex-shrink-0",
                  config.headerBg,
                  config.headerBorder
                )}>
                  <h4 className={cn("font-bold text-xl", config.labelColor)}>
                    {config.label}
                  </h4>
                  <p className="text-base text-muted-foreground">{config.sublabel}</p>
                </div>

                {/* Brokers List */}
                <div className="flex flex-col gap-1 flex-1 overflow-y-auto hide-scrollbar">
                  {tier.brokers.length > 0 ? (
                    tier.brokers.map((broker, idx) =>
                      renderOtherTierBroker(broker, tier.offset + idx, tier.tier)
                    )
                  ) : (
                    <div className="text-center py-4 text-muted-foreground text-sm">
                      No brokers
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
