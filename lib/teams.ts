// Team configuration from the CRM office-dashboard API.

export interface TeamConfig {
  displayName: string;
  leaderId?: string;
  leaderName: string;
  memberIds?: string[];
  members: string[];
}

interface BrokerIdentity {
  userId: string;
  userName: string;
}

export function getTeamMembers(team: TeamConfig): string[] {
  return [team.leaderName, ...team.members];
}

export function getTeamMemberIds(team: TeamConfig): string[] {
  return [team.leaderId, ...(team.memberIds ?? [])].filter((id): id is string => Boolean(id));
}

function normalizeName(name: string): string {
  return name.trim().toLowerCase();
}

function namesMatch(brokerName: string, memberName: string): boolean {
  const broker = normalizeName(brokerName);
  const member = normalizeName(memberName);
  const brokerFirstName = broker.split(/\s+/)[0];
  const memberFirstName = member.split(/\s+/)[0];

  return brokerFirstName === memberFirstName || broker.includes(member) || member.includes(broker);
}

export function getTeamBrokers<T extends BrokerIdentity>(team: TeamConfig, brokers: T[]): T[] {
  const memberIds = new Set(getTeamMemberIds(team));
  if (memberIds.size > 0) {
    return brokers.filter((broker) => memberIds.has(broker.userId));
  }

  const memberNames = getTeamMembers(team);
  return brokers.filter((broker) =>
    memberNames.some((memberName) => namesMatch(broker.userName, memberName))
  );
}
