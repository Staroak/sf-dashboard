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

interface FundedPageProps {
  monthlyFunded: number;
  brokers: BrokerStats[];
}

export function FundedPage({
  monthlyFunded,
  brokers,
}: FundedPageProps) {
  return (
    <div className="h-full flex flex-col gap-2 p-2 overflow-hidden">
      {/* Top Stats Row */}
      <div className="flex items-center flex-shrink-0">
        <div className="flex items-center justify-between flex-1">
          <SimpleStat value={monthlyFunded} label="Funded This Month" color="purple" />
        </div>
        <BluePearl current={monthlyFunded} goal={100} size="horizontal" />
      </div>

      {/* Monthly Leaderboard - ranked by closedWon */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <FullLeaderboard
          brokers={brokers}
          metric="closedWon"
          title="Monthly Funded Deals"
          dailyGoal={100}
          goalCurrent={monthlyFunded}
          goalLabel="Monthly Goal"
        />
      </div>
    </div>
  );
}
