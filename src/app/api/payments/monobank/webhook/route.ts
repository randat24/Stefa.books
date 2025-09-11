import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { supabase } from '@/lib/supabase';

// Схема для webhook от Монобанка
interface WebhookData {
  invoiceId: string;
  status: 'success' | 'failure' | 'expired';
  amount: number;
  ccy: number;
  createdDate: string;
  modifiedDate: string;
  reference: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    logger.info('Monobank webhook received:', {
      type: body.type,
      invoiceId: body.data?.invoiceId,
      status: body.data?.status
    });

    // Проверяем тип уведомления
    if (body.type !== 'InvoicePaymentStatusChanged') {
      logger.warn('Unknown webhook type:', { type: body.type });
      return NextResponse.json({ success: true, message: 'Unknown webhook type' });
    }

    const { invoiceId, status, amount, ccy, modifiedDate } = body.data as WebhookData;

    if (!invoiceId) {
      logger.error('Missing invoiceId in webhook');
      return NextResponse.json(
        { success: false, error: 'Missing invoiceId' },
        { status: 400 }
      );
    }

    // Обновляем статус платежа в базе данных
    const { data: payment, error: updateError } = await supabase
      .from('payments')
      .update({
        status: status === 'success' ? 'completed' : status === 'failure' ? 'failed' : 'expired',
        amount: amount,
        currency: ccy === 980 ? 'UAH' : ccy === 840 ? 'USD' : 'EUR',
        paid_at: status === 'success' ? new Date(modifiedDate).toISOString() : null,
        updated_at: new Date().toISOString()
      })
      .eq('invoice_id', invoiceId)
      .select()
      .single();

    if (updateError) {
      logger.error('Error updating payment status:', { error: updateError, invoiceId });
      return NextResponse.json(
        { success: false, error: 'Failed to update payment status' },
        { status: 500 }
      );
    }

    // Если платеж успешный, активируем подписку
    if (status === 'success' && payment) {
      // Получаем данные платежа для активации подписки
      const { data: paymentData } = await supabase
        .from('payments')
        .select('customer_email, subscription_type')
        .eq('invoice_id', invoiceId)
        .single();

      if (paymentData) {
        const { error: subscriptionError } = await supabase
          .from('users')
          .update({
            // subscription_type: paymentData.subscription_type, // TODO: Add subscription_type field to payments table
            status: 'active',
            updated_at: new Date().toISOString()
          })
          .eq('email', (paymentData as any).email); // TODO: Add customer_email field to payments table

        if (subscriptionError) {
          logger.error('Error activating subscription:', { error: subscriptionError, paymentData });
        } else {
          logger.info('Subscription activated successfully:', {
            email: (paymentData as any).email, // TODO: Add customer_email field to payments table
            subscription_type: 'premium' // TODO: Add subscription_type field to payments table
          });
        }
      }
    }

    logger.info('Webhook processed successfully:', {
      invoiceId,
      status,
      paymentId: payment?.id
    });

    return NextResponse.json({ success: true });

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
