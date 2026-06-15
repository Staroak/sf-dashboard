"use client";

import { SimpleStat } from "./SimpleStat";
import { FullLeaderboard } from "./FullLeaderboard";
import { Flame } from "lucide-react";

interface BrokerStats {
  userId: string;
  userName: string;
  contactsMade: number;
  closedWon: number;
  applicationsTaken: number;
  appraisalsOrdered: number;
  submissions: number;
}

interface WeekendSummaryPageProps {
  weekendContacts: number;
  weekendApplications: number;
  weekendAppraisals: number;
  weekendSubmissions: number;
  brokers: BrokerStats[];
  /** Team weekend applications target for the leaderboard progress ring. */
  weekendGoal?: number;
}

export function WeekendSummaryPage({
  weekendContacts,
  weekendApplications,
  weekendAppraisals,
  weekendSubmissions,
  brokers,
  weekendGoal = 30,
}: WeekendSummaryPageProps) {
  const weekendActivity = weekendApplications + weekendAppraisals + weekendSubmissions;
  return (
    <div className="h-full flex flex-col gap-3 p-3 overflow-hidden">
      {/* Title */}
      <div className="flex items-center justify-center gap-3 flex-shrink-0">
        <Flame className="h-9 w-9 text-orange-500" />
        <h1 className="font-black text-4xl bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 bg-clip-text text-transparent">
          Weekend Wrap-Up — Sat + Sun
        </h1>
        <Flame className="h-9 w-9 text-orange-500" />
      </div>

      {/* Weekend totals */}
      <div className="flex items-center justify-around flex-shrink-0">
        <SimpleStat value={weekendApplications} label="Applications" color="green" />
        <SimpleStat value={weekendAppraisals} label="Appraisals" color="purple" />
        <SimpleStat value={weekendSubmissions} label="Submissions" color="orange" />
        <SimpleStat value={weekendContacts} label="Contacts" color="blue" />
      </div>

      {/* Per-broker weekend leaderboard — ranked by combined activity (apps + appraisals + submissions) */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <FullLeaderboard
          brokers={brokers}
          metric="activity"
          title="Weekend Activity"
          dailyGoal={weekendGoal}
          goalCurrent={weekendActivity}
          goalLabel="Weekend Goal"
        />
      </div>
    </div>
  );
}
