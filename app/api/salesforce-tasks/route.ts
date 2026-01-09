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

    // Check Task object - get sample tasks
    const taskQuery = `
      SELECT Id, Subject, OwnerId, Owner.Name, CreatedDate
      FROM Task
      WHERE CreatedDate = THIS_MONTH
      ORDER BY CreatedDate DESC
      LIMIT 50
    `;

    const taskResult = await conn.query(taskQuery);

    // Also check Event object - get sample events
    const eventQuery = `
      SELECT Id, Subject, OwnerId, Owner.Name, CreatedDate
      FROM Event
      WHERE CreatedDate = THIS_MONTH
      ORDER BY CreatedDate DESC
      LIMIT 50
    `;

    const eventResult = await conn.query(eventQuery);

    // Look for "Application Taken" specifically
    const appTakenTaskQuery = `
      SELECT OwnerId, COUNT(Id) cnt
      FROM Task
      WHERE Subject LIKE '%Application%Taken%' AND CreatedDate = THIS_MONTH
      GROUP BY OwnerId
      ORDER BY COUNT(Id) DESC
    `;

    let appTakenTasks = { totalSize: 0, records: [] };
    try {
      appTakenTasks = await conn.query(appTakenTaskQuery);
    } catch (e) {
      console.log('App taken task query failed:', e);
    }

    // Try different variations
    const appTakenTaskQuery2 = `
      SELECT OwnerId, COUNT(Id) cnt
      FROM Task
      WHERE (Subject = 'Application Taken' OR Subject LIKE 'Application Taken%') AND CreatedDate = THIS_MONTH
      GROUP BY OwnerId
    `;

    let appTakenTasks2 = { totalSize: 0, records: [] };
    try {
      appTakenTasks2 = await conn.query(appTakenTaskQuery2);
    } catch (e) {
      console.log('App taken task query 2 failed:', e);
    }

    // Get total count of Application Taken tasks this month
    const totalAppTakenQuery = `
      SELECT COUNT(Id) cnt
      FROM Task
      WHERE Subject LIKE '%Application Taken%' AND CreatedDate = THIS_MONTH
    `;

    let totalAppTaken = { records: [{ cnt: 0 }] };
    try {
      totalAppTaken = await conn.query(totalAppTakenQuery);
    } catch (e) {
      console.log('Total app taken query failed:', e);
    }

    // Get distinct subject values to find the right one for outbound calls
    const distinctSubjectsQuery = `
      SELECT Subject, COUNT(Id) cnt
      FROM Task
      WHERE CreatedDate = THIS_MONTH
      GROUP BY Subject
      ORDER BY COUNT(Id) DESC
      LIMIT 30
    `;

    let distinctSubjects = { records: [] };
    try {
      distinctSubjects = await conn.query(distinctSubjectsQuery);
    } catch (e) {
      console.log('Distinct subjects query failed:', e);
    }

    // Look for outbound call variations
    const outboundCallQuery = `
      SELECT Subject, COUNT(Id) cnt
      FROM Task
      WHERE (Subject LIKE '%Outbound%' OR Subject LIKE '%Call%' OR Subject LIKE '%Dial%') AND CreatedDate = THIS_MONTH
      GROUP BY Subject
      ORDER BY COUNT(Id) DESC
    `;

    let outboundCalls = { records: [] };
    try {
      outboundCalls = await conn.query(outboundCallQuery);
    } catch (e) {
      console.log('Outbound call query failed:', e);
    }

    return NextResponse.json({
      taskSubjects: taskResult.records,
      eventSubjects: eventResult.records,
      appTakenByOwner: appTakenTasks.records,
      appTakenByOwner2: appTakenTasks2.records,
      totalAppTakenThisMonth: totalAppTaken.records[0],
      distinctSubjects: distinctSubjects.records,
      outboundCallVariations: outboundCalls.records
    });

  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({
      error: 'Failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
