"use client";

import { SimpleStat } from "./SimpleStat";
import { FullLeaderboard } from "./FullLeaderboard";
import { BluePearl } from "./BluePearl";

interface BrokerStats {
  userId: string;
  userName: string;
  contactsMade: number;
  applicationsTaken: number;
  appraisalsOrdered: number;
  submissions: number;
}

interface SubmissionsPageProps {
  dailyContacts: number;
  dailySubmissions: number;
  monthlySubmissions: number;
  brokers: BrokerStats[];
}

export function SubmissionsPage({
  dailyContacts,
  dailySubmissions,
  monthlySubmissions,
  brokers,
}: SubmissionsPageProps) {
  return (
    <div className="h-full flex flex-col gap-3 p-3 overflow-hidden">
      {/* Top Stats Row */}
      <div className="flex items-center flex-shrink-0">
        <div className="flex items-center justify-between flex-1">
          <SimpleStat value={dailyContacts} label="Contacts Made Today" color="blue" />
          <SimpleStat value={dailySubmissions} label="Submissions Today" color="orange" />
          <SimpleStat value={monthlySubmissions} label="Submissions This Month" color="orange" />
        </div>
        <BluePearl current={dailySubmissions} goal={6} size="horizontal" />
      </div>

      {/* Full Leaderboard with 4 columns */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <FullLeaderboard
          brokers={brokers}
          metric="submissions"
          title="Today's Submissions"
          dailyGoal={6}
        />
      </div>
    </div>
  );
}
