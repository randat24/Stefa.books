import { NextResponse } from 'next/server'

export async function GET() {
  console.log('🔄 Health check called')
  
  return NextResponse.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    message: 'API is working'
  })
}