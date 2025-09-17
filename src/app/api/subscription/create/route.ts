/**
 * API для создания подписки
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { SubscriptionService } from '@/lib/services/subscription';
import { monobankService } from '@/lib/services/monobank';
import { Logger } from '@/lib/logger';
import type { SubscriptionType } from '@/lib/types/subscription';

const logger = new Logger('SubscriptionCreateAPI');

const createSubscriptionSchema = z.object({
  email: z.string().email('Невірний формат email'),
  name: z.string().min(2, 'Ім\'я повинно містити мінімум 2 символи'),
  phone: z.string().min(10, 'Невірний формат телефону'),
  address: z.string().min(5, 'Адреса повинна містити мінімум 5 символів'),
  subscription_type: z.enum(['mini', 'maxi'], {
    errorMap: () => ({ message: 'Оберіть тип підписки: mini або maxi' })
  })
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    logger.info('Получен запрос на создание подписки:', body);

    // Валидация данных
    const validatedData = createSubscriptionSchema.parse(body);
    const { email, name, phone, address, subscription_type } = validatedData;

    // Проверяем, нет ли уже пользователя с таким email
    const existingUser = await SubscriptionService.getUserByEmail(email);
    if (existingUser) {
      return NextResponse.json(
        { error: 'Користувач з таким email вже існує' },
        { status: 400 }
      );
    }

    // Создаем пользователя с подпиской
    const { userId, subscriptionId } = await SubscriptionService.createUserWithSubscription(
      email,
      name,
      phone,
      address,
      subscription_type as SubscriptionType
    );

    // Получаем план подписки для расчета суммы
    const plan = SubscriptionService.getSubscriptionPlan(subscription_type as SubscriptionType);

    // Создаем платеж в Monobank
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://stefa-books.com.ua';
    const payment = await monobankService.createPayment({
      amount: plan.price,
      description: `Підписка ${plan.name} - Stefa Books`,
      reference: `subscription-${subscriptionId}`,
      redirectUrl: `${siteUrl}/subscription/success?subscription=${subscriptionId}`,
      webhookUrl: `${siteUrl}/api/payments/monobank/webhook`,
      customerEmail: email,
      customerName: name
    });

    logger.info(`Создан платеж для подписки ${subscriptionId}: ${payment.invoiceId}`);

    // Обновляем подписку с ID платежа Monobank
    await SubscriptionService.updateSubscriptionPayment(subscriptionId, {
      monobank_invoice_id: payment.invoiceId,
      payment_url: payment.pageUrl
    });

    return NextResponse.json({
      success: true,
      subscription_id: subscriptionId,
      user_id: userId,
      payment: {
        invoice_id: payment.invoiceId,
        payment_url: payment.pageUrl,
        amount: plan.price,
        currency: 'UAH'
      },
      redirect_url: payment.pageUrl,
      profile_url: `${siteUrl}/user/${userId}`
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