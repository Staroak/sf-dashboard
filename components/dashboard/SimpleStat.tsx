"use client";

import { TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

type StatColor = "blue" | "green" | "purple" | "orange" | "cyan" | "pink";

interface SimpleStatProps {
  value: number;
  label: string;
  color?: StatColor;
  className?: string;
  previousValue?: number | null;
}

const colorStyles: Record<StatColor, { value: string; label: string; bg: string; border: string }> = {
  blue: {
    value: "text-blue-600 dark:text-blue-400",
    label: "text-blue-500 dark:text-blue-300",
    bg: "bg-blue-500/10",
    border: "border-blue-500/30",
  },
  green: {
    value: "text-green-600 dark:text-green-400",
    label: "text-green-500 dark:text-green-300",
    bg: "bg-green-500/10",
    border: "border-green-500/30",
  },
  purple: {
    value: "text-purple-600 dark:text-purple-400",
    label: "text-purple-500 dark:text-purple-300",
    bg: "bg-purple-500/10",
    border: "border-purple-500/30",
  },
  orange: {
    value: "text-orange-600 dark:text-orange-400",
    label: "text-orange-500 dark:text-orange-300",
    bg: "bg-orange-500/10",
    border: "border-orange-500/30",
  },
  cyan: {
    value: "text-cyan-600 dark:text-cyan-400",
    label: "text-cyan-500 dark:text-cyan-300",
    bg: "bg-cyan-500/10",
    border: "border-cyan-500/30",
  },
  pink: {
    value: "text-pink-600 dark:text-pink-400",
    label: "text-pink-500 dark:text-pink-300",
    bg: "bg-pink-500/10",
    border: "border-pink-500/30",
  },
};

export function SimpleStat({ value, label, color, className, previousValue }: SimpleStatProps) {
  const styles = color ? colorStyles[color] : null;

  // Calculate delta indicator
  const showDelta = previousValue !== undefined && previousValue !== null;
  const delta = showDelta ? value - previousValue : 0;
  const isPositive = delta > 0;
  const isNeutral = delta === 0;

  const DeltaIndicator = showDelta ? (
    <span
      className={cn(
        "flex items-center gap-1 text-sm font-semibold ml-2",
        isNeutral ? "text-muted-foreground" : isPositive ? "text-green-500" : "text-red-500"
      )}
    >
      {!isNeutral && (isPositive ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />)}
      <span>{isPositive ? "+" : ""}{delta}</span>
    </span>
  ) : null;

  if (styles) {
    return (
      <div className={cn(
        "flex items-baseline gap-3 px-4 py-1.5 rounded-xl border",
        styles.bg,
        styles.border,
        className
      )}>
        <span className={cn("font-bold tabular-nums", styles.value)} style={{ fontSize: 'min(2.5rem, 4.2vh)', lineHeight: 1.1 }}>
          {value}
        </span>
        {DeltaIndicator}
        <span className={cn("font-semibold", styles.label)} style={{ fontSize: 'min(1.125rem, 2vh)' }}>
          {label}
        </span>
      </div>
    );
  }

  return (
    <div className={cn("flex items-baseline gap-3", className)}>
      <span className="font-bold tabular-nums" style={{ fontSize: 'min(2.5rem, 4.2vh)', lineHeight: 1.1 }}>{value}</span>
      {DeltaIndicator}
      <span className="font-semibold text-muted-foreground" style={{ fontSize: 'min(1.125rem, 2vh)' }}>{label}</span>
    </div>
  );
}
