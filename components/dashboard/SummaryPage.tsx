"use client";

import { StatsSection } from "./StatsSection";
import { RotatingLeaderboard } from "./RotatingLeaderboard";
import { QuoteSidebar } from "./QuoteSidebar";
import { BluePearl } from "./BluePearl";

interface BrokerStats {
  userId: string;
  userName: string;
  contactsMade: number;
  applicationsTaken: number;
  appraisalsOrdered: number;
  submissions: number;
}

interface PeriodStats {
  contactsMade: number;
  applicationsTaken: number;
  appraisalsOrdered: number;
  submissions: number;
}

interface SummaryPageProps {
  daily: PeriodStats;
  monthly: PeriodStats;
  yesterday?: PeriodStats;
  brokers: BrokerStats[];
}

const DAILY_GOALS = {
  applications: 33,
  appraisals: 8,
  submissions: 6,
};

export function SummaryPage({ daily, monthly, yesterday, brokers }: SummaryPageProps) {
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
              previousContactsMade={yesterday?.contactsMade}
              previousApplicationsTaken={yesterday?.applicationsTaken}
              previousAppraisalsOrdered={yesterday?.appraisalsOrdered}
              previousSubmissions={yesterday?.submissions}
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

          {/* Bottom Section: Leaderboard and Quotes - equal width */}
          <div className="flex-1 grid grid-cols-2 gap-3 min-h-0">
            {/* Rotating Leaderboard */}
            <RotatingLeaderboard
              brokers={brokers}
              rotationInterval={3600}
            />

            {/* Rotating Quotes and Tips */}
            <QuoteSidebar />
          </div>
        </div>

        {/* Sidebar - 3 columns with 3 Daily Goal Pearls */}
        <aside className="col-span-12 lg:col-span-3 flex flex-col gap-3 min-h-0">
          {/* Applications Goal */}
          <div className="rounded-xl border border-border bg-card/80 p-3 shadow-sm flex flex-col items-center justify-center flex-1 min-h-0">
            <BluePearl
              current={daily.applicationsTaken}
              goal={DAILY_GOALS.applications}
              label="Daily Applications"
              size="large"
            />
          </div>

          {/* Appraisals Goal */}
          <div className="rounded-xl border border-border bg-card/80 p-3 shadow-sm flex flex-col items-center justify-center flex-1 min-h-0">
            <BluePearl
              current={daily.appraisalsOrdered}
              goal={DAILY_GOALS.appraisals}
              label="Daily Appraisals"
              size="large"
            />
          </div>

          {/* Submissions Goal */}
          <div className="rounded-xl border border-border bg-card/80 p-3 shadow-sm flex flex-col items-center justify-center flex-1 min-h-0">
            <BluePearl
              current={daily.submissions}
              goal={DAILY_GOALS.submissions}
              label="Daily Submissions"
              size="large"
            />
          </div>
        </aside>
      </div>
    </div>
  );
}
