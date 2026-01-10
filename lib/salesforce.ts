import { Connection } from 'jsforce';

// Type definitions
export interface BrokerStats {
  userId: string;
  userName: string;
  contactsMade: number;
  applicationsTaken: number;
  appraisalsOrdered: number;
  submissions: number;
}

export interface DashboardMetrics {
  daily: {
    contactsMade: number;
    applicationsTaken: number;
    appraisalsOrdered: number;
    submissions: number;
    byBroker: BrokerStats[];
  };
  monthly: {
    contactsMade: number;
    applicationsTaken: number;
    appraisalsOrdered: number;
    submissions: number;
    byBroker: BrokerStats[];
  };
  leaderboard: BrokerStats[];
}

interface QueryRecord {
  OwnerId?: string;
  Owner?: { Name?: string };
  total?: number;
  expr0?: number;
  [key: string]: unknown;
}

interface TaskRecord {
  Id: string;
  OwnerId: string;
  Subject: string;
  CreatedDate: string;
}

class SalesforceService {
  // Get Eastern timezone boundaries for today and this month
  private getDateBoundaries(): {
    todayStart: string;
    todayEnd: string;
    monthStart: string;
    monthEnd: string;
  } {
    // Use Eastern timezone (America/New_York) - matches Salesforce org setting
    const timezone = process.env.SF_TIMEZONE || 'America/New_York';
    const now = new Date();

    // Get current date in Eastern timezone
    const easternFormatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
    const easternDate = easternFormatter.format(now);
    const [year, month, day] = easternDate.split('-').map(Number);

    // Eastern Standard Time is UTC-5, Eastern Daylight Time is UTC-4
    // Check if we're in DST by comparing timezone offset
    const janDate = new Date(year, 0, 1);
    const julDate = new Date(year, 6, 1);
    const stdOffset = Math.max(janDate.getTimezoneOffset(), julDate.getTimezoneOffset());
    const isDST = now.getTimezoneOffset() < stdOffset;

    // Eastern midnight in UTC: EST = UTC+5, EDT = UTC+4
    const utcOffset = isDST ? 4 : 5;

    // Today's boundaries in UTC (Eastern midnight = 5:00 UTC in EST, 4:00 UTC in EDT)
    const todayStart = new Date(Date.UTC(year, month - 1, day, utcOffset, 0, 0, 0));
    const todayEnd = new Date(Date.UTC(year, month - 1, day + 1, utcOffset, 0, 0, 0));

    // This month's boundaries in UTC
    const monthStart = new Date(Date.UTC(year, month - 1, 1, utcOffset, 0, 0, 0));
    const monthEnd = new Date(Date.UTC(year, month, 1, utcOffset, 0, 0, 0));

    console.log(`Timezone: ${timezone}, DST: ${isDST}, UTC offset: ${utcOffset}`);
    console.log(`Today range: ${todayStart.toISOString()} to ${todayEnd.toISOString()}`);

    return {
      todayStart: todayStart.toISOString(),
      todayEnd: todayEnd.toISOString(),
      monthStart: monthStart.toISOString(),
      monthEnd: monthEnd.toISOString()
    };
  }

  // Create fresh connection for each request to avoid stale data
  async connect(): Promise<Connection> {
    const conn = new Connection({
      loginUrl: process.env.SF_LOGIN_URL || 'https://login.salesforce.com'
    });

    const username = process.env.SF_USERNAME;
    const password = process.env.SF_PASSWORD;
    const securityToken = process.env.SF_SECURITY_TOKEN || '';

    if (!username || !password) {
      throw new Error('Salesforce credentials not configured');
    }

    try {
      await conn.login(username, password + securityToken);
      console.log('Connected to Salesforce:', conn.instanceUrl);
      return conn;
    } catch (error) {
      console.error('Salesforce login failed:', error);
      throw error;
    }
  }

  // Helper to deduplicate tasks - removes tasks created within 3 seconds by same owner with same subject
  private deduplicateTasks(tasks: TaskRecord[]): TaskRecord[] {
    // Sort by CreatedDate to process in chronological order
    const sortedTasks = [...tasks].sort((a, b) =>
      new Date(a.CreatedDate).getTime() - new Date(b.CreatedDate).getTime()
    );

    const kept: TaskRecord[] = [];
    const duplicatesRemoved: string[] = [];
    // Track last seen time for each OwnerId-Subject combination
    const lastSeen = new Map<string, number>();

    for (const task of sortedTasks) {
      const createdTime = new Date(task.CreatedDate).getTime();
      const key = `${task.OwnerId}-${task.Subject}`;
      const lastTime = lastSeen.get(key);

      // If no previous task with same owner+subject, or more than 3 seconds apart, keep it
      if (lastTime === undefined || (createdTime - lastTime) > 3000) {
        kept.push(task);
        lastSeen.set(key, createdTime);
      } else {
        duplicatesRemoved.push(task.Id);
      }
    }

    if (duplicatesRemoved.length > 0) {
      console.log(`Deduplication: removed ${duplicatesRemoved.length} duplicate task(s) (within 3 second window)`);
    }

    return kept;
  }

  // Helper to get broker names lookup
  private async getBrokerNames(conn: Connection): Promise<Map<string, string>> {
    const cache = new Map<string, string>();
    try {
      const result = await conn.query(`SELECT Id, Name FROM User WHERE IsActive = true LIMIT 200`);
      for (const record of result.records as Array<{ Id: string; Name: string }>) {
        cache.set(record.Id, record.Name);
      }
    } catch (error) {
      console.error('Error fetching user names:', error);
    }
    return cache;
  }

  // Get Applications Taken (from Task object with Subject = 'Application Taken')
  // Uses deduplication to filter out tasks created within 1 second by same owner
  private async getApplicationsCount(conn: Connection, period: 'daily' | 'monthly', brokerNames: Map<string, string>): Promise<{ total: number; byBroker: Map<string, { name: string; count: number }> }> {
    // Use explicit Eastern timezone date ranges to match Salesforce org timezone
    const boundaries = this.getDateBoundaries();
    const dateFilter = period === 'daily'
      ? `CreatedDate >= ${boundaries.todayStart} AND CreatedDate < ${boundaries.todayEnd}`
      : `CreatedDate >= ${boundaries.monthStart} AND CreatedDate < ${boundaries.monthEnd}`;

    // Query individual Task records for deduplication
    const query = `
      SELECT Id, OwnerId, Subject, CreatedDate
      FROM Task
      WHERE Subject = 'Application Taken' AND ${dateFilter}
      ORDER BY CreatedDate DESC
      LIMIT 2000
    `;

    try {
      const result = await conn.query(query);
      const tasks = result.records as TaskRecord[];

      // Deduplicate tasks created within 1 second by same owner with same subject
      const dedupedTasks = this.deduplicateTasks(tasks);

      // Count by broker
      const byBroker = new Map<string, { name: string; count: number }>();
      for (const task of dedupedTasks) {
        const ownerId = task.OwnerId;
        const existing = byBroker.get(ownerId);
        if (existing) {
          existing.count++;
        } else {
          const ownerName = brokerNames.get(ownerId) || 'Unknown';
          byBroker.set(ownerId, { name: ownerName, count: 1 });
        }
      }

      const totalCount = dedupedTasks.length;
      console.log(`${period} applications: ${totalCount} (after dedup from ${tasks.length})`);
      return { total: totalCount, byBroker };
    } catch (error) {
      console.error(`Error fetching ${period} applications:`, error);
      return { total: 0, byBroker: new Map() };
    }
  }

  // Get Contacts Made (sum of Application Taken, No Opportunity, Not Interested, Scheduled Follow Up)
  // Uses deduplication to filter out tasks created within 1 second by same owner with same subject
  private async getContactsCount(conn: Connection, period: 'daily' | 'monthly', brokerNames: Map<string, string>): Promise<{ total: number; byBroker: Map<string, { name: string; count: number }> }> {
    // Use explicit Eastern timezone date ranges to match Salesforce org timezone
    const boundaries = this.getDateBoundaries();
    const dateFilter = period === 'daily'
      ? `CreatedDate >= ${boundaries.todayStart} AND CreatedDate < ${boundaries.todayEnd}`
      : `CreatedDate >= ${boundaries.monthStart} AND CreatedDate < ${boundaries.monthEnd}`;

    // Query individual Task records for deduplication
    // Contacts = Application Taken + No Opportunity + Not Interested + Scheduled Follow Up
    const query = `
      SELECT Id, OwnerId, Subject, CreatedDate
      FROM Task
      WHERE Subject IN ('Application Taken', 'No Opportunity', 'Not Interested', 'Scheduled Follow Up') AND ${dateFilter}
      ORDER BY CreatedDate DESC
      LIMIT 5000
    `;

    try {
      const result = await conn.query(query);
      const tasks = result.records as TaskRecord[];

      // Deduplicate tasks created within 1 second by same owner with same subject
      const dedupedTasks = this.deduplicateTasks(tasks);

      // Count by broker
      const byBroker = new Map<string, { name: string; count: number }>();
      for (const task of dedupedTasks) {
        const ownerId = task.OwnerId;
        const existing = byBroker.get(ownerId);
        if (existing) {
          existing.count++;
        } else {
          const ownerName = brokerNames.get(ownerId) || 'Unknown';
          byBroker.set(ownerId, { name: ownerName, count: 1 });
        }
      }

      const totalCount = dedupedTasks.length;
      console.log(`${period} contacts made: ${totalCount} (after dedup from ${tasks.length})`);
      return { total: totalCount, byBroker };
    } catch (error) {
      console.error(`Error fetching ${period} contacts:`, error);
      return { total: 0, byBroker: new Map() };
    }
  }

  // Get Appraisals Ordered (using Appraisal_Date__c field - Date type)
  private async getAppraisalsCount(conn: Connection, period: 'daily' | 'monthly', brokerNames: Map<string, string>): Promise<{ total: number; byBroker: Map<string, { name: string; count: number }> }> {
    const objectName = process.env.SF_APPLICATION_OBJECT || 'Opportunity';
    // Appraisal_Date__c is a Date field, compare directly with TODAY/THIS_MONTH
    const dateFilter = period === 'daily'
      ? 'Appraisal_Date__c = TODAY'
      : 'Appraisal_Date__c = THIS_MONTH';

    const query = `
      SELECT OwnerId, COUNT(Id) total
      FROM ${objectName}
      WHERE Appraisal_Ordered__c = true AND ${dateFilter}
      GROUP BY OwnerId
      ORDER BY COUNT(Id) DESC
    `;

    try {
      const result = await conn.query(query);
      const records = result.records as QueryRecord[];

      let totalCount = 0;
      const byBroker = new Map<string, { name: string; count: number }>();

      for (const record of records) {
        const count = (record.total || record.expr0 || 0) as number;
        totalCount += count;
        const ownerId = (record.OwnerId || 'unknown') as string;
        const ownerName = brokerNames.get(ownerId) || 'Unknown';
        byBroker.set(ownerId, { name: ownerName, count });
      }

      console.log(`${period} appraisals: ${totalCount}`);
      return { total: totalCount, byBroker };
    } catch (error) {
      console.error(`Error fetching ${period} appraisals:`, error);
      return { total: 0, byBroker: new Map() };
    }
  }

  // Get Submissions to Lender (using Date_Submitted__c field - Date type)
  private async getSubmissionsCount(conn: Connection, period: 'daily' | 'monthly', brokerNames: Map<string, string>): Promise<{ total: number; byBroker: Map<string, { name: string; count: number }> }> {
    const objectName = process.env.SF_APPLICATION_OBJECT || 'Opportunity';
    // Date_Submitted__c is a Date field, compare directly with TODAY/THIS_MONTH
    const dateFilter = period === 'daily'
      ? 'Date_Submitted__c = TODAY'
      : 'Date_Submitted__c = THIS_MONTH';

    const query = `
      SELECT OwnerId, COUNT(Id) total
      FROM ${objectName}
      WHERE Submitted_to_Lender__c = true AND ${dateFilter}
      GROUP BY OwnerId
      ORDER BY COUNT(Id) DESC
    `;

    try {
      const result = await conn.query(query);
      const records = result.records as QueryRecord[];

      let totalCount = 0;
      const byBroker = new Map<string, { name: string; count: number }>();

      for (const record of records) {
        const count = (record.total || record.expr0 || 0) as number;
        totalCount += count;
        const ownerId = (record.OwnerId || 'unknown') as string;
        const ownerName = brokerNames.get(ownerId) || 'Unknown';
        byBroker.set(ownerId, { name: ownerName, count });
      }

      console.log(`${period} submissions: ${totalCount}`);
      return { total: totalCount, byBroker };
    } catch (error) {
      console.error(`Error fetching ${period} submissions:`, error);
      return { total: 0, byBroker: new Map() };
    }
  }

  // Combine broker stats from all four metrics
  // If allBrokerNames is provided, include all brokers (even with 0 activity)
  private combineBrokerStats(
    contacts: Map<string, { name: string; count: number }>,
    applications: Map<string, { name: string; count: number }>,
    appraisals: Map<string, { name: string; count: number }>,
    submissions: Map<string, { name: string; count: number }>,
    allBrokerNames?: Map<string, string>
  ): BrokerStats[] {
    // If allBrokerNames provided, include all brokers; otherwise just those with activity
    const allBrokerIds = allBrokerNames
      ? new Set(allBrokerNames.keys())
      : new Set([
          ...contacts.keys(),
          ...applications.keys(),
          ...appraisals.keys(),
          ...submissions.keys()
        ]);

    const brokerStats: BrokerStats[] = [];

    for (const oderId of allBrokerIds) {
      const contData = contacts.get(oderId);
      const appData = applications.get(oderId);
      const apprData = appraisals.get(oderId);
      const subData = submissions.get(oderId);

      // Get broker name from allBrokerNames first, then from activity data
      const brokerName = allBrokerNames?.get(oderId) || contData?.name || appData?.name || apprData?.name || subData?.name || 'Unknown';

      brokerStats.push({
        userId: oderId,
        userName: brokerName,
        contactsMade: contData?.count || 0,
        applicationsTaken: appData?.count || 0,
        appraisalsOrdered: apprData?.count || 0,
        submissions: subData?.count || 0
      });
    }

    // Sort by appraisals (primary metric for leaderboard)
    return brokerStats.sort((a, b) => b.appraisalsOrdered - a.appraisalsOrdered);
  }

  // Get top 5 brokers by appraisals for leaderboard
  async getLeaderboard(): Promise<BrokerStats[]> {
    const conn = await this.connect();
    const brokerNames = await this.getBrokerNames(conn);
    const contacts = await this.getContactsCount(conn, 'monthly', brokerNames);
    const appraisals = await this.getAppraisalsCount(conn, 'monthly', brokerNames);
    const applications = await this.getApplicationsCount(conn, 'monthly', brokerNames);
    const submissions = await this.getSubmissionsCount(conn, 'monthly', brokerNames);

    const combined = this.combineBrokerStats(contacts.byBroker, applications.byBroker, appraisals.byBroker, submissions.byBroker);
    return combined.slice(0, 5);
  }

  async getAllMetrics(): Promise<DashboardMetrics> {
    const conn = await this.connect();

    // Get broker names lookup first
    const brokerNames = await this.getBrokerNames(conn);

    // Run all queries sequentially to avoid rate limits
    console.log('Fetching daily metrics...');
    const dailyContacts = await this.getContactsCount(conn, 'daily', brokerNames);
    const dailyApplications = await this.getApplicationsCount(conn, 'daily', brokerNames);
    const dailyAppraisals = await this.getAppraisalsCount(conn, 'daily', brokerNames);
    const dailySubmissions = await this.getSubmissionsCount(conn, 'daily', brokerNames);

    console.log('Fetching monthly metrics...');
    const monthlyContacts = await this.getContactsCount(conn, 'monthly', brokerNames);
    const monthlyApplications = await this.getApplicationsCount(conn, 'monthly', brokerNames);
    const monthlyAppraisals = await this.getAppraisalsCount(conn, 'monthly', brokerNames);
    const monthlySubmissions = await this.getSubmissionsCount(conn, 'monthly', brokerNames);

    // Combine broker stats - include all brokers for daily (even with 0 activity)
    const dailyBrokerStats = this.combineBrokerStats(
      dailyContacts.byBroker,
      dailyApplications.byBroker,
      dailyAppraisals.byBroker,
      dailySubmissions.byBroker,
      brokerNames // Include all active users
    );

    const monthlyBrokerStats = this.combineBrokerStats(
      monthlyContacts.byBroker,
      monthlyApplications.byBroker,
      monthlyAppraisals.byBroker,
      monthlySubmissions.byBroker
    );

    return {
      daily: {
        contactsMade: dailyContacts.total,
        applicationsTaken: dailyApplications.total,
        appraisalsOrdered: dailyAppraisals.total,
        submissions: dailySubmissions.total,
        byBroker: dailyBrokerStats
      },
      monthly: {
        contactsMade: monthlyContacts.total,
        applicationsTaken: monthlyApplications.total,
        appraisalsOrdered: monthlyAppraisals.total,
        submissions: monthlySubmissions.total,
        byBroker: monthlyBrokerStats
      },
      leaderboard: monthlyBrokerStats.slice(0, 5)
    };
  }
}

export const salesforceService = new SalesforceService();
