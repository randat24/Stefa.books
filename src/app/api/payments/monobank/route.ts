import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { logger } from '@/lib/logger';

// Схема для создания платежа
const createPaymentSchema = z.object({
  amount: z.number().min(1, 'Сума повинна бути більше 0'),
  currency: z.enum(['UAH', 'USD', 'EUR']).default('UAH'),
  description: z.string().min(1, 'Опис обов\'язковий'),
  order_id: z.string().min(1, 'ID замовлення обов\'язковий'),
  customer_email: z.string().email('Невірний email'),
  customer_name: z.string().min(1, 'Ім\'я клієнта обов\'язкове'),
  return_url: z.string().url('Невірний URL повернення').optional(),
  webhook_url: z.string().url('Невірний webhook URL').optional()
});

// Схема для проверки статуса платежа
const checkPaymentSchema = z.object({
  invoice_id: z.string().min(1, 'ID інвойсу обов\'язковий')
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Валидация входных данных
    const validatedData = createPaymentSchema.parse(body);
    
    logger.info('Creating Monobank payment:', {
      amount: validatedData.amount,
      currency: validatedData.currency,
      order_id: validatedData.order_id,
      customer_email: validatedData.customer_email
    });

    // TODO: Интеграция с реальным API Монобанка
    // Пока возвращаем мок-данные для тестирования
    const mockPayment = {
      invoice_id: `mono_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      status: 'pending',
      payment_url: `https://pay.monobank.ua/mock/${Date.now()}`,
      qr_code: `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==`,
      expires_at: new Date(Date.now() + 15 * 60 * 1000).toISOString(), // 15 минут
      created_at: new Date().toISOString()
    };

    // В реальной интеграции здесь будет:
    // 1. Создание инвойса в Монобанке
    // 2. Получение payment_url и QR кода
    // 3. Сохранение данных в базу
    // 4. Настройка webhook для уведомлений

    logger.info('Monobank payment created successfully:', {
      invoice_id: mockPayment.invoice_id,
      status: mockPayment.status
    });

    return NextResponse.json({
      success: true,
      payment: mockPayment,
      message: 'Платіж створено успішно'
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      logger.error('Payment validation error:', { errors: error.errors });
      return NextResponse.json(
        { 
          success: false, 
          error: 'Невірні дані',
          details: error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message
          }))
        },
        { status: 400 }
      );
    }

    logger.error('Unexpected error in Monobank payment creation:', error);
    return NextResponse.json(
      { success: false, error: 'Внутрішня помилка сервера' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const invoiceId = searchParams.get('invoice_id');
    
    if (!invoiceId) {
      return NextResponse.json(
        { success: false, error: 'ID інвойсу обов\'язковий' },
        { status: 400 }
      );
    }

    // Валидация
    const validatedData = checkPaymentSchema.parse({ invoice_id: invoiceId });

    logger.info('Checking Monobank payment status:', {
      invoice_id: validatedData.invoice_id
    });

    // TODO: Проверка статуса в реальном API Монобанка
    // Пока возвращаем мок-данные
    const mockStatus = {
      invoice_id: validatedData.invoice_id,
      status: 'success', // pending, success, failed, expired
      amount: 50000, // в копейках
      currency: 'UAH',
      created_at: new Date().toISOString(),
      paid_at: new Date().toISOString(),
      description: 'Підписка Stefa.books'
    };

    // В реальной интеграции здесь будет:
    // 1. Запрос к API Монобанка для проверки статуса
    // 2. Обновление статуса в базе данных
    // 3. Уведомление пользователя об изменении статуса

    logger.info('Monobank payment status retrieved:', {
      invoice_id: mockStatus.invoice_id,
      status: mockStatus.status
    });

    return NextResponse.json({
      success: true,
      payment: mockStatus
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Невірні дані',
          details: error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message
          }))
        },
        { status: 400 }
      );
    }

    logger.error('Unexpected error in Monobank payment status check:', error);
    return NextResponse.json(
      { success: false, error: 'Внутрішня помилка сервера' },
      { status: 500 }
    );
  }
}
