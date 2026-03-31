import { NextResponse } from 'next/server';
import { salesforceService } from '@/lib/salesforce';
import type { DashboardMetrics } from '@/lib/salesforce';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// In-memory cache: 2-minute TTL to reduce Salesforce API calls
const CACHE_TTL_MS = 2 * 60 * 1000;
let cachedMetrics: DashboardMetrics | null = null;
let cacheTimestamp = 0;
let fetchInProgress: Promise<DashboardMetrics | null> | null = null;

async function getCachedMetrics(): Promise<DashboardMetrics | null> {
  const now = Date.now();

  // Return cached data if still fresh
  if (cachedMetrics && (now - cacheTimestamp) < CACHE_TTL_MS) {
    console.log(`Using cached Salesforce data (${Math.round((now - cacheTimestamp) / 1000)}s old)`);
    return cachedMetrics;
  }

  // Deduplicate concurrent requests — if a fetch is already in progress, wait for it
  if (fetchInProgress) {
    console.log('Waiting for in-progress Salesforce fetch...');
    return fetchInProgress;
  }

  // Fetch fresh data
  fetchInProgress = (async () => {
    try {
      console.log('Fetching fresh Salesforce metrics...');
      const metrics = await salesforceService.getAllMetrics();
      cachedMetrics = metrics;
      cacheTimestamp = Date.now();
      console.log('Salesforce metrics cached successfully');
      return metrics;
    } catch (err) {
      console.error('Salesforce error:', err);
      // Return stale cache if available, rather than nothing
      if (cachedMetrics) {
        console.log('Returning stale cached data due to error');
        return cachedMetrics;
      }
      return null;
    } finally {
      fetchInProgress = null;
    }
  })();

  return fetchInProgress;
}

export async function GET() {
  try {
    const salesforceMetrics = await getCachedMetrics();

    // Build dashboard data from Salesforce metrics
    const dashboardData = {
      timestamp: new Date().toISOString(),
      daily: {
        contactsMade: salesforceMetrics?.daily.contactsMade || 0,
        closedWon: salesforceMetrics?.daily.closedWon || 0,
        applicationsTaken: salesforceMetrics?.daily.applicationsTaken || 0,
        appraisalsOrdered: salesforceMetrics?.daily.appraisalsOrdered || 0,
        submissions: salesforceMetrics?.daily.submissions || 0,
        salesMetrics: salesforceMetrics?.daily || null
      },
      yesterday: {
        contactsMade: salesforceMetrics?.yesterday.contactsMade || 0,
        closedWon: salesforceMetrics?.yesterday.closedWon || 0,
        applicationsTaken: salesforceMetrics?.yesterday.applicationsTaken || 0,
        appraisalsOrdered: salesforceMetrics?.yesterday.appraisalsOrdered || 0,
        submissions: salesforceMetrics?.yesterday.submissions || 0,
        salesMetrics: salesforceMetrics?.yesterday || null
      },
      weekly: {
        contactsMade: salesforceMetrics?.weekly.contactsMade || 0,
        closedWon: salesforceMetrics?.weekly.closedWon || 0,
        applicationsTaken: salesforceMetrics?.weekly.applicationsTaken || 0,
        appraisalsOrdered: salesforceMetrics?.weekly.appraisalsOrdered || 0,
        submissions: salesforceMetrics?.weekly.submissions || 0,
        salesMetrics: salesforceMetrics?.weekly || null
      },
      monthly: {
        contactsMade: salesforceMetrics?.monthly.contactsMade || 0,
        closedWon: salesforceMetrics?.monthly.closedWon || 0,
        applicationsTaken: salesforceMetrics?.monthly.applicationsTaken || 0,
        appraisalsOrdered: salesforceMetrics?.monthly.appraisalsOrdered || 0,
        submissions: salesforceMetrics?.monthly.submissions || 0,
        salesMetrics: salesforceMetrics?.monthly || null
      },
      leaderboard: salesforceMetrics?.leaderboard || []
    };

    return NextResponse.json(dashboardData, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  } catch (error) {
    console.error('Dashboard API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}
