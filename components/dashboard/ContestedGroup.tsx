"use client";

import { useState, useEffect } from "react";
import { Users, FileText, ClipboardCheck, Send, Flame } from "lucide-react";
import { cn } from "@/lib/utils";

interface BrokerStats {
  userId: string;
  userName: string;
  contactsMade: number;
  applicationsTaken: number;
  appraisalsOrdered: number;
  submissions: number;
}

interface ContestedGroupProps {
  brokers: BrokerStats[];
  rotationInterval?: number;
}

type MetricType = 'applications' | 'appraisals' | 'submissions';

const metricConfig: Record<MetricType, {
  title: string;
  key: keyof BrokerStats;
  icon: typeof FileText;
  color: string;
  bgColor: string;
  dotColor: string;
}> = {
  applications: {
    title: "Applications",
    key: "applicationsTaken",
    icon: FileText,
    color: "text-green-500",
    bgColor: "bg-green-500/10",
    dotColor: "bg-green-500"
  },
  appraisals: {
    title: "Appraisals",
    key: "appraisalsOrdered",
    icon: ClipboardCheck,
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
    dotColor: "bg-purple-500"
  },
  submissions: {
    title: "Submissions",
    key: "submissions",
    icon: Send,
    color: "text-orange-500",
    bgColor: "bg-orange-500/10",
    dotColor: "bg-orange-500"
  }
};

export function ContestedGroup({ brokers, rotationInterval = 8000 }: ContestedGroupProps) {
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

  // Find the most contested score (most people with the same score > 0)
  const findContestedGroup = () => {
    const scoreGroups: Record<number, BrokerStats[]> = {};

    brokers.forEach(broker => {
      const score = broker[config.key] as number;
      if (score > 0) {
        if (!scoreGroups[score]) {
          scoreGroups[score] = [];
        }
        scoreGroups[score].push(broker);
      }
    });

    // Find the score with the most people (ties)
    let maxTies = 0;
    let contestedScore = 0;
    let contestedGroup: BrokerStats[] = [];

    Object.entries(scoreGroups).forEach(([score, group]) => {
      if (group.length > maxTies || (group.length === maxTies && Number(score) > contestedScore)) {
        maxTies = group.length;
        contestedScore = Number(score);
        contestedGroup = group;
      }
    });

    // If no ties found, show the people just behind the leader
    if (maxTies <= 1) {
      const sorted = [...brokers]
        .filter(b => (b[config.key] as number) > 0)
        .sort((a, b) => (b[config.key] as number) - (a[config.key] as number));

      if (sorted.length > 1) {
        // Find second place score and all people with that score
        const secondScore = sorted[1][config.key] as number;
        contestedGroup = sorted.filter(b => (b[config.key] as number) === secondScore);
        contestedScore = secondScore;
      }
    }

    return { contestedGroup, contestedScore };
  };

  const { contestedGroup, contestedScore } = findContestedGroup();

  return (
    <div className="rounded-xl border border-gray-800 bg-gray-900/80 p-3 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className={cn(
          "flex items-center gap-2 transition-opacity duration-300",
          isTransitioning ? "opacity-0" : "opacity-100"
        )}>
          <Flame className="h-4 w-4 text-orange-500" />
          <h3 className="font-semibold text-base text-white">Hot Competition ... LOCK IN!</h3>
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

      {/* Content */}
      <div className={cn(
        "transition-all duration-300",
        isTransitioning ? "opacity-0 transform translate-x-4" : "opacity-100 transform translate-x-0"
      )}>
        {contestedGroup.length > 0 ? (
          <>
            {/* Score badge */}
            <div className={cn(
              "flex items-center justify-center gap-2 py-2 px-3 rounded-lg mb-2",
              config.bgColor
            )}>
              <MetricIcon className={cn("h-4 w-4", config.color)} />
              <span className="text-white font-medium text-sm">{config.title}</span>
              <span className={cn("text-xl font-bold", config.color)}>
                {contestedScore}
              </span>
            </div>

            {/* Competing brokers */}
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">
                {contestedGroup.length} brokers tied
              </p>
              <div className="grid grid-cols-2 gap-1.5">
                {contestedGroup.slice(0, 6).map((broker) => (
                  <div
                    key={broker.userId}
                    className="flex items-center gap-1.5 p-1.5 rounded-lg bg-gray-800/50 border border-gray-700"
                  >
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-bold text-[10px]">
                        {broker.userName.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <span className="text-xs text-white truncate flex-1">
                      {broker.userName.split(' ')[0]}
                    </span>
                  </div>
                ))}
              </div>
              {contestedGroup.length > 6 && (
                <p className="text-xs text-gray-500 text-center mt-1">
                  +{contestedGroup.length - 6} more
                </p>
              )}
            </div>
          </>
        ) : (
          <div className="text-center py-4 text-gray-500">
            <Users className="h-8 w-8 mx-auto mb-1 opacity-20" />
            <p className="text-sm">No competition data yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
