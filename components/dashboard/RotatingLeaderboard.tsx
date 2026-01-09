"use client";

import { useState, useEffect } from "react";
import { Trophy, Medal, Award, TrendingUp, FileText, ClipboardCheck, Send } from "lucide-react";
import { cn } from "@/lib/utils";

interface BrokerStats {
  userId: string;
  userName: string;
  contactsMade: number;
  applicationsTaken: number;
  appraisalsOrdered: number;
  submissions: number;
}

interface RotatingLeaderboardProps {
  brokers: BrokerStats[];
  rotationInterval?: number; // milliseconds
}

type MetricType = 'applications' | 'appraisals' | 'submissions';

const metricConfig: Record<MetricType, {
  title: string;
  key: keyof BrokerStats;
  icon: typeof FileText;
  color: string;
  gradient: string;
  dotColor: string;
}> = {
  applications: {
    title: "Top Applications",
    key: "applicationsTaken",
    icon: FileText,
    color: "text-green-500",
    gradient: "from-green-500 to-green-600",
    dotColor: "bg-green-500"
  },
  appraisals: {
    title: "Top Appraisals",
    key: "appraisalsOrdered",
    icon: ClipboardCheck,
    color: "text-purple-500",
    gradient: "from-purple-500 to-purple-600",
    dotColor: "bg-purple-500"
  },
  submissions: {
    title: "Top Submissions",
    key: "submissions",
    icon: Send,
    color: "text-orange-500",
    gradient: "from-orange-500 to-orange-600",
    dotColor: "bg-orange-500"
  }
};

const rankIcons = [
  { icon: Trophy, color: "text-yellow-500", bg: "bg-yellow-500/10", border: "border-yellow-500/30" },
  { icon: Medal, color: "text-gray-400", bg: "bg-gray-400/10", border: "border-gray-400/30" },
  { icon: Award, color: "text-amber-600", bg: "bg-amber-600/10", border: "border-amber-600/30" },
];

export function RotatingLeaderboard({ brokers, rotationInterval = 8000 }: RotatingLeaderboardProps) {
  const [currentMetric, setCurrentMetric] = useState<MetricType>('applications');
  const [isTransitioning, setIsTransitioning] = useState(false);

  const metrics: MetricType[] = ['applications', 'appraisals', 'submissions'];

  useEffect(() => {
    const interval = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentMetric(prev => {
          const currentIndex = metrics.indexOf(prev);
          return metrics[(currentIndex + 1) % metrics.length];
        });
        setIsTransitioning(false);
      }, 300);
    }, rotationInterval);

    return () => clearInterval(interval);
  }, [rotationInterval]);

  const config = metricConfig[currentMetric];
  const MetricIcon = config.icon;

  // Sort and get top 5 for current metric
  const sortedBrokers = [...brokers]
    .sort((a, b) => (b[config.key] as number) - (a[config.key] as number))
    .filter(b => (b[config.key] as number) > 0)
    .slice(0, 5);

  const maxScore = Math.max(...sortedBrokers.map(b => b[config.key] as number), 1);

  return (
    <div className="rounded-xl border border-gray-800 bg-gray-900/80 p-3 shadow-sm">
      {/* Header with metric indicator */}
      <div className="flex items-center justify-between mb-2">
        <div className={cn(
          "flex items-center gap-2 transition-opacity duration-300",
          isTransitioning ? "opacity-0" : "opacity-100"
        )}>
          <MetricIcon className={cn("h-4 w-4", config.color)} />
          <h3 className="font-semibold text-base text-white">{config.title}</h3>
        </div>

        {/* Metric dots indicator */}
        <div className="flex gap-1.5">
          {metrics.map((metric) => (
            <button
              key={metric}
              onClick={() => {
                setIsTransitioning(true);
                setTimeout(() => {
                  setCurrentMetric(metric);
                  setIsTransitioning(false);
                }, 300);
              }}
              className={cn(
                "w-2 h-2 rounded-full transition-all",
                currentMetric === metric
                  ? metricConfig[metric].dotColor
                  : "bg-gray-600 hover:bg-gray-500"
              )}
            />
          ))}
        </div>
      </div>

      {/* Leaderboard entries */}
      <div className={cn(
        "space-y-1.5 transition-all duration-300",
        isTransitioning ? "opacity-0 transform translate-x-4" : "opacity-100 transform translate-x-0"
      )}>
        {sortedBrokers.map((broker, index) => {
          const score = broker[config.key] as number;
          const rankStyle = rankIcons[index] || { icon: null, color: "text-muted-foreground", bg: "bg-muted", border: "border-muted" };
          const RankIcon = rankStyle.icon;
          const percentage = (score / maxScore) * 100;

          return (
            <div
              key={broker.userId}
              className={cn(
                "relative flex items-center gap-2 p-2 rounded-lg border transition-all hover:shadow-md",
                index === 0 && "bg-gradient-to-r from-yellow-500/10 to-amber-500/10 border-yellow-500/30",
                index === 1 && "bg-gradient-to-r from-gray-400/10 to-slate-400/10 border-gray-400/30",
                index === 2 && "bg-gradient-to-r from-amber-600/10 to-orange-600/10 border-amber-600/30",
                index > 2 && "bg-gray-800/50 border-gray-700"
              )}
            >
              {/* Rank badge */}
              <div
                className={cn(
                  "flex items-center justify-center w-7 h-7 rounded-full border-2",
                  rankStyle.bg,
                  rankStyle.border
                )}
              >
                {RankIcon ? (
                  <RankIcon className={cn("h-3.5 w-3.5", rankStyle.color)} />
                ) : (
                  <span className="font-bold text-xs text-muted-foreground">{index + 1}</span>
                )}
              </div>

              {/* Name and progress */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className={cn(
                    "font-medium truncate text-sm text-white",
                    index === 0 && "text-yellow-400"
                  )}>
                    {broker.userName}
                  </span>
                  <div className="flex items-center gap-1">
                    <span className="font-bold text-sm text-white">{score}</span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="h-1.5 rounded-full bg-gray-700 overflow-hidden mt-0.5">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all duration-500",
                      index === 0 && "bg-gradient-to-r from-yellow-400 to-amber-500",
                      index === 1 && "bg-gradient-to-r from-gray-300 to-gray-400",
                      index === 2 && "bg-gradient-to-r from-amber-500 to-orange-500",
                      index > 2 && `bg-gradient-to-r ${config.gradient}`
                    )}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}

        {sortedBrokers.length === 0 && (
          <div className="text-center py-4 text-gray-500">
            <MetricIcon className="h-8 w-8 mx-auto mb-1 opacity-20" />
            <p className="text-sm">No data available yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
