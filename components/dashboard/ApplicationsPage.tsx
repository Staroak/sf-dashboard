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

interface ApplicationsPageProps {
  dailyContacts: number;
  dailyApplications: number;
  monthlyApplications: number;
  brokers: BrokerStats[];
  yesterdayContacts?: number;
  yesterdayApplications?: number;
  yesterdayBrokers?: BrokerStats[];
  /** Weekend (Sat+Sun) total — shown as a sideline stat on Mondays only. */
  weekendApplications?: number;
  /** Monday Sat–Mon roll-up active — relabel "Today" → "Saturday - Monday". */
  rollup?: boolean;
}

export function ApplicationsPage({
  dailyContacts,
  dailyApplications,
  monthlyApplications,
  brokers,
  yesterdayContacts,
  yesterdayApplications,
  yesterdayBrokers,
  weekendApplications,
  rollup,
}: ApplicationsPageProps) {
  return (
    <div className="h-full flex flex-col gap-3 p-3 overflow-hidden">
      {/* Top Stats Row */}
      <div className="flex items-center flex-shrink-0">
        <div className="flex items-center justify-between flex-1">
          <SimpleStat value={dailyContacts} label={rollup ? "Contacts Made (Sat-Mon)" : "Contacts Made Today"} color="blue" previousValue={yesterdayContacts} />
          <SimpleStat value={dailyApplications} label={rollup ? "Applications (Sat-Mon)" : "Applications Today"} color="green" previousValue={yesterdayApplications} />
          {weekendApplications !== undefined && (
            <SimpleStat value={weekendApplications} label="Weekend (Sat+Sun)" color="cyan" />
          )}
          <SimpleStat value={monthlyApplications} label="Applications This Month" color="green" />
        </div>
        <BluePearl current={dailyApplications} goal={33} size="horizontal" />
      </div>

      {/* Full Leaderboard with 4 columns */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <FullLeaderboard
          brokers={brokers}
          yesterdayBrokers={yesterdayBrokers}
          metric="applicationsTaken"
          title={rollup ? "Saturday - Monday's Applications" : "Today's Applications"}
          dailyGoal={33}
          goalCurrent={dailyApplications}
          goalYesterday={yesterdayApplications}
          goalLabel="Daily Goal"
        />
      </div>
    </div>
  );
}
