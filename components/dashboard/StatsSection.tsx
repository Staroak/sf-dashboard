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
  previousContactsMade?: number;
  previousApplicationsTaken?: number;
  previousAppraisalsOrdered?: number;
  previousSubmissions?: number;
  compact?: boolean; // Removes subtitles and uses inline layout
}

export function StatsSection({
  title,
  period,
  contactsMade,
  applicationsTaken,
  appraisalsOrdered,
  submissions,
  previousContactsMade,
  previousApplicationsTaken,
  previousAppraisalsOrdered,
  previousSubmissions,
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
          trend={previousContactsMade !== undefined ? {
            value: previousContactsMade === 0 ? (contactsMade > 0 ? 100 : 0) : Math.round(((contactsMade - previousContactsMade) / previousContactsMade) * 100),
            isPositive: contactsMade >= previousContactsMade
          } : undefined}
        />
        <MetricCard
          title="Applications"
          value={applicationsTaken}
          subtitle={compact ? undefined : "New applications"}
          icon={FileText}
          color="green"
          compact={compact}
          trend={previousApplicationsTaken !== undefined ? {
            value: previousApplicationsTaken === 0 ? (applicationsTaken > 0 ? 100 : 0) : Math.round(((applicationsTaken - previousApplicationsTaken) / previousApplicationsTaken) * 100),
            isPositive: applicationsTaken >= previousApplicationsTaken
          } : undefined}
        />
        <MetricCard
          title="Appraisals"
          value={appraisalsOrdered}
          subtitle={compact ? undefined : "Orders placed"}
          icon={Home}
          color="purple"
          compact={compact}
          trend={previousAppraisalsOrdered !== undefined ? {
            value: previousAppraisalsOrdered === 0 ? (appraisalsOrdered > 0 ? 100 : 0) : Math.round(((appraisalsOrdered - previousAppraisalsOrdered) / previousAppraisalsOrdered) * 100),
            isPositive: appraisalsOrdered >= previousAppraisalsOrdered
          } : undefined}
        />
        <MetricCard
          title="Submissions"
          value={submissions}
          subtitle={compact ? undefined : "To lenders"}
          icon={Send}
          color="orange"
          compact={compact}
          trend={previousSubmissions !== undefined ? {
            value: previousSubmissions === 0 ? (submissions > 0 ? 100 : 0) : Math.round(((submissions - previousSubmissions) / previousSubmissions) * 100),
            isPositive: submissions >= previousSubmissions
          } : undefined}
        />
      </div>
    </div>
  );
}
