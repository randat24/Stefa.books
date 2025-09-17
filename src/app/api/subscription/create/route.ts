/**
 * API для создания подписки
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { monobankPaymentService } from '@/lib/payments/monobank-payment-service';
import { logger } from '@/lib/logger';

// Logger is already imported as singleton instance

const createSubscriptionSchema = z.object({
  email: z.string().email('Невірний формат email'),
  name: z.string().min(2, 'Ім\'я повинно містити мінімум 2 символи'),
  phone: z.string().min(10, 'Невірний формат телефону'),
  address: z.string().min(5, 'Адреса повинна містити мінімум 5 символів'),
  subscription_type: z.enum(['mini', 'maxi', 'premium'], {
    errorMap: () => ({ message: 'Оберіть тип підписки: mini, maxi або premium' })
  })
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    logger.info('Получен запрос на создание подписки:', body);

    // Валидация данных
    const validatedData = createSubscriptionSchema.parse(body);
    const { email, name, phone, address, subscription_type } = validatedData;

    // Определяем сумму в зависимости от плана
    const planPrices = {
      mini: 300,
      maxi: 500,
      premium: 1500
    };
    
    const amount = planPrices[subscription_type] || 300;
    const description = `Підписка ${subscription_type.toUpperCase()} - ${amount} ₴`;

    // Создаем платеж в Monobank
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://stefa-books.com.ua';
    const reference = `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const paymentResult = await monobankPaymentService.createPayment({
      amount,
      description,
      reference,
      redirectUrl: `${siteUrl}/payment/success?reference=${reference}`,
      webhookUrl: `${siteUrl}/api/payments/monobank/webhook`
    });

    // Проверяем успешность создания платежа
    if (paymentResult.status !== 'success' || !paymentResult.data) {
      logger.error('Ошибка создания платежа в Monobank:', paymentResult.error);
      return NextResponse.json(
        { error: 'Помилка створення платежу в Monobank' },
        { status: 500 }
      );
    }

    logger.info(`Создан платеж для подписки: ${paymentResult.data?.invoiceId}`);

    // Создаем заявку на подписку
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false } }
    );

    const { data: subscriptionRequest, error: requestError } = await supabase
      .from('subscription_requests')
      .insert({
        name,
        email,
        phone,
        plan: subscription_type,
        payment_method: 'monobank',
        status: 'pending',
        admin_notes: `Payment created: ${paymentResult.data?.invoiceId}`
      })
      .select()
      .single();

    if (requestError || !subscriptionRequest) {
      logger.error('Ошибка создания заявки на подписку:', requestError);
      return NextResponse.json(
        { error: 'Помилка створення заявки на підписку' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      subscription_id: subscriptionRequest.id,
      payment: {
        invoice_id: paymentResult.data?.invoiceId,
        payment_url: paymentResult.data?.pageUrl,
        amount,
        currency: 'UAH'
      },
      redirect_url: paymentResult.data?.pageUrl
    });

  } catch (error) {
    logger.error('Ошибка создания подписки:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Помилка валідації даних',
          details: error.errors.map(e => e.message)
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Помилка створення підписки' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { error: 'Метод не підтримується' },
    { status: 405 }
  );
}