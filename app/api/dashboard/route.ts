import { NextResponse } from 'next/server';
import { updateBrokerList } from '@/lib/brokers';
import { getMockDashboardData } from '@/lib/mock-dashboard';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// In-memory cache: 2-minute TTL to reduce CRM API calls
const CACHE_TTL_MS = 2 * 60 * 1000;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let cachedData: any = null;
let cacheTimestamp = 0;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let fetchInProgress: Promise<any> | null = null;

const CRM_API_URL = process.env.CRM_API_URL;
const OFFICE_DASHBOARD_API_KEY = process.env.OFFICE_DASHBOARD_API_KEY;

async function getCachedData() {
  const now = Date.now();

  if (cachedData && (now - cacheTimestamp) < CACHE_TTL_MS) {
    return cachedData;
  }

  if (fetchInProgress) {
    return fetchInProgress;
  }

  fetchInProgress = (async () => {
    try {
      if (!CRM_API_URL) {
        // No CRM configured (local dev) — serve mock data so the dashboard,
        // including the weekend feature, is viewable without credentials.
        console.log('CRM_API_URL not set — serving mock dashboard data');
        const mock = getMockDashboardData();
        cachedData = mock;
        cacheTimestamp = Date.now();
        return mock;
      }

      console.log('Fetching fresh CRM metrics...');
      const headers: Record<string, string> = { 'Cache-Control': 'no-cache' };
      if (OFFICE_DASHBOARD_API_KEY) {
        headers['Authorization'] = `Bearer ${OFFICE_DASHBOARD_API_KEY}`;
      }

      const response = await fetch(`${CRM_API_URL}/api/office-dashboard`, {
        cache: 'no-store',
        headers,
      });

      if (!response.ok) {
        throw new Error(`CRM API returned ${response.status}`);
      }

      const data = await response.json();

      // Update dynamic broker list from CRM response
      if (data.validBrokers) {
        updateBrokerList(data.validBrokers);
      }

      cachedData = data;
      cacheTimestamp = Date.now();
      console.log('CRM metrics cached successfully');
      return data;
    } catch (err) {
      console.error('CRM API error:', err);
      if (cachedData) {
        console.log('Returning stale cached data due to error');
        return cachedData;
      }
      return null;
    } finally {
      fetchInProgress = null;
    }
  })();

  return fetchInProgress;
}

const NO_STORE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
  'Pragma': 'no-cache',
  'Expires': '0',
};

export async function GET(request: Request) {
  try {
    // ?mock=1 — preview the demo payload (incl. the weekend bucket) regardless of
    // CRM config. Lets the weekend feature be shown without touching .env.local.
    if (new URL(request.url).searchParams.get('mock') === '1') {
      return NextResponse.json(getMockDashboardData(), { headers: NO_STORE_HEADERS });
    }

    const dashboardData = await getCachedData();

    if (!dashboardData) {
      return NextResponse.json(
        { error: 'Failed to fetch dashboard data' },
        { status: 500 }
      );
    }

    return NextResponse.json(dashboardData, { headers: NO_STORE_HEADERS });
  } catch (error) {
    console.error('Dashboard API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}
