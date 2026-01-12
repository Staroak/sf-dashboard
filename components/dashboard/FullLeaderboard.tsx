"use client";

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

interface FullLeaderboardProps {
  brokers: BrokerStats[];
  metric: MetricKey;
  title: string;
  className?: string;
}

const tierConfig = [
  {
    label: "Tier 1",
    labelColor: "text-yellow-400",
    nameColor: "text-yellow-400",
    bg: "bg-yellow-500/5",
  },
  {
    label: "Tier 2",
    labelColor: "text-gray-300",
    nameColor: "text-gray-300",
    bg: "bg-gray-500/5",
  },
  {
    label: "Tier 3",
    labelColor: "text-amber-500",
    nameColor: "text-amber-500",
    bg: "bg-amber-500/5",
  },
  {
    label: "Tier 4",
    labelColor: "text-gray-500",
    nameColor: "text-gray-500",
    bg: "bg-gray-500/5",
  },
];

// Tier 1 rank icons (first 6)
const tier1Icons = [
  { icon: Trophy, color: "text-yellow-500" },
  { icon: Medal, color: "text-gray-400" },
  { icon: Award, color: "text-amber-600" },
  { icon: Star, color: "text-blue-500" },
  { icon: Star, color: "text-blue-400" },
  { icon: Star, color: "text-blue-300" },
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
    { brokers: sortedBrokers.slice(0, 6), startRank: 1, tier: 0 },
    { brokers: sortedBrokers.slice(6, 14), startRank: 7, tier: 1 },
    { brokers: sortedBrokers.slice(14, 22), startRank: 15, tier: 2 },
    { brokers: sortedBrokers.slice(22, 31), startRank: 23, tier: 3 },
  ];

  return (
    <div className={cn("h-full flex flex-col", className)}>
      {/* Header */}
      <div className="flex items-center justify-center gap-4 mb-4 flex-shrink-0">
        <Trophy className="h-12 w-12 text-yellow-500" />
        <h1 className="font-black text-6xl text-foreground">{title}</h1>
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
              <div className="flex flex-col flex-1 min-h-0">
                {tier.brokers.map((broker, idx) => {
                  const score = broker[metric];
                  const rank = tier.startRank + idx;

                  // Tier 1 gets icons, others get rank numbers or poop
                  let badge;
                  if (tierIndex === 0) {
                    const IconConfig = tier1Icons[idx];
                    const Icon = IconConfig.icon;
                    badge = <Icon className={cn("w-[10%] h-auto aspect-square flex-shrink-0", IconConfig.color)} />;
                  } else if (tierIndex === 3) {
                    badge = (
                      <span
                        className="w-[10%] text-center flex-shrink-0"
                        style={{ fontSize: 'clamp(1rem, 4vw, 2.5rem)', lineHeight: 1.1 }}
                      >
                        💩
                      </span>
                    );
                  } else {
                    badge = (
                      <span
                        className="font-bold text-muted-foreground w-[10%] text-center flex-shrink-0"
                        style={{ fontSize: 'clamp(1rem, 4vw, 2.5rem)', lineHeight: 1.1 }}
                      >
                        {rank}
                      </span>
                    );
                  }

                  return (
                    <div
                      key={broker.userId}
                      className="flex items-center gap-2 px-2 flex-1"
                      style={{ minHeight: 0 }}
                    >
                      {badge}
                      <span
                        className={cn(
                          "font-bold truncate flex-1",
                          config.nameColor
                        )}
                        style={{
                          fontSize: 'clamp(1rem, 4vw, 2.5rem)',
                          lineHeight: 1.1
                        }}
                      >
                        {broker.userName.split(' ')[0]}
                      </span>
                      <span
                        className={cn(
                          "font-black tabular-nums flex-shrink-0",
                          config.nameColor
                        )}
                        style={{
                          fontSize: 'clamp(1.2rem, 5vw, 3rem)',
                          lineHeight: 1.1
                        }}
                      >
                        {score}
                      </span>
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
