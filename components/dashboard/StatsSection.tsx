"use client";

import { Phone, FileText, Home, Send, Calendar, TrendingUp } from "lucide-react";
import { MetricCard } from "./MetricCard";

interface StatsSectionProps {
  title: string;
  period: "Daily" | "Monthly";
  contactsMade: number;
  applicationsTaken: number;
  appraisalsOrdered: number;
  submissions: number;
  compact?: boolean; // Removes subtitles and uses inline layout
}

export function StatsSection({
  title,
  period,
  contactsMade,
  applicationsTaken,
  appraisalsOrdered,
  submissions,
  compact = false,
}: StatsSectionProps) {
  const isDaily = period === "Daily";

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        {isDaily ? (
          <Calendar className="h-4 w-4 text-blue-500" />
        ) : (
          <TrendingUp className="h-4 w-4 text-purple-500" />
        )}
        <h2 className="text-lg font-semibold text-white">{title}</h2>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <MetricCard
          title="Contacts Made"
          value={contactsMade}
          subtitle={compact ? undefined : "Answered calls"}
          icon={Phone}
          color="blue"
          compact={compact}
        />
        <MetricCard
          title="Applications"
          value={applicationsTaken}
          subtitle={compact ? undefined : "New applications"}
          icon={FileText}
          color="green"
          compact={compact}
        />
        <MetricCard
          title="Appraisals"
          value={appraisalsOrdered}
          subtitle={compact ? undefined : "Orders placed"}
          icon={Home}
          color="purple"
          compact={compact}
        />
        <MetricCard
          title="Submissions"
          value={submissions}
          subtitle={compact ? undefined : "To lenders"}
          icon={Send}
          color="orange"
          compact={compact}
        />
      </div>
    </div>
  );
}
