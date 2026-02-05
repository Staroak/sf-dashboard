import { NextResponse } from 'next/server' 

export async function GET() {
  return NextResponse.json({
    
    daily: {
      applicationsTaken: 12,
      appraisalsOrdered: 8 ,
      submissions: 8,
    }
  })
} 

