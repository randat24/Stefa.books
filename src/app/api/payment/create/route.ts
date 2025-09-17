import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { monobankService } from '@/lib/services/monobank';
import { logger } from '@/lib/logger';

// Схема валидации для создания платежа
const createPaymentSchema = z.object({
  subscriptionRequestId: z.string().uuid(),
  amount: z.number().positive(),
  description: z.string().min(1),
  redirectUrl: z.string().url() });

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Валидация входных данных
    const validatedData = createPaymentSchema.parse(body);
    
    // Генерируем уникальный reference
    const reference = `sub_${validatedData.subscriptionRequestId}_${Date.now()}`;
    
    // URL для webhook (должен быть доступен извне)
    const webhookUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/payment/webhook`;
    
    logger.info('Creating payment', {
      subscriptionRequestId: validatedData.subscriptionRequestId,
      amount: validatedData.amount,
      reference });

    // Создаем платеж в Монобанке
    const paymentResult = await monobankService.createPayment({
      amount: validatedData.amount,
      description: validatedData.description,
      reference,
      redirectUrl: validatedData.redirectUrl,
      webhookUrl });

    if (paymentResult.status === 'error') {
      logger.error('Payment creation failed', {
        error: paymentResult.errText,
        subscriptionRequestId: validatedData.subscriptionRequestId });
      
      return NextResponse.json(
        { 
          success: false, 
          error: 'Не удалось создать платеж',
          details: paymentResult.errText 
        },
        { status: 500 }
      );
    }

    logger.info('Payment created successfully', {
      invoiceId: paymentResult.data?.invoiceId,
      reference });

    return NextResponse.json({
      success: true,
      data: {
        invoiceId: paymentResult.data?.invoiceId,
        paymentUrl: paymentResult.data?.pageUrl,
        reference } });

  } catch (error) {
    logger.error('Payment creation error', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Неверные данные запроса',
          details: error.errors 
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { 
        success: false, 
        error: 'Внутренняя ошибка сервера' 
      },
      { status: 500 }
    );
  }
}
