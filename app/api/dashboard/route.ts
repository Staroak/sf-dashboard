import { NextResponse } from 'next/server';
import { salesforceService } from '@/lib/salesforce';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    // Fetch all metrics from Salesforce (including contacts from Task object)
    let salesforceMetrics = null;
    try {
      console.log('Fetching Salesforce metrics...');
      salesforceMetrics = await salesforceService.getAllMetrics();
      console.log('Salesforce metrics fetched successfully');
    } catch (err) {
      console.error('Salesforce error:', err);
    }

    // Build dashboard data from Salesforce metrics
    const dashboardData = {
      timestamp: new Date().toISOString(),
      daily: {
        contactsMade: salesforceMetrics?.daily.contactsMade || 0,
        applicationsTaken: salesforceMetrics?.daily.applicationsTaken || 0,
        appraisalsOrdered: salesforceMetrics?.daily.appraisalsOrdered || 0,
        submissions: salesforceMetrics?.daily.submissions || 0,
        salesMetrics: salesforceMetrics?.daily || null
      },
      monthly: {
        contactsMade: salesforceMetrics?.monthly.contactsMade || 0,
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
