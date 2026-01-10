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

interface SubmissionsPageProps {
  dailyContacts: number;
  dailySubmissions: number;
  monthlySubmissions: number;
  brokers: BrokerStats[];
}

const DAILY_GOAL = 6;

export function SubmissionsPage({
  dailyContacts,
  dailySubmissions,
  monthlySubmissions,
  brokers,
}: SubmissionsPageProps) {
  return (
    <div className="h-full flex flex-col gap-3 p-3 overflow-hidden">
      {/* Top Stats Row */}
      <div className="flex items-center justify-between flex-shrink-0">
        <SimpleStat value={dailyContacts} label="Contacts Made Today" color="blue" />
        <SimpleStat value={dailySubmissions} label="Submissions Today" color="orange" />
        <SimpleStat value={monthlySubmissions} label="Submissions This Month" color="orange" />
      </div>

      {/* Full Leaderboard with 4 columns */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <FullLeaderboard
          brokers={brokers}
          metric="submissions"
          title="Today's Submissions"
          dailyGoal={DAILY_GOAL}
          currentValue={dailySubmissions}
          goalLabel="Daily Submissions Goal"
          quoteCategory="submissions"
        />
      </div>
    </div>
  );
}
