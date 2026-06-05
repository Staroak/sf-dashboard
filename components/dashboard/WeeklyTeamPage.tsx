"use client";

import { useMemo } from "react";
import { Trophy, Medal, Award, Users, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import { getTeamBrokers, type TeamConfig } from "@/lib/teams";

interface BrokerStats {
  userId: string;
  userName: string;
  contactsMade: number;
  closedWon: number;
  applicationsTaken: number;
  appraisalsOrdered: number;
  submissions: number;
}

interface WeeklyTeamPageProps {
  brokers: BrokerStats[];
  teams: TeamConfig[];
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
  { bg: "bg-slate-500/5", border: "border-slate-500/30", nameColor: "text-slate-300" },
];

export function WeeklyTeamPage({ brokers, teams }: WeeklyTeamPageProps) {
  // Calculate aggregated stats for each team lead from weekly data
  const teamStats = useMemo(() => {
    // Teams that should never be shown on the board, regardless of stats
    const HIDDEN_TEAMS = new Set(["neville"]);

    const calculateStats = (brokerList: BrokerStats[]): TeamStats[] => {
      return teams
        .filter((team) => !HIDDEN_TEAMS.has(team.displayName.trim().toLowerCase()))
        .map((team) => {
        const teamBrokers = getTeamBrokers(team, brokerList);

        // Sum up the stats
        const applications = teamBrokers.reduce((sum, b) => sum + b.applicationsTaken, 0);
        const appraisals = teamBrokers.reduce((sum, b) => sum + b.appraisalsOrdered, 0);
        const submissions = teamBrokers.reduce((sum, b) => sum + b.submissions, 0);

        return {
          teamLead: team.displayName,
          applications,
          appraisals,
          submissions,
          total: applications + appraisals + submissions,
        };
      });
    };

    return calculateStats(brokers).sort((a, b) => b.total - a.total);
  }, [brokers, teams]);

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

  const showTeamsLoading = teams.length === 0;

  return (
    <div className="h-full flex flex-col gap-3 px-24 py-4 overflow-hidden">
      {/* Header Row - Title + Column Headers */}
      <div className="flex-shrink-0 flex items-center px-6">
        {/* Left side: Rank placeholder + Title */}
        <div className="w-16 flex-shrink-0" /> {/* Match rank column width */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <Users className="h-10 w-10 text-blue-500" />
            <Calendar className="h-8 w-8 text-blue-400" />
          </div>
          <div>
            <h1 className="font-black text-4xl text-foreground">Weekly Team Performance</h1>
            <p className="text-lg text-muted-foreground">This Week&apos;s Rankings</p>
          </div>
        </div>
        <div className="flex-1" />

        {/* Right side: Column Headers - must match data column widths exactly */}
        <div className="flex items-center flex-shrink-0 gap-8">
          <div className="w-[240px] text-center">
            <span className="text-xl font-bold text-green-500 uppercase tracking-wider">
              Apps
            </span>
          </div>
          <div className="w-[240px] text-center">
            <span className="text-xl font-bold text-purple-500 uppercase tracking-wider">
              Appraisals
            </span>
          </div>
          <div className="w-[240px] text-center">
            <span className="text-xl font-bold text-orange-500 uppercase tracking-wider">
              Submissions
            </span>
          </div>
        </div>
      </div>

      {/* Leaderboard Grid */}
      {showTeamsLoading ? (
        <div className="flex-1 min-h-0 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary" />
            <p className="text-2xl font-semibold text-muted-foreground">Loading CRM teams...</p>
          </div>
        </div>
      ) : (
        <div
          className="flex-1 min-h-0 grid gap-2"
          style={{ gridTemplateRows: `repeat(${teamStats.length}, minmax(0, 1fr))` }}
        >
          {teamStats.map((team, index) => {
          const rank = index + 1;
          const config = rankConfig[index] || rankConfig[7];

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
              <div className="min-w-0 flex items-center flex-shrink-0">
                <span
                  className={cn("font-bold truncate", config.nameColor)}
                  style={{ fontSize: "clamp(1.75rem, 3.5vw, 3rem)" }}
                >
                  {team.teamLead}
                </span>
              </div>

              {/* Dotted leader line */}
              <div className="flex-1 mx-4 border-b-2 border-dotted border-white/15 self-end mb-4" />

              {/* Stats - aligned with header columns */}
              <div className="flex items-center flex-shrink-0 gap-8">
                {/* Applications */}
                <div className="w-[240px] flex items-center justify-center">
                  <span
                    className="font-black text-green-500 tabular-nums"
                    style={{ fontSize: "clamp(2.5rem, 5vw, 4.5rem)" }}
                  >
                    {team.applications}
                  </span>
                </div>

                {/* Appraisals */}
                <div className="w-[240px] flex items-center justify-center">
                  <span
                    className="font-black text-purple-500 tabular-nums"
                    style={{ fontSize: "clamp(2.5rem, 5vw, 4.5rem)" }}
                  >
                    {team.appraisals}
                  </span>
                </div>

                {/* Submissions */}
                <div className="w-[240px] flex items-center justify-center">
                  <span
                    className="font-black text-orange-500 tabular-nums"
                    style={{ fontSize: "clamp(2.5rem, 5vw, 4.5rem)" }}
                  >
                    {team.submissions}
                  </span>
                </div>
              </div>
            </div>
          );
          })}
        </div>
      )}
    </div>
  );
}
