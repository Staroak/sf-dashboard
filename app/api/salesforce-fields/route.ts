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
    console.log('Connected to Salesforce for field discovery');

    // Describe the Opportunity object to get all fields
    const objectName = process.env.SF_APPLICATION_OBJECT || 'Opportunity';
    const describe = await conn.sobject(objectName).describe();

    // Get field names that might be relevant
    const relevantFields = describe.fields
      .filter(f =>
        f.name.toLowerCase().includes('stage') ||
        f.name.toLowerCase().includes('apprais') ||
        f.name.toLowerCase().includes('submit') ||
        f.name.toLowerCase().includes('applic') ||
        f.name.toLowerCase().includes('status') ||
        f.name.toLowerCase().includes('type') ||
        f.name.toLowerCase().includes('lender') ||
        f.type === 'picklist' ||
        f.type === 'boolean' ||
        f.type === 'date' ||
        f.type === 'datetime'
      )
      .map(f => ({
        name: f.name,
        label: f.label,
        type: f.type,
        picklistValues: f.picklistValues?.map(p => p.value) || []
      }));

    // Also get a sample of recent records to see what values are being used
    const sampleQuery = `
      SELECT Id, Name, StageName, CreatedDate, OwnerId, Owner.Name
      FROM ${objectName}
      WHERE CreatedDate = THIS_MONTH
      ORDER BY CreatedDate DESC
      LIMIT 20
    `;

    const sampleResult = await conn.query(sampleQuery);
    const sampleRecords = sampleResult.records.map((r: Record<string, unknown>) => ({
      Name: r.Name,
      StageName: r.StageName,
      CreatedDate: r.CreatedDate,
      OwnerName: (r.Owner as { Name?: string })?.Name
    }));

    // Get distinct stage values
    const stageQuery = `
      SELECT StageName, COUNT(Id) cnt
      FROM ${objectName}
      WHERE CreatedDate = THIS_MONTH
      GROUP BY StageName
      ORDER BY COUNT(Id) DESC
    `;

    const stageResult = await conn.query(stageQuery);
    const stageBreakdown = stageResult.records.map((r: Record<string, unknown>) => ({
      stage: r.StageName,
      count: r.cnt || r.expr0
    }));

    return NextResponse.json({
      objectName,
      totalFields: describe.fields.length,
      relevantFields: relevantFields.slice(0, 50), // Limit to 50 most relevant
      stageBreakdown,
      sampleRecords
    });

  } catch (error) {
    console.error('Error discovering Salesforce fields:', error);
    return NextResponse.json({
      error: 'Failed to discover fields',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
