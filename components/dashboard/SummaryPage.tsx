"use client";

import { StatsSection } from "./StatsSection";
import { RotatingLeaderboard } from "./RotatingLeaderboard";
import { ContestedGroup } from "./ContestedGroup";
import { BluePearl } from "./BluePearl";
import { QuoteSidebar } from "./QuoteSidebar";

interface BrokerStats {
  userId: string;
  userName: string;
  contactsMade: number;
  applicationsTaken: number;
  appraisalsOrdered: number;
  submissions: number;
}

interface SummaryPageProps {
  daily: {
    contactsMade: number;
    applicationsTaken: number;
    appraisalsOrdered: number;
    submissions: number;
  };
  monthly: {
    contactsMade: number;
    applicationsTaken: number;
    appraisalsOrdered: number;
    submissions: number;
  };
  brokers: BrokerStats[];
}

const DAILY_GOAL = 33;

export function SummaryPage({ daily, monthly, brokers }: SummaryPageProps) {
  return (
    <div className="h-full flex flex-col p-3 overflow-hidden">
      <div className="flex-1 grid grid-cols-12 gap-3 min-h-0">
        {/* Main Stats Area - 9 columns */}
        <div className="col-span-12 lg:col-span-9 flex flex-col gap-3 min-h-0">
          {/* Daily Stats - compact mode */}
          <div className="flex-shrink-0">
            <StatsSection
              title="Today's Performance"
              period="Daily"
              contactsMade={daily.contactsMade}
              applicationsTaken={daily.applicationsTaken}
              appraisalsOrdered={daily.appraisalsOrdered}
              submissions={daily.submissions}
              compact
            />
          </div>

          {/* Monthly Stats - compact mode */}
          <div className="flex-shrink-0">
            <StatsSection
              title="Monthly Performance"
              period="Monthly"
              contactsMade={monthly.contactsMade}
              applicationsTaken={monthly.applicationsTaken}
              appraisalsOrdered={monthly.appraisalsOrdered}
              submissions={monthly.submissions}
              compact
            />
          </div>

          {/* Bottom Section: Rotating Leaderboards - takes ALL remaining space */}
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3 min-h-0">
            {/* Rotating Top 5 Leaders */}
            <RotatingLeaderboard
              brokers={brokers}
              rotationInterval={8000}
            />

            {/* Contested Group - Shows tied brokers */}
            <ContestedGroup
              brokers={brokers}
              rotationInterval={8000}
            />
          </div>
        </div>

        {/* Sidebar - 3 columns */}
        <aside className="col-span-12 lg:col-span-3 flex flex-col gap-3 min-h-0">
          {/* QuoteSidebar - flex-1 to take half the space */}
          <div className="flex-1 min-h-0">
            <QuoteSidebar />
          </div>

          {/* Daily Goal Tracker - flex-1 to take half the space */}
          <div className="rounded-xl border border-border bg-card/80 p-4 shadow-sm flex flex-col items-center justify-center flex-1 min-h-0">
            <BluePearl
              current={daily.applicationsTaken}
              goal={DAILY_GOAL}
              label="Daily Applications Goal"
              size="large"
            />
          </div>
        </aside>
      </div>
    </div>
  );
}
