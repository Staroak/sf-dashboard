"use client";

import { SimpleStat } from "./SimpleStat";
import { FullLeaderboard } from "./FullLeaderboard";
import { BluePearl } from "./BluePearl";

interface BrokerStats {
  userId: string;
  userName: string;
  contactsMade: number;
  closedWon: number;
  applicationsTaken: number;
  appraisalsOrdered: number;
  submissions: number;
}

interface SubmissionsPageProps {
  dailyContacts: number;
  dailySubmissions: number;
  monthlySubmissions: number;
  brokers: BrokerStats[];
  yesterdayContacts?: number;
  yesterdaySubmissions?: number;
  yesterdayBrokers?: BrokerStats[];
  /** Weekend (Sat+Sun) total — shown as a sideline stat on Mondays only. */
  weekendSubmissions?: number;
  /** Monday Sat–Mon roll-up active — relabel "Today" → "Saturday - Monday". */
  rollup?: boolean;
}

export function SubmissionsPage({
  dailyContacts,
  dailySubmissions,
  monthlySubmissions,
  brokers,
  yesterdayContacts,
  yesterdaySubmissions,
  yesterdayBrokers,
  weekendSubmissions,
  rollup,
}: SubmissionsPageProps) {
  return (
    <div className="h-full flex flex-col gap-3 p-3 overflow-hidden">
      {/* Top Stats Row */}
      <div className="flex items-center flex-shrink-0">
        <div className="flex items-center justify-between flex-1">
          <SimpleStat value={dailyContacts} label={rollup ? "Contacts Made (Sat-Mon)" : "Contacts Made Today"} color="blue" previousValue={yesterdayContacts} />
          <SimpleStat value={dailySubmissions} label={rollup ? "Submissions (Sat-Mon)" : "Submissions Today"} color="orange" previousValue={yesterdaySubmissions} />
          {weekendSubmissions !== undefined && (
            <SimpleStat value={weekendSubmissions} label="Weekend (Sat+Sun)" color="cyan" />
          )}
          <SimpleStat value={monthlySubmissions} label="Submissions This Month" color="orange" />
        </div>
        <BluePearl current={dailySubmissions} goal={6} size="horizontal" />
      </div>

      {/* Full Leaderboard with 4 columns */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <FullLeaderboard
          brokers={brokers}
          yesterdayBrokers={yesterdayBrokers}
          metric="submissions"
          title={rollup ? "Saturday - Monday's Submissions" : "Today's Submissions"}
          dailyGoal={6}
          goalCurrent={dailySubmissions}
          goalYesterday={yesterdaySubmissions}
          goalLabel="Daily Goal"
        />
      </div>
    </div>
  );
}
