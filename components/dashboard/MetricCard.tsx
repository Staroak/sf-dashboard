"use client";

import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: "blue" | "green" | "purple" | "orange" | "cyan" | "pink";
  size?: "default" | "large";
}

const colorStyles = {
  blue: {
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
    iconBg: "bg-blue-500",
    text: "text-blue-600 dark:text-blue-400",
    gradient: "from-blue-500 to-blue-600",
  },
  green: {
    bg: "bg-green-500/10",
    border: "border-green-500/20",
    iconBg: "bg-green-500",
    text: "text-green-600 dark:text-green-400",
    gradient: "from-green-500 to-green-600",
  },
  purple: {
    bg: "bg-purple-500/10",
    border: "border-purple-500/20",
    iconBg: "bg-purple-500",
    text: "text-purple-600 dark:text-purple-400",
    gradient: "from-purple-500 to-purple-600",
  },
  orange: {
    bg: "bg-orange-500/10",
    border: "border-orange-500/20",
    iconBg: "bg-orange-500",
    text: "text-orange-600 dark:text-orange-400",
    gradient: "from-orange-500 to-orange-600",
  },
  cyan: {
    bg: "bg-cyan-500/10",
    border: "border-cyan-500/20",
    iconBg: "bg-cyan-500",
    text: "text-cyan-600 dark:text-cyan-400",
    gradient: "from-cyan-500 to-cyan-600",
  },
  pink: {
    bg: "bg-pink-500/10",
    border: "border-pink-500/20",
    iconBg: "bg-pink-500",
    text: "text-pink-600 dark:text-pink-400",
    gradient: "from-pink-500 to-pink-600",
  },
};

export function MetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  color = "blue",
  size = "default",
}: MetricCardProps) {
  const styles = colorStyles[color];

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl border bg-gray-900/80 shadow-sm transition-all hover:shadow-lg",
        styles.border,
        size === "large" ? "p-4" : "p-3"
      )}
    >
      {/* Background gradient */}
      <div className={cn(
        "absolute top-0 right-0 w-24 h-24 opacity-10 rounded-full blur-2xl",
        `bg-gradient-to-br ${styles.gradient}`
      )} />

      <div className="relative flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs font-medium text-gray-400 mb-0.5">{title}</p>
          <h3 className={cn(
            "font-bold tracking-tight text-white",
            size === "large" ? "text-4xl" : "text-2xl"
          )}>
            {value.toLocaleString()}
          </h3>
          {subtitle && (
            <p className={cn("text-xs", styles.text)}>{subtitle}</p>
          )}
          {trend && (
            <div className={cn(
              "flex items-center gap-1 mt-1 text-xs font-medium",
              trend.isPositive ? "text-green-500" : "text-red-500"
            )}>
              <span>{trend.isPositive ? "+" : ""}{trend.value}%</span>
              <span className="text-muted-foreground">vs last period</span>
            </div>
          )}
        </div>

        <div className={cn(
          "flex items-center justify-center rounded-lg p-2",
          styles.iconBg
        )}>
          <Icon className="h-5 w-5 text-white" />
        </div>
      </div>
    </div>
  );
}
