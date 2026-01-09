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

    // Get time boundaries for debugging
    const now = new Date();
    const pacificNow = new Date(now.toLocaleString('en-US', { timeZone: 'America/Los_Angeles' }));

    // Get Pacific midnight today
    const pacificToday = new Date(pacificNow);
    pacificToday.setHours(0, 0, 0, 0);

    // Get Pacific midnight tomorrow
    const pacificTomorrow = new Date(pacificToday);
    pacificTomorrow.setDate(pacificTomorrow.getDate() + 1);

    // Query with explicit time range for Pacific timezone
    const pacificRangeQuery = `
      SELECT COUNT(Id) cnt
      FROM Task
      WHERE Subject = 'Outbound Call - Please Update'
        AND CreatedDate >= ${pacificToday.toISOString()}
        AND CreatedDate < ${pacificTomorrow.toISOString()}
    `;

    let pacificCount = { records: [{ cnt: 0 }] };
    try {
      pacificCount = await conn.query(pacificRangeQuery);
    } catch (e) {
      console.log('Pacific range query failed:', e);
    }

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      serverTime: now.toISOString(),
      pacificTime: pacificNow.toISOString(),
      pacificTodayStart: pacificToday.toISOString(),
      pacificTodayEnd: pacificTomorrow.toISOString(),
      totalTasksToday: todayTasks.totalSize,
      subjectCounts: subjectCounts,
      todayApplicationTaken: todayAppTaken.records[0],
      todayOutboundCallExact: todayOutboundExact.records[0],
      todayOutboundCallLike: todayOutboundLike.records[0],
      todayOutboundCallDash: todayOutboundDash.records[0],
      todayOutboundPleaseUpdate: todayOutboundPleaseUpdate.records[0],
      outboundCallSubjects: outboundSubjectCounts,
      pacificTimezoneCount: pacificCount.records[0]
    });

  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({
      error: 'Failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
