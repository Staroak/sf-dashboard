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
        <SimpleStat value={dailyContacts} label="Contacts Made Today" />
        <SimpleStat value={dailyApplications} label="Applications Today" />
        <SimpleStat value={monthlyApplications} label="Applications This Month" />
      </div>

      {/* Main Content */}
      <div className="flex-1 grid grid-cols-12 gap-3 min-h-0 overflow-hidden">
        {/* Leaderboard - 8 columns */}
        <div className="col-span-8 min-h-0 overflow-hidden">
          <TieredLeaderboard
            brokers={brokers}
            metric="applicationsTaken"
            title="Applications Leaderboard"
            dailyGoal={DAILY_GOAL}
          />
        </div>

        {/* Sidebar - 4 columns */}
        <div className="col-span-4 flex flex-col gap-3 min-h-0 overflow-hidden">
          {/* Daily Goal with BluePearl - flex-1 to share space equally */}
          <div className="rounded-xl border border-gray-800 bg-gray-900/80 p-4 shadow-sm flex flex-col items-center justify-center flex-1 min-h-0">
            <BluePearl
              current={dailyApplications}
              goal={DAILY_GOAL}
              label="Daily Applications Goal"
              size="large"
            />
          </div>
          {/* Quote - flex-1 to share space equally */}
          <QuoteDisplay category="applications" className="flex-1 min-h-0" />
        </div>
      </div>
    </div>
  );
}
