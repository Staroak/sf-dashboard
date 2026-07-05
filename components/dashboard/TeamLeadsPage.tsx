"use client";

import { useMemo } from "react";
import { Trophy, Medal, Award, Users, TrendingUp, TrendingDown } from "lucide-react";
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

interface TeamLeadsPageProps {
  brokers: BrokerStats[];
  yesterdayBrokers?: BrokerStats[];
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
];

export function TeamLeadsPage({ brokers, yesterdayBrokers, teams }: TeamLeadsPageProps) {
  // Calculate aggregated stats for each team lead
  const { teamStats, yesterdayStats } = useMemo(() => {
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

    const todayStats = calculateStats(brokers).sort((a, b) => b.total - a.total);
    const yStats = yesterdayBrokers ? calculateStats(yesterdayBrokers) : [];

    // Create lookup map for yesterday stats
    const yesterdayLookup: Record<string, TeamStats> = {};
    for (const stat of yStats) {
      yesterdayLookup[stat.teamLead] = stat;
    }

    return { teamStats: todayStats, yesterdayStats: yesterdayLookup };
  }, [brokers, yesterdayBrokers, teams]);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="text-yellow-500" style={{ width: "min(2.5rem, 55cqh)", height: "min(2.5rem, 55cqh)" }} />;
      case 2:
        return <Medal className="text-gray-400" style={{ width: "min(2.5rem, 55cqh)", height: "min(2.5rem, 55cqh)" }} />;
      case 3:
        return <Award className="text-amber-600" style={{ width: "min(2.5rem, 55cqh)", height: "min(2.5rem, 55cqh)" }} />;
      default:
        return (
          <span className="font-black text-muted-foreground" style={{ fontSize: "min(2.25rem, 50cqh)" }}>{rank}</span>
        );
    }
  };

  const showTeamsLoading = teams.length === 0;

  return (
    <div
      className="h-full flex flex-col gap-3 py-4 overflow-hidden"
      style={{ paddingLeft: "min(6rem, 7vw)", paddingRight: "min(6rem, 7vw)" }}
    >
      {/* Header Row - Title + Column Headers */}
      <div className="flex-shrink-0 flex items-center px-6">
        {/* Left side: Rank placeholder + Title */}
        <div className="w-16 flex-shrink-0" /> {/* Match rank column width */}
        <div className="flex items-center gap-4">
          <Users className="text-blue-500" style={{ width: "min(2.5rem, 4.5vh)", height: "min(2.5rem, 4.5vh)" }} />
          <h1 className="font-black text-foreground" style={{ fontSize: "min(2.25rem, 4.2vh)" }}>Team Performance</h1>
        </div>
        <div className="flex-1" />

        {/* Right side: Column Headers - must match data column widths exactly */}
        <div className="flex items-center flex-shrink-0" style={{ gap: "min(2rem, 3vw)" }}>
          <div className="text-center" style={{ width: "min(240px, 13vw)" }}>
            <span className="font-bold text-green-500 uppercase tracking-wider" style={{ fontSize: "min(1.25rem, 2.2vh)" }}>
              Apps
            </span>
          </div>
          <div className="text-center" style={{ width: "min(240px, 13vw)" }}>
            <span className="font-bold text-purple-500 uppercase tracking-wider" style={{ fontSize: "min(1.25rem, 2.2vh)" }}>
              Appraisals
            </span>
          </div>
          <div className="text-center" style={{ width: "min(240px, 13vw)" }}>
            <span className="font-bold text-orange-500 uppercase tracking-wider" style={{ fontSize: "min(1.25rem, 2.2vh)" }}>
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
                  "flex items-center font-bold ml-1",
                  delta > 0 ? "text-green-400" : "text-red-400"
                )}
                style={{ fontSize: "min(0.875rem, 24cqh)" }}
              >
                {delta > 0 ? <TrendingUp style={{ width: "1em", height: "1em" }} /> : <TrendingDown style={{ width: "1em", height: "1em" }} />}
                {delta > 0 ? "+" : ""}{delta}
              </span>
            );
          };

          return (
            <div
              key={team.teamLead}
              className={cn(
                "flex items-center rounded-2xl border min-h-0 overflow-hidden",
                config.bg,
                config.border
              )}
              style={{
                containerType: "size",
                paddingLeft: "min(1.5rem, 3cqw)",
                paddingRight: "min(1.5rem, 3cqw)",
              }}
            >
              {/* Rank */}
              <div className="flex items-center justify-center w-16 flex-shrink-0">
                {getRankIcon(rank)}
              </div>

              {/* Team Lead Name */}
              <div className="min-w-0 flex items-center flex-shrink-0">
                <span
                  className={cn("font-bold truncate", config.nameColor)}
                  style={{ fontSize: "min(3rem, 3.5vw, 55cqh)" }}
                >
                  {team.teamLead}
                </span>
              </div>

              {/* Dotted leader line */}
              <div className="flex-1 mx-4 border-b-2 border-dotted border-white/15 self-end mb-4" />

              {/* Stats - aligned with header columns */}
              <div className="flex items-center flex-shrink-0" style={{ gap: "min(2rem, 3vw)" }}>
                {/* Applications */}
                <div className="flex items-center justify-center" style={{ width: "min(240px, 13vw)" }}>
                  <span
                    className="font-black text-green-500 tabular-nums"
                    style={{ fontSize: "min(4.5rem, 5vw, 68cqh)" }}
                  >
                    {team.applications}
                  </span>
                  {renderDelta(appDelta)}
                </div>

                {/* Appraisals */}
                <div className="flex items-center justify-center" style={{ width: "min(240px, 13vw)" }}>
                  <span
                    className="font-black text-purple-500 tabular-nums"
                    style={{ fontSize: "min(4.5rem, 5vw, 68cqh)" }}
                  >
                    {team.appraisals}
                  </span>
                  {renderDelta(apprDelta)}
                </div>

                {/* Submissions */}
                <div className="flex items-center justify-center" style={{ width: "min(240px, 13vw)" }}>
                  <span
                    className="font-black text-orange-500 tabular-nums"
                    style={{ fontSize: "min(4.5rem, 5vw, 68cqh)" }}
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
      )}
    </div>
  );
}
