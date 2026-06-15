// Dev-only mock for the dashboard payload.
//
// Used by app/api/dashboard/route.ts ONLY when CRM_API_URL is not configured,
// so the dashboard (including the weekend feature) is viewable on localhost
// without live CRM credentials. Never reached in production where CRM_API_URL is set.

import { VALID_BROKERS } from './brokers';

interface BrokerStats {
  userId: string;
  userName: string;
  contactsMade: number;
  closedWon: number;
  applicationsTaken: number;
  appraisalsOrdered: number;
  submissions: number;
}

interface PeriodData {
  contactsMade: number;
  closedWon: number;
  applicationsTaken: number;
  appraisalsOrdered: number;
  submissions: number;
  salesMetrics: {
    contactsMade: number;
    closedWon: number;
    applicationsTaken: number;
    appraisalsOrdered: number;
    submissions: number;
    byBroker: BrokerStats[];
  };
}

// Deterministic pseudo-random in [0,1) from an integer seed — stable demo, no Math.random.
function rng(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function makeBroker(name: string, i: number, scale: number, seedOffset: number): BrokerStats {
  const r = (k: number) => rng(i * 17.31 + seedOffset + k);
  const apps = Math.round(r(1) * scale);
  const appraisals = Math.round(r(2) * scale * 0.7);
  const submissions = Math.round(r(3) * scale * 0.55);
  const contacts = Math.round(r(4) * scale * 4) + apps;
  const closedWon = Math.round(r(5) * scale * 0.3);
  return {
    userId: `mock-${i}`,
    userName: name,
    contactsMade: contacts,
    closedWon,
    applicationsTaken: apps,
    appraisalsOrdered: appraisals,
    submissions,
  };
}

function makePeriod(scale: number, seedOffset: number): PeriodData {
  const byBroker = VALID_BROKERS.map((name, i) => makeBroker(name, i, scale, seedOffset));
  const sum = (k: keyof Omit<BrokerStats, 'userId' | 'userName'>) =>
    byBroker.reduce((acc, b) => acc + b[k], 0);
  const agg = {
    contactsMade: sum('contactsMade'),
    closedWon: sum('closedWon'),
    applicationsTaken: sum('applicationsTaken'),
    appraisalsOrdered: sum('appraisalsOrdered'),
    submissions: sum('submissions'),
  };
  return { ...agg, salesMetrics: { ...agg, byBroker } };
}

export function getMockDashboardData() {
  // daily = a fresh, low Monday morning (stays well under team/broker goals so it reads
  // as "fresh 0's" and doesn't fire daily celebrations).
  // weekend = the highlight: a strong Sat+Sun the office didn't see live.
  const monthly = makePeriod(38, 500);
  return {
    timestamp: new Date().toISOString(),
    daily: makePeriod(0.7, 100),
    yesterday: makePeriod(2.4, 200),
    weekend: makePeriod(4, 300),
    weekly: makePeriod(9, 400),
    monthly,
    leaderboard: monthly.salesMetrics.byBroker,
    teams: [] as unknown[],
    _mock: true,
  };
}
