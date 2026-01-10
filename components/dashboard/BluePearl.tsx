"use client";

import { cn } from "@/lib/utils";

interface BluePearlProps {
  current: number;
  goal?: number;
  label?: string;
  size?: "default" | "large";
}

export function BluePearl({ current, goal = 100, label = "Daily Contacts Goal", size = "default" }: BluePearlProps) {
  const isLarge = size === "large";
  const percentage = Math.min((current / goal) * 100, 100);
  const isComplete = percentage >= 100;

  // Size configurations
  const pearlSize = isLarge ? "w-32 h-32" : "w-20 h-20";
  const progressBarWidth = isLarge ? "w-32" : "w-20";
  const labelSize = isLarge ? "text-sm" : "text-xs";
  const numberSize = isLarge ? "text-3xl" : "text-xl";
  const goalSize = isLarge ? "text-sm" : "text-[10px]";
  const shineSize1 = isLarge ? "w-6 h-6 top-2 left-5" : "w-4 h-4 top-1.5 left-3";
  const shineSize2 = isLarge ? "w-3 h-3 top-5 left-6" : "w-2 h-2 top-3 left-4";

  return (
    <div className={cn("flex flex-col items-center p-1", isLarge ? "gap-3" : "gap-1.5")}>
      <span className={cn("font-medium text-gray-400", labelSize)}>{label}</span>

      {/* Pearl Container */}
      <div className="relative">
        {/* Glow effect when filling */}
        <div
          className={cn(
            "absolute inset-0 rounded-full blur-md transition-opacity duration-1000",
            isComplete ? "opacity-60" : "opacity-30"
          )}
          style={{
            background: `radial-gradient(circle, rgba(59, 130, 246, ${percentage / 100}) 0%, transparent 70%)`,
          }}
        />

        {/* Outer ring */}
        <div className={cn("relative rounded-full border-2 border-blue-200 dark:border-blue-900 p-0.5", pearlSize)}>
          {/* Pearl body */}
          <div className="relative w-full h-full rounded-full bg-gradient-to-br from-blue-100 to-blue-50 dark:from-blue-950 dark:to-slate-900 overflow-hidden shadow-inner">
            {/* Water fill effect */}
            <div
              className="absolute bottom-0 left-0 right-0 transition-all duration-1000 ease-out"
              style={{ height: `${percentage}%` }}
            >
              {/* Animated wave effect */}
              <div className="absolute inset-0 overflow-hidden">
                <div
                  className={cn(
                    "absolute inset-0 animate-pulse",
                    isComplete
                      ? "bg-gradient-to-t from-blue-500 via-blue-400 to-blue-300"
                      : "bg-gradient-to-t from-blue-600 via-blue-500 to-blue-400"
                  )}
                />
                {/* Wave SVG */}
                <svg
                  className="absolute -top-1.5 left-0 w-full animate-[wave_3s_ease-in-out_infinite]"
                  viewBox="0 0 100 10"
                  preserveAspectRatio="none"
                >
                  <path
                    d="M0 5 Q 25 0, 50 5 T 100 5 L 100 10 L 0 10 Z"
                    fill={isComplete ? "#60a5fa" : "#3b82f6"}
                    opacity="0.6"
                  />
                </svg>
              </div>

              {/* Shimmer effect */}
              <div
                className={cn(
                  "absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent",
                  "animate-[shimmer_2s_infinite]"
                )}
              />
            </div>

            {/* Pearl shine */}
            <div className={cn("absolute rounded-full bg-white/40 blur-sm", shineSize1)} />
            <div className={cn("absolute rounded-full bg-white/60", shineSize2)} />

            {/* Center content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
              <span className={cn(
                "font-bold transition-colors",
                numberSize,
                percentage >= 50 ? "text-white drop-shadow-lg" : "text-blue-600 dark:text-blue-400"
              )}>
                {current}
              </span>
              <span className={cn(
                "transition-colors",
                goalSize,
                percentage >= 50 ? "text-white/80 drop-shadow" : "text-blue-500 dark:text-blue-300"
              )}>
                / {goal}
              </span>
            </div>
          </div>
        </div>

        {/* Celebration effect when complete */}
        {isComplete && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-yellow-400 rounded-full animate-ping" />
            <div className="absolute top-3 right-1.5 w-1 h-1 bg-blue-300 rounded-full animate-ping delay-100" />
            <div className="absolute bottom-3 left-1.5 w-1 h-1 bg-cyan-300 rounded-full animate-ping delay-200" />
          </div>
        )}
      </div>

      {/* Percentage label */}
      <div className="flex items-center gap-1.5">
        <div className={cn("h-1.5 rounded-full bg-blue-100 dark:bg-blue-900 overflow-hidden", progressBarWidth)}>
          <div
            className={cn(
              "h-full rounded-full transition-all duration-1000",
              isComplete
                ? "bg-gradient-to-r from-blue-400 to-cyan-400"
                : "bg-gradient-to-r from-blue-500 to-blue-600"
            )}
            style={{ width: `${percentage}%` }}
          />
        </div>
        <span className={cn("font-medium text-blue-600 dark:text-blue-400 min-w-[2.5rem]", labelSize)}>
          {Math.round(percentage)}%
        </span>
      </div>

      {/* Status message */}
      <span className={cn(
        "font-medium",
        isLarge ? "text-sm" : "text-[10px]",
        isComplete ? "text-green-500" : "text-gray-400"
      )}>
        {isComplete ? "Goal Achieved!" : `${goal - current} more to go`}
      </span>
    </div>
  );
}
