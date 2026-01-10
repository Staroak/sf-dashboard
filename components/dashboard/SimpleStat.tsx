"use client";

import { cn } from "@/lib/utils";

interface SimpleStatProps {
  value: number;
  label: string;
  className?: string;
}

export function SimpleStat({ value, label, className }: SimpleStatProps) {
  return (
    <div className={cn("flex items-baseline gap-3", className)}>
      <span className="text-5xl font-bold tabular-nums">{value}</span>
      <span className="text-xl font-semibold text-muted-foreground">{label}</span>
    </div>
  );
}
