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

interface AppraisalsPageProps {
  dailyContacts: number;
  dailyAppraisals: number;
  monthlyAppraisals: number;
  brokers: BrokerStats[];
  yesterdayContacts?: number;
  yesterdayAppraisals?: number;
  yesterdayBrokers?: BrokerStats[];
  /** Weekend (Sat+Sun) total — shown as a sideline stat on Mondays only. */
  weekendAppraisals?: number;
}

export function AppraisalsPage({
  dailyContacts,
  dailyAppraisals,
  monthlyAppraisals,
  brokers,
  yesterdayContacts,
  yesterdayAppraisals,
  yesterdayBrokers,
  weekendAppraisals,
}: AppraisalsPageProps) {
  return (
    <div className="h-full flex flex-col gap-3 p-3 overflow-hidden">
      {/* Top Stats Row */}
      <div className="flex items-center flex-shrink-0">
        <div className="flex items-center justify-between flex-1">
          <SimpleStat value={dailyContacts} label="Contacts Made Today" color="blue" previousValue={yesterdayContacts} />
          <SimpleStat value={dailyAppraisals} label="Appraisals Today" color="purple" previousValue={yesterdayAppraisals} />
          {weekendAppraisals !== undefined && (
            <SimpleStat value={weekendAppraisals} label="Weekend (Sat+Sun)" color="cyan" />
          )}
          <SimpleStat value={monthlyAppraisals} label="Appraisals This Month" color="purple" />
        </div>
        <BluePearl current={dailyAppraisals} goal={8} size="horizontal" />
      </div>

      {/* Full Leaderboard with 4 columns */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <FullLeaderboard
          brokers={brokers}
          yesterdayBrokers={yesterdayBrokers}
          metric="appraisalsOrdered"
          title="Today's Appraisals"
          dailyGoal={8}
          goalCurrent={dailyAppraisals}
          goalYesterday={yesterdayAppraisals}
          goalLabel="Daily Goal"
        />
      </div>
    </div>
  );
}
