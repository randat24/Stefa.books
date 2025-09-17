import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { monobankService } from '@/lib/services/monobank';

export async function GET(request: NextRequest) {
  try {
    logger.info('Getting Monobank client info');

    const result = await monobankService.getClientInfo();

    if (result.status === 'error') {
      logger.error('Failed to get client info', { error: result.errText });
      return NextResponse.json(
        { 
          success: false, 
          error: result.errText || 'Помилка отримання інформації про клієнта'
        },
        { status: 400 }
      );
    }

    logger.info('Client info retrieved successfully', {
      clientId: result.data?.clientId,
      name: result.data?.name,
      accountsCount: result.data?.accounts?.length
    });

    return NextResponse.json({
      success: true,
      data: result.data
    });

  } catch (error) {
    logger.error('Unexpected error in client info endpoint', error);
    return NextResponse.json(
      { success: false, error: 'Внутрішня помилка сервера' },
      { status: 500 }
    );
  }
}

// OPTIONS для CORS
export async function OPTIONS() {
  return NextResponse.json(
    {},
    { 
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type' }
    }
  );
}