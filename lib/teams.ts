// Team Configuration
// ====================================
// Each team has:
//   - displayName: The name shown on the dashboard (customize this!)
//   - leaderName: The team leader's Salesforce name (must match exactly)
//   - members: Array of team member Salesforce names (must match exactly)
//
// The team leader's stats ARE included in the team totals.
// ====================================

interface TeamConfig {
  displayName: string;      // What shows on the dashboard
  leaderName: string;       // Team leader's Salesforce name (included in tally)
  members: string[];        // Additional team members
}

export const TEAMS: TeamConfig[] = [
  {
    displayName: "Team Jennifer",           // <-- Change this to customize display name
    leaderName: "Jennifer Souvanvong",      // Team leader (included in totals)
    members: [
      "Harick Brar",
    ],
  },
  {
    displayName: "Team Shaneen",            // <-- Change this to customize display name
    leaderName: "Shaneen Mohammed",
    members: [
      "Renzo Mesia",
      "Shiela Jamero",
      "Megan Robertson",
      "Parmeet Singh",
    ],
  },
  {
    displayName: "Team Stephanie",          // <-- Change this to customize display name
    leaderName: "Stephanie Viaje",
    members: [
      "Ranier Manding",
      "Garry Singh",
      "Gurpreet Kaur",
      "Natalie Pacheco",
    ],
  },
  {
    displayName: "Team Brandon",            // <-- Change this to customize display name
    leaderName: "Brandon Viaje-Roque",
    members: [
      "Serg Martires",
      "Alice Nabi",
    ],
  },
  {
    displayName: "Team Nav",                // <-- Change this to customize display name
    leaderName: "Nav Cheema",
    members: [
      "Bowie Nan",
      "Saihaj Cheema",
      "Rahul Narula",
      "Savraj Cheema",
    ],
  },
  {
    displayName: "Team Alika",              // <-- Change this to customize display name
    leaderName: "Alika Walia",
    members: [
      "Doyle Minhas",
      "Gurjit Sandhu",
      "Jaslene Perhar",
    ],
  },
  {
    displayName: "Team Sunny",
    leaderName: "Sunny Dhillon",
    members: [
      "Gaurav Dadral",
      "Olaf Durkowski",
      "Karny Mehat",
      "Salil Singla"
    ]
  },
  {
    displayName: "Team Lesly",
    leaderName: "Lesly Camaclang",
    members: [
      "Mindy Basran",
      "Caitlyn Chretien",
    ]
  },
];

// Helper to get all team members INCLUDING the leader
export function getTeamMembers(team: TeamConfig): string[] {
  return [team.leaderName, ...team.members];
}

// Legacy exports for backwards compatibility
export const TEAM_LEADS: Record<string, string[]> = TEAMS.reduce((acc, team) => {
  // Include leader in the members list for stats calculation
  acc[team.displayName] = getTeamMembers(team);
  return acc;
}, {} as Record<string, string[]>);

export const TEAM_LEAD_NAMES = TEAMS.map(team => team.displayName);
