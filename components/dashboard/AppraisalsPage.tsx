"use client";

import { SimpleStat } from "./SimpleStat";
import { FullLeaderboard } from "./FullLeaderboard";

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
        <SimpleStat value={dailyContacts} label="Contacts Made Today" color="blue" />
        <SimpleStat value={dailyAppraisals} label="Appraisals Today" color="purple" />
        <SimpleStat value={monthlyAppraisals} label="Appraisals This Month" color="purple" />
      </div>

      {/* Full Leaderboard with 4 columns */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <FullLeaderboard
          brokers={brokers}
          metric="appraisalsOrdered"
          title="Today's Appraisals"
          dailyGoal={DAILY_GOAL}
          currentValue={dailyAppraisals}
          goalLabel="Daily Appraisals Goal"
          quoteCategory="appraisals"
        />
      </div>
    </div>
  );
}
