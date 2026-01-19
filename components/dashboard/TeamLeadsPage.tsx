"use client";

import { useMemo } from "react";
import { Trophy, Medal, Award, Users, TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { TEAM_LEADS, TEAM_LEAD_NAMES } from "@/lib/teams";

interface BrokerStats {
  userId: string;
  userName: string;
  contactsMade: number;
  applicationsTaken: number;
  appraisalsOrdered: number;
  submissions: number;
}

interface TeamLeadsPageProps {
  brokers: BrokerStats[];
  yesterdayBrokers?: BrokerStats[];
}

interface TeamStats {
  teamLead: string;
  applications: number;
  appraisals: number;
  submissions: number;
  total: number;
}

const rankConfig = [
  { bg: "bg-yellow-500/10", border: "border-yellow-500/40", nameColor: "text-yellow-400" },
  { bg: "bg-gray-500/10", border: "border-gray-500/40", nameColor: "text-gray-300" },
  { bg: "bg-amber-600/10", border: "border-amber-600/40", nameColor: "text-amber-500" },
  { bg: "bg-slate-500/5", border: "border-slate-500/30", nameColor: "text-slate-300" },
  { bg: "bg-slate-500/5", border: "border-slate-500/30", nameColor: "text-slate-300" },
  { bg: "bg-slate-500/5", border: "border-slate-500/30", nameColor: "text-slate-300" },
  { bg: "bg-slate-500/5", border: "border-slate-500/30", nameColor: "text-slate-300" },
];

export function TeamLeadsPage({ brokers, yesterdayBrokers }: TeamLeadsPageProps) {
  // Calculate aggregated stats for each team lead
  const { teamStats, yesterdayStats } = useMemo(() => {
    const calculateStats = (brokerList: BrokerStats[]): TeamStats[] => {
      return TEAM_LEAD_NAMES.map((teamLead) => {
        const teamMembers = TEAM_LEADS[teamLead];

        // Filter brokers to find team members
        const teamBrokers = brokerList.filter((broker) =>
          teamMembers.some((member) =>
            broker.userName.toLowerCase().includes(member.toLowerCase()) ||
            member.toLowerCase().includes(broker.userName.toLowerCase())
          )
        );

        // Sum up the stats
        const applications = teamBrokers.reduce((sum, b) => sum + b.applicationsTaken, 0);
        const appraisals = teamBrokers.reduce((sum, b) => sum + b.appraisalsOrdered, 0);
        const submissions = teamBrokers.reduce((sum, b) => sum + b.submissions, 0);

        return {
          teamLead,
          applications,
          appraisals,
          submissions,
          total: applications + appraisals + submissions,
        };
      });
    };

    const todayStats = calculateStats(brokers).sort((a, b) => b.total - a.total);
    const yStats = yesterdayBrokers ? calculateStats(yesterdayBrokers) : [];

    // Create lookup map for yesterday stats
    const yesterdayLookup: Record<string, TeamStats> = {};
    for (const stat of yStats) {
      yesterdayLookup[stat.teamLead] = stat;
    }

    return { teamStats: todayStats, yesterdayStats: yesterdayLookup };
  }, [brokers, yesterdayBrokers]);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-10 h-10 text-yellow-500" />;
      case 2:
        return <Medal className="w-10 h-10 text-gray-400" />;
      case 3:
        return <Award className="w-10 h-10 text-amber-600" />;
      default:
        return (
          <span className="text-4xl font-black text-muted-foreground">{rank}</span>
        );
    }
  };

  return (
    <div className="h-full flex flex-col gap-3 p-4 overflow-hidden">
      {/* Header Row - Title + Column Headers */}
      <div className="flex-shrink-0 flex items-center px-6">
        {/* Left side: Rank placeholder + Title */}
        <div className="w-16 flex-shrink-0" /> {/* Match rank column width */}
        <div className="flex items-center gap-4 flex-1">
          <Users className="h-10 w-10 text-blue-500" />
          <h1 className="font-black text-4xl text-foreground">Team Performance</h1>
        </div>

        {/* Right side: Column Headers - must match data column widths exactly */}
        <div className="flex items-center flex-shrink-0 gap-8">
          <div className="w-[180px] text-center">
            <span className="text-xl font-bold text-green-500 uppercase tracking-wider">
              Apps
            </span>
          </div>
          <div className="w-[180px] text-center">
            <span className="text-xl font-bold text-purple-500 uppercase tracking-wider">
              Appraisals
            </span>
          </div>
          <div className="w-[180px] text-center">
            <span className="text-xl font-bold text-orange-500 uppercase tracking-wider">
              Submissions
            </span>
          </div>
        </div>
      </div>

      {/* Leaderboard Grid */}
      <div className="flex-1 min-h-0 grid grid-rows-7 gap-2">
        {teamStats.map((team, index) => {
          const rank = index + 1;
          const config = rankConfig[index] || rankConfig[6];
          const yesterday = yesterdayStats[team.teamLead];

          // Calculate deltas
          const appDelta = yesterday ? team.applications - yesterday.applications : null;
          const apprDelta = yesterday ? team.appraisals - yesterday.appraisals : null;
          const subDelta = yesterday ? team.submissions - yesterday.submissions : null;

          const renderDelta = (delta: number | null) => {
            if (delta === null || delta === 0) return null;
            return (
              <span
                className={cn(
                  "flex items-center text-sm font-bold ml-1",
                  delta > 0 ? "text-green-400" : "text-red-400"
                )}
              >
                {delta > 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                {delta > 0 ? "+" : ""}{delta}
              </span>
            );
          };

          return (
            <div
              key={team.teamLead}
              className={cn(
                "flex items-center rounded-2xl border px-6",
                config.bg,
                config.border
              )}
            >
              {/* Rank */}
              <div className="flex items-center justify-center w-16 flex-shrink-0">
                {getRankIcon(rank)}
              </div>

              {/* Team Lead Name */}
              <div className="flex-1 min-w-0 flex items-center">
                <span
                  className={cn("font-bold truncate", config.nameColor)}
                  style={{ fontSize: "clamp(1.75rem, 3.5vw, 3rem)" }}
                >
                  {team.teamLead}
                </span>
              </div>

              {/* Stats - aligned with header columns */}
              <div className="flex items-center flex-shrink-0 gap-8">
                {/* Applications */}
                <div className="w-[180px] flex items-center justify-center">
                  <span
                    className="font-black text-green-500 tabular-nums"
                    style={{ fontSize: "clamp(2.5rem, 5vw, 4.5rem)" }}
                  >
                    {team.applications}
                  </span>
                  {renderDelta(appDelta)}
                </div>

                {/* Appraisals */}
                <div className="w-[180px] flex items-center justify-center">
                  <span
                    className="font-black text-purple-500 tabular-nums"
                    style={{ fontSize: "clamp(2.5rem, 5vw, 4.5rem)" }}
                  >
                    {team.appraisals}
                  </span>
                  {renderDelta(apprDelta)}
                </div>

                {/* Submissions */}
                <div className="w-[180px] flex items-center justify-center">
                  <span
                    className="font-black text-orange-500 tabular-nums"
                    style={{ fontSize: "clamp(2.5rem, 5vw, 4.5rem)" }}
                  >
                    {team.submissions}
                  </span>
                  {renderDelta(subDelta)}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
