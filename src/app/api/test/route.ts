import { NextResponse } from 'next/server';

export async function GET(): Promise<Response> {
  return NextResponse.json({ 
    success: true, 
    message: 'API is working',
    timestamp: new Date().toISOString()
  });
}
