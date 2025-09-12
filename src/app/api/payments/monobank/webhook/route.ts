import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { monobankService } from '@/lib/services/monobank';
import type { MonobankWebhookData } from '@/lib/types/monobank';


export async function POST(request: NextRequest) {
  try {
    // Отримуємо тіло запиту як рядок для валідації підпису
    const bodyText = await request.text();
    const signature = request.headers.get('X-Sign') || '';
    
    logger.info('Monobank webhook received', {
      hasSignature: !!signature,
      bodyLength: bodyText.length
    });

    // Валідуємо підпис webhook'у
    if (!monobankService.validateWebhook(bodyText, signature)) {
      logger.error('Invalid webhook signature');
      return NextResponse.json(
        { success: false, error: 'Invalid signature' },
        { status: 401 }
      );
    }

    // Парсимо JSON після валідації підпису
    const body = JSON.parse(bodyText);
    
    logger.info('Monobank webhook data:', {
      invoiceId: body.invoiceId,
      status: body.status,
      amount: body.amount,
      reference: body.reference
    });

    // Перевіряємо обов'язкові поля
    if (!body.invoiceId) {
      logger.error('Missing invoiceId in webhook');
      return NextResponse.json(
        { success: false, error: 'Missing invoiceId' },
        { status: 400 }
      );
    }

    // Обробляємо webhook через MonobankService
    const webhookData: MonobankWebhookData = {
      invoiceId: body.invoiceId,
      status: body.status,
      amount: body.amount,
      ccy: body.ccy || 980, // UAH за замовчуванням
      reference: body.reference,
      createdDate: body.createdDate,
      modifiedDate: body.modifiedDate
    };

    const result = await monobankService.processWebhook(webhookData);

    if (!result.success) {
      logger.error('Failed to process webhook:', { result, webhookData });
      return NextResponse.json(
        { success: false, error: result.message },
        { status: 500 }
      );
    }

    logger.info('Webhook processed successfully:', {
      invoiceId: body.invoiceId,
      status: body.status,
      message: result.message
    });

    return NextResponse.json({ success: true, message: result.message });

  } catch (error) {
    logger.error('Unexpected error in Monobank webhook:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET для проверки webhook (используется Монобанком для проверки доступности)
export async function GET() {
  return NextResponse.json({ 
    success: true, 
    message: 'Monobank webhook endpoint is active',
    timestamp: new Date().toISOString()
  });
}
