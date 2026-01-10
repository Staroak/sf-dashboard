"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Trophy, Medal, Award, Star } from "lucide-react";

interface BrokerStats {
  userId: string;
  userName: string;
  contactsMade: number;
  applicationsTaken: number;
  appraisalsOrdered: number;
  submissions: number;
}

type MetricKey = "applicationsTaken" | "appraisalsOrdered" | "submissions" | "contactsMade";

interface TieredLeaderboardProps {
  brokers: BrokerStats[];
  metric: MetricKey;
  title: string;
  dailyGoal: number;
  className?: string;
  rotationInterval?: number;
}

function getTierConfig(tier: number) {
  switch (tier) {
    case 1:
      return {
        label: "Tier 1 - Top Performers",
        labelColor: "text-yellow-500",
        dotColor: "bg-yellow-500",
      };
    case 2:
      return {
        label: "Tier 2 - Strong Performers",
        labelColor: "text-gray-400",
        dotColor: "bg-gray-400",
      };
    case 3:
      return {
        label: "Tier 3 - Rising Stars",
        labelColor: "text-amber-700",
        dotColor: "bg-amber-700",
      };
    default:
      return {
        label: "Needs Improvement",
        labelColor: "text-gray-500",
        dotColor: "bg-gray-500",
      };
  }
}

const rankIcons = [
  { icon: Trophy, color: "text-yellow-500", bg: "bg-yellow-500/10", border: "border-yellow-500/30" },
  { icon: Medal, color: "text-gray-400", bg: "bg-gray-400/10", border: "border-gray-400/30" },
  { icon: Award, color: "text-amber-600", bg: "bg-amber-600/10", border: "border-amber-600/30" },
  { icon: Star, color: "text-blue-500", bg: "bg-blue-500/10", border: "border-blue-500/30" },
  { icon: Star, color: "text-blue-400", bg: "bg-blue-400/10", border: "border-blue-400/30" },
];

export function TieredLeaderboard({
  brokers,
  metric,
  title,
  dailyGoal,
  className,
  rotationInterval = 10000
}: TieredLeaderboardProps) {
  const [currentTierIndex, setCurrentTierIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Sort brokers by the metric descending
  const sortedBrokers = [...brokers].sort((a, b) => b[metric] - a[metric]);

  // Group by tiers
  const tiers = [
    { brokers: sortedBrokers.slice(0, 5), offset: 0, tier: 1 },
    { brokers: sortedBrokers.slice(5, 15), offset: 5, tier: 2 },
    { brokers: sortedBrokers.slice(15, 25), offset: 15, tier: 3 },
    { brokers: sortedBrokers.slice(25), offset: 25, tier: 4 },
  ].filter(t => t.brokers.length > 0);

  const changeTier = (newIndex: number) => {
    if (newIndex === currentTierIndex || isTransitioning) return;

    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentTierIndex(newIndex);
      setIsTransitioning(false);
    }, 300);
  };

  // Auto-rotate through tiers
  useEffect(() => {
    if (tiers.length <= 1) return;

    const interval = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentTierIndex((prev) => (prev + 1) % tiers.length);
        setIsTransitioning(false);
      }, 300);
    }, rotationInterval);

    return () => clearInterval(interval);
  }, [tiers.length, rotationInterval]);

  const currentTier = tiers[currentTierIndex];
  if (!currentTier) return null;

  const tierConfig = getTierConfig(currentTier.tier);

  // Determine if this tier has many brokers (needs compact mode)
  const brokerCount = currentTier.brokers.length;
  const isCompact = brokerCount > 5;

  const renderBroker = (broker: BrokerStats, index: number) => {
    const globalRank = currentTier.offset + index;
    const rank = currentTier.offset + index + 1;
    const score = broker[metric];
    // Progress bar based on daily goal
    const percentage = Math.min((score / dailyGoal) * 100, 100);

    // Use rank icons for top 5 overall, otherwise show number
    const rankStyle = globalRank < 5
      ? rankIcons[globalRank]
      : { icon: null, color: "text-muted-foreground", bg: "bg-muted", border: "border-muted" };
    const RankIcon = rankStyle.icon;

    // Row styling based on global rank
    const rowStyle = globalRank === 0
      ? "bg-gradient-to-r from-yellow-500/10 to-amber-500/10 border-yellow-500/30"
      : globalRank === 1
      ? "bg-gradient-to-r from-gray-400/10 to-slate-400/10 border-gray-400/30"
      : globalRank === 2
      ? "bg-gradient-to-r from-amber-600/10 to-orange-600/10 border-amber-600/30"
      : currentTier.tier === 4
      ? "bg-gray-800/30 border-gray-700/50"
      : "bg-gray-800/50 border-gray-700";

    // Progress bar gradient - green if at or above goal
    const progressStyle = percentage >= 100
      ? "bg-gradient-to-r from-green-400 to-emerald-500"
      : globalRank === 0
      ? "bg-gradient-to-r from-yellow-400 to-amber-500"
      : globalRank === 1
      ? "bg-gradient-to-r from-gray-300 to-gray-400"
      : globalRank === 2
      ? "bg-gradient-to-r from-amber-500 to-orange-500"
      : currentTier.tier === 4
      ? "bg-gradient-to-r from-gray-500 to-gray-600"
      : "bg-gradient-to-r from-blue-500 to-blue-600";

    // Dynamic sizing based on broker count
    const cardPadding = isCompact ? "p-2" : "p-3";
    const rankBadgeSize = isCompact ? "w-8 h-8" : "w-10 h-10";
    const rankIconSize = isCompact ? "h-4 w-4" : "h-5 w-5";
    const rankFontSize = isCompact ? "text-base" : "text-lg";
    const nameSize = isCompact ? "text-base" : "text-xl";
    const scoreSize = isCompact ? "text-lg" : "text-2xl";
    const progressHeight = isCompact ? "h-1.5" : "h-2.5";

    return (
      <div
        key={broker.userId}
        className={cn(
          "relative flex items-center gap-2 rounded-xl border transition-all hover:shadow-md flex-1 min-h-0",
          cardPadding,
          rowStyle
        )}
      >
        {/* Rank badge */}
        <div
          className={cn(
            "flex items-center justify-center rounded-full border-2 flex-shrink-0",
            rankBadgeSize,
            rankStyle.bg,
            rankStyle.border
          )}
        >
          {RankIcon ? (
            <RankIcon className={cn(rankIconSize, rankStyle.color)} />
          ) : currentTier.tier === 4 ? (
            <span className={isCompact ? "text-base" : "text-xl"}>💩</span>
          ) : (
            <span className={cn("font-bold text-muted-foreground", rankFontSize)}>{rank}</span>
          )}
        </div>

        {/* Name and progress */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <span className={cn(
              "font-semibold truncate text-white",
              nameSize,
              globalRank === 0 && "text-yellow-400"
            )}>
              {broker.userName}
            </span>
            <span className={cn("font-bold text-white ml-2 tabular-nums", scoreSize)}>{score}</span>
          </div>

          {/* Progress bar based on daily goal */}
          <div className={cn("rounded-full bg-gray-700 overflow-hidden mt-0.5", progressHeight)}>
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
    <div className={cn("rounded-xl border border-gray-800 bg-gray-900/80 p-3 flex flex-col h-full", className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-2 flex-shrink-0">
        <div className={cn(
          "flex items-center gap-2 transition-opacity duration-300",
          isTransitioning ? "opacity-0" : "opacity-100"
        )}>
          <Trophy className={cn("h-5 w-5", tierConfig.labelColor)} />
          <h3 className="font-semibold text-lg text-white">{title}</h3>
        </div>

        {/* Tier indicator dots */}
        <div className="flex items-center gap-1.5">
          {tiers.map((t, idx) => (
            <button
              key={idx}
              onClick={() => changeTier(idx)}
              className={cn(
                "w-2.5 h-2.5 rounded-full transition-all",
                idx === currentTierIndex
                  ? getTierConfig(t.tier).dotColor
                  : "bg-gray-600 hover:bg-gray-500"
              )}
              aria-label={`Go to tier ${idx + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Current tier label */}
      <h4 className={cn(
        "text-sm font-medium uppercase tracking-wider mb-2 transition-opacity duration-300 flex-shrink-0",
        tierConfig.labelColor,
        isTransitioning ? "opacity-0" : "opacity-100"
      )}>
        {tierConfig.label}
      </h4>

      {/* Brokers list - flex to fill available space */}
      <div className={cn(
        "flex-1 flex flex-col transition-all duration-300 min-h-0",
        isCompact ? "gap-1" : "gap-2",
        isTransitioning ? "opacity-0 transform translate-x-4" : "opacity-100 transform translate-x-0"
      )}>
        {currentTier.brokers.map((broker, idx) => renderBroker(broker, idx))}
      </div>
    </div>
  );
}
