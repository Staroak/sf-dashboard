"use client";

import { cn } from "@/lib/utils";

interface GoalCardProps {
  current: number;
  goal: number;
  label: string;
  className?: string;
}

export function GoalCard({ current, goal, label, className }: GoalCardProps) {
  const percentage = Math.min((current / goal) * 100, 100);
  const isComplete = percentage >= 100;

  return (
    <div className={cn(
      "rounded-xl border bg-gray-900/80 p-6 flex flex-col items-center",
      isComplete ? "border-green-500/50" : "border-gray-800",
      className
    )}>
      <span className="text-lg font-medium text-muted-foreground mb-2">{label}</span>

      {/* Large Progress Circle */}
      <div className="relative w-40 h-40 mb-4">
        {/* Background circle */}
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            className="text-gray-800"
          />
          {/* Progress arc */}
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={`${percentage * 2.83} 283`}
            className={cn(
              "transition-all duration-1000",
              isComplete ? "text-green-500" : "text-blue-500"
            )}
          />
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={cn(
            "text-5xl font-bold",
            isComplete ? "text-green-500" : "text-white"
          )}>
            {current}
          </span>
          <span className="text-xl text-muted-foreground">/ {goal}</span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full h-3 rounded-full bg-gray-800 overflow-hidden">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-1000",
            isComplete
              ? "bg-gradient-to-r from-green-500 to-emerald-400"
              : "bg-gradient-to-r from-blue-600 to-blue-400"
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Status */}
      <span className={cn(
        "mt-3 text-lg font-medium",
        isComplete ? "text-green-500" : "text-muted-foreground"
      )}>
        {isComplete ? "Goal Achieved!" : `${goal - current} more to go`}
      </span>
    </div>
  );
}
