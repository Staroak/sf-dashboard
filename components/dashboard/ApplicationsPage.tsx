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

interface ApplicationsPageProps {
  dailyContacts: number;
  dailyApplications: number;
  monthlyApplications: number;
  brokers: BrokerStats[];
}

const DAILY_GOAL = 33;

export function ApplicationsPage({
  dailyContacts,
  dailyApplications,
  monthlyApplications,
  brokers,
}: ApplicationsPageProps) {
  return (
    <div className="h-full flex flex-col gap-3 p-3 overflow-hidden">
      {/* Top Stats Row */}
      <div className="flex items-center justify-between flex-shrink-0">
        <SimpleStat value={dailyContacts} label="Contacts Made Today" color="blue" />
        <SimpleStat value={dailyApplications} label="Applications Today" color="green" />
        <SimpleStat value={monthlyApplications} label="Applications This Month" color="green" />
      </div>

      {/* Full Leaderboard with 4 columns */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <FullLeaderboard
          brokers={brokers}
          metric="applicationsTaken"
          title="Today's Applications"
          dailyGoal={DAILY_GOAL}
          currentValue={dailyApplications}
          goalLabel="Daily Applications Goal"
          quoteCategory="applications"
        />
      </div>
    </div>
  );
}
