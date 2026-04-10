// Team Configuration — dynamically populated from CRM API.
// Falls back to hardcoded list if API hasn't responded yet.

export interface TeamConfig {
  displayName: string;
  leaderName: string;
  members: string[];
}

const FALLBACK_TEAMS: TeamConfig[] = [
  { displayName: "Team Jennifer", leaderName: "Jennifer Souvanvong", members: ["Harick Brar"] },
  { displayName: "Team Shaneen", leaderName: "Shaneen Mohammed", members: ["Renzo Mesia", "Shiela Jamero", "Megan Robertson", "Parmeet Singh"] },
  { displayName: "Team Stephanie", leaderName: "Stephanie Viaje", members: ["Ranier Manding", "Garry Singh", "Gurpreet Kaur", "Natalie Pacheco"] },
  { displayName: "Team Brandon", leaderName: "Brandon Viaje-Roque", members: ["Serg Martires", "Alice Nabi"] },
  { displayName: "Team Nav", leaderName: "Nav Cheema", members: ["Bowie Nan", "Saihaj Cheema", "Rahul Narula", "Savraj Cheema"] },
  { displayName: "Team Alika", leaderName: "Alika Walia", members: ["Doyle Minhas", "Gurjit Sandhu", "Jaslene Perhar"] },
  { displayName: "Team Sunny", leaderName: "Sunny Dhillon", members: ["Gaurav Dadral", "Olaf Durkowski", "Karny Mehat", "Salil Singla"] },
  { displayName: "Team Lesly", leaderName: "Lesly Camaclang", members: ["Mindy Basran", "Caitlyn Chretien", "Shaad Bakhtyar"] },
];

let currentTeams: TeamConfig[] = FALLBACK_TEAMS;

/** Update the team list from CRM API response */
export function updateTeams(teams: TeamConfig[]) {
  if (teams.length > 0) {
    currentTeams = teams;
  }
}

/** Get the current team list (dynamic or fallback) */
export function getTeams(): TeamConfig[] {
  return currentTeams;
}

export const TEAMS = FALLBACK_TEAMS; // kept for direct references during initial load

// Helper to get all team members INCLUDING the leader
export function getTeamMembers(team: TeamConfig): string[] {
  return [team.leaderName, ...team.members];
}

// Dynamic versions of legacy exports
export function getTeamLeads(): Record<string, string[]> {
  return currentTeams.reduce((acc, team) => {
    acc[team.displayName] = getTeamMembers(team);
    return acc;
  }, {} as Record<string, string[]>);
}

export function getTeamLeadNames(): string[] {
  return currentTeams.map(team => team.displayName);
}

// Legacy exports (use dynamic getters above for real-time data)
export const TEAM_LEADS: Record<string, string[]> = FALLBACK_TEAMS.reduce((acc, team) => {
  acc[team.displayName] = getTeamMembers(team);
  return acc;
}, {} as Record<string, string[]>);

export const TEAM_LEAD_NAMES = FALLBACK_TEAMS.map(team => team.displayName);
