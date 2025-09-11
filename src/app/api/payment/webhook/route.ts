import { NextRequest, NextResponse } from 'next/server';
import { monobankService } from '@/lib/services/monobank';
import { logger } from '@/lib/logger';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const signature = request.headers.get('x-signature') || '';
    
    logger.info('Received Monobank webhook', {
      body,
      signature: signature ? 'present' : 'missing',
    });

    // Валидируем webhook
    if (!monobankService.validateWebhook(body, signature)) {
      logger.warn('Invalid webhook signature', { signature });
      return NextResponse.json(
        { success: false, error: 'Invalid signature' },
        { status: 401 }
      );
    }

    // Обрабатываем webhook
    const result = await monobankService.processWebhook(body);
    
    if (result.success) {
      logger.info('Webhook processed successfully', { result });
      return NextResponse.json({ success: true, message: result.message });
    } else {
      logger.error('Webhook processing failed', { result });
      return NextResponse.json(
        { success: false, error: result.message },
        { status: 500 }
      );
    }

  } catch (error) {
    logger.error('Webhook error', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Монобанк также может отправлять GET запросы для проверки endpoint
export async function GET() {
  return NextResponse.json({ 
    status: 'ok', 
    message: 'Monobank webhook endpoint is active' 
  });
}
