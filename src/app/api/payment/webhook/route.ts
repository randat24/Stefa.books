import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { logger } from '@/lib/logger';
import { monobankPaymentService } from '@/lib/payments/monobank-payment-service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    logger.info('Payment webhook received', { 
      body: body,
      headers: Object.fromEntries(request.headers.entries())
    });

    // Проверяем, что это webhook от Monobank
    if (!body.invoiceId) {
      logger.warn('Invalid webhook payload - missing invoiceId');
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    // Проверяем статус платежа в Monobank
    const paymentStatus = await monobankPaymentService.checkPaymentStatus(body.invoiceId);
    
    if (paymentStatus.status !== 'success' || !paymentStatus.data) {
      logger.warn('Payment status check failed', { 
        invoiceId: body.invoiceId,
        status: paymentStatus.status 
      });
      return NextResponse.json({ error: 'Payment status check failed' }, { status: 400 });
    }

    const paymentData = paymentStatus.data;
    
    // Если платеж успешный, обновляем заявку
    if (paymentData.status === 'success') {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
      
      if (!supabaseUrl || !supabaseServiceKey) {
        logger.error('Missing Supabase configuration for webhook');
        return NextResponse.json({ error: 'Configuration error' }, { status: 500 });
      }

      const supabase = createClient(supabaseUrl, supabaseServiceKey, {
        auth: { persistSession: false }
      });

      // Находим заявку по reference
      const { data: subscriptionRequest, error: findError } = await supabase
        .from('subscription_requests')
        .select('*')
        .eq('notes', `Payment created: ${body.invoiceId}`)
        .single();

      if (findError || !subscriptionRequest) {
        logger.error('Subscription request not found for payment', { 
          invoiceId: body.invoiceId,
          error: findError 
        });
        return NextResponse.json({ error: 'Subscription request not found' }, { status: 404 });
      }

      // Обновляем статус заявки
      const { error: updateError } = await supabase
        .from('subscription_requests')
        .update({
          status: 'paid',
          notes: `Payment completed: ${body.invoiceId} - ${paymentData.amount} ${paymentData.ccy}`
        })
        .eq('id', subscriptionRequest.id);

      if (updateError) {
        logger.error('Failed to update subscription request', { 
          error: updateError,
          requestId: subscriptionRequest.id 
        });
        return NextResponse.json({ error: 'Failed to update subscription' }, { status: 500 });
      }

      logger.info('Payment processed successfully', {
        invoiceId: body.invoiceId,
        requestId: subscriptionRequest.id,
        amount: paymentData.amount,
        ccy: paymentData.ccy
      });

      // Автоматически регистрируем пользователя после успешной оплаты
      try {
        const { AutoRegistrationService } = await import('@/lib/auth/auto-registration-service');
        
        const registrationResult = await AutoRegistrationService.registerWithTemporaryPassword({
          email: subscriptionRequest.email,
          name: subscriptionRequest.name,
          phone: subscriptionRequest.phone,
          plan: subscriptionRequest.plan,
          paymentMethod: subscriptionRequest.payment_method,
          subscriptionRequestId: subscriptionRequest.id
        });

        if (registrationResult.success) {
          logger.info('User auto-registered after payment', {
            requestId: subscriptionRequest.id,
            email: subscriptionRequest.email,
            userId: registrationResult.user?.id
          });
        } else {
          logger.warn('Auto-registration failed after payment', {
            requestId: subscriptionRequest.id,
            email: subscriptionRequest.email,
            error: registrationResult.error
          });
        }
      } catch (registrationError) {
        logger.error('Auto-registration error after payment', {
          requestId: subscriptionRequest.id,
          email: subscriptionRequest.email,
          error: registrationError
        });
        // Не прерываем процесс, просто логируем ошибку
      }

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ success: true, status: 'pending' });

  } catch (error) {
    logger.error('Payment webhook error', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}