"use client";

import { SimpleStat } from "./SimpleStat";
import { TieredLeaderboard } from "./TieredLeaderboard";
import { BluePearl } from "./BluePearl";
import { QuoteDisplay } from "./QuoteDisplay";

interface BrokerStats {
  userId: string;
  userName: string;
  contactsMade: number;
  applicationsTaken: number;
  appraisalsOrdered: number;
  submissions: number;
}

interface AppraisalsPageProps {
  dailyContacts: number;
  dailyAppraisals: number;
  monthlyAppraisals: number;
  brokers: BrokerStats[];
}

const DAILY_GOAL = 8;

export function AppraisalsPage({
  dailyContacts,
  dailyAppraisals,
  monthlyAppraisals,
  brokers,
}: AppraisalsPageProps) {
  return (
    <div className="h-full flex flex-col gap-3 p-3 overflow-hidden">
      {/* Top Stats Row */}
      <div className="flex items-center justify-between flex-shrink-0">
        <SimpleStat value={dailyContacts} label="Contacts Made Today" />
        <SimpleStat value={dailyAppraisals} label="Appraisals Today" />
        <SimpleStat value={monthlyAppraisals} label="Appraisals This Month" />
      </div>

      {/* Main Content */}
      <div className="flex-1 grid grid-cols-12 gap-3 min-h-0 overflow-hidden">
        {/* Leaderboard - 8 columns */}
        <div className="col-span-8 min-h-0 overflow-hidden">
          <TieredLeaderboard
            brokers={brokers}
            metric="appraisalsOrdered"
            title="Appraisals Leaderboard"
            dailyGoal={DAILY_GOAL}
          />
        </div>

        {/* Sidebar - 4 columns */}
        <div className="col-span-4 flex flex-col gap-3 min-h-0 overflow-hidden">
          {/* Daily Goal with BluePearl - flex-1 to share space equally */}
          <div className="rounded-xl border border-gray-800 bg-gray-900/80 p-4 shadow-sm flex flex-col items-center justify-center flex-1 min-h-0">
            <BluePearl
              current={dailyAppraisals}
              goal={DAILY_GOAL}
              label="Daily Appraisals Goal"
              size="large"
            />
          </div>
          {/* Quote - flex-1 to share space equally */}
          <QuoteDisplay category="appraisals" className="flex-1 min-h-0" />
        </div>
      </div>
    </div>
  );
}
