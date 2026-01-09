"use client";

import { Trophy, Medal, Award, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

export interface LeaderboardEntry {
  rank: number;
  name: string;
  score: number;
  change?: "up" | "down" | "same";
}

interface LeaderboardProps {
  entries: LeaderboardEntry[];
  title?: string;
  metric?: string;
}

const rankIcons = [
  { icon: Trophy, color: "text-yellow-500", bg: "bg-yellow-500/10", border: "border-yellow-500/30" },
  { icon: Medal, color: "text-gray-400", bg: "bg-gray-400/10", border: "border-gray-400/30" },
  { icon: Award, color: "text-amber-600", bg: "bg-amber-600/10", border: "border-amber-600/30" },
];

export function Leaderboard({
  entries,
  title = "Appraisal Leaders",
  metric = "Appraisals"
}: LeaderboardProps) {
  const maxScore = Math.max(...entries.map(e => e.score), 1);

  return (
    <div className="rounded-xl border border-gray-800 bg-gray-900/80 p-4 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <Trophy className="h-5 w-5 text-yellow-500" />
        <h3 className="font-semibold text-lg text-white">{title}</h3>
      </div>

      <div className="space-y-3">
        {entries.map((entry, index) => {
          const rankStyle = rankIcons[index] || { icon: null, color: "text-muted-foreground", bg: "bg-muted", border: "border-muted" };
          const RankIcon = rankStyle.icon;
          const percentage = (entry.score / maxScore) * 100;

          return (
            <div
              key={entry.rank}
              className={cn(
                "relative flex items-center gap-3 p-3 rounded-lg border transition-all hover:shadow-md",
                index === 0 && "bg-gradient-to-r from-yellow-500/10 to-amber-500/10 border-yellow-500/30",
                index === 1 && "bg-gradient-to-r from-gray-400/10 to-slate-400/10 border-gray-400/30",
                index === 2 && "bg-gradient-to-r from-amber-600/10 to-orange-600/10 border-amber-600/30",
                index > 2 && "bg-gray-800/50 border-gray-700"
              )}
            >
              {/* Rank badge */}
              <div
                className={cn(
                  "flex items-center justify-center w-10 h-10 rounded-full border-2",
                  rankStyle.bg,
                  rankStyle.border
                )}
              >
                {RankIcon ? (
                  <RankIcon className={cn("h-5 w-5", rankStyle.color)} />
                ) : (
                  <span className="font-bold text-muted-foreground">{entry.rank}</span>
                )}
              </div>

              {/* Name and progress */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className={cn(
                    "font-medium truncate text-white",
                    index === 0 && "text-yellow-400"
                  )}>
                    {entry.name}
                  </span>
                  <div className="flex items-center gap-1">
                    <span className="font-bold text-lg text-white">{entry.score}</span>
                    <span className="text-xs text-gray-400">{metric}</span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="h-2 rounded-full bg-gray-700 overflow-hidden">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all duration-500",
                      index === 0 && "bg-gradient-to-r from-yellow-400 to-amber-500",
                      index === 1 && "bg-gradient-to-r from-gray-300 to-gray-400",
                      index === 2 && "bg-gradient-to-r from-amber-500 to-orange-500",
                      index > 2 && "bg-gradient-to-r from-blue-400 to-blue-600"
                    )}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>

              {/* Trend indicator */}
              {entry.change && entry.change !== "same" && (
                <TrendingUp
                  className={cn(
                    "h-4 w-4",
                    entry.change === "up" ? "text-green-500" : "text-red-500 rotate-180"
                  )}
                />
              )}
            </div>
          );
        })}

        {entries.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Trophy className="h-12 w-12 mx-auto mb-2 opacity-20" />
            <p>No data available yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
