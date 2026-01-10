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
    <div className="rounded-xl border border-border bg-card/80 p-4 shadow-sm h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-3 flex-shrink-0">
        <div className={cn(
          "flex items-center gap-2 transition-opacity duration-300",
          isTransitioning ? "opacity-0" : "opacity-100"
        )}>
          <Flame className="h-5 w-5 text-orange-500" />
          <h3 className="font-semibold text-lg text-foreground">Hot Competition ... LOCK IN!</h3>
        </div>

        {/* Metric dots indicator */}
        <div className="flex gap-2">
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
                "w-2.5 h-2.5 rounded-full transition-all",
                currentMetric === metric
                  ? metricConfig[metric].dotColor
                  : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
              )}
            />
          ))}
        </div>
      </div>

      {/* Content */}
      <div className={cn(
        "flex-1 flex flex-col transition-all duration-300",
        isTransitioning ? "opacity-0 transform translate-x-4" : "opacity-100 transform translate-x-0"
      )}>
        {contestedGroup.length > 0 ? (
          <>
            {/* Score badge */}
            <div className={cn(
              "flex items-center justify-center gap-3 py-3 px-4 rounded-xl mb-3 flex-shrink-0",
              config.bgColor
            )}>
              <MetricIcon className={cn("h-6 w-6", config.color)} />
              <span className="text-white font-semibold text-lg">{config.title}</span>
              <span className={cn("text-3xl font-bold", config.color)}>
                {contestedScore}
              </span>
            </div>

            {/* Competing brokers */}
            <div className="flex-1 flex flex-col min-h-0">
              <p className="text-sm text-muted-foreground uppercase tracking-wider mb-3 flex-shrink-0">
                {contestedGroup.length} brokers tied
              </p>
              <div className="grid grid-cols-2 gap-2 flex-1 content-start overflow-hidden">
                {contestedGroup.map((broker) => (
                  <div
                    key={broker.userId}
                    className="flex items-center gap-2 p-2.5 rounded-xl bg-muted/50 border border-border"
                  >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-bold text-sm">
                        {broker.userName.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <span className="text-base text-foreground truncate flex-1 font-medium">
                      {broker.userName.split(' ')[0]}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-8 text-muted-foreground flex-1 flex flex-col items-center justify-center">
            <Users className="h-12 w-12 mx-auto mb-2 opacity-20" />
            <p className="text-base">No competition data yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
