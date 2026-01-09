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
}

export function StatsSection({
  title,
  period,
  contactsMade,
  applicationsTaken,
  appraisalsOrdered,
  submissions,
}: StatsSectionProps) {
  const isDaily = period === "Daily";

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        {isDaily ? (
          <Calendar className="h-5 w-5 text-blue-500" />
        ) : (
          <TrendingUp className="h-5 w-5 text-purple-500" />
        )}
        <h2 className="text-xl font-semibold text-white">{title}</h2>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Contacts Made"
          value={contactsMade}
          subtitle="Answered calls"
          icon={Phone}
          color="blue"
        />
        <MetricCard
          title="Applications"
          value={applicationsTaken}
          subtitle="New applications"
          icon={FileText}
          color="green"
        />
        <MetricCard
          title="Appraisals"
          value={appraisalsOrdered}
          subtitle="Orders placed"
          icon={Home}
          color="purple"
        />
        <MetricCard
          title="Submissions"
          value={submissions}
          subtitle="To lenders"
          icon={Send}
          color="orange"
        />
      </div>
    </div>
  );
}
