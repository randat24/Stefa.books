import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { createClient } from '@supabase/supabase-js';
import { logger } from '@/lib/logger';
import { monobankService } from '@/lib/services/monobank';
import { AutoRegistrationService } from '@/lib/auth/auto-registration-service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const signature = request.headers.get('x-signature') || '';
    
    // Валидируем webhook
    if (!monobankService.validateWebhook(body, signature)) {
      logger.warn('Invalid Monobank webhook signature', { signature });
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    // Обрабатываем webhook
    const result = await monobankService.processWebhook(body);
    
    if (!result.success) {
      logger.error('Webhook processing failed', { body, result });
      return NextResponse.json({ error: result.message }, { status: 500 });
    }

    // Обновляем статус заявки в базе данных
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    
    if (!supabaseUrl || !supabaseServiceKey) {
      logger.error('Missing Supabase environment variables in webhook');
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false }
    });

    // Ищем заявку по reference
    const reference = body.reference;
    if (!reference) {
      logger.warn('No reference in webhook data', { body });
      return NextResponse.json({ error: 'No reference provided' }, { status: 400 });
    }

    // Извлекаем ID пользователя из reference
    const userId = reference.replace('sub_', '').split('_')[0];

    if (body.status === 'success') {
      // Автоматически регистрируем пользователя при успешной оплате
      await autoRegisterUserAfterPayment(userId, reference, body, supabase);
    }

    // Обновляем статус заявки в таблице users
    const { error: updateError } = await supabase
      .from('users')
      .update({
        status: body.status === 'success' ? 'active' : 'rejected',
        notes: `Payment ${body.status}: ${body.invoiceId}`,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (updateError) {
      logger.error('Failed to update user status', {
        error: updateError,
        reference,
        userId,
        status: body.status
      });
      return NextResponse.json({ error: 'Failed to update status' }, { status: 500 });
    }

    logger.info('Webhook processed successfully', {
      reference,
      status: body.status,
      invoiceId: body.invoiceId
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    logger.error('Webhook processing error', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * Автоматически регистрирует пользователя после успешной оплаты
 * Использует новый AutoRegistrationService для создания аккаунта и отправки email
 */
async function autoRegisterUserAfterPayment(
  userId: string,
  reference: string,
  paymentData: any,
  supabase: any
) {
  try {
    // Находим заявку на подписку по reference
    const subscriptionRequestId = reference.replace('sub_', '').split('_')[0];

    // Получаем данные заявки на подписку
    const { data: subscriptionRequest, error: requestError } = await supabase
      .from('subscription_requests')
      .select('*')
      .eq('id', subscriptionRequestId)
      .single();

    if (requestError || !subscriptionRequest) {
      logger.error('Failed to fetch subscription request for auto-registration', {
        subscriptionRequestId,
        reference,
        error: requestError
      });
      return;
    }

    // Проверяем, что это онлайн-платеж
    if (subscriptionRequest.payment_method !== 'online') {
      logger.warn('Received webhook for non-online payment method', {
        subscriptionRequestId,
        paymentMethod: subscriptionRequest.payment_method
      });
      return;
    }

    // Автоматически регистрируем пользователя
    const registrationResult = await AutoRegistrationService.registerWithTemporaryPassword({
      email: subscriptionRequest.email,
      name: subscriptionRequest.name,
      phone: subscriptionRequest.phone,
      plan: subscriptionRequest.plan,
      paymentMethod: 'online',
      subscriptionRequestId: subscriptionRequest.id
    });

    if (registrationResult.success) {
      logger.info('User auto-registered after payment webhook', {
        subscriptionRequestId,
        userId: registrationResult.user?.id,
        email: subscriptionRequest.email,
        invoiceId: paymentData.invoiceId,
        reference
      });

      // Создаем запись о платеже
      const { error: paymentRecordError } = await supabase
        .from('payments')
        .insert({
          invoice_id: paymentData.invoiceId,
          user_id: registrationResult.user?.id,
          amount: paymentData.amount || (subscriptionRequest.plan === 'mini' ? 300 : 500),
          currency: 'UAH',
          status: 'completed',
          payment_method: 'monobank',
          reference: reference,
          payment_data: paymentData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (paymentRecordError) {
        logger.error('Failed to create payment record', {
          userId: registrationResult.user?.id,
          invoiceId: paymentData.invoiceId,
          error: paymentRecordError
        });
      }

    } else {
      logger.error('Failed to auto-register user after payment', {
        subscriptionRequestId,
        email: subscriptionRequest.email,
        error: registrationResult.error,
        invoiceId: paymentData.invoiceId,
        reference
      });

      // Обновляем заявку статусом "paid_registration_failed"
      await supabase
        .from('subscription_requests')
        .update({
          status: 'paid_registration_failed',
          admin_notes: `Оплата підтверджена (${paymentData.invoiceId}), але реєстрація не вдалася: ${registrationResult.error}`,
          updated_at: new Date().toISOString()
        })
        .eq('id', subscriptionRequestId);
    }

  } catch (error) {
    logger.error('Error during auto-registration after payment', {
      userId,
      reference,
      error: error instanceof Error ? error.message : String(error)
    });
  }
}