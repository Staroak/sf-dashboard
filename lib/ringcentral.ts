import { SDK } from '@ringcentral/sdk';

export interface CallMetrics {
  totalCalls: number;
  contactsMade: number; // Answered calls only
  voicemails: number;
  missed: number;
  byUser: UserCallMetrics[];
}

export interface UserCallMetrics {
  extensionId: string;
  userName: string;
  totalCalls: number;
  contactsMade: number;
  voicemails: number;
  missed: number;
  totalDuration: number;
}

interface CallLogRecord {
  id: string;
  direction: 'Inbound' | 'Outbound';
  result: string;
  duration?: number;
  extension?: {
    id?: string;
    name?: string;
  };
  from?: {
    extensionId?: string;
    name?: string;
  };
  to?: {
    extensionId?: string;
    name?: string;
  };
}

interface CallLogResponse {
  records: CallLogRecord[];
  navigation?: {
    nextPage?: {
      uri: string;
    };
  };
}

// Simple in-memory cache to avoid rate limiting
interface CacheEntry {
  data: CallMetrics;
  timestamp: number;
}

const cache: {
  daily?: CacheEntry;
  monthly?: CacheEntry;
} = {};

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes cache

class RingCentralService {
  private sdk: SDK;
  private platform: ReturnType<SDK['platform']>;
  private isAuthenticated: boolean = false;
  private lastRequestTime: number = 0;
  private minRequestInterval: number = 7000; // 7 seconds between requests (under 10 per minute limit)

  constructor() {
    this.sdk = new SDK({
      server: process.env.RC_SERVER_URL || 'https://platform.ringcentral.com',
      clientId: process.env.RC_CLIENT_ID || '',
      clientSecret: process.env.RC_CLIENT_SECRET || ''
    });
    this.platform = this.sdk.platform();
  }

  private async waitForRateLimit(): Promise<void> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    if (timeSinceLastRequest < this.minRequestInterval) {
      await new Promise(resolve => setTimeout(resolve, this.minRequestInterval - timeSinceLastRequest));
    }
    this.lastRequestTime = Date.now();
  }

  async authenticate(): Promise<void> {
    if (this.isAuthenticated) return;

    const jwtToken = process.env.RC_JWT_TOKEN;
    if (!jwtToken) {
      throw new Error('RingCentral JWT token not configured');
    }

    try {
      await this.platform.login({ jwt: jwtToken });
      this.isAuthenticated = true;
      console.log('Connected to RingCentral');

      // Handle token refresh
      this.platform.on(this.platform.events.refreshSuccess, () => {
        console.log('RingCentral token refreshed');
      });
    } catch (error) {
      console.error('RingCentral authentication failed:', error);
      throw error;
    }
  }

  // Get call logs for a date range with rate limiting
  async getCallLogs(dateFrom: string, dateTo: string): Promise<CallLogRecord[]> {
    await this.authenticate();

    const allRecords: CallLogRecord[] = [];
    let page = 1;
    let hasMore = true;
    const maxPages = 10; // Increased to get more data for monthly view

    while (hasMore && page <= maxPages) {
      try {
        // Wait for rate limit before making request
        await this.waitForRateLimit();

        const response = await this.platform.get('/restapi/v1.0/account/~/call-log', {
          dateFrom,
          dateTo,
          view: 'Simple', // Use Simple view to reduce data
          type: 'Voice',
          perPage: 250,
          page
        });

        const data: CallLogResponse = await response.json();
        allRecords.push(...data.records);

        if (data.navigation?.nextPage && page < maxPages) {
          page++;
        } else {
          hasMore = false;
        }
      } catch (error: unknown) {
        const err = error as { retryAfter?: number };
        console.error('Error fetching call logs:', error);

        // If rate limited, wait and don't continue
        if (err.retryAfter) {
          console.log(`Rate limited. Will use cached data.`);
        }
        hasMore = false;
      }
    }

    return allRecords;
  }

  // Filter and categorize call logs
  private analyzeCallLogs(records: CallLogRecord[]): CallMetrics {
    const userMap = new Map<string, UserCallMetrics>();
    const metrics: CallMetrics = {
      totalCalls: records.length,
      contactsMade: 0,
      voicemails: 0,
      missed: 0,
      byUser: []
    };

    // Results that indicate a successful contact
    const answeredResults = ['Accepted', 'Call connected', 'Answered'];
    const voicemailResults = ['Voicemail'];
    const missedResults = ['Missed', 'No Answer', 'Hang Up', 'Busy', 'Rejected'];

    records.forEach(call => {
      // Get user info - prioritize 'from' for outbound, 'to' for inbound
      let userId = 'unknown';
      let userName = 'Unknown User';

      if (call.direction === 'Outbound' && call.from) {
        userId = call.from.extensionId || call.extension?.id || 'unknown';
        userName = call.from.name || call.extension?.name || 'Unknown User';
      } else if (call.direction === 'Inbound' && call.to) {
        userId = call.to.extensionId || call.extension?.id || 'unknown';
        userName = call.to.name || call.extension?.name || 'Unknown User';
      } else if (call.extension) {
        userId = call.extension.id || 'unknown';
        userName = call.extension.name || 'Unknown User';
      }

      // Initialize user if not exists
      if (!userMap.has(userId)) {
        userMap.set(userId, {
          extensionId: userId,
          userName: userName,
          totalCalls: 0,
          contactsMade: 0,
          voicemails: 0,
          missed: 0,
          totalDuration: 0
        });
      }

      const user = userMap.get(userId)!;
      user.totalCalls++;
      user.totalDuration += call.duration || 0;

      // Categorize the call
      if (answeredResults.includes(call.result)) {
        metrics.contactsMade++;
        user.contactsMade++;
      } else if (voicemailResults.includes(call.result)) {
        metrics.voicemails++;
        user.voicemails++;
      } else if (missedResults.includes(call.result)) {
        metrics.missed++;
        user.missed++;
      }
    });

    metrics.byUser = Array.from(userMap.values()).sort(
      (a, b) => b.contactsMade - a.contactsMade
    );

    return metrics;
  }

  // Get daily call metrics with caching
  async getDailyMetrics(date?: Date): Promise<CallMetrics> {
    // Check cache first
    if (cache.daily && Date.now() - cache.daily.timestamp < CACHE_TTL) {
      console.log('Using cached daily RingCentral data');
      return cache.daily.data;
    }

    const targetDate = date || new Date();

    const dateFrom = new Date(targetDate);
    dateFrom.setHours(0, 0, 0, 0);

    const dateTo = new Date(targetDate);
    dateTo.setHours(23, 59, 59, 999);

    try {
      const records = await this.getCallLogs(
        dateFrom.toISOString(),
        dateTo.toISOString()
      );
      const metrics = this.analyzeCallLogs(records);

      // Cache the results
      cache.daily = {
        data: metrics,
        timestamp: Date.now()
      };

      return metrics;
    } catch (error) {
      console.error('Error getting daily metrics:', error);
      // Return cached data if available, even if expired
      if (cache.daily) {
        console.log('Returning expired cached daily data due to error');
        return cache.daily.data;
      }
      return {
        totalCalls: 0,
        contactsMade: 0,
        voicemails: 0,
        missed: 0,
        byUser: []
      };
    }
  }

  // Get monthly call metrics using Analytics API for accurate aggregation
  async getMonthlyMetrics(year?: number, month?: number): Promise<CallMetrics> {
    // Check cache first
    if (cache.monthly && Date.now() - cache.monthly.timestamp < CACHE_TTL) {
      console.log('Using cached monthly RingCentral data');
      return cache.monthly.data;
    }

    await this.authenticate();

    const now = new Date();
    const targetYear = year || now.getFullYear();
    const targetMonth = month || now.getMonth() + 1;

    const dateFrom = new Date(targetYear, targetMonth - 1, 1, 0, 0, 0, 0);
    const dateTo = new Date(targetYear, targetMonth, 0, 23, 59, 59, 999);

    try {
      await this.waitForRateLimit();

      // Use Analytics Aggregate API for accurate monthly totals
      const response = await this.platform.post('/analytics/calls/v1/accounts/~/aggregation/fetch', {
        grouping: {
          groupBy: 'Users',
          keys: []
        },
        timeSettings: {
          timeZone: process.env.RC_TIMEZONE || 'America/Los_Angeles',
          timeRange: {
            timeFrom: dateFrom.toISOString(),
            timeTo: dateTo.toISOString()
          }
        },
        responseOptions: {
          counters: {
            allCalls: { aggregationType: 'Sum' },
            callsByDirection: { aggregationType: 'Sum' },
            callsByResult: { aggregationType: 'Sum' }
          }
        }
      });

      const data = await response.json();
      console.log('Analytics API response received');

      // Parse aggregate response
      let totalCalls = 0;
      let contactsMade = 0;
      let voicemails = 0;
      let missed = 0;
      const byUser: UserCallMetrics[] = [];

      if (data.data && Array.isArray(data.data)) {
        for (const record of data.data) {
          const counters = record.counters || {};
          const allCalls = counters.allCalls?.Sum || 0;
          const byResult = counters.callsByResult || {};

          // Count answered calls (contacts made)
          const answered = (byResult.Accepted?.Sum || 0) +
            (byResult['Call connected']?.Sum || 0) +
            (byResult.Answered?.Sum || 0);

          const vm = byResult.Voicemail?.Sum || 0;
          const missedCalls = (byResult.Missed?.Sum || 0) +
            (byResult['No Answer']?.Sum || 0) +
            (byResult.Busy?.Sum || 0);

          totalCalls += allCalls;
          contactsMade += answered;
          voicemails += vm;
          missed += missedCalls;

          if (record.key?.userId) {
            byUser.push({
              extensionId: record.key.extensionId || record.key.userId,
              userName: record.key.name || 'Unknown User',
              totalCalls: allCalls,
              contactsMade: answered,
              voicemails: vm,
              missed: missedCalls,
              totalDuration: 0
            });
          }
        }
      }

      const metrics: CallMetrics = {
        totalCalls,
        contactsMade,
        voicemails,
        missed,
        byUser: byUser.sort((a, b) => b.contactsMade - a.contactsMade)
      };

      // Cache the results
      cache.monthly = {
        data: metrics,
        timestamp: Date.now()
      };

      console.log(`Monthly analytics: ${totalCalls} total, ${contactsMade} contacts`);
      return metrics;
    } catch (error) {
      console.error('Error getting monthly analytics:', error);

      // Fall back to call log API if analytics fails
      console.log('Falling back to call log API for monthly data...');
      try {
        const records = await this.getCallLogs(
          dateFrom.toISOString(),
          dateTo.toISOString()
        );
        const metrics = this.analyzeCallLogs(records);
        cache.monthly = { data: metrics, timestamp: Date.now() };
        return metrics;
      } catch (fallbackError) {
        console.error('Fallback also failed:', fallbackError);
        if (cache.monthly) {
          return cache.monthly.data;
        }
        return {
          totalCalls: 0,
          contactsMade: 0,
          voicemails: 0,
          missed: 0,
          byUser: []
        };
      }
    }
  }

  // Get all metrics for dashboard - sequential to avoid rate limits
  async getAllMetrics(): Promise<{
    daily: CallMetrics;
    monthly: CallMetrics;
  }> {
    // Run sequentially to avoid rate limiting
    const daily = await this.getDailyMetrics();
    const monthly = await this.getMonthlyMetrics();

    return { daily, monthly };
  }
}

export const ringCentralService = new RingCentralService();
