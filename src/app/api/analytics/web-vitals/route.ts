import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    // Validate incoming data
    const { metric, value, rating, url, timestamp } = data
    
    if (!metric || typeof value !== 'number' || !rating || !url) {
      return NextResponse.json(
        { error: 'Invalid data format' },
        { status: 400 }
      )
    }

    // Log Web Vitals in development
    if (process.env.NODE_ENV === 'development') {
      console.log('📊 Web Vitals Data:', {
        metric,
        value: `${Math.round(value)}${metric === 'CLS' ? '' : 'ms'}`,
        rating,
        url,
        timestamp: new Date(timestamp).toISOString()
      })
    }

    // In production, you would typically:
    // 1. Store in database (Supabase, PostgreSQL)
    // 2. Send to analytics service (Google Analytics, DataDog, etc.)
    // 3. Send to monitoring service (Sentry, LogRocket)
    
    if (process.env.NODE_ENV === 'production') {
      // Example: Store in Supabase
      // const { supabase } = await import('@/lib/supabase')
      // await supabase.from('web_vitals').insert({
      //   metric,
      //   value,
      //   rating,
      //   url,
      //   timestamp: new Date(timestamp).toISOString(),
      //   user_agent: request.headers.get('user-agent'),
      //   referrer: request.headers.get('referer')
      // })

      // Example: Send to external analytics
      // await fetch('https://analytics-service.com/web-vitals', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(data)
      // })
    }

    return NextResponse.json({ success: true })
    
  } catch (error) {
    console.error('Error processing web vitals data:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Handle preflight requests
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type' } })
}