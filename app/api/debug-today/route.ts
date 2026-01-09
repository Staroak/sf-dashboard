import { NextResponse } from 'next/server';
import { Connection } from 'jsforce';

export async function GET() {
  try {
    const conn = new Connection({
      loginUrl: process.env.SF_LOGIN_URL || 'https://login.salesforce.com'
    });

    const username = process.env.SF_USERNAME;
    const password = process.env.SF_PASSWORD;
    const securityToken = process.env.SF_SECURITY_TOKEN || '';

    if (!username || !password) {
      return NextResponse.json({ error: 'Salesforce credentials not configured' }, { status: 500 });
    }

    await conn.login(username, password + securityToken);

    // Get TODAY's tasks - list all subjects
    const todayTasksQuery = `
      SELECT Id, Subject, CreatedDate
      FROM Task
      WHERE DAY_ONLY(CreatedDate) = TODAY
      ORDER BY CreatedDate DESC
      LIMIT 100
    `;

    const todayTasks = await conn.query(todayTasksQuery);

    // Count subjects manually
    const subjectCounts: Record<string, number> = {};
    for (const record of todayTasks.records as Array<{ Subject: string }>) {
      const subject = record.Subject || 'null';
      subjectCounts[subject] = (subjectCounts[subject] || 0) + 1;
    }

    // Get TODAY's "Application Taken" tasks specifically
    const todayAppTakenQuery = `
      SELECT COUNT(Id) cnt
      FROM Task
      WHERE Subject = 'Application Taken' AND DAY_ONLY(CreatedDate) = TODAY
    `;

    const todayAppTaken = await conn.query(todayAppTakenQuery);

    // Get TODAY's "Outbound Call" tasks specifically (exact match)
    const todayOutboundExactQuery = `
      SELECT COUNT(Id) cnt
      FROM Task
      WHERE Subject = 'Outbound Call' AND DAY_ONLY(CreatedDate) = TODAY
    `;

    const todayOutboundExact = await conn.query(todayOutboundExactQuery);

    // Get TODAY's "Outbound Call%" tasks (LIKE match)
    const todayOutboundLikeQuery = `
      SELECT COUNT(Id) cnt
      FROM Task
      WHERE Subject LIKE 'Outbound Call%' AND DAY_ONLY(CreatedDate) = TODAY
    `;

    const todayOutboundLike = await conn.query(todayOutboundLikeQuery);

    // Get TODAY's tasks with "Outbound Call - " prefix
    const todayOutboundDashQuery = `
      SELECT COUNT(Id) cnt
      FROM Task
      WHERE Subject LIKE 'Outbound Call - %' AND DAY_ONLY(CreatedDate) = TODAY
    `;

    const todayOutboundDash = await conn.query(todayOutboundDashQuery);

    // Get ALL Outbound Call% tasks to see what subjects exist
    const allOutboundQuery = `
      SELECT Id, Subject
      FROM Task
      WHERE Subject LIKE 'Outbound Call%' AND DAY_ONLY(CreatedDate) = TODAY
      LIMIT 50
    `;

    const allOutbound = await conn.query(allOutboundQuery);

    // Count outbound subjects
    const outboundSubjectCounts: Record<string, number> = {};
    for (const record of allOutbound.records as Array<{ Subject: string }>) {
      const subject = record.Subject || 'null';
      outboundSubjectCounts[subject] = (outboundSubjectCounts[subject] || 0) + 1;
    }

    // Get "Outbound Call - Please Update" specifically
    const todayOutboundPleaseUpdateQuery = `
      SELECT COUNT(Id) cnt
      FROM Task
      WHERE Subject = 'Outbound Call - Please Update' AND DAY_ONLY(CreatedDate) = TODAY
    `;

    const todayOutboundPleaseUpdate = await conn.query(todayOutboundPleaseUpdateQuery);

    // Get time boundaries for debugging - Eastern timezone
    const now = new Date();
    const timezone = 'America/New_York';

    // Get current date in Eastern timezone
    const easternFormatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
    const easternDate = easternFormatter.format(now);
    const [year, month, day] = easternDate.split('-').map(Number);

    // EST is UTC-5 (January = no DST)
    const utcOffset = 5;

    // Eastern midnight today in UTC
    const easternTodayStart = new Date(Date.UTC(year, month - 1, day, utcOffset, 0, 0, 0));
    const easternTodayEnd = new Date(Date.UTC(year, month - 1, day + 1, utcOffset, 0, 0, 0));

    // Query with explicit time range for Eastern timezone
    const easternRangeQuery = `
      SELECT COUNT(Id) cnt
      FROM Task
      WHERE Subject LIKE 'Outbound Call%'
        AND CreatedDate >= ${easternTodayStart.toISOString()}
        AND CreatedDate < ${easternTodayEnd.toISOString()}
    `;

    let easternCount = { records: [{ cnt: 0 }] };
    try {
      easternCount = await conn.query(easternRangeQuery);
    } catch (e) {
      console.log('Eastern range query failed:', e);
    }

    // Query for Application Taken with Eastern timezone
    const easternAppQuery = `
      SELECT COUNT(Id) cnt
      FROM Task
      WHERE Subject = 'Application Taken'
        AND CreatedDate >= ${easternTodayStart.toISOString()}
        AND CreatedDate < ${easternTodayEnd.toISOString()}
    `;

    let easternAppCount = { records: [{ cnt: 0 }] };
    try {
      easternAppCount = await conn.query(easternAppQuery);
    } catch (e) {
      console.log('Eastern app query failed:', e);
    }

    // Calculate Eastern timezone month boundaries (same as dashboard)
    const easternMonthStart = new Date(Date.UTC(year, month - 1, 1, utcOffset, 0, 0, 0));
    const easternMonthEnd = new Date(Date.UTC(year, month, 1, utcOffset, 0, 0, 0));

    // Get MONTHLY Application Taken count by broker using Eastern timezone range (same as dashboard now)
    const monthlyAppByBrokerQuery = `
      SELECT OwnerId, Owner.Name, COUNT(Id) total
      FROM Task
      WHERE Subject = 'Application Taken'
        AND CreatedDate >= ${easternMonthStart.toISOString()}
        AND CreatedDate < ${easternMonthEnd.toISOString()}
      GROUP BY OwnerId, Owner.Name
      ORDER BY COUNT(Id) DESC
    `;

    // Also get the raw list of Application Taken tasks for Rahul to debug
    // Include Who.Name (Contact/Lead name) to match with Salesforce report
    const rahulTasksQuery = `
      SELECT Id, Subject, CreatedDate, Owner.Name, Who.Name, What.Name
      FROM Task
      WHERE Subject = 'Application Taken'
        AND Owner.Name LIKE '%Rahul%'
        AND CreatedDate >= ${easternMonthStart.toISOString()}
        AND CreatedDate < ${easternMonthEnd.toISOString()}
      ORDER BY CreatedDate DESC
    `;

    let rahulTasks = { records: [] as Array<{ Id: string; Subject: string; CreatedDate: string; Owner?: { Name: string }; Who?: { Name: string }; What?: { Name: string } }>, totalSize: 0 };
    try {
      rahulTasks = await conn.query(rahulTasksQuery);
    } catch (e) {
      console.log('Rahul tasks query failed:', e);
    }

    let monthlyAppByBroker = { records: [] as Array<{ OwnerId: string; Owner?: { Name: string }; total?: number; expr0?: number }> };
    try {
      monthlyAppByBroker = await conn.query(monthlyAppByBrokerQuery);
    } catch (e) {
      console.log('Monthly app by broker query failed:', e);
    }

    // Format monthly app results
    const monthlyAppResults = monthlyAppByBroker.records.map(r => ({
      ownerId: r.OwnerId,
      ownerName: r.Owner?.Name || 'Unknown',
      count: r.total || r.expr0 || 0
    }));

    // Get all user names to properly map IDs to names
    const userQuery = `SELECT Id, Name FROM User WHERE IsActive = true LIMIT 200`;
    let userMap: Record<string, string> = {};
    try {
      const users = await conn.query(userQuery);
      for (const user of users.records as Array<{ Id: string; Name: string }>) {
        userMap[user.Id] = user.Name;
      }
    } catch (e) {
      console.log('User query failed:', e);
    }

    // Re-map the monthly results with proper names
    const monthlyAppWithNames = monthlyAppResults.map(r => ({
      ...r,
      ownerName: userMap[r.ownerId] || r.ownerName
    }));

    // Format Rahul's tasks with contact/lead names for comparison
    const rahulTasksList = rahulTasks.records.map(t => ({
      id: t.Id,
      subject: t.Subject,
      createdDate: t.CreatedDate,
      ownerName: t.Owner?.Name,
      contactName: t.Who?.Name || null,
      relatedTo: t.What?.Name || null
    }));

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      serverTime: now.toISOString(),
      easternDate: easternDate,
      easternTodayStart: easternTodayStart.toISOString(),
      easternTodayEnd: easternTodayEnd.toISOString(),
      easternMonthStart: easternMonthStart.toISOString(),
      easternMonthEnd: easternMonthEnd.toISOString(),
      totalTasksToday: todayTasks.totalSize,
      subjectCounts: subjectCounts,
      todayApplicationTaken_UTC: todayAppTaken.records[0],
      todayOutboundCallLike_UTC: todayOutboundLike.records[0],
      todayOutboundPleaseUpdate_UTC: todayOutboundPleaseUpdate.records[0],
      outboundCallSubjects: outboundSubjectCounts,
      easternTimezone_OutboundCall: easternCount.records[0],
      easternTimezone_ApplicationTaken: easternAppCount.records[0],
      monthlyApplicationsByBroker_THIS_MONTH: monthlyAppWithNames,
      rahulTasks_THIS_MONTH: {
        totalCount: rahulTasks.totalSize,
        tasks: rahulTasksList
      },
      userCount: Object.keys(userMap).length
    });

  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({
      error: 'Failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
