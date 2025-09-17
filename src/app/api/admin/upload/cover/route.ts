import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';

export async function POST(request: NextRequest) {
  try {
    logger.info('Cover upload endpoint called');
    
    return NextResponse.json(
      { error: 'Cover upload functionality not implemented yet' },
      { status: 501 }
    );
  } catch (error) {
    logger.error('Error in cover upload:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}
