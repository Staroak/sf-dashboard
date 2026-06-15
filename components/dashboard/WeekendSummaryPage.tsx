"use client";

import { SimpleStat } from "./SimpleStat";
import { FullLeaderboard } from "./FullLeaderboard";
import { BluePearl } from "./BluePearl";
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
      {/* Top Stats Row — mirrors ApplicationsPage exactly so both pages are the same height */}
      <div className="flex items-center flex-shrink-0">
        <div className="flex items-center justify-between flex-1">
          <SimpleStat value={weekendApplications} label="Applications" color="green" />
          <SimpleStat value={weekendAppraisals} label="Appraisals" color="purple" />
          <SimpleStat value={weekendSubmissions} label="Submissions" color="orange" />
          <SimpleStat value={weekendContacts} label="Contacts" color="blue" />
        </div>
        <BluePearl current={weekendActivity} goal={weekendGoal} size="horizontal" />
      </div>

      {/* Per-broker weekend leaderboard — ranked by combined activity (apps + appraisals + submissions) */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <FullLeaderboard
          brokers={brokers}
          metric="activity"
          title="Weekend Wrap-Up"
          titleIcon={Flame}
          titleIconClassName="text-orange-500"
          titleClassName="bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 bg-clip-text text-transparent"
          dailyGoal={weekendGoal}
          goalCurrent={weekendActivity}
          goalLabel="Weekend Goal"
        />
      </div>
    </div>
  );
}
